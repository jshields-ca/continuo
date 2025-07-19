const { PrismaClient } = require('@prisma/client');
const { GraphQLError } = require('graphql');
const { logger } = require('../../shared/utils/logger');

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

        // Build where clause
        const where = {
          companyId: user.companyId,
          ...(filter && {
            ...(filter.search && {
              OR: [
                { name: { contains: filter.search, mode: 'insensitive' } },
                { email: { contains: filter.search, mode: 'insensitive' } },
                { phone: { contains: filter.search, mode: 'insensitive' } }
              ]
            }),
            ...(filter.status && { status: filter.status }),
            ...(filter.type && { type: filter.type }),
            ...(filter.industry && { industry: filter.industry }),
            ...(filter.tags && { tags: { hasSome: filter.tags } })
          })
        };

        // Get total count
        const totalCount = await prisma.customer.count({ where });

        // Build pagination
        const skip = after ? 1 : 0;
        const cursor = after ? { id: after } : undefined;

        // Get customers
        const customers = await prisma.customer.findMany({
          where,
          take: first,
          skip,
          cursor,
          orderBy: { createdAt: 'desc' },
          include: {
            contacts: true
          }
        });

        // Build edges
        const edges = customers.map(customer => ({
          node: customer,
          cursor: customer.id
        }));

        // Build page info
        const hasNextPage = customers.length === first;
        const hasPreviousPage = !!after;

        const pageInfo = {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        };

        return {
          edges,
          pageInfo,
          totalCount
        };
      } catch (error) {
        logger.error('Error fetching customers:', error);
        throw new GraphQLError('Failed to fetch customers', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Get single customer by ID
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
            contacts: true
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

    // Get contacts with pagination
    contacts: async (_, { customerId, first = 10, after }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Build where clause
        const where = {
          customer: {
            companyId: user.companyId
          },
          ...(customerId && { customerId })
        };

        // Get total count
        const totalCount = await prisma.contact.count({ where });

        // Build pagination
        const skip = after ? 1 : 0;
        const cursor = after ? { id: after } : undefined;

        // Get contacts
        const contacts = await prisma.contact.findMany({
          where,
          take: first,
          skip,
          cursor,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true
          }
        });

        // Build edges
        const edges = contacts.map(contact => ({
          node: contact,
          cursor: contact.id
        }));

        // Build page info
        const hasNextPage = contacts.length === first;
        const hasPreviousPage = !!after;

        const pageInfo = {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        };

        return {
          edges,
          pageInfo,
          totalCount
        };
      } catch (error) {
        logger.error('Error fetching contacts:', error);
        throw new GraphQLError('Failed to fetch contacts', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Get single contact by ID
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
            customer: true
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