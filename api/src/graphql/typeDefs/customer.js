const { gql } = require('apollo-server-express');

const customerTypeDefs = gql`
  enum CustomerStatus {
    ACTIVE
    INACTIVE
    PROSPECT
    LEAD
    CUSTOMER
    FORMER
  }

  enum CustomerType {
    INDIVIDUAL
    COMPANY
    ORGANIZATION
  }

  type Customer {
    id: ID!
    companyId: ID!
    name: String!
    type: CustomerType!
    status: CustomerStatus!
    email: String
    phone: String
    website: String
    address: JSON
    industry: String
    size: String
    annualRevenue: Float
    notes: String
    tags: [String!]!
    contacts: [Contact!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  type Contact {
    id: ID!
    customerId: ID!
    firstName: String!
    lastName: String!
    email: String
    phone: String
    role: String
    isPrimary: Boolean!
    notes: String
    customer: Customer!
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  input CreateCustomerInput {
    name: String!
    type: CustomerType = COMPANY
    status: CustomerStatus = ACTIVE
    email: String
    phone: String
    website: String
    address: JSON
    industry: String
    size: String
    annualRevenue: Float
    notes: String
    tags: [String!]
  }

  input UpdateCustomerInput {
    name: String
    type: CustomerType
    status: CustomerStatus
    email: String
    phone: String
    website: String
    address: JSON
    industry: String
    size: String
    annualRevenue: Float
    notes: String
    tags: [String!]
  }

  input CreateContactInput {
    customerId: ID!
    firstName: String!
    lastName: String!
    email: String
    phone: String
    role: String
    isPrimary: Boolean = false
    notes: String
  }

  input UpdateContactInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    role: String
    isPrimary: Boolean
    notes: String
  }

  input CustomerFilterInput {
    search: String
    status: CustomerStatus
    type: CustomerType
    industry: String
    tags: [String!]
  }

  type CustomerConnection {
    edges: [CustomerEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CustomerEdge {
    node: Customer!
    cursor: String!
  }

  type ContactConnection {
    edges: [ContactEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ContactEdge {
    node: Contact!
    cursor: String!
  }

  extend type Query {
    # Customer queries
    customers(
      first: Int = 10
      after: String
      filter: CustomerFilterInput
    ): CustomerConnection!
    
    customer(id: ID!): Customer
    
    # Contact queries
    contacts(
      customerId: ID
      first: Int = 10
      after: String
    ): ContactConnection!
    
    contact(id: ID!): Contact
  }

  extend type Mutation {
    # Customer mutations
    createCustomer(input: CreateCustomerInput!): Customer!
    updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer!
    deleteCustomer(id: ID!): Boolean!
    
    # Contact mutations
    createContact(input: CreateContactInput!): Contact!
    updateContact(id: ID!, input: UpdateContactInput!): Contact!
    deleteContact(id: ID!): Boolean!
    
    # Bulk operations
    bulkUpdateCustomerStatus(ids: [ID!]!, status: CustomerStatus!): [Customer!]!
  }
`;

module.exports = customerTypeDefs; 