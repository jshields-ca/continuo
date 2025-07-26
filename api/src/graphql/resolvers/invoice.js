const { GraphQLError } = require('graphql');
const { PrismaClient } = require('@prisma/client');
const logger = require('../../shared/utils/logger');

const prisma = new PrismaClient();

// Helper function to generate invoice number
const generateInvoiceNumber = async (companyId) => {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { companyId },
    orderBy: { number: 'desc' }
  });

  if (!lastInvoice) {
    return 'INV-0001';
  }

  const lastNumber = parseInt(lastInvoice.number.split('-')[1]);
  const nextNumber = lastNumber + 1;
  return `INV-${nextNumber.toString().padStart(4, '0')}`;
};

// Helper function to calculate invoice totals
const calculateInvoiceTotals = (items) => {
  let subtotal = 0;
  let taxAmount = 0;
  let vatAmount = 0;

  items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;
    // Convert percentage to decimal (e.g., 11% = 0.11)
    taxAmount += itemTotal * ((item.taxRate || 0) / 100);
    vatAmount += itemTotal * ((item.vatRate || 0) / 100);
  });

  const total = subtotal + taxAmount + vatAmount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    vatAmount: parseFloat(vatAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Helper function to track invoice history
const trackInvoiceHistory = async (invoiceId, userId, action, field = null, itemId = null, oldValue = null, newValue = null) => {
  try {
    await prisma.invoiceHistory.create({
      data: {
        invoiceId,
        userId,
        action,
        field,
        itemId,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null
      }
    });
  } catch (error) {
    logger.error('Error tracking invoice history:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

// Helper function to get frozen customer/company info
const getFrozenInfo = async (customerId, companyId) => {
  const [customer, company] = await Promise.all([
    prisma.customer.findUnique({ where: { id: customerId } }),
    prisma.company.findUnique({ where: { id: companyId } })
  ]);

  return {
    customerName: customer.name,
    customerAddress: JSON.stringify(customer.address || {}),
    customerTaxId: customer.taxId || null,
    companyName: company.name,
    companyAddress: `${company.address || ''}, ${company.city || ''}, ${company.state || ''} ${company.zipCode || ''}`.trim(),
    companyTaxId: company.taxId || null
  };
};

const invoiceResolvers = {
  Query: {
    // Get invoices with filtering and pagination
    invoices: async (_, { filter, orderBy, limit = 50, offset = 0 }, context) => {
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
          if (filter.status) where.status = filter.status;
          if (filter.customerId) where.customerId = filter.customerId;
          if (filter.currency) where.currency = filter.currency;
          if (filter.issueDateFrom || filter.issueDateTo) {
            where.issueDate = {};
            if (filter.issueDateFrom) where.issueDate.gte = new Date(filter.issueDateFrom);
            if (filter.issueDateTo) where.issueDate.lte = new Date(filter.issueDateTo);
          }
          if (filter.dueDateFrom || filter.dueDateTo) {
            where.dueDate = {};
            if (filter.dueDateFrom) where.dueDate.gte = new Date(filter.dueDateFrom);
            if (filter.dueDateTo) where.dueDate.lte = new Date(filter.dueDateTo);
          }
          if (filter.minAmount || filter.maxAmount) {
            where.total = {};
            if (filter.minAmount) where.total.gte = filter.minAmount;
            if (filter.maxAmount) where.total.lte = filter.maxAmount;
          }
        }

        // Map frontend field names to Prisma field names
        const fieldMapping = {
          'CREATED_AT': 'createdAt',
          'UPDATED_AT': 'updatedAt',
          'ISSUE_DATE': 'issueDate',
          'DUE_DATE': 'dueDate',
          'CUSTOMER_NAME': 'customerName',
          'COMPANY_NAME': 'companyName',
          'TOTAL': 'total',
          'STATUS': 'status',
          'NUMBER': 'number'
        };

        const orderByClause = orderBy ? {
          [fieldMapping[orderBy.field] || orderBy.field]: orderBy.direction.toLowerCase()
        } : { createdAt: 'desc' };

        const invoices = await prisma.invoice.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: orderByClause,
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        // Recalculate totals for each invoice to ensure accuracy
        const invoicesWithRecalculatedTotals = invoices.map(invoice => {
          const recalculatedTotals = calculateInvoiceTotals(invoice.items);
          
          return {
            ...invoice,
            subtotal: recalculatedTotals.subtotal,
            taxAmount: recalculatedTotals.taxAmount,
            vatAmount: recalculatedTotals.vatAmount,
            total: recalculatedTotals.total,
            // Keep original values for comparison
            storedSubtotal: invoice.subtotal,
            storedTaxAmount: invoice.taxAmount,
            storedVatAmount: invoice.vatAmount,
            storedTotal: invoice.total
          };
        });

        return invoicesWithRecalculatedTotals;
      } catch (error) {
        logger.error('Error fetching invoices:', error);
        throw error;
      }
    },

    // Get single invoice
    invoice: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const invoice = await prisma.invoice.findFirst({
          where: {
            id,
            companyId: user.companyId
          },
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Recalculate totals to ensure accuracy
        const recalculatedTotals = calculateInvoiceTotals(invoice.items);
        
        return {
          ...invoice,
          subtotal: recalculatedTotals.subtotal,
          taxAmount: recalculatedTotals.taxAmount,
          vatAmount: recalculatedTotals.vatAmount,
          total: recalculatedTotals.total,
          // Keep original values for comparison
          storedSubtotal: invoice.subtotal,
          storedTaxAmount: invoice.taxAmount,
          storedVatAmount: invoice.vatAmount,
          storedTotal: invoice.total
        };
      } catch (error) {
        logger.error('Error fetching invoice:', error);
        throw error;
      }
    },

    // Get invoice by number
    invoiceByNumber: async (_, { number }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const invoice = await prisma.invoice.findFirst({
          where: {
            number,
            companyId: user.companyId
          },
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Recalculate totals to ensure accuracy
        const recalculatedTotals = calculateInvoiceTotals(invoice.items);
        
        return {
          ...invoice,
          subtotal: recalculatedTotals.subtotal,
          taxAmount: recalculatedTotals.taxAmount,
          vatAmount: recalculatedTotals.vatAmount,
          total: recalculatedTotals.total,
          // Keep original values for comparison
          storedSubtotal: invoice.subtotal,
          storedTaxAmount: invoice.taxAmount,
          storedVatAmount: invoice.vatAmount,
          storedTotal: invoice.total
        };
      } catch (error) {
        logger.error('Error fetching invoice by number:', error);
        throw error;
      }
    },

    // Get invoice items
    invoiceItems: async (_, { invoiceId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: invoiceId,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const items = await prisma.invoiceItem.findMany({
          where: { invoiceId },
          orderBy: { createdAt: 'asc' }
        });

        return items;
      } catch (error) {
        logger.error('Error fetching invoice items:', error);
        throw error;
      }
    },

    // Get single invoice item
    invoiceItem: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const item = await prisma.invoiceItem.findFirst({
          where: { id },
          include: {
            invoice: {
              where: { companyId: user.companyId }
            }
          }
        });

        if (!item || !item.invoice) {
          throw new GraphQLError('Invoice item not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return item;
      } catch (error) {
        logger.error('Error fetching invoice item:', error);
        throw error;
      }
    },

    // Get payments for invoice
    payments: async (_, { invoiceId }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: invoiceId,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const payments = await prisma.payment.findMany({
          where: { invoiceId },
          orderBy: { paymentDate: 'desc' }
        });

        return payments;
      } catch (error) {
        logger.error('Error fetching payments:', error);
        throw error;
      }
    },

    // Get single payment
    payment: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const payment = await prisma.payment.findFirst({
          where: { id },
          include: {
            invoice: {
              where: { companyId: user.companyId }
            }
          }
        });

        if (!payment || !payment.invoice) {
          throw new GraphQLError('Payment not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return payment;
      } catch (error) {
        logger.error('Error fetching payment:', error);
        throw error;
      }
    },

    // Get invoice history
    invoiceHistory: async (_, { invoiceId, limit = 50, offset = 0 }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: invoiceId,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const history = await prisma.invoiceHistory.findMany({
          where: { invoiceId },
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });

        return history;
      } catch (error) {
        logger.error('Error fetching invoice history:', error);
        throw error;
      }
    },

    // Get invoice statistics
    invoiceStats: async (_, { filter }, context) => {
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
          if (filter.status) where.status = filter.status;
          if (filter.customerId) where.customerId = filter.customerId;
          if (filter.currency) where.currency = filter.currency;
        }

        const invoices = await prisma.invoice.findMany({ 
          where,
          include: {
            items: true
          }
        });

        // Recalculate totals for each invoice to ensure accurate statistics
        const invoicesWithRecalculatedTotals = invoices.map(invoice => {
          const recalculatedTotals = calculateInvoiceTotals(invoice.items);
          return {
            ...invoice,
            total: recalculatedTotals.total
          };
        });

        const stats = {
          totalInvoices: invoicesWithRecalculatedTotals.length,
          totalAmount: invoicesWithRecalculatedTotals.reduce((sum, inv) => sum + parseFloat(inv.total), 0),
          paidAmount: invoicesWithRecalculatedTotals
            .filter(inv => inv.status === 'PAID')
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0),
          overdueAmount: invoicesWithRecalculatedTotals
            .filter(inv => inv.status === 'OVERDUE')
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0),
          draftAmount: invoicesWithRecalculatedTotals
            .filter(inv => inv.status === 'DRAFT')
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0),
          averageInvoiceAmount: invoicesWithRecalculatedTotals.length > 0 
            ? invoicesWithRecalculatedTotals.reduce((sum, inv) => sum + parseFloat(inv.total), 0) / invoicesWithRecalculatedTotals.length 
            : 0,
          currencyBreakdown: [],
          statusBreakdown: []
        };

        // Calculate currency breakdown
        const currencyMap = {};
        invoicesWithRecalculatedTotals.forEach(inv => {
          const currency = inv.currency;
          if (!currencyMap[currency]) {
            currencyMap[currency] = { count: 0, totalAmount: 0 };
          }
          currencyMap[currency].count++;
          currencyMap[currency].totalAmount += parseFloat(inv.total);
        });

        stats.currencyBreakdown = Object.entries(currencyMap).map(([currency, data]) => ({
          currency,
          count: data.count,
          totalAmount: data.totalAmount
        }));

        // Calculate status breakdown
        const statusMap = {};
        invoicesWithRecalculatedTotals.forEach(inv => {
          const status = inv.status;
          if (!statusMap[status]) {
            statusMap[status] = { count: 0, totalAmount: 0 };
          }
          statusMap[status].count++;
          statusMap[status].totalAmount += parseFloat(inv.total);
        });

        stats.statusBreakdown = Object.entries(statusMap).map(([status, data]) => ({
          status,
          count: data.count,
          totalAmount: data.totalAmount
        }));

        return stats;
      } catch (error) {
        logger.error('Error fetching invoice stats:', error);
        throw error;
      }
    },

    // Get next invoice number
    nextInvoiceNumber: async (_, __, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        return await generateInvoiceNumber(user.companyId);
      } catch (error) {
        logger.error('Error generating invoice number:', error);
        throw error;
      }
    }
  },

  Mutation: {
    // Create invoice
    createInvoice: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify customer belongs to user's company
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

        const invoiceNumber = await generateInvoiceNumber(user.companyId);
        const frozenInfo = await getFrozenInfo(input.customerId, user.companyId);
        const totals = calculateInvoiceTotals(input.items);

        const invoice = await prisma.invoice.create({
          data: {
            companyId: user.companyId,
            customerId: input.customerId,
            number: invoiceNumber,
            issueDate: new Date(input.issueDate),
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            currency: input.currency || 'CAD',
            subtotal: totals.subtotal,
            taxAmount: totals.taxAmount,
            vatAmount: totals.vatAmount,
            total: totals.total,
            notes: input.notes,
            customFields: input.customFields,
            ...frozenInfo,
            items: {
              create: input.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate || 0,
                vatRate: item.vatRate || 0,
                amount: item.quantity * item.unitPrice,
                customFields: item.customFields
              }))
            }
          },
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        // Track invoice creation
        await trackInvoiceHistory(invoice.id, user.id, 'INVOICE_CREATED');

        logger.info(`Invoice created: ${invoice.id} by user: ${user.id}`);
        return invoice;
      } catch (error) {
        logger.error('Error creating invoice:', error);
        throw error;
      }
    },

    // Update invoice
    updateInvoice: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!existingInvoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Prevent updates to sent/paid invoices
        if (existingInvoice.status === 'SENT' || existingInvoice.status === 'PAID') {
          throw new GraphQLError('Cannot update sent or paid invoices', {
            extensions: { code: 'FORBIDDEN' }
          });
        }

        const updateData = {};
        const historyEntries = [];

        // Track changes for each field
        if (input.customerId && input.customerId !== existingInvoice.customerId) {
          updateData.customerId = input.customerId;
          historyEntries.push({
            field: 'customerId',
            oldValue: existingInvoice.customerId,
            newValue: input.customerId
          });
        }
        if (input.issueDate && new Date(input.issueDate).getTime() !== existingInvoice.issueDate.getTime()) {
          updateData.issueDate = new Date(input.issueDate);
          historyEntries.push({
            field: 'issueDate',
            oldValue: existingInvoice.issueDate,
            newValue: new Date(input.issueDate)
          });
        }
        if (input.dueDate !== undefined) {
          const newDueDate = input.dueDate ? new Date(input.dueDate) : null;
          if (newDueDate?.getTime() !== existingInvoice.dueDate?.getTime()) {
            updateData.dueDate = newDueDate;
            historyEntries.push({
              field: 'dueDate',
              oldValue: existingInvoice.dueDate,
              newValue: newDueDate
            });
          }
        }
        if (input.currency && input.currency !== existingInvoice.currency) {
          updateData.currency = input.currency;
          historyEntries.push({
            field: 'currency',
            oldValue: existingInvoice.currency,
            newValue: input.currency
          });
        }
        if (input.notes !== undefined && input.notes !== existingInvoice.notes) {
          updateData.notes = input.notes;
          historyEntries.push({
            field: 'notes',
            oldValue: existingInvoice.notes,
            newValue: input.notes
          });
        }
        if (input.customFields !== undefined && JSON.stringify(input.customFields) !== JSON.stringify(existingInvoice.customFields)) {
          updateData.customFields = input.customFields;
          historyEntries.push({
            field: 'customFields',
            oldValue: existingInvoice.customFields,
            newValue: input.customFields
          });
        }
        if (input.status && input.status !== existingInvoice.status) {
          updateData.status = input.status;
          historyEntries.push({
            field: 'status',
            oldValue: existingInvoice.status,
            newValue: input.status
          });
        }

        const invoice = await prisma.invoice.update({
          where: { id },
          data: updateData,
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        // Track all changes in history
        for (const entry of historyEntries) {
          await trackInvoiceHistory(id, user.id, 'FIELD_UPDATED', entry.field, null, entry.oldValue, entry.newValue);
        }

        logger.info(`Invoice updated: ${invoice.id} by user: ${user.id}`);
        return invoice;
      } catch (error) {
        logger.error('Error updating invoice:', error);
        throw error;
      }
    },

    // Delete invoice
    deleteInvoice: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Only allow deletion of draft invoices
        if (invoice.status !== 'DRAFT') {
          throw new GraphQLError('Only draft invoices can be deleted', {
            extensions: { code: 'FORBIDDEN' }
          });
        }

        await prisma.invoice.delete({ where: { id } });

        logger.info(`Invoice deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting invoice:', error);
        throw error;
      }
    },

    // Send invoice
    sendInvoice: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        if (invoice.status !== 'DRAFT') {
          throw new GraphQLError('Only draft invoices can be sent', {
            extensions: { code: 'FORBIDDEN' }
          });
        }

        const updatedInvoice = await prisma.invoice.update({
          where: { id },
          data: { status: 'SENT' },
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        logger.info(`Invoice sent: ${id} by user: ${user.id}`);
        return updatedInvoice;
      } catch (error) {
        logger.error('Error sending invoice:', error);
        throw error;
      }
    },

    // Void invoice
    voidInvoice: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        if (invoice.status === 'PAID') {
          throw new GraphQLError('Paid invoices cannot be voided', {
            extensions: { code: 'FORBIDDEN' }
          });
        }

        const updatedInvoice = await prisma.invoice.update({
          where: { id },
          data: { status: 'VOID' },
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        logger.info(`Invoice voided: ${id} by user: ${user.id}`);
        return updatedInvoice;
      } catch (error) {
        logger.error('Error voiding invoice:', error);
        throw error;
      }
    },

    // Duplicate invoice
    duplicateInvoice: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Get original invoice with items
        const originalInvoice = await prisma.invoice.findFirst({
          where: {
            id,
            companyId: user.companyId
          },
          include: {
            items: true
          }
        });

        if (!originalInvoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const invoiceNumber = await generateInvoiceNumber(user.companyId);
        const frozenInfo = await getFrozenInfo(originalInvoice.customerId, user.companyId);

        const newInvoice = await prisma.invoice.create({
          data: {
            companyId: user.companyId,
            customerId: originalInvoice.customerId,
            number: invoiceNumber,
            issueDate: new Date(),
            dueDate: originalInvoice.dueDate,
            currency: originalInvoice.currency,
            subtotal: originalInvoice.subtotal,
            taxAmount: originalInvoice.taxAmount,
            vatAmount: originalInvoice.vatAmount,
            total: originalInvoice.total,
            notes: originalInvoice.notes,
            customFields: originalInvoice.customFields,
            ...frozenInfo,
            items: {
              create: originalInvoice.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                vatRate: item.vatRate,
                amount: item.amount,
                customFields: item.customFields
              }))
            }
          },
          include: {
            customer: true,
            items: true,
            payments: true
          }
        });

        logger.info(`Invoice duplicated: ${originalInvoice.id} -> ${newInvoice.id} by user: ${user.id}`);
        return newInvoice;
      } catch (error) {
        logger.error('Error duplicating invoice:', error);
        throw error;
      }
    },

    // Add invoice item
    addInvoiceItem: async (_, { invoiceId, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company and is editable
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: invoiceId,
            companyId: user.companyId,
            status: { in: ['DRAFT'] }
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found or not editable', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const item = await prisma.invoiceItem.create({
          data: {
            invoiceId,
            description: input.description,
            quantity: input.quantity,
            unitPrice: input.unitPrice,
            taxRate: input.taxRate || 0,
            vatRate: input.vatRate || 0,
            amount: input.quantity * input.unitPrice,
            customFields: input.customFields
          }
        });

        // Recalculate invoice totals
        const items = await prisma.invoiceItem.findMany({ where: { invoiceId } });
        const totals = calculateInvoiceTotals(items);

        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            subtotal: totals.subtotal,
            taxAmount: totals.taxAmount,
            vatAmount: totals.vatAmount,
            total: totals.total
          }
        });

        // Track item addition
        await trackInvoiceHistory(invoiceId, user.id, 'ITEM_ADDED', null, item.id, null, {
          description: input.description,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          taxRate: input.taxRate || 0,
          vatRate: input.vatRate || 0,
          amount: input.quantity * input.unitPrice
        });

        logger.info(`Invoice item added: ${item.id} to invoice: ${invoiceId} by user: ${user.id}`);
        return item;
      } catch (error) {
        logger.error('Error adding invoice item:', error);
        throw error;
      }
    },

    // Update invoice item
    updateInvoiceItem: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify item belongs to user's company and invoice is editable
        const item = await prisma.invoiceItem.findFirst({
          where: { 
            id,
            invoice: {
              companyId: user.companyId,
              status: { in: ['DRAFT'] }
            }
          },
          include: {
            invoice: true
          }
        });

        if (!item || !item.invoice) {
          throw new GraphQLError('Invoice item not found or not editable', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updateData = {};
        const historyEntries = [];

        // Track changes for each field
        if (input.description !== undefined && input.description !== item.description) {
          updateData.description = input.description;
          historyEntries.push({
            field: 'description',
            oldValue: item.description,
            newValue: input.description
          });
        }
        if (input.quantity !== undefined && input.quantity !== item.quantity) {
          updateData.quantity = input.quantity;
          historyEntries.push({
            field: 'quantity',
            oldValue: item.quantity,
            newValue: input.quantity
          });
        }
        if (input.unitPrice !== undefined && input.unitPrice !== item.unitPrice) {
          updateData.unitPrice = input.unitPrice;
          historyEntries.push({
            field: 'unitPrice',
            oldValue: item.unitPrice,
            newValue: input.unitPrice
          });
        }
        if (input.taxRate !== undefined && input.taxRate !== item.taxRate) {
          updateData.taxRate = input.taxRate;
          historyEntries.push({
            field: 'taxRate',
            oldValue: item.taxRate,
            newValue: input.taxRate
          });
        }
        if (input.vatRate !== undefined && input.vatRate !== item.vatRate) {
          updateData.vatRate = input.vatRate;
          historyEntries.push({
            field: 'vatRate',
            oldValue: item.vatRate,
            newValue: input.vatRate
          });
        }
        if (input.customFields !== undefined && JSON.stringify(input.customFields) !== JSON.stringify(item.customFields)) {
          updateData.customFields = input.customFields;
          historyEntries.push({
            field: 'customFields',
            oldValue: item.customFields,
            newValue: input.customFields
          });
        }

        // Recalculate amount if quantity or unitPrice changed
        if (input.quantity !== undefined || input.unitPrice !== undefined) {
          const newQuantity = input.quantity !== undefined ? input.quantity : item.quantity;
          const newUnitPrice = input.unitPrice !== undefined ? input.unitPrice : item.unitPrice;
          const newAmount = newQuantity * newUnitPrice;
          updateData.amount = newAmount;
          
          if (newAmount !== item.amount) {
            historyEntries.push({
              field: 'amount',
              oldValue: item.amount,
              newValue: newAmount
            });
          }
        }

        const updatedItem = await prisma.invoiceItem.update({
          where: { id },
          data: updateData
        });

        // Recalculate invoice totals
        const items = await prisma.invoiceItem.findMany({ where: { invoiceId: item.invoiceId } });
        const totals = calculateInvoiceTotals(items);

        await prisma.invoice.update({
          where: { id: item.invoiceId },
          data: {
            subtotal: totals.subtotal,
            taxAmount: totals.taxAmount,
            vatAmount: totals.vatAmount,
            total: totals.total
          }
        });

        // Track all item changes in history
        for (const entry of historyEntries) {
          await trackInvoiceHistory(item.invoiceId, user.id, 'ITEM_UPDATED', entry.field, id, entry.oldValue, entry.newValue);
        }

        logger.info(`Invoice item updated: ${id} by user: ${user.id}`);
        return updatedItem;
      } catch (error) {
        logger.error('Error updating invoice item:', error);
        throw error;
      }
    },

    // Delete invoice item
    deleteInvoiceItem: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify item belongs to user's company and invoice is editable
        const item = await prisma.invoiceItem.findFirst({
          where: { 
            id,
            invoice: {
              companyId: user.companyId,
              status: { in: ['DRAFT'] }
            }
          },
          include: {
            invoice: true
          }
        });

        if (!item || !item.invoice) {
          throw new GraphQLError('Invoice item not found or not editable', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Track item deletion before deleting
        await trackInvoiceHistory(item.invoiceId, user.id, 'ITEM_DELETED', null, id, {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          vatRate: item.vatRate,
          amount: item.amount
        }, null);

        await prisma.invoiceItem.delete({ where: { id } });

        // Recalculate invoice totals
        const items = await prisma.invoiceItem.findMany({ where: { invoiceId: item.invoiceId } });
        const totals = calculateInvoiceTotals(items);

        await prisma.invoice.update({
          where: { id: item.invoiceId },
          data: {
            subtotal: totals.subtotal,
            taxAmount: totals.taxAmount,
            vatAmount: totals.vatAmount,
            total: totals.total
          }
        });

        logger.info(`Invoice item deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting invoice item:', error);
        throw error;
      }
    },

    // Create payment
    createPayment: async (_, { input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: input.invoiceId,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const payment = await prisma.payment.create({
          data: {
            invoiceId: input.invoiceId,
            amount: input.amount,
            currency: input.currency || 'CAD',
            paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
            paymentMethod: input.paymentMethod,
            reference: input.reference,
            notes: input.notes
          }
        });

        // Update invoice status if payment covers full amount
        const totalPayments = await prisma.payment.aggregate({
          where: { invoiceId: input.invoiceId },
          _sum: { amount: true }
        });

        const totalPaid = totalPayments._sum.amount || 0;
        if (totalPaid >= parseFloat(invoice.total)) {
          await prisma.invoice.update({
            where: { id: input.invoiceId },
            data: { status: 'PAID' }
          });
        }

        logger.info(`Payment created: ${payment.id} for invoice: ${input.invoiceId} by user: ${user.id}`);
        return payment;
      } catch (error) {
        logger.error('Error creating payment:', error);
        throw error;
      }
    },

    // Update payment
    updatePayment: async (_, { id, input }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify payment belongs to user's company
        const payment = await prisma.payment.findFirst({
          where: { id },
          include: {
            invoice: {
              where: { companyId: user.companyId }
            }
          }
        });

        if (!payment || !payment.invoice) {
          throw new GraphQLError('Payment not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updateData = {};
        if (input.amount !== undefined) updateData.amount = input.amount;
        if (input.currency !== undefined) updateData.currency = input.currency;
        if (input.paymentDate !== undefined) updateData.paymentDate = new Date(input.paymentDate);
        if (input.paymentMethod !== undefined) updateData.paymentMethod = input.paymentMethod;
        if (input.reference !== undefined) updateData.reference = input.reference;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.status !== undefined) updateData.status = input.status;

        const updatedPayment = await prisma.payment.update({
          where: { id },
          data: updateData
        });

        logger.info(`Payment updated: ${id} by user: ${user.id}`);
        return updatedPayment;
      } catch (error) {
        logger.error('Error updating payment:', error);
        throw error;
      }
    },

    // Delete payment
    deletePayment: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify payment belongs to user's company
        const payment = await prisma.payment.findFirst({
          where: { id },
          include: {
            invoice: {
              where: { companyId: user.companyId }
            }
          }
        });

        if (!payment || !payment.invoice) {
          throw new GraphQLError('Payment not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        await prisma.payment.delete({ where: { id } });

        logger.info(`Payment deleted: ${id} by user: ${user.id}`);
        return true;
      } catch (error) {
        logger.error('Error deleting payment:', error);
        throw error;
      }
    },

    // Generate invoice PDF (placeholder for now)
    generateInvoicePDF: async (_, { id }, context) => {
      try {
        const { user } = context;
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Verify invoice belongs to user's company
        const invoice = await prisma.invoice.findFirst({
          where: {
            id,
            companyId: user.companyId
          }
        });

        if (!invoice) {
          throw new GraphQLError('Invoice not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // TODO: Implement actual PDF generation
        // For now, return a placeholder URL
        const pdfUrl = `/api/invoices/${id}/pdf`;
        
        // Update invoice with PDF URL
        await prisma.invoice.update({
          where: { id },
          data: { pdfUrl }
        });

        logger.info(`PDF generation requested for invoice: ${id} by user: ${user.id}`);
        return pdfUrl;
      } catch (error) {
        logger.error('Error generating invoice PDF:', error);
        throw error;
      }
    }
  },

  // Type resolvers
  Invoice: {
    company: async (parent, _, context) => {
      return await prisma.company.findUnique({ where: { id: parent.companyId } });
    },
    customer: async (parent, _, context) => {
      return await prisma.customer.findUnique({ where: { id: parent.customerId } });
    },
    items: async (parent, _, context) => {
      return await prisma.invoiceItem.findMany({ where: { invoiceId: parent.id } });
    },
    payments: async (parent, _, context) => {
      return await prisma.payment.findMany({ where: { invoiceId: parent.id } });
    }
  },

  InvoiceItem: {
    invoice: async (parent, _, context) => {
      return await prisma.invoice.findUnique({ where: { id: parent.invoiceId } });
    }
  },

  Payment: {
    invoice: async (parent, _, context) => {
      return await prisma.invoice.findUnique({ where: { id: parent.invoiceId } });
    }
  },

  InvoiceHistory: {
    invoice: async (parent, _, context) => {
      return await prisma.invoice.findUnique({ where: { id: parent.invoiceId } });
    },
    user: async (parent, _, context) => {
      return await prisma.user.findUnique({ where: { id: parent.userId } });
    }
  }
};

module.exports = invoiceResolvers; 