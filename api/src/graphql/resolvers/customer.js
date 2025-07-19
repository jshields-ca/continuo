const { GraphQLError } = require('graphql');
const { PrismaClient } = require('@prisma/client');
const logger = require('../../shared/utils/logger');

const prisma = new PrismaClient();

const customerResolvers = {
  Query: {
    // Get customers with pagination and filtering
    customers: async (_, { first = 10, after, filter }, context) => {
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
              { industry: { contains: filter.search, mode: 'insensitive' } },
              { notes: { contains: filter.search, mode: 'insensitive' } }
            ];
          }
          if (filter.status) where.status = filter.status;
          if (filter.type) where.type = filter.type;
          if (filter.industry) where.industry = filter.industry;
          if (filter.tags && filter.tags.length > 0) {
            where.tags = { hasSome: filter.tags };
          }
        }

        const cursor = after ? { id: after } : undefined;

        const [customers, totalCount] = await Promise.all([
          prisma.customer.findMany({
            where,
            take: first + 1,
            cursor,
            orderBy: { createdAt: 'desc' },
            include: {
              contacts: true
            }
          }),
          prisma.customer.count({ where })
        ]);

        const hasNextPage = customers.length > first;
        const edges = customers.slice(0, first).map(customer => ({
          node: customer,
          cursor: customer.id
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
        logger.error('Error fetching customers:', error);
        throw error;
      }
    },

    // Get single customer
    customer: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const customer = await prisma.customer.findFirst({
          where: {
            id,
            companyId: user.companyId
          },
          include: {
            contacts: {
              include: {
                communications: {
                  orderBy: { createdAt: 'desc' },
                  take: 10
                },
                activities: {
                  orderBy: { createdAt: 'desc' },
                  take: 10
                }
              }
            }
          }
        });

        if (!customer) {
          throw new GraphQLError('Customer not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return customer;
      } catch (error) {
        logger.error('Error fetching customer:', error);
        throw error;
      }
    },

    // Get contacts with enhanced filtering
    contacts: async (_, { customerId, first = 10, after, filter }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const where = {
          customer: {
            companyId: user.companyId
          }
        };

        if (customerId) {
          where.customerId = customerId;
        }

        if (filter) {
          if (filter.search) {
            where.OR = [
              { firstName: { contains: filter.search, mode: 'insensitive' } },
              { lastName: { contains: filter.search, mode: 'insensitive' } },
              { email: { contains: filter.search, mode: 'insensitive' } },
              { phone: { contains: filter.search, mode: 'insensitive' } },
              { role: { contains: filter.search, mode: 'insensitive' } }
            ];
          }
          if (filter.role) where.role = filter.role;
          if (filter.isPrimary !== undefined) where.isPrimary = filter.isPrimary;
          if (filter.hasEmail !== undefined) {
            if (filter.hasEmail) {
              where.email = { not: null };
            } else {
              where.email = null;
            }
          }
          if (filter.hasPhone !== undefined) {
            if (filter.hasPhone) {
              where.phone = { not: null };
            } else {
              where.phone = null;
            }
          }
          if (filter.lastContactedAfter) {
            where.lastContactedAt = { gte: filter.lastContactedAfter };
          }
          if (filter.lastContactedBefore) {
            where.lastContactedAt = { ...where.lastContactedAt, lte: filter.lastContactedBefore };
          }
        }

        const cursor = after ? { id: after } : undefined;

        const [contacts, totalCount] = await Promise.all([
          prisma.contact.findMany({
            where,
            take: first + 1,
            cursor,
            orderBy: { createdAt: 'desc' },
            include: {
              customer: true,
              communications: {
                orderBy: { createdAt: 'desc' },
                take: 5
              },
              activities: {
                orderBy: { createdAt: 'desc' },
                take: 5
              }
            }
          }),
          prisma.contact.count({ where })
        ]);

        const hasNextPage = contacts.length > first;
        const edges = contacts.slice(0, first).map(contact => ({
          node: contact,
          cursor: contact.id
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
        logger.error('Error fetching contacts:', error);
        throw error;
      }
    },

    // Get single contact
    contact: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const contact = await prisma.contact.findFirst({
          where: {
            id,
            customer: {
              companyId: user.companyId
            }
          },
          include: {
            customer: true,
            communications: {
              orderBy: { createdAt: 'desc' }
            },
            activities: {
              orderBy: { createdAt: 'desc' }
            }
          }
        });

        if (!contact) {
          throw new GraphQLError('Contact not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return contact;
      } catch (error) {
        logger.error('Error fetching contact:', error);
        throw error;
      }
    },

    // Get contact communications
    contactCommunications: async (_, { contactId, first = 10, after, filter }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const where = {
          contact: {
            customer: {
              companyId: user.companyId
            }
          }
        };

        if (contactId) {
          where.contactId = contactId;
        }

        if (filter) {
          if (filter.type) where.type = filter.type;
          if (filter.direction) where.direction = filter.direction;
          if (filter.status) where.status = filter.status;
          if (filter.channel) where.channel = filter.channel;
          if (filter.after || filter.before) {
            where.createdAt = {};
            if (filter.after) where.createdAt.gte = filter.after;
            if (filter.before) where.createdAt.lte = filter.before;
          }
        }

        const cursor = after ? { id: after } : undefined;

        const [communications, totalCount] = await Promise.all([
          prisma.contactCommunication.findMany({
            where,
            take: first + 1,
            cursor,
            orderBy: { createdAt: 'desc' },
            include: {
              contact: true
            }
          }),
          prisma.contactCommunication.count({ where })
        ]);

        const hasNextPage = communications.length > first;
        const edges = communications.slice(0, first).map(communication => ({
          node: communication,
          cursor: communication.id
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
        logger.error('Error fetching contact communications:', error);
        throw error;
      }
    },

    // Get single contact communication
    contactCommunication: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const communication = await prisma.contactCommunication.findFirst({
          where: {
            id,
            contact: {
              customer: {
                companyId: user.companyId
              }
            }
          },
          include: {
            contact: true
          }
        });

        if (!communication) {
          throw new GraphQLError('Contact communication not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return communication;
      } catch (error) {
        logger.error('Error fetching contact communication:', error);
        throw error;
      }
    },

    // Get contact activities
    contactActivities: async (_, { contactId, first = 10, after }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const where = {
          contact: {
            customer: {
              companyId: user.companyId
            }
          }
        };

        if (contactId) {
          where.contactId = contactId;
        }

        const cursor = after ? { id: after } : undefined;

        const [activities, totalCount] = await Promise.all([
          prisma.contactActivity.findMany({
            where,
            take: first + 1,
            cursor,
            orderBy: { createdAt: 'desc' },
            include: {
              contact: true
            }
          }),
          prisma.contactActivity.count({ where })
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
        logger.error('Error fetching contact activities:', error);
        throw error;
      }
    },

    // Get single contact activity
    contactActivity: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const activity = await prisma.contactActivity.findFirst({
          where: {
            id,
            contact: {
              customer: {
                companyId: user.companyId
              }
            }
          },
          include: {
            contact: true
          }
        });

        if (!activity) {
          throw new GraphQLError('Contact activity not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return activity;
      } catch (error) {
        logger.error('Error fetching contact activity:', error);
        throw error;
      }
    }
  },

  Mutation: {
    // Create new customer
    createCustomer: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Validate required fields
        if (!input.name) {
          throw new GraphQLError('Customer name is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const customer = await prisma.customer.create({
          data: {
            ...input,
            companyId: user.companyId,
            createdBy: user.id,
            updatedBy: user.id,
            tags: input.tags || []
          },
          include: {
            contacts: true
          }
        });

        logger.info(`Customer created: ${customer.id} by user: ${user.id}`);
        return customer;
      } catch (error) {
        logger.error('Error creating customer:', error);
        throw error;
      }
    },

    // Update customer
    updateCustomer: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if customer exists and belongs to user's company
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!existingCustomer) {
          throw new GraphQLError('Customer not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const customer = await prisma.customer.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user.id,
            ...(input.tags && { tags: input.tags })
          },
          include: {
            contacts: true
          }
        });

        logger.info(`Customer updated: ${customer.id} by user: ${user.id}`);
        return customer;
      } catch (error) {
        logger.error('Error updating customer:', error);
        throw error;
      }
    },

    // Delete customer
    deleteCustomer: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if customer exists and belongs to user's company
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!existingCustomer) {
          throw new GraphQLError('Customer not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        await prisma.customer.delete({
          where: { id }
        });

        logger.info(`Customer deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting customer:', error);
        throw error;
      }
    },

    // Create new contact
    createContact: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Validate required fields
        if (!input.firstName || !input.lastName) {
          throw new GraphQLError('Contact first name and last name are required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        // Check if customer exists and belongs to user's company
        const customer = await prisma.customer.findFirst({
          where: {
            id: input.customerId,
            companyId: user.companyId
          }
        });

        if (!customer) {
          throw new GraphQLError('Customer not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // If this contact is primary, unset other primary contacts
        if (input.isPrimary) {
          await prisma.contact.updateMany({
            where: {
              customerId: input.customerId,
              isPrimary: true
            },
            data: {
              isPrimary: false
            }
          });
        }

        const contact = await prisma.contact.create({
          data: {
            ...input,
            createdBy: user.id,
            updatedBy: user.id
          },
          include: {
            customer: true
          }
        });

        // Create initial activity record
        await prisma.contactActivity.create({
          data: {
            contactId: contact.id,
            activityType: 'TASK_CREATED',
            description: 'Contact created',
            createdBy: user.id
          }
        });

        logger.info(`Contact created: ${contact.id} by user: ${user.id}`);
        return contact;
      } catch (error) {
        logger.error('Error creating contact:', error);
        throw error;
      }
    },

    // Update contact
    updateContact: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if contact exists and belongs to user's company
        const existingContact = await prisma.contact.findFirst({
          where: {
            id,
            customer: {
              companyId: user.companyId
            }
          }
        });

        if (!existingContact) {
          throw new GraphQLError('Contact not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // If this contact is being set as primary, unset other primary contacts
        if (input.isPrimary) {
          await prisma.contact.updateMany({
            where: {
              customerId: existingContact.customerId,
              isPrimary: true,
              id: { not: id }
            },
            data: {
              isPrimary: false
            }
          });
        }

        const contact = await prisma.contact.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user.id
          },
          include: {
            customer: true
          }
        });

        // Create activity record for update
        await prisma.contactActivity.create({
          data: {
            contactId: contact.id,
            activityType: 'UPDATED',
            description: 'Contact information updated',
            createdBy: user.id
          }
        });

        logger.info(`Contact updated: ${contact.id} by user: ${user.id}`);
        return contact;
      } catch (error) {
        logger.error('Error updating contact:', error);
        throw error;
      }
    },

    // Delete contact
    deleteContact: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if contact exists and belongs to user's company
        const existingContact = await prisma.contact.findFirst({
          where: {
            id,
            customer: {
              companyId: user.companyId
            }
          }
        });

        if (!existingContact) {
          throw new GraphQLError('Contact not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        await prisma.contact.delete({
          where: { id }
        });

        logger.info(`Contact deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting contact:', error);
        throw error;
      }
    },

    // Create contact communication
    createContactCommunication: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if contact exists and belongs to user's company
        const contact = await prisma.contact.findFirst({
          where: {
            id: input.contactId,
            customer: {
              companyId: user.companyId
            }
          }
        });

        if (!contact) {
          throw new GraphQLError('Contact not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const communication = await prisma.contactCommunication.create({
          data: {
            ...input,
            createdBy: user.id,
            updatedBy: user.id
          },
          include: {
            contact: true
          }
        });

        // Update contact's last contacted date
        await prisma.contact.update({
          where: { id: input.contactId },
          data: {
            lastContactedAt: new Date(),
            updatedBy: user.id
          }
        });

        // Create activity record
        await prisma.contactActivity.create({
          data: {
            contactId: input.contactId,
            activityType: 'CONTACTED',
            description: `${input.type.toLowerCase()} communication created`,
            metadata: { communicationId: communication.id },
            createdBy: user.id
          }
        });

        logger.info(`Contact communication created: ${communication.id} by user: ${user.id}`);
        return communication;
      } catch (error) {
        logger.error('Error creating contact communication:', error);
        throw error;
      }
    },

    // Update contact communication
    updateContactCommunication: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if communication exists and belongs to user's company
        const existingCommunication = await prisma.contactCommunication.findFirst({
          where: {
            id,
            contact: {
              customer: {
                companyId: user.companyId
              }
            }
          }
        });

        if (!existingCommunication) {
          throw new GraphQLError('Contact communication not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const communication = await prisma.contactCommunication.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user.id
          },
          include: {
            contact: true
          }
        });

        logger.info(`Contact communication updated: ${communication.id} by user: ${user.id}`);
        return communication;
      } catch (error) {
        logger.error('Error updating contact communication:', error);
        throw error;
      }
    },

    // Delete contact communication
    deleteContactCommunication: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if communication exists and belongs to user's company
        const existingCommunication = await prisma.contactCommunication.findFirst({
          where: {
            id,
            contact: {
              customer: {
                companyId: user.companyId
              }
            }
          }
        });

        if (!existingCommunication) {
          throw new GraphQLError('Contact communication not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        await prisma.contactCommunication.delete({
          where: { id }
        });

        logger.info(`Contact communication deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting contact communication:', error);
        throw error;
      }
    },

    // Create contact activity
    createContactActivity: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if contact exists and belongs to user's company
        const contact = await prisma.contact.findFirst({
          where: {
            id: input.contactId,
            customer: {
              companyId: user.companyId
            }
          }
        });

        if (!contact) {
          throw new GraphQLError('Contact not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const activity = await prisma.contactActivity.create({
          data: {
            ...input,
            createdBy: user.id
          },
          include: {
            contact: true
          }
        });

        logger.info(`Contact activity created: ${activity.id} by user: ${user.id}`);
        return activity;
      } catch (error) {
        logger.error('Error creating contact activity:', error);
        throw error;
      }
    },

    // Set primary contact
    setPrimaryContact: async (_, { contactId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if contact exists and belongs to user's company
        const contact = await prisma.contact.findFirst({
          where: {
            id: contactId,
            customer: {
              companyId: user.companyId
            }
          }
        });

        if (!contact) {
          throw new GraphQLError('Contact not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Unset other primary contacts for this customer
        await prisma.contact.updateMany({
          where: {
            customerId: contact.customerId,
            isPrimary: true,
            id: { not: contactId }
          },
          data: {
            isPrimary: false
          }
        });

        // Set this contact as primary
        const updatedContact = await prisma.contact.update({
          where: { id: contactId },
          data: {
            isPrimary: true,
            updatedBy: user.id
          },
          include: {
            customer: true
          }
        });

        // Create activity record
        await prisma.contactActivity.create({
          data: {
            contactId: contactId,
            activityType: 'UPDATED',
            description: 'Contact set as primary',
            createdBy: user.id
          }
        });

        logger.info(`Primary contact set: ${contactId} by user: ${user.id}`);
        return updatedContact;
      } catch (error) {
        logger.error('Error setting primary contact:', error);
        throw error;
      }
    },

    // Update contact last contacted
    updateContactLastContacted: async (_, { contactId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if contact exists and belongs to user's company
        const contact = await prisma.contact.findFirst({
          where: {
            id: contactId,
            customer: {
              companyId: user.companyId
            }
          }
        });

        if (!contact) {
          throw new GraphQLError('Contact not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updatedContact = await prisma.contact.update({
          where: { id: contactId },
          data: {
            lastContactedAt: new Date(),
            updatedBy: user.id
          },
          include: {
            customer: true
          }
        });

        // Create activity record
        await prisma.contactActivity.create({
          data: {
            contactId: contactId,
            activityType: 'CONTACTED',
            description: 'Contact marked as contacted',
            createdBy: user.id
          }
        });

        logger.info(`Contact last contacted updated: ${contactId} by user: ${user.id}`);
        return updatedContact;
      } catch (error) {
        logger.error('Error updating contact last contacted:', error);
        throw error;
      }
    },

    // Bulk update customer status
    bulkUpdateCustomerStatus: async (_, { ids, status }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Update all customers that belong to user's company
        const updatedCustomers = await prisma.customer.updateMany({
          where: {
            id: { in: ids },
            companyId: user.companyId
          },
          data: {
            status,
            updatedBy: user.id
          }
        });

        // Fetch updated customers
        const customers = await prisma.customer.findMany({
          where: {
            id: { in: ids },
            companyId: user.companyId
          },
          include: {
            contacts: true
          }
        });

        logger.info(`Bulk customer status update: ${ids.length} customers by user: ${user.id}`);
        return customers;
      } catch (error) {
        logger.error('Error bulk updating customer status:', error);
        throw error;
      }
    }
  }
};

module.exports = customerResolvers; 