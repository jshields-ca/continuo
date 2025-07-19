const { UserInputError, AuthenticationError, ForbiddenError } = require('apollo-server-express');
const logger = require('../../shared/utils/logger');

const accountResolvers = {
  Query: {
    // Account queries
    accounts: async (parent, { filter = {}, limit = 50, offset = 0 }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const where = {
        companyId: user.companyId,
        ...(filter.type && { type: filter.type }),
        ...(filter.category && { category: filter.category }),
        ...(filter.status && { status: filter.status }),
        ...(filter.parentId && { parentId: filter.parentId }),
        ...(filter.isSystem !== undefined && { isSystem: filter.isSystem }),
        ...(filter.search && {
          OR: [
            { name: { contains: filter.search, mode: 'insensitive' } },
            { code: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ],
        }),
      };

      return await prisma.account.findMany({
        where,
        include: {
          parent: true,
          children: true,
          company: true,
          transactions: {
            orderBy: { date: 'desc' },
            take: 10, // Limit recent transactions
          },
        },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
        take: limit,
        skip: offset,
      });
    },

    account: async (parent, { id }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
        include: {
          parent: true,
          children: true,
          company: true,
          transactions: {
            orderBy: { date: 'desc' },
          },
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      return account;
    },

    accountByCode: async (parent, { code }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          code,
          companyId: user.companyId,
        },
        include: {
          parent: true,
          children: true,
          company: true,
          transactions: {
            orderBy: { date: 'desc' },
          },
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      return account;
    },

    accountHierarchy: async (parent, { parentId }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      return await prisma.account.findMany({
        where: {
          companyId: user.companyId,
          parentId: parentId || null,
        },
        include: {
          children: true,
        },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
      });
    },

    accountSummary: async (parent, args, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const accounts = await prisma.account.findMany({
        where: {
          companyId: user.companyId,
          status: 'ACTIVE',
        },
      });

      const totalAccounts = accounts.length;
      const activeAccounts = accounts.filter(a => a.status === 'ACTIVE').length;
      const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

      // Group by type
      const accountTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
      const accountsByType = accountTypes.map(type => {
        const typeAccounts = accounts.filter(a => a.type === type);
        return {
          type,
          count: typeAccounts.length,
          balance: typeAccounts.reduce((sum, account) => sum + parseFloat(account.balance), 0),
        };
      });

      // Group by category
      const accountCategories = [
        'CURRENT_ASSETS', 'FIXED_ASSETS', 'CURRENT_LIABILITIES', 'LONG_TERM_LIABILITIES',
        'COMMON_STOCK', 'RETAINED_EARNINGS', 'OPERATING_REVENUE', 'NON_OPERATING_REVENUE',
        'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSES', 'MARKETING_EXPENSES', 'ADMINISTRATIVE_EXPENSES'
      ];
      const accountsByCategory = accountCategories.map(category => {
        const categoryAccounts = accounts.filter(a => a.category === category);
        return {
          category,
          count: categoryAccounts.length,
          balance: categoryAccounts.reduce((sum, account) => sum + parseFloat(account.balance), 0),
        };
      });

      return {
        totalAccounts,
        activeAccounts,
        totalBalance,
        accountsByType,
        accountsByCategory,
      };
    },

    // Transaction queries
    transactions: async (parent, { filter = {}, limit = 50, offset = 0 }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const where = {
        companyId: user.companyId,
        ...(filter.accountId && { accountId: filter.accountId }),
        ...(filter.type && { type: filter.type }),
        ...(filter.category && { category: filter.category }),
        ...(filter.dateFrom && { date: { gte: new Date(filter.dateFrom) } }),
        ...(filter.dateTo && { date: { lte: new Date(filter.dateTo) } }),
        ...(filter.amountMin && { amount: { gte: filter.amountMin } }),
        ...(filter.amountMax && { amount: { lte: filter.amountMax } }),
        ...(filter.search && {
          OR: [
            { description: { contains: filter.search, mode: 'insensitive' } },
            { reference: { contains: filter.search, mode: 'insensitive' } },
          ],
        }),
      };

      return await prisma.transaction.findMany({
        where,
        include: {
          account: true,
          company: true,
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      });
    },

    transaction: async (parent, { id }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
        include: {
          account: true,
          company: true,
        },
      });

      if (!transaction) {
        throw new UserInputError('Transaction not found');
      }

      return transaction;
    },

    accountTransactions: async (parent, { accountId, limit = 50, offset = 0 }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      // Verify account belongs to user's company
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          companyId: user.companyId,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      return await prisma.transaction.findMany({
        where: {
          accountId,
          companyId: user.companyId,
        },
        include: {
          account: true,
          company: true,
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      });
    },

    // Chart of Accounts queries
    chartOfAccounts: async (parent, args, { user, prisma, requireAuth }) => {
      requireAuth();
      
      return await prisma.account.findMany({
        where: {
          companyId: user.companyId,
          status: 'ACTIVE',
        },
        include: {
          parent: true,
          children: true,
        },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
      });
    },

    accountBalances: async (parent, args, { user, prisma, requireAuth }) => {
      requireAuth();
      
      return await prisma.account.findMany({
        where: {
          companyId: user.companyId,
          status: 'ACTIVE',
        },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: 1, // Get latest transaction for balance verification
          },
        },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
      });
    },

    accountReconciliation: async (parent, { accountId }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          companyId: user.companyId,
        },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
          },
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      const expectedBalance = parseFloat(account.balance);
      const actualBalance = account.transactions.reduce((sum, transaction) => {
        const amount = parseFloat(transaction.amount);
        return transaction.type === 'CREDIT' ? sum + amount : sum - amount;
      }, parseFloat(account.openingBalance));

      const difference = expectedBalance - actualBalance;

      return {
        accountId,
        account,
        expectedBalance,
        actualBalance,
        difference,
        unreconciledTransactions: account.transactions.filter(t => !t.reconciled),
        reconciledTransactions: account.transactions.filter(t => t.reconciled),
        lastReconciledAt: account.lastReconciledAt,
      };
    },
  },

  Mutation: {
    // Account mutations
    createAccount: async (parent, { input }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      // Validate account code uniqueness
      const existingAccount = await prisma.account.findFirst({
        where: {
          code: input.code,
          companyId: user.companyId,
        },
      });

      if (existingAccount) {
        throw new UserInputError('Account code already exists');
      }

      // Validate parent account if provided
      if (input.parentId) {
        const parentAccount = await prisma.account.findFirst({
          where: {
            id: input.parentId,
            companyId: user.companyId,
          },
        });

        if (!parentAccount) {
          throw new UserInputError('Parent account not found');
        }
      }

      const account = await prisma.account.create({
        data: {
          ...input,
          companyId: user.companyId,
          openingBalance: input.openingBalance || 0,
          balance: input.openingBalance || 0,
          createdBy: user.id,
        },
        include: {
          parent: true,
          children: true,
          company: true,
        },
      });

      logger.info(`Account created: ${account.id} by user: ${user.id}`);
      return account;
    },

    updateAccount: async (parent, { id, input }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      if (account.isSystem) {
        throw new ForbiddenError('System accounts cannot be modified');
      }

      // Validate account code uniqueness if code is being updated
      if (input.code && input.code !== account.code) {
        const existingAccount = await prisma.account.findFirst({
          where: {
            code: input.code,
            companyId: user.companyId,
            id: { not: id },
          },
        });

        if (existingAccount) {
          throw new UserInputError('Account code already exists');
        }
      }

      const updatedAccount = await prisma.account.update({
        where: { id },
        data: {
          ...input,
          updatedBy: user.id,
        },
        include: {
          parent: true,
          children: true,
          company: true,
        },
      });

      logger.info(`Account updated: ${id} by user: ${user.id}`);
      return updatedAccount;
    },

    deleteAccount: async (parent, { id }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
        include: {
          children: true,
          transactions: true,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      if (account.isSystem) {
        throw new ForbiddenError('System accounts cannot be deleted');
      }

      if (account.children.length > 0) {
        throw new UserInputError('Cannot delete account with child accounts');
      }

      if (account.transactions.length > 0) {
        throw new UserInputError('Cannot delete account with transactions');
      }

      await prisma.account.delete({
        where: { id },
      });

      logger.info(`Account deleted: ${id} by user: ${user.id}`);
      return true;
    },

    archiveAccount: async (parent, { id }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      const updatedAccount = await prisma.account.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          updatedBy: user.id,
        },
        include: {
          parent: true,
          children: true,
          company: true,
        },
      });

      logger.info(`Account archived: ${id} by user: ${user.id}`);
      return updatedAccount;
    },

    activateAccount: async (parent, { id }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      const updatedAccount = await prisma.account.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          updatedBy: user.id,
        },
        include: {
          parent: true,
          children: true,
          company: true,
        },
      });

      logger.info(`Account activated: ${id} by user: ${user.id}`);
      return updatedAccount;
    },

    // Transaction mutations
    createTransaction: async (parent, { input }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      // Validate account exists and belongs to user's company
      const account = await prisma.account.findFirst({
        where: {
          id: input.accountId,
          companyId: user.companyId,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      // Validate transaction type
      if (!['DEBIT', 'CREDIT'].includes(input.type)) {
        throw new UserInputError('Transaction type must be DEBIT or CREDIT');
      }

      // Validate amount
      if (input.amount <= 0) {
        throw new UserInputError('Transaction amount must be greater than zero');
      }

      const transaction = await prisma.transaction.create({
        data: {
          ...input,
          companyId: user.companyId,
          date: input.date ? new Date(input.date) : new Date(),
          tags: input.tags || [],
          createdBy: user.id,
        },
        include: {
          account: true,
          company: true,
        },
      });

      // Update account balance
      const balanceChange = input.type === 'CREDIT' ? input.amount : -input.amount;
      await prisma.account.update({
        where: { id: input.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
          updatedBy: user.id,
        },
      });

      logger.info(`Transaction created: ${transaction.id} by user: ${user.id}`);
      return transaction;
    },

    updateTransaction: async (parent, { id, input }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
      });

      if (!transaction) {
        throw new UserInputError('Transaction not found');
      }

      // If amount or type is being updated, we need to recalculate account balance
      let balanceAdjustment = 0;
      if (input.amount !== undefined || input.type !== undefined) {
        const oldAmount = parseFloat(transaction.amount);
        const oldType = transaction.type;
        const newAmount = input.amount !== undefined ? input.amount : oldAmount;
        const newType = input.type !== undefined ? input.type : oldType;

        const oldBalanceChange = oldType === 'CREDIT' ? oldAmount : -oldAmount;
        const newBalanceChange = newType === 'CREDIT' ? newAmount : -newAmount;
        balanceAdjustment = newBalanceChange - oldBalanceChange;
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          ...input,
          date: input.date ? new Date(input.date) : undefined,
          updatedBy: user.id,
        },
        include: {
          account: true,
          company: true,
        },
      });

      // Update account balance if needed
      if (balanceAdjustment !== 0) {
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: balanceAdjustment,
            },
            updatedBy: user.id,
          },
        });
      }

      logger.info(`Transaction updated: ${id} by user: ${user.id}`);
      return updatedTransaction;
    },

    deleteTransaction: async (parent, { id }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
      });

      if (!transaction) {
        throw new UserInputError('Transaction not found');
      }

      // Reverse the account balance
      const balanceChange = transaction.type === 'CREDIT' ? -transaction.amount : transaction.amount;
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
          updatedBy: user.id,
        },
      });

      await prisma.transaction.delete({
        where: { id },
      });

      logger.info(`Transaction deleted: ${id} by user: ${user.id}`);
      return true;
    },

    // Chart of Accounts mutations
    createDefaultChartOfAccounts: async (parent, args, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const defaultAccounts = [
        // Assets
        { name: 'Cash', code: '1000', type: 'ASSET', category: 'CURRENT_ASSETS', description: 'Cash and cash equivalents' },
        { name: 'Accounts Receivable', code: '1100', type: 'ASSET', category: 'CURRENT_ASSETS', description: 'Money owed by customers' },
        { name: 'Inventory', code: '1200', type: 'ASSET', category: 'CURRENT_ASSETS', description: 'Product inventory' },
        { name: 'Equipment', code: '1500', type: 'ASSET', category: 'FIXED_ASSETS', description: 'Office equipment and machinery' },
        { name: 'Buildings', code: '1600', type: 'ASSET', category: 'FIXED_ASSETS', description: 'Buildings and structures' },
        
        // Liabilities
        { name: 'Accounts Payable', code: '2000', type: 'LIABILITY', category: 'CURRENT_LIABILITIES', description: 'Money owed to suppliers' },
        { name: 'Notes Payable', code: '2100', type: 'LIABILITY', category: 'CURRENT_LIABILITIES', description: 'Short-term loans' },
        { name: 'Long-term Debt', code: '2200', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES', description: 'Long-term loans and bonds' },
        
        // Equity
        { name: 'Common Stock', code: '3000', type: 'EQUITY', category: 'COMMON_STOCK', description: 'Common stock equity' },
        { name: 'Retained Earnings', code: '3100', type: 'EQUITY', category: 'RETAINED_EARNINGS', description: 'Accumulated profits' },
        
        // Revenue
        { name: 'Sales Revenue', code: '4000', type: 'REVENUE', category: 'OPERATING_REVENUE', description: 'Revenue from sales' },
        { name: 'Service Revenue', code: '4100', type: 'REVENUE', category: 'OPERATING_REVENUE', description: 'Revenue from services' },
        { name: 'Interest Income', code: '4200', type: 'REVENUE', category: 'NON_OPERATING_REVENUE', description: 'Interest earned' },
        
        // Expenses
        { name: 'Cost of Goods Sold', code: '5000', type: 'EXPENSE', category: 'COST_OF_GOODS_SOLD', description: 'Direct costs of goods sold' },
        { name: 'Salaries and Wages', code: '6000', type: 'EXPENSE', category: 'OPERATING_EXPENSES', description: 'Employee salaries and wages' },
        { name: 'Rent Expense', code: '6100', type: 'EXPENSE', category: 'OPERATING_EXPENSES', description: 'Office and equipment rent' },
        { name: 'Utilities', code: '6200', type: 'EXPENSE', category: 'OPERATING_EXPENSES', description: 'Electricity, water, internet, etc.' },
        { name: 'Marketing', code: '6300', type: 'EXPENSE', category: 'MARKETING_EXPENSES', description: 'Marketing and advertising expenses' },
        { name: 'Office Supplies', code: '6400', type: 'EXPENSE', category: 'ADMINISTRATIVE_EXPENSES', description: 'Office supplies and materials' },
      ];

      const createdAccounts = [];
      
      for (const accountData of defaultAccounts) {
        // Check if account already exists
        const existingAccount = await prisma.account.findFirst({
          where: {
            code: accountData.code,
            companyId: user.companyId,
          },
        });

        if (existingAccount) {
          // Update existing account to be marked as system account
          const updatedAccount = await prisma.account.update({
            where: { id: existingAccount.id },
            data: {
              isSystem: true,
              updatedBy: user.id,
            },
            include: {
              parent: true,
              children: true,
              company: true,
            },
          });
          createdAccounts.push(updatedAccount);
          continue;
        }

        const account = await prisma.account.create({
          data: {
            ...accountData,
            companyId: user.companyId,
            isSystem: true,
            createdBy: user.id,
          },
          include: {
            parent: true,
            children: true,
            company: true,
          },
        });
        createdAccounts.push(account);
      }

      logger.info(`Default chart of accounts created for company: ${user.companyId} by user: ${user.id}`);
      return createdAccounts;
    },

    importAccounts: async (parent, { accounts }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const createdAccounts = [];
      
      for (const accountData of accounts) {
        const account = await prisma.account.create({
          data: {
            ...accountData,
            companyId: user.companyId,
            createdBy: user.id,
          },
          include: {
            parent: true,
            children: true,
            company: true,
          },
        });
        createdAccounts.push(account);
      }

      logger.info(`Accounts imported for company: ${user.companyId} by user: ${user.id}`);
      return createdAccounts;
    },

    exportAccounts: async (parent, args, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const accounts = await prisma.account.findMany({
        where: {
          companyId: user.companyId,
        },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
      });

      // Return as JSON string for export
      return JSON.stringify(accounts, null, 2);
    },

    // Account balance mutations
    updateAccountBalance: async (parent, { accountId, balance }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          companyId: user.companyId,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      const updatedAccount = await prisma.account.update({
        where: { id: accountId },
        data: {
          balance,
          updatedBy: user.id,
        },
        include: {
          parent: true,
          children: true,
          company: true,
        },
      });

      logger.info(`Account balance updated: ${accountId} by user: ${user.id}`);
      return updatedAccount;
    },

    recalculateAccountBalances: async (parent, args, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const accounts = await prisma.account.findMany({
        where: {
          companyId: user.companyId,
        },
        include: {
          transactions: true,
        },
      });

      for (const account of accounts) {
        const calculatedBalance = account.transactions.reduce((sum, transaction) => {
          const amount = parseFloat(transaction.amount);
          return transaction.type === 'CREDIT' ? sum + amount : sum - amount;
        }, parseFloat(account.openingBalance));

        await prisma.account.update({
          where: { id: account.id },
          data: {
            balance: calculatedBalance,
            updatedBy: user.id,
          },
        });
      }

      logger.info(`Account balances recalculated for company: ${user.companyId} by user: ${user.id}`);
      return true;
    },

    // Account reconciliation
    reconcileAccount: async (parent, { accountId, transactions }, { user, prisma, requireAuth }) => {
      requireAuth();
      
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          companyId: user.companyId,
        },
        include: {
          transactions: true,
        },
      });

      if (!account) {
        throw new UserInputError('Account not found');
      }

      // Mark transactions as reconciled
      await prisma.transaction.updateMany({
        where: {
          id: { in: transactions },
          accountId,
          companyId: user.companyId,
        },
        data: {
          reconciled: true,
          updatedBy: user.id,
        },
      });

      // Update account reconciliation timestamp
      await prisma.account.update({
        where: { id: accountId },
        data: {
          lastReconciledAt: new Date(),
          updatedBy: user.id,
        },
      });

      // Return reconciliation summary
      const allTransactions = await prisma.transaction.findMany({
        where: {
          accountId,
          companyId: user.companyId,
        },
      });

      const expectedBalance = parseFloat(account.balance);
      const actualBalance = allTransactions.reduce((sum, transaction) => {
        const amount = parseFloat(transaction.amount);
        return transaction.type === 'CREDIT' ? sum + amount : sum - amount;
      }, parseFloat(account.openingBalance));

      return {
        accountId,
        account,
        expectedBalance,
        actualBalance,
        difference: expectedBalance - actualBalance,
        unreconciledTransactions: allTransactions.filter(t => !t.reconciled),
        reconciledTransactions: allTransactions.filter(t => t.reconciled),
        lastReconciledAt: new Date(),
      };
    },
  },

  // Field resolvers
  Account: {
    parent: async (parent, args, { prisma }) => {
      if (!parent.parentId) return null;
      return await prisma.account.findUnique({
        where: { id: parent.parentId },
      });
    },

    children: async (parent, args, { prisma }) => {
      return await prisma.account.findMany({
        where: { parentId: parent.id },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
      });
    },

    company: async (parent, args, { prisma }) => {
      return await prisma.company.findUnique({
        where: { id: parent.companyId },
      });
    },

    transactions: async (parent, args, { prisma }) => {
      return await prisma.transaction.findMany({
        where: { accountId: parent.id },
        orderBy: { date: 'desc' },
      });
    },
  },

  Transaction: {
    account: async (parent, args, { prisma }) => {
      return await prisma.account.findUnique({
        where: { id: parent.accountId },
      });
    },

    company: async (parent, args, { prisma }) => {
      return await prisma.company.findUnique({
        where: { id: parent.companyId },
      });
    },
  },
};

module.exports = accountResolvers; 