const { gql } = require('apollo-server-express');

const invoiceTypeDefs = gql`
  # Enums
  enum InvoiceStatus {
    DRAFT
    SENT
    PAID
    OVERDUE
    VOID
  }

  enum Currency {
    CAD
    USD
    EUR
    GBP
  }

  enum PaymentMethod {
    CASH
    CHECK
    BANK_TRANSFER
    CREDIT_CARD
    DEBIT_CARD
    PAYPAL
    STRIPE
    OTHER
  }

  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    CANCELLED
    REFUNDED
  }

  # Types
  type Invoice {
    id: ID!
    companyId: ID!
    customerId: ID!
    number: String!
    status: InvoiceStatus!
    issueDate: DateTime!
    dueDate: DateTime
    currency: Currency!
    subtotal: Float!
    taxAmount: Float!
    vatAmount: Float!
    total: Float!
    # Stored values for comparison (original database values)
    storedSubtotal: Float
    storedTaxAmount: Float
    storedVatAmount: Float
    storedTotal: Float
    notes: String
    pdfUrl: String
    customFields: JSON
    
    # Frozen customer/company info for legal compliance
    customerName: String!
    customerAddress: String!
    customerTaxId: String
    companyName: String!
    companyAddress: String!
    companyTaxId: String
    
    # Relationships
    company: Company!
    customer: Customer!
    items: [InvoiceItem!]!
    payments: [Payment!]!
    
    # Audit fields
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type InvoiceItem {
    id: ID!
    invoiceId: ID!
    description: String!
    quantity: Float!
    unitPrice: Float!
    taxRate: Float!
    vatRate: Float!
    amount: Float!
    customFields: JSON
    invoice: Invoice!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Payment {
    id: ID!
    invoiceId: ID!
    amount: Float!
    currency: Currency!
    paymentDate: DateTime!
    paymentMethod: PaymentMethod!
    reference: String
    notes: String
    status: PaymentStatus!
    invoice: Invoice!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type InvoiceHistory {
    id: ID!
    invoiceId: ID!
    userId: ID!
    action: String!
    field: String
    itemId: ID
    oldValue: JSON
    newValue: JSON
    createdAt: DateTime!
    
    # Relationships
    invoice: Invoice!
    user: User!
  }

  # Input types
  input CreateInvoiceInput {
    customerId: ID!
    issueDate: DateTime!
    dueDate: DateTime
    currency: Currency = CAD
    notes: String
    customFields: JSON
    items: [CreateInvoiceItemInput!]!
  }

  input CreateInvoiceItemInput {
    description: String!
    quantity: Float!
    unitPrice: Float!
    taxRate: Float = 0
    vatRate: Float = 0
    customFields: JSON
  }

  input UpdateInvoiceInput {
    customerId: ID
    issueDate: DateTime
    dueDate: DateTime
    currency: Currency
    notes: String
    customFields: JSON
    status: InvoiceStatus
  }

  input UpdateInvoiceItemInput {
    description: String
    quantity: Float
    unitPrice: Float
    taxRate: Float
    vatRate: Float
    customFields: JSON
  }

  input CreatePaymentInput {
    invoiceId: ID!
    amount: Float!
    currency: Currency = CAD
    paymentDate: DateTime
    paymentMethod: PaymentMethod!
    reference: String
    notes: String
  }

  input UpdatePaymentInput {
    amount: Float
    currency: Currency
    paymentDate: DateTime
    paymentMethod: PaymentMethod
    reference: String
    notes: String
    status: PaymentStatus
  }

  input InvoiceFilterInput {
    status: InvoiceStatus
    customerId: ID
    issueDateFrom: DateTime
    issueDateTo: DateTime
    dueDateFrom: DateTime
    dueDateTo: DateTime
    currency: Currency
    minAmount: Float
    maxAmount: Float
  }

  input InvoiceOrderByInput {
    field: InvoiceOrderByField!
    direction: OrderDirection!
  }

  enum InvoiceOrderByField {
    ISSUE_DATE
    DUE_DATE
    TOTAL
    STATUS
    CREATED_AT
    UPDATED_AT
  }

  enum OrderDirection {
    ASC
    DESC
  }

  # Queries
  type Query {
    # Invoice queries
    invoices(
      filter: InvoiceFilterInput
      orderBy: InvoiceOrderByInput
      limit: Int
      offset: Int
    ): [Invoice!]!
    
    invoice(id: ID!): Invoice
    invoiceByNumber(number: String!): Invoice
    
    # Invoice item queries
    invoiceItems(invoiceId: ID!): [InvoiceItem!]!
    invoiceItem(id: ID!): InvoiceItem
    
    # Payment queries
    payments(invoiceId: ID!): [Payment!]!
    payment(id: ID!): Payment
    
    # Invoice history queries
    invoiceHistory(invoiceId: ID!, limit: Int, offset: Int): [InvoiceHistory!]!
    
    # Analytics queries
    invoiceStats(
      filter: InvoiceFilterInput
      groupBy: String
    ): InvoiceStats!
    
    nextInvoiceNumber: String!
  }

  # Mutations
  type Mutation {
    # Invoice mutations
    createInvoice(input: CreateInvoiceInput!): Invoice!
    updateInvoice(id: ID!, input: UpdateInvoiceInput!): Invoice!
    deleteInvoice(id: ID!): Boolean!
    sendInvoice(id: ID!): Invoice!
    voidInvoice(id: ID!): Invoice!
    duplicateInvoice(id: ID!): Invoice!
    
    # Invoice item mutations
    addInvoiceItem(invoiceId: ID!, input: CreateInvoiceItemInput!): InvoiceItem!
    updateInvoiceItem(id: ID!, input: UpdateInvoiceItemInput!): InvoiceItem!
    deleteInvoiceItem(id: ID!): Boolean!
    
    # Payment mutations
    createPayment(input: CreatePaymentInput!): Payment!
    updatePayment(id: ID!, input: UpdatePaymentInput!): Payment!
    deletePayment(id: ID!): Boolean!
    
    # PDF generation
    generateInvoicePDF(id: ID!): String! # Returns PDF URL
  }

  # Analytics types
  type InvoiceStats {
    totalInvoices: Int!
    totalAmount: Float!
    paidAmount: Float!
    overdueAmount: Float!
    draftAmount: Float!
    averageInvoiceAmount: Float!
    currencyBreakdown: [CurrencyStats!]!
    statusBreakdown: [StatusStats!]!
  }

  type CurrencyStats {
    currency: Currency!
    count: Int!
    totalAmount: Float!
  }

  type StatusStats {
    status: InvoiceStatus!
    count: Int!
    totalAmount: Float!
  }

  # Custom scalar for JSON
  scalar JSON
  scalar DateTime
`;

module.exports = invoiceTypeDefs; 