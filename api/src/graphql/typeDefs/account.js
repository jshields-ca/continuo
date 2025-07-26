const { gql } = require('apollo-server-express');

const accountTypeDefs = gql`
  # Account Types
  enum AccountType {
    ASSET
    LIABILITY
    EQUITY
    REVENUE
    EXPENSE
  }

  enum AccountCategory {
    # Assets
    CURRENT_ASSETS
    FIXED_ASSETS
    INTANGIBLE_ASSETS
    OTHER_ASSETS
    
    # Liabilities
    CURRENT_LIABILITIES
    LONG_TERM_LIABILITIES
    OTHER_LIABILITIES
    
    # Equity
    OWNERS_EQUITY
    RETAINED_EARNINGS
    COMMON_STOCK
    PREFERRED_STOCK
    
    # Revenue
    OPERATING_REVENUE
    NON_OPERATING_REVENUE
    OTHER_REVENUE
    
    # Expenses
    COST_OF_GOODS_SOLD
    OPERATING_EXPENSES
    ADMINISTRATIVE_EXPENSES
    MARKETING_EXPENSES
    RESEARCH_AND_DEVELOPMENT
    OTHER_EXPENSES
  }

  enum AccountStatus {
    ACTIVE
    INACTIVE
    ARCHIVED
  }

  # Account Type
  type Account {
    id: ID!
    companyId: ID!
    name: String!
    code: String!
    type: AccountType!
    category: AccountCategory!
    status: AccountStatus!
    description: String
    
    # Balance information
    balance: Float!
    openingBalance: Float!
    calculatedBalance: Float
    storedBalance: Float
    
    # Hierarchy
    parentId: ID
    parent: Account
    children: [Account!]!
    
    # Account settings
    isSystem: Boolean!
    isReconcilable: Boolean!
    isTaxable: Boolean!
    
    # Relationships
    company: Company!
    transactions: [Transaction!]!
    
    # Audit fields
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  # Audit Log Type
  type AuditLog {
    id: ID!
    userId: ID!
    user: User!
    companyId: ID!
    action: String!
    entity: String!
    entityId: String
    oldValues: JSON
    newValues: JSON
    ipAddress: String
    userAgent: String
    createdAt: DateTime!
  }

  # Transaction History Type
  type TransactionHistory {
    transaction: Transaction!
    auditLogs: [AuditLog!]!
  }

  # Transaction Type
  type Transaction {
    id: ID!
    companyId: ID!
    accountId: ID!
    type: String! # "DEBIT" or "CREDIT"
    amount: Float!
    description: String
    reference: String
    date: DateTime!
    
    # Transaction details
    category: String
    tags: [String!]!
    
    # Relationships
    company: Company!
    account: Account!
    
    # Audit fields
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  # Account Summary Type
  type AccountSummary {
    totalAccounts: Int!
    activeAccounts: Int!
    totalBalance: Float!
    accountsByType: [AccountTypeSummary!]!
    accountsByCategory: [AccountCategorySummary!]!
  }

  type AccountTypeSummary {
    type: AccountType!
    count: Int!
    balance: Float!
  }

  type AccountCategorySummary {
    category: AccountCategory!
    count: Int!
    balance: Float!
  }

  # Input Types
  input CreateAccountInput {
    name: String!
    code: String!
    type: AccountType!
    category: AccountCategory!
    description: String
    parentId: ID
    openingBalance: Float
    isSystem: Boolean
    isReconcilable: Boolean
    isTaxable: Boolean
  }

  input UpdateAccountInput {
    name: String
    code: String
    type: AccountType
    category: AccountCategory
    description: String
    parentId: ID
    status: AccountStatus
    isReconcilable: Boolean
    isTaxable: Boolean
  }

  input CreateTransactionInput {
    accountId: ID!
    type: String! # "DEBIT" or "CREDIT"
    amount: Float!
    description: String
    reference: String
    date: DateTime
    category: String
    tags: [String!]
  }

  input UpdateTransactionInput {
    type: String
    amount: Float
    description: String
    reference: String
    date: DateTime
    category: String
    tags: [String!]
  }

  input AccountFilterInput {
    type: AccountType
    category: AccountCategory
    status: AccountStatus
    parentId: ID
    isSystem: Boolean
    search: String
  }

  input TransactionFilterInput {
    accountId: ID
    type: String
    category: String
    dateFrom: DateTime
    dateTo: DateTime
    amountMin: Float
    amountMax: Float
    search: String
  }

  # Queries
  extend type Query {
    # Account queries
    accounts(filter: AccountFilterInput, limit: Int, offset: Int): [Account!]!
    account(id: ID!): Account
    accountByCode(code: String!): Account
    accountHierarchy(parentId: ID): [Account!]!
    accountSummary: AccountSummary!
    
    # Transaction queries
    transactions(filter: TransactionFilterInput, limit: Int, offset: Int): [Transaction!]!
    transaction(id: ID!): Transaction
    accountTransactions(accountId: ID!, limit: Int, offset: Int): [Transaction!]!
    transactionHistory(transactionId: ID!): TransactionHistory!
    
    # Chart of Accounts queries
    chartOfAccounts: [Account!]!
    accountBalances: [Account!]!
    accountReconciliation(accountId: ID!): AccountReconciliation!
  }

  # Mutations
  extend type Mutation {
    # Account mutations
    createAccount(input: CreateAccountInput!): Account!
    updateAccount(id: ID!, input: UpdateAccountInput!): Account!
    deleteAccount(id: ID!): Boolean!
    archiveAccount(id: ID!): Account!
    activateAccount(id: ID!): Account!
    
    # Transaction mutations
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
    
    # Chart of Accounts mutations
    createDefaultChartOfAccounts: [Account!]!
    importAccounts(accounts: [CreateAccountInput!]!): [Account!]!
    exportAccounts: String!
    
    # Account balance mutations
    updateAccountBalance(accountId: ID!, balance: Float!): Account!
    recalculateAccountBalances: Boolean!
    
    # Account reconciliation
    reconcileAccount(accountId: ID!, transactions: [ID!]!): AccountReconciliation!
  }

  # Account Reconciliation Type
  type AccountReconciliation {
    accountId: ID!
    account: Account!
    expectedBalance: Float!
    actualBalance: Float!
    difference: Float!
    unreconciledTransactions: [Transaction!]!
    reconciledTransactions: [Transaction!]!
    lastReconciledAt: DateTime
  }
`;

module.exports = accountTypeDefs; 