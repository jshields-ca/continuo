const { GraphQLError } = require('graphql');
const { PrismaClient } = require('@prisma/client');
const logger = require('../../shared/utils/logger');

const prisma = new PrismaClient();

const leadResolvers = {
  Query: {
    // Get leads with pagination and filtering
    leads: async (_, { first = 10, after, filter }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const where = {
          companyId: user.companyId
        };

        if (filter) {
          if (filter.search) {
            where.OR = [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { email: { contains: filter.search, mode: 'insensitive' } },
              { phone: { contains: filter.search, mode: 'insensitive' } },
              { company: { contains: filter.search, mode: 'insensitive' } },
              { industry: { contains: filter.search, mode: 'insensitive' } },
              { notes: { contains: filter.search, mode: 'insensitive' } }
            ];
          }
          if (filter.source) where.source = filter.source;
          if (filter.status) where.status = filter.status;
          if (filter.assignedTo) where.assignedTo = filter.assignedTo;
          if (filter.industry) where.industry = filter.industry;
          if (filter.tags && filter.tags.length > 0) {
            where.tags = { hasSome: filter.tags };
          }
          if (filter.scoreMin !== undefined) {
            where.score = { gte: filter.scoreMin };
          }
          if (filter.scoreMax !== undefined) {
            where.score = { ...where.score, lte: filter.scoreMax };
          }
          if (filter.createdAfter) {
            where.createdAt = { gte: filter.createdAfter };
          }
          if (filter.createdBefore) {
            where.createdAt = { ...where.createdAt, lte: filter.createdBefore };
          }
          if (filter.lastContactedAfter) {
            where.lastContactedAt = { gte: filter.lastContactedAfter };
          }
          if (filter.lastContactedBefore) {
            where.lastContactedAt = { ...where.lastContactedAt, lte: filter.lastContactedBefore };
          }
        }

        const cursor = after ? { id: after } : undefined;

        const [leads, totalCount] = await Promise.all([
          prisma.lead.findMany({
            where,
            take: first + 1,
            cursor,
            orderBy: { createdAt: 'desc' },
            include: {
              company_ref: true,
              assignedUser: true,
              opportunities: {
                orderBy: { createdAt: 'desc' },
                take: 5
              },
              activities: {
                orderBy: { createdAt: 'desc' },
                take: 5
              }
            }
          }),
          prisma.lead.count({ where })
        ]);

        const hasNextPage = leads.length > first;
        const edges = leads.slice(0, first).map(lead => ({
          node: lead,
          cursor: lead.id
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage: !!after,
            startCursor: edges[0]?.cursor,
            endCursor: edges[edges.length - 1]?.cursor
          },
          totalCount
        };
      } catch (error) {
        logger.error('Error fetching leads:', error);
        throw error;
      }
    },

    // Get single lead
    lead: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const lead = await prisma.lead.findFirst({
          where: {
            id,
            companyId: user.companyId
          },
          include: {
            company_ref: true,
            assignedUser: true,
            opportunities: {
              orderBy: { createdAt: 'desc' }
            },
            activities: {
              orderBy: { createdAt: 'desc' }
            }
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return lead;
      } catch (error) {
        logger.error('Error fetching lead:', error);
        throw error;
      }
    },

    // Get opportunities with pagination and filtering
    opportunities: async (_, { leadId, first = 10, after, filter }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const where = {
          lead: {
            companyId: user.companyId
          }
        };

        if (leadId) {
          where.leadId = leadId;
        }

        if (filter) {
          if (filter.stage) where.stage = filter.stage;
          if (filter.amountMin !== undefined) {
            where.amount = { gte: filter.amountMin };
          }
          if (filter.amountMax !== undefined) {
            where.amount = { ...where.amount, lte: filter.amountMax };
          }
          if (filter.probabilityMin !== undefined) {
            where.probability = { gte: filter.probabilityMin };
          }
          if (filter.probabilityMax !== undefined) {
            where.probability = { ...where.probability, lte: filter.probabilityMax };
          }
          if (filter.expectedCloseAfter) {
            where.expectedCloseDate = { gte: filter.expectedCloseAfter };
          }
          if (filter.expectedCloseBefore) {
            where.expectedCloseDate = { ...where.expectedCloseDate, lte: filter.expectedCloseBefore };
          }
        }

        const cursor = after ? { id: after } : undefined;

        const [opportunities, totalCount] = await Promise.all([
          prisma.opportunity.findMany({
            where,
            take: first + 1,
            cursor,
            orderBy: { createdAt: 'desc' },
            include: {
              lead: true
            }
          }),
          prisma.opportunity.count({ where })
        ]);

        const hasNextPage = opportunities.length > first;
        const edges = opportunities.slice(0, first).map(opportunity => ({
          node: opportunity,
          cursor: opportunity.id
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage: !!after,
            startCursor: edges[0]?.cursor,
            endCursor: edges[edges.length - 1]?.cursor
          },
          totalCount
        };
      } catch (error) {
        logger.error('Error fetching opportunities:', error);
        throw error;
      }
    },

    // Get single opportunity
    opportunity: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const opportunity = await prisma.opportunity.findFirst({
          where: {
            id,
            lead: {
              companyId: user.companyId
            }
          },
          include: {
            lead: true
          }
        });

        if (!opportunity) {
          throw new GraphQLError('Opportunity not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return opportunity;
      } catch (error) {
        logger.error('Error fetching opportunity:', error);
        throw error;
      }
    },

    // Get lead activities
    leadActivities: async (_, { leadId, first = 10, after }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const where = {
          lead: {
            companyId: user.companyId
          }
        };

        if (leadId) {
          where.leadId = leadId;
        }

        const cursor = after ? { id: after } : undefined;

        const [activities, totalCount] = await Promise.all([
          prisma.leadActivity.findMany({
            where,
            take: first + 1,
            cursor,
            orderBy: { createdAt: 'desc' },
            include: {
              lead: true
            }
          }),
          prisma.leadActivity.count({ where })
        ]);

        const hasNextPage = activities.length > first;
        const edges = activities.slice(0, first).map(activity => ({
          node: activity,
          cursor: activity.id
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage: !!after,
            startCursor: edges[0]?.cursor,
            endCursor: edges[edges.length - 1]?.cursor
          },
          totalCount
        };
      } catch (error) {
        logger.error('Error fetching lead activities:', error);
        throw error;
      }
    },

    // Get single lead activity
    leadActivity: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const activity = await prisma.leadActivity.findFirst({
          where: {
            id,
            lead: {
              companyId: user.companyId
            }
          },
          include: {
            lead: true
          }
        });

        if (!activity) {
          throw new GraphQLError('Lead activity not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return activity;
      } catch (error) {
        logger.error('Error fetching lead activity:', error);
        throw error;
      }
    },

    // Get lead pipeline analytics
    leadPipeline: async (_, __, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const [
          totalLeads,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          proposalLeads,
          negotiationLeads,
          convertedLeads,
          lostLeads,
          totalOpportunities,
          opportunities
        ] = await Promise.all([
          prisma.lead.count({
            where: { companyId: user.companyId }
          }),
          prisma.lead.count({
            where: { 
              companyId: user.companyId,
              status: 'NEW'
            }
          }),
          prisma.lead.count({
            where: { 
              companyId: user.companyId,
              status: 'CONTACTED'
            }
          }),
          prisma.lead.count({
            where: { 
              companyId: user.companyId,
              status: 'QUALIFIED'
            }
          }),
          prisma.lead.count({
            where: { 
              companyId: user.companyId,
              status: 'PROPOSAL_SENT'
            }
          }),
          prisma.lead.count({
            where: { 
              companyId: user.companyId,
              status: 'NEGOTIATION'
            }
          }),
          prisma.lead.count({
            where: { 
              companyId: user.companyId,
              status: 'CONVERTED'
            }
          }),
          prisma.lead.count({
            where: { 
              companyId: user.companyId,
              status: 'LOST'
            }
          }),
          prisma.opportunity.count({
            where: {
              lead: { companyId: user.companyId }
            }
          }),
          prisma.opportunity.findMany({
            where: {
              lead: { companyId: user.companyId }
            },
            select: {
              amount: true,
              probability: true
            }
          })
        ]);

        // Calculate total pipeline value
        const totalPipelineValue = opportunities.reduce((sum, opp) => {
          if (opp.amount && opp.probability) {
            return sum + (opp.amount * opp.probability / 100);
          }
          return sum;
        }, 0);

        // Calculate conversion rate
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        return {
          totalLeads,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          proposalLeads,
          negotiationLeads,
          convertedLeads,
          lostLeads,
          totalOpportunities,
          totalPipelineValue,
          conversionRate
        };
      } catch (error) {
        logger.error('Error fetching lead pipeline:', error);
        throw error;
      }
    }
  },

  Mutation: {
    // Create new lead
    createLead: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Validate required fields
        if (!input.name || !input.email) {
          throw new GraphQLError('Lead name and email are required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        // Filter out assignedTo if it's empty to avoid foreign key constraint
        const leadData = {
          ...input,
          companyId: user.companyId,
          createdBy: user.id,
          updatedBy: user.id,
          tags: input.tags || []
        };
        
        // Only include assignedTo if it has a valid value
        if (!input.assignedTo || input.assignedTo.trim() === '') {
          delete leadData.assignedTo;
        } else {
          // Verify the user exists before assigning
          const assignedUser = await prisma.user.findFirst({
            where: {
              id: input.assignedTo,
              companyId: user.companyId
            }
          });
          
          if (!assignedUser) {
            delete leadData.assignedTo;
          }
        }

        const lead = await prisma.lead.create({
          data: leadData,
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        // Create initial activity record
        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            activityType: 'CREATED',
            description: 'Lead created',
            createdBy: user.id
          }
        });

        logger.info(`Lead created: ${lead.id} by user: ${user.id}`);
        return lead;
      } catch (error) {
        logger.error('Error creating lead:', error);
        throw error;
      }
    },

    // Update lead
    updateLead: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const existingLead = await prisma.lead.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!existingLead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const lead = await prisma.lead.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user.id,
            ...(input.tags && { tags: input.tags })
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        // Create activity record for update
        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            activityType: 'NOTE_ADDED',
            description: 'Lead information updated',
            createdBy: user.id
          }
        });

        logger.info(`Lead updated: ${lead.id} by user: ${user.id}`);
        return lead;
      } catch (error) {
        logger.error('Error updating lead:', error);
        throw error;
      }
    },

    // Delete lead
    deleteLead: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const existingLead = await prisma.lead.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!existingLead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        await prisma.lead.delete({
          where: { id }
        });

        logger.info(`Lead deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting lead:', error);
        throw error;
      }
    },

    // Create opportunity
    createOpportunity: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const lead = await prisma.lead.findFirst({
          where: {
            id: input.leadId,
            companyId: user.companyId
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const opportunity = await prisma.opportunity.create({
          data: {
            ...input,
            createdBy: user.id,
            updatedBy: user.id,
            tags: input.tags || []
          },
          include: {
            lead: true
          }
        });

        logger.info(`Opportunity created: ${opportunity.id} by user: ${user.id}`);
        return opportunity;
      } catch (error) {
        logger.error('Error creating opportunity:', error);
        throw error;
      }
    },

    // Update opportunity
    updateOpportunity: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if opportunity exists and belongs to user's company
        const existingOpportunity = await prisma.opportunity.findFirst({
          where: {
            id,
            lead: {
              companyId: user.companyId
            }
          }
        });

        if (!existingOpportunity) {
          throw new GraphQLError('Opportunity not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const opportunity = await prisma.opportunity.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user.id,
            ...(input.tags && { tags: input.tags })
          },
          include: {
            lead: true
          }
        });

        logger.info(`Opportunity updated: ${opportunity.id} by user: ${user.id}`);
        return opportunity;
      } catch (error) {
        logger.error('Error updating opportunity:', error);
        throw error;
      }
    },

    // Delete opportunity
    deleteOpportunity: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if opportunity exists and belongs to user's company
        const existingOpportunity = await prisma.opportunity.findFirst({
          where: {
            id,
            lead: {
              companyId: user.companyId
            }
          }
        });

        if (!existingOpportunity) {
          throw new GraphQLError('Opportunity not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        await prisma.opportunity.delete({
          where: { id }
        });

        logger.info(`Opportunity deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting opportunity:', error);
        throw error;
      }
    },

    // Create lead activity
    createLeadActivity: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const lead = await prisma.lead.findFirst({
          where: {
            id: input.leadId,
            companyId: user.companyId
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const activity = await prisma.leadActivity.create({
          data: {
            ...input,
            createdBy: user.id
          },
          include: {
            lead: true
          }
        });

        logger.info(`Lead activity created: ${activity.id} by user: ${user.id}`);
        return activity;
      } catch (error) {
        logger.error('Error creating lead activity:', error);
        throw error;
      }
    },

    // Assign lead to user
    assignLead: async (_, { leadId, userId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const lead = await prisma.lead.findFirst({
          where: {
            id: leadId,
            companyId: user.companyId
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Check if assigned user exists and belongs to same company
        const assignedUser = await prisma.user.findFirst({
          where: {
            id: userId,
            companyId: user.companyId
          }
        });

        if (!assignedUser) {
          throw new GraphQLError('Assigned user not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updatedLead = await prisma.lead.update({
          where: { id: leadId },
          data: {
            assignedTo: userId,
            assignedAt: new Date(),
            updatedBy: user.id
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        // Create activity record
        await prisma.leadActivity.create({
          data: {
            leadId: leadId,
            activityType: 'REASSIGNED',
            description: `Lead assigned to ${assignedUser.firstName} ${assignedUser.lastName}`,
            createdBy: user.id
          }
        });

        logger.info(`Lead assigned: ${leadId} to user: ${userId} by user: ${user.id}`);
        return updatedLead;
      } catch (error) {
        logger.error('Error assigning lead:', error);
        throw error;
      }
    },

    // Convert lead to customer
    convertLeadToCustomer: async (_, { leadId, customerId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const lead = await prisma.lead.findFirst({
          where: {
            id: leadId,
            companyId: user.companyId
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Check if customer exists and belongs to user's company
        const customer = await prisma.customer.findFirst({
          where: {
            id: customerId,
            companyId: user.companyId
          }
        });

        if (!customer) {
          throw new GraphQLError('Customer not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updatedLead = await prisma.lead.update({
          where: { id: leadId },
          data: {
            status: 'CONVERTED',
            convertedToCustomerId: customerId,
            convertedAt: new Date(),
            updatedBy: user.id
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        // Create activity record
        await prisma.leadActivity.create({
          data: {
            leadId: leadId,
            activityType: 'CONVERTED',
            description: `Lead converted to customer: ${customer.name}`,
            metadata: { customerId: customerId },
            createdBy: user.id
          }
        });

        logger.info(`Lead converted: ${leadId} to customer: ${customerId} by user: ${user.id}`);
        return updatedLead;
      } catch (error) {
        logger.error('Error converting lead:', error);
        throw error;
      }
    },

    // Update lead status
    updateLeadStatus: async (_, { leadId, status }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const lead = await prisma.lead.findFirst({
          where: {
            id: leadId,
            companyId: user.companyId
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updatedLead = await prisma.lead.update({
          where: { id: leadId },
          data: {
            status,
            updatedBy: user.id
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        // Create activity record
        await prisma.leadActivity.create({
          data: {
            leadId: leadId,
            activityType: 'NOTE_ADDED',
            description: `Lead status updated to ${status}`,
            createdBy: user.id
          }
        });

        logger.info(`Lead status updated: ${leadId} to ${status} by user: ${user.id}`);
        return updatedLead;
      } catch (error) {
        logger.error('Error updating lead status:', error);
        throw error;
      }
    },

    // Update lead score
    updateLeadScore: async (_, { leadId, score }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Validate score range
        if (score < 0 || score > 100) {
          throw new GraphQLError('Lead score must be between 0 and 100', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        // Check if lead exists and belongs to user's company
        const lead = await prisma.lead.findFirst({
          where: {
            id: leadId,
            companyId: user.companyId
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updatedLead = await prisma.lead.update({
          where: { id: leadId },
          data: {
            score,
            updatedBy: user.id
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        logger.info(`Lead score updated: ${leadId} to ${score} by user: ${user.id}`);
        return updatedLead;
      } catch (error) {
        logger.error('Error updating lead score:', error);
        throw error;
      }
    },

    // Update lead last contacted
    updateLeadLastContacted: async (_, { leadId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lead exists and belongs to user's company
        const lead = await prisma.lead.findFirst({
          where: {
            id: leadId,
            companyId: user.companyId
          }
        });

        if (!lead) {
          throw new GraphQLError('Lead not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updatedLead = await prisma.lead.update({
          where: { id: leadId },
          data: {
            lastContactedAt: new Date(),
            updatedBy: user.id
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        // Create activity record
        await prisma.leadActivity.create({
          data: {
            leadId: leadId,
            activityType: 'CONTACTED',
            description: 'Lead marked as contacted',
            createdBy: user.id
          }
        });

        logger.info(`Lead last contacted updated: ${leadId} by user: ${user.id}`);
        return updatedLead;
      } catch (error) {
        logger.error('Error updating lead last contacted:', error);
        throw error;
      }
    },

    // Bulk update lead status
    bulkUpdateLeadStatus: async (_, { ids, status }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Update all leads that belong to user's company
        await prisma.lead.updateMany({
          where: {
            id: { in: ids },
            companyId: user.companyId
          },
          data: {
            status,
            updatedBy: user.id
          }
        });

        // Fetch updated leads
        const leads = await prisma.lead.findMany({
          where: {
            id: { in: ids },
            companyId: user.companyId
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        logger.info(`Bulk lead status update: ${ids.length} leads to ${status} by user: ${user.id}`);
        return leads;
      } catch (error) {
        logger.error('Error bulk updating lead status:', error);
        throw error;
      }
    },

    // Bulk assign leads
    bulkAssignLeads: async (_, { ids, userId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if assigned user exists and belongs to same company
        const assignedUser = await prisma.user.findFirst({
          where: {
            id: userId,
            companyId: user.companyId
          }
        });

        if (!assignedUser) {
          throw new GraphQLError('Assigned user not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Update all leads that belong to user's company
        await prisma.lead.updateMany({
          where: {
            id: { in: ids },
            companyId: user.companyId
          },
          data: {
            assignedTo: userId,
            assignedAt: new Date(),
            updatedBy: user.id
          }
        });

        // Fetch updated leads
        const leads = await prisma.lead.findMany({
          where: {
            id: { in: ids },
            companyId: user.companyId
          },
          include: {
            company_ref: true,
            assignedUser: true
          }
        });

        logger.info(`Bulk lead assignment: ${ids.length} leads to user: ${userId} by user: ${user.id}`);
        return leads;
      } catch (error) {
        logger.error('Error bulk assigning leads:', error);
        throw error;
      }
    }
  }
};

module.exports = leadResolvers; 