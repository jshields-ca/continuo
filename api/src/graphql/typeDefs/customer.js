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

  enum CommunicationType {
    EMAIL
    PHONE_CALL
    SMS
    MEETING
    NOTE
    TASK
    OTHER
  }

  enum CommunicationDirection {
    INBOUND
    OUTBOUND
  }

  enum CommunicationStatus {
    DRAFT
    SENT
    DELIVERED
    READ
    FAILED
    SCHEDULED
  }

  enum ActivityType {
    VIEWED
    UPDATED
    CONTACTED
    EMAIL_OPENED
    EMAIL_CLICKED
    PHONE_CALL_MADE
    PHONE_CALL_RECEIVED
    MEETING_SCHEDULED
    MEETING_COMPLETED
    NOTE_ADDED
    TASK_CREATED
    TASK_COMPLETED
    OTHER
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
    lastContactedAt: DateTime
    contactFrequency: String
    customer: Customer!
    communications: [ContactCommunication!]!
    activities: [ContactActivity!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  type ContactCommunication {
    id: ID!
    contactId: ID!
    type: CommunicationType!
    subject: String
    content: String
    direction: CommunicationDirection!
    status: CommunicationStatus!
    channel: String
    duration: Int
    scheduledAt: DateTime
    contact: Contact!
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  type ContactActivity {
    id: ID!
    contactId: ID!
    activityType: ActivityType!
    description: String
    metadata: JSON
    contact: Contact!
    createdAt: DateTime!
    createdBy: String
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
    contactFrequency: String
  }

  input UpdateContactInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    role: String
    isPrimary: Boolean
    notes: String
    contactFrequency: String
  }

  input CreateContactCommunicationInput {
    contactId: ID!
    type: CommunicationType!
    subject: String
    content: String
    direction: CommunicationDirection!
    status: CommunicationStatus = SENT
    channel: String
    duration: Int
    scheduledAt: DateTime
  }

  input UpdateContactCommunicationInput {
    type: CommunicationType
    subject: String
    content: String
    direction: CommunicationDirection
    status: CommunicationStatus
    channel: String
    duration: Int
    scheduledAt: DateTime
  }

  input CreateContactActivityInput {
    contactId: ID!
    activityType: ActivityType!
    description: String
    metadata: JSON
  }

  input CustomerFilterInput {
    search: String
    status: CustomerStatus
    type: CustomerType
    industry: String
    tags: [String!]
  }

  input ContactFilterInput {
    search: String
    role: String
    isPrimary: Boolean
    customerId: ID
    hasEmail: Boolean
    hasPhone: Boolean
    lastContactedAfter: DateTime
    lastContactedBefore: DateTime
  }

  input ContactCommunicationFilterInput {
    contactId: ID
    type: CommunicationType
    direction: CommunicationDirection
    status: CommunicationStatus
    channel: String
    after: DateTime
    before: DateTime
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

  type ContactCommunicationConnection {
    edges: [ContactCommunicationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ContactCommunicationEdge {
    node: ContactCommunication!
    cursor: String!
  }

  type ContactActivityConnection {
    edges: [ContactActivityEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ContactActivityEdge {
    node: ContactActivity!
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
      filter: ContactFilterInput
    ): ContactConnection!
    
    contact(id: ID!): Contact
    
    # Contact communication queries
    contactCommunications(
      contactId: ID
      first: Int = 10
      after: String
      filter: ContactCommunicationFilterInput
    ): ContactCommunicationConnection!
    
    contactCommunication(id: ID!): ContactCommunication
    
    # Contact activity queries
    contactActivities(
      contactId: ID
      first: Int = 10
      after: String
    ): ContactActivityConnection!
    
    contactActivity(id: ID!): ContactActivity
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
    
    # Contact communication mutations
    createContactCommunication(input: CreateContactCommunicationInput!): ContactCommunication!
    updateContactCommunication(id: ID!, input: UpdateContactCommunicationInput!): ContactCommunication!
    deleteContactCommunication(id: ID!): Boolean!
    
    # Contact activity mutations
    createContactActivity(input: CreateContactActivityInput!): ContactActivity!
    
    # Bulk operations
    bulkUpdateCustomerStatus(ids: [ID!]!, status: CustomerStatus!): [Customer!]!
    
    # Contact management operations
    setPrimaryContact(contactId: ID!): Contact!
    updateContactLastContacted(contactId: ID!): Contact!
  }
`;

module.exports = customerTypeDefs; 