const axios = require('axios');

const API_URL = 'http://localhost:4000/graphql';
let authToken = null;
let currentUserId = null;

// Helper function to make GraphQL requests
async function graphqlRequest(query, variables = {}) {
  const response = await axios.post(API_URL, {
    query,
    variables,
  }, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

// Helper function to get current user ID
async function getCurrentUserId() {
  if (currentUserId) return currentUserId;
  
  const query = `
    query {
      me {
        id
        email
        companyId
      }
    }
  `;
  
  const response = await graphqlRequest(query);
  currentUserId = response.data.me.id;
  return currentUserId;
}

// Test data
const testAccounts = [
  {
    name: 'Cash',
    code: '1001',
    type: 'ASSET',
    category: 'CURRENT_ASSETS',
    description: 'Cash and cash equivalents',
  },
  {
    name: 'Accounts Receivable',
    code: '1101',
    type: 'ASSET',
    category: 'CURRENT_ASSETS',
    description: 'Money owed by customers',
  },
  {
    name: 'Accounts Payable',
    code: '2001',
    type: 'LIABILITY',
    category: 'CURRENT_LIABILITIES',
    description: 'Money owed to suppliers',
  },
  {
    name: 'Sales Revenue',
    code: '4001',
    type: 'REVENUE',
    category: 'OPERATING_REVENUE',
    description: 'Revenue from sales',
  },
  {
    name: 'Cost of Goods Sold',
    code: '5001',
    type: 'EXPENSE',
    category: 'COST_OF_GOODS_SOLD',
    description: 'Direct costs of goods sold',
  },
];

const testTransactions = [
  {
    accountId: null, // Will be set during test
    type: 'CREDIT',
    amount: 1000.00,
    description: 'Initial cash deposit',
    reference: 'INIT-001',
    category: 'Initial Setup',
    tags: ['setup', 'cash'],
  },
  {
    accountId: null, // Will be set during test
    type: 'DEBIT',
    amount: 500.00,
    description: 'Purchase of office supplies',
    reference: 'EXP-001',
    category: 'Office Expenses',
    tags: ['expense', 'supplies'],
  },
];

describe('Chart of Accounts API Tests', () => {
  let createdAccountIds = [];

  beforeAll(async () => {
    // Login to get authentication token
    const loginQuery = `
      mutation {
        login(input: { email: "admin@continuo-demo.com", password: "TestPassword123!" }) {
          token
          user {
            id
            email
            companyId
          }
        }
      }
    `;
    
    try {
      const response = await axios.post(API_URL, {
        query: loginQuery,
      });
      
      if (response.data.data?.login?.token) {
        authToken = response.data.data.login.token;
        console.log('✅ Authentication successful');
      } else {
        console.log('⚠️  Using existing session or fallback authentication');
      }
    } catch (error) {
      console.log('⚠️  Authentication failed, proceeding with tests');
    }
  });

  describe('Account Management', () => {
    test('should create accounts successfully', async () => {
      console.log('\n🧪 Testing account creation...');
      
      for (const accountData of testAccounts) {
        const createAccountQuery = `
          mutation CreateAccount($input: CreateAccountInput!) {
            createAccount(input: $input) {
              id
              name
              code
              type
              category
              status
              description
              balance
              openingBalance
              isSystem
              isReconcilable
              isTaxable
              createdAt
              updatedAt
            }
          }
        `;
        
        const response = await graphqlRequest(createAccountQuery, {
          input: accountData,
        });
        
        expect(response.data.createAccount).toBeDefined();
        expect(response.data.createAccount.name).toBe(accountData.name);
        expect(response.data.createAccount.code).toBe(accountData.code);
        expect(response.data.createAccount.type).toBe(accountData.type);
        expect(response.data.createAccount.category).toBe(accountData.category);
        expect(response.data.createAccount.status).toBe('ACTIVE');
        expect(response.data.createAccount.balance).toBe(0);
        expect(response.data.createAccount.openingBalance).toBe(0);
        expect(response.data.createAccount.isSystem).toBe(false);
        expect(response.data.createAccount.isReconcilable).toBe(true);
        expect(response.data.createAccount.isTaxable).toBe(false);
        
        createdAccountIds.push(response.data.createAccount.id);
        console.log(`✅ Created account: ${accountData.name} (${accountData.code})`);
      }
    });

    test('should retrieve accounts with filtering', async () => {
      console.log('\n🧪 Testing account retrieval with filters...');
      
      // Test getting all accounts
      const getAllAccountsQuery = `
        query {
          accounts {
            id
            name
            code
            type
            category
            status
            balance
          }
        }
      `;
      
      const allAccountsResponse = await graphqlRequest(getAllAccountsQuery);
      expect(allAccountsResponse.data.accounts).toBeDefined();
      expect(allAccountsResponse.data.accounts.length).toBeGreaterThanOrEqual(testAccounts.length);
      console.log(`✅ Retrieved ${allAccountsResponse.data.accounts.length} accounts`);
      
      // Test filtering by type
      const getAssetAccountsQuery = `
        query {
          accounts(filter: { type: ASSET }) {
            id
            name
            code
            type
            category
          }
        }
      `;
      
      const assetAccountsResponse = await graphqlRequest(getAssetAccountsQuery);
      expect(assetAccountsResponse.data.accounts).toBeDefined();
      expect(assetAccountsResponse.data.accounts.every(acc => acc.type === 'ASSET')).toBe(true);
      console.log(`✅ Retrieved ${assetAccountsResponse.data.accounts.length} asset accounts`);
      
      // Test filtering by category
      const getCurrentAssetsQuery = `
        query {
          accounts(filter: { category: CURRENT_ASSETS }) {
            id
            name
            code
            type
            category
          }
        }
      `;
      
      const currentAssetsResponse = await graphqlRequest(getCurrentAssetsQuery);
      expect(currentAssetsResponse.data.accounts).toBeDefined();
      expect(currentAssetsResponse.data.accounts.every(acc => acc.category === 'CURRENT_ASSETS')).toBe(true);
      console.log(`✅ Retrieved ${currentAssetsResponse.data.accounts.length} current asset accounts`);
      
      // Test search functionality
      const searchAccountsQuery = `
        query {
          accounts(filter: { search: "cash" }) {
            id
            name
            code
            type
            category
          }
        }
      `;
      
      const searchResponse = await graphqlRequest(searchAccountsQuery);
      expect(searchResponse.data.accounts).toBeDefined();
      expect(searchResponse.data.accounts.some(acc => acc.name.toLowerCase().includes('cash'))).toBe(true);
      console.log(`✅ Search found ${searchResponse.data.accounts.length} accounts matching "cash"`);
    });

    test('should get account by ID and code', async () => {
      console.log('\n🧪 Testing account retrieval by ID and code...');
      
      if (createdAccountIds.length === 0) {
        console.log('⚠️  No accounts created, skipping test');
        return;
      }
      
      const accountId = createdAccountIds[0];
      
      // Test getting account by ID
      const getAccountByIdQuery = `
        query GetAccount($id: ID!) {
          account(id: $id) {
            id
            name
            code
            type
            category
            status
            balance
            parent {
              id
              name
            }
            children {
              id
              name
            }
            transactions {
              id
              amount
              type
              description
            }
          }
        }
      `;
      
      const accountByIdResponse = await graphqlRequest(getAccountByIdQuery, { id: accountId });
      expect(accountByIdResponse.data.account).toBeDefined();
      expect(accountByIdResponse.data.account.id).toBe(accountId);
      console.log(`✅ Retrieved account by ID: ${accountByIdResponse.data.account.name}`);
      
      // Test getting account by code
      const accountCode = accountByIdResponse.data.account.code;
      const getAccountByCodeQuery = `
        query GetAccountByCode($code: String!) {
          accountByCode(code: $code) {
            id
            name
            code
            type
            category
          }
        }
      `;
      
      const accountByCodeResponse = await graphqlRequest(getAccountByCodeQuery, { code: accountCode });
      expect(accountByCodeResponse.data.accountByCode).toBeDefined();
      expect(accountByCodeResponse.data.accountByCode.code).toBe(accountCode);
      console.log(`✅ Retrieved account by code: ${accountByCodeResponse.data.accountByCode.name}`);
    });

    test('should get account hierarchy', async () => {
      console.log('\n🧪 Testing account hierarchy...');
      
      const getHierarchyQuery = `
        query {
          accountHierarchy {
            id
            name
            code
            type
            category
            children {
              id
              name
              code
            }
          }
        }
      `;
      
      const hierarchyResponse = await graphqlRequest(getHierarchyQuery);
      expect(hierarchyResponse.data.accountHierarchy).toBeDefined();
      console.log(`✅ Retrieved ${hierarchyResponse.data.accountHierarchy.length} root-level accounts`);
    });

    test('should get account summary', async () => {
      console.log('\n🧪 Testing account summary...');
      
      const getSummaryQuery = `
        query {
          accountSummary {
            totalAccounts
            activeAccounts
            totalBalance
            accountsByType {
              type
              count
              balance
            }
            accountsByCategory {
              category
              count
              balance
            }
          }
        }
      `;
      
      const summaryResponse = await graphqlRequest(getSummaryQuery);
      expect(summaryResponse.data.accountSummary).toBeDefined();
      expect(summaryResponse.data.accountSummary.totalAccounts).toBeGreaterThanOrEqual(0);
      expect(summaryResponse.data.accountSummary.activeAccounts).toBeGreaterThanOrEqual(0);
      expect(summaryResponse.data.accountSummary.accountsByType).toBeDefined();
      expect(summaryResponse.data.accountSummary.accountsByCategory).toBeDefined();
      console.log(`✅ Account summary: ${summaryResponse.data.accountSummary.totalAccounts} total accounts, ${summaryResponse.data.accountSummary.activeAccounts} active`);
    });

    test('should update account successfully', async () => {
      console.log('\n🧪 Testing account updates...');
      
      if (createdAccountIds.length === 0) {
        console.log('⚠️  No accounts created, skipping test');
        return;
      }
      
      const accountId = createdAccountIds[0];
      const updateData = {
        name: 'Updated Cash Account',
        description: 'Updated description for cash account',
        isTaxable: true,
      };
      
      const updateAccountQuery = `
        mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
          updateAccount(id: $id, input: $input) {
            id
            name
            description
            isTaxable
            updatedAt
          }
        }
      `;
      
      const updateResponse = await graphqlRequest(updateAccountQuery, {
        id: accountId,
        input: updateData,
      });
      
      expect(updateResponse.data.updateAccount).toBeDefined();
      expect(updateResponse.data.updateAccount.name).toBe(updateData.name);
      expect(updateResponse.data.updateAccount.description).toBe(updateData.description);
      expect(updateResponse.data.updateAccount.isTaxable).toBe(updateData.isTaxable);
      console.log(`✅ Updated account: ${updateResponse.data.updateAccount.name}`);
    });

    test('should archive and activate accounts', async () => {
      console.log('\n🧪 Testing account archiving and activation...');
      
      if (createdAccountIds.length === 0) {
        console.log('⚠️  No accounts created, skipping test');
        return;
      }
      
      const accountId = createdAccountIds[0];
      
      // Archive account
      const archiveAccountQuery = `
        mutation ArchiveAccount($id: ID!) {
          archiveAccount(id: $id) {
            id
            status
            updatedAt
          }
        }
      `;
      
      const archiveResponse = await graphqlRequest(archiveAccountQuery, { id: accountId });
      expect(archiveResponse.data.archiveAccount).toBeDefined();
      expect(archiveResponse.data.archiveAccount.status).toBe('ARCHIVED');
      console.log(`✅ Archived account: ${archiveResponse.data.archiveAccount.id}`);
      
      // Activate account
      const activateAccountQuery = `
        mutation ActivateAccount($id: ID!) {
          activateAccount(id: $id) {
            id
            status
            updatedAt
          }
        }
      `;
      
      const activateResponse = await graphqlRequest(activateAccountQuery, { id: accountId });
      expect(activateResponse.data.activateAccount).toBeDefined();
      expect(activateResponse.data.activateAccount.status).toBe('ACTIVE');
      console.log(`✅ Activated account: ${activateResponse.data.activateAccount.id}`);
    });
  });

  describe('Transaction Management', () => {
    let createdTransactionIds = [];
    let cashAccountId = null;

    beforeAll(async () => {
      // Get cash account ID for transactions
      const getCashAccountQuery = `
        query {
          accounts(filter: { search: "cash" }) {
            id
            name
            code
          }
        }
      `;
      
      const cashAccountResponse = await graphqlRequest(getCashAccountQuery);
      if (cashAccountResponse.data.accounts.length > 0) {
        cashAccountId = cashAccountResponse.data.accounts[0].id;
      }
    });

    test('should create transactions successfully', async () => {
      console.log('\n🧪 Testing transaction creation...');
      
      if (!cashAccountId) {
        console.log('⚠️  No cash account found, skipping transaction tests');
        return;
      }
      
      for (const transactionData of testTransactions) {
        const createTransactionQuery = `
          mutation CreateTransaction($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
              accountId
              type
              amount
              description
              reference
              date
              category
              tags
              createdAt
              updatedAt
              account {
                id
                name
                balance
              }
            }
          }
        `;
        
        const input = {
          ...transactionData,
          accountId: cashAccountId,
        };
        
        const response = await graphqlRequest(createTransactionQuery, { input });
        
        expect(response.data.createTransaction).toBeDefined();
        expect(response.data.createTransaction.accountId).toBe(cashAccountId);
        expect(response.data.createTransaction.type).toBe(transactionData.type);
        expect(response.data.createTransaction.amount).toBe(transactionData.amount);
        expect(response.data.createTransaction.description).toBe(transactionData.description);
        expect(response.data.createTransaction.reference).toBe(transactionData.reference);
        expect(response.data.createTransaction.category).toBe(transactionData.category);
        expect(response.data.createTransaction.tags).toEqual(transactionData.tags);
        expect(response.data.createTransaction.account).toBeDefined();
        
        createdTransactionIds.push(response.data.createTransaction.id);
        console.log(`✅ Created transaction: ${transactionData.description} (${transactionData.type} ${transactionData.amount})`);
        console.log(`   Account balance updated to: ${response.data.createTransaction.account.balance}`);
      }
    });

    test('should retrieve transactions with filtering', async () => {
      console.log('\n🧪 Testing transaction retrieval with filters...');
      
      if (!cashAccountId) {
        console.log('⚠️  No cash account found, skipping test');
        return;
      }
      
      // Test getting all transactions
      const getAllTransactionsQuery = `
        query {
          transactions {
            id
            accountId
            type
            amount
            description
            reference
            date
            category
            tags
            account {
              id
              name
            }
          }
        }
      `;
      
      const allTransactionsResponse = await graphqlRequest(getAllTransactionsQuery);
      expect(allTransactionsResponse.data.transactions).toBeDefined();
      console.log(`✅ Retrieved ${allTransactionsResponse.data.transactions.length} transactions`);
      
      // Test filtering by account
      const getAccountTransactionsQuery = `
        query GetAccountTransactions($accountId: ID!) {
          accountTransactions(accountId: $accountId) {
            id
            type
            amount
            description
            account {
              id
              name
            }
          }
        }
      `;
      
      const accountTransactionsResponse = await graphqlRequest(getAccountTransactionsQuery, {
        accountId: cashAccountId,
      });
      expect(accountTransactionsResponse.data.accountTransactions).toBeDefined();
      expect(accountTransactionsResponse.data.accountTransactions.every(t => t.account.id === cashAccountId)).toBe(true);
      console.log(`✅ Retrieved ${accountTransactionsResponse.data.accountTransactions.length} transactions for cash account`);
      
      // Test filtering by type
      const getCreditTransactionsQuery = `
        query {
          transactions(filter: { type: "CREDIT" }) {
            id
            type
            amount
            description
          }
        }
      `;
      
      const creditTransactionsResponse = await graphqlRequest(getCreditTransactionsQuery);
      expect(creditTransactionsResponse.data.transactions).toBeDefined();
      expect(creditTransactionsResponse.data.transactions.every(t => t.type === 'CREDIT')).toBe(true);
      console.log(`✅ Retrieved ${creditTransactionsResponse.data.transactions.length} credit transactions`);
    });

    test('should update transactions successfully', async () => {
      console.log('\n🧪 Testing transaction updates...');
      
      if (createdTransactionIds.length === 0) {
        console.log('⚠️  No transactions created, skipping test');
        return;
      }
      
      const transactionId = createdTransactionIds[0];
      const updateData = {
        description: 'Updated transaction description',
        category: 'Updated Category',
        tags: ['updated', 'test'],
      };
      
      const updateTransactionQuery = `
        mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
          updateTransaction(id: $id, input: $input) {
            id
            description
            category
            tags
            updatedAt
          }
        }
      `;
      
      const updateResponse = await graphqlRequest(updateTransactionQuery, {
        id: transactionId,
        input: updateData,
      });
      
      expect(updateResponse.data.updateTransaction).toBeDefined();
      expect(updateResponse.data.updateTransaction.description).toBe(updateData.description);
      expect(updateResponse.data.updateTransaction.category).toBe(updateData.category);
      expect(updateResponse.data.updateTransaction.tags).toEqual(updateData.tags);
      console.log(`✅ Updated transaction: ${updateResponse.data.updateTransaction.id}`);
    });

    test('should delete transactions successfully', async () => {
      console.log('\n🧪 Testing transaction deletion...');
      
      if (createdTransactionIds.length === 0) {
        console.log('⚠️  No transactions created, skipping test');
        return;
      }
      
      const transactionId = createdTransactionIds[createdTransactionIds.length - 1];
      
      const deleteTransactionQuery = `
        mutation DeleteTransaction($id: ID!) {
          deleteTransaction(id: $id)
        }
      `;
      
      const deleteResponse = await graphqlRequest(deleteTransactionQuery, { id: transactionId });
      expect(deleteResponse.data.deleteTransaction).toBe(true);
      console.log(`✅ Deleted transaction: ${transactionId}`);
      
      // Remove from our tracking array
      createdTransactionIds.pop();
    });
  });

  describe('Chart of Accounts Features', () => {
    test('should create default chart of accounts', async () => {
      console.log('\n🧪 Testing default chart of accounts creation...');
      
      const createDefaultChartQuery = `
        mutation {
          createDefaultChartOfAccounts {
            id
            name
            code
            type
            category
            isSystem
          }
        }
      `;
      
      const response = await graphqlRequest(createDefaultChartQuery);
      expect(response.data.createDefaultChartOfAccounts).toBeDefined();
      expect(response.data.createDefaultChartOfAccounts.length).toBeGreaterThan(0);
      expect(response.data.createDefaultChartOfAccounts.every(acc => acc.isSystem)).toBe(true);
      console.log(`✅ Created ${response.data.createDefaultChartOfAccounts.length} default accounts`);
    });

    test('should get chart of accounts', async () => {
      console.log('\n🧪 Testing chart of accounts retrieval...');
      
      const getChartQuery = `
        query {
          chartOfAccounts {
            id
            name
            code
            type
            category
            status
            balance
            parent {
              id
              name
            }
            children {
              id
              name
            }
          }
        }
      `;
      
      const response = await graphqlRequest(getChartQuery);
      expect(response.data.chartOfAccounts).toBeDefined();
      expect(response.data.chartOfAccounts.length).toBeGreaterThan(0);
      console.log(`✅ Retrieved ${response.data.chartOfAccounts.length} accounts in chart of accounts`);
    });

    test('should get account balances', async () => {
      console.log('\n🧪 Testing account balances retrieval...');
      
      const getBalancesQuery = `
        query {
          accountBalances {
            id
            name
            code
            type
            category
            balance
            openingBalance
            transactions {
              id
              amount
              type
            }
          }
        }
      `;
      
      const response = await graphqlRequest(getBalancesQuery);
      expect(response.data.accountBalances).toBeDefined();
      expect(response.data.accountBalances.length).toBeGreaterThan(0);
      console.log(`✅ Retrieved balances for ${response.data.accountBalances.length} accounts`);
    });

    test('should recalculate account balances', async () => {
      console.log('\n🧪 Testing account balance recalculation...');
      
      const recalculateQuery = `
        mutation {
          recalculateAccountBalances
        }
      `;
      
      const response = await graphqlRequest(recalculateQuery);
      expect(response.data.recalculateAccountBalances).toBe(true);
      console.log(`✅ Account balances recalculated successfully`);
    });

    test('should export accounts', async () => {
      console.log('\n🧪 Testing account export...');
      
      const exportQuery = `
        mutation {
          exportAccounts
        }
      `;
      
      const response = await graphqlRequest(exportQuery);
      expect(response.data.exportAccounts).toBeDefined();
      
      const exportedData = JSON.parse(response.data.exportAccounts);
      expect(Array.isArray(exportedData)).toBe(true);
      console.log(`✅ Exported ${exportedData.length} accounts`);
    });
  });

  describe('Account Reconciliation', () => {
    test('should get account reconciliation data', async () => {
      console.log('\n🧪 Testing account reconciliation...');
      
      // Get first account for reconciliation test
      const getAccountsQuery = `
        query {
          accounts(limit: 1) {
            id
            name
            code
          }
        }
      `;
      
      const accountsResponse = await graphqlRequest(getAccountsQuery);
      if (accountsResponse.data.accounts.length === 0) {
        console.log('⚠️  No accounts found, skipping reconciliation test');
        return;
      }
      
      const accountId = accountsResponse.data.accounts[0].id;
      
      const reconciliationQuery = `
        query GetAccountReconciliation($accountId: ID!) {
          accountReconciliation(accountId: $accountId) {
            accountId
            account {
              id
              name
              code
              balance
            }
            expectedBalance
            actualBalance
            difference
            unreconciledTransactions {
              id
              amount
              type
            }
            reconciledTransactions {
              id
              amount
              type
            }
            lastReconciledAt
          }
        }
      `;
      
      const response = await graphqlRequest(reconciliationQuery, { accountId });
      expect(response.data.accountReconciliation).toBeDefined();
      expect(response.data.accountReconciliation.accountId).toBe(accountId);
      expect(response.data.accountReconciliation.account).toBeDefined();
      expect(typeof response.data.accountReconciliation.expectedBalance).toBe('number');
      expect(typeof response.data.accountReconciliation.actualBalance).toBe('number');
      expect(typeof response.data.accountReconciliation.difference).toBe('number');
      expect(Array.isArray(response.data.accountReconciliation.unreconciledTransactions)).toBe(true);
      expect(Array.isArray(response.data.accountReconciliation.reconciledTransactions)).toBe(true);
      console.log(`✅ Retrieved reconciliation data for account: ${response.data.accountReconciliation.account.name}`);
      console.log(`   Expected: ${response.data.accountReconciliation.expectedBalance}, Actual: ${response.data.accountReconciliation.actualBalance}, Difference: ${response.data.accountReconciliation.difference}`);
    });
  });

  afterAll(async () => {
    console.log('\n🧹 Cleaning up test data...');
    
    // Clean up created accounts (if any)
    for (const accountId of createdAccountIds || []) {
      try {
        const deleteAccountQuery = `
          mutation DeleteAccount($id: ID!) {
            deleteAccount(id: $id)
          }
        `;
        await graphqlRequest(deleteAccountQuery, { id: accountId });
        console.log(`🗑️  Cleaned up account: ${accountId}`);
      } catch (error) {
        console.log(`⚠️  Could not clean up account ${accountId}: ${error.message}`);
      }
    }
    
    console.log('✅ Chart of Accounts API tests completed');
  });
}); 