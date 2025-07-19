const { gql } = require('apollo-server-express');

const leadTypeDefs = gql`
  enum LeadSource {
    WEBSITE
    REFERRAL
    SOCIAL_MEDIA
    EMAIL_CAMPAIGN
    PHONE_CALL
    TRADE_SHOW
    CONFERENCE
    PARTNER
    COLD_OUTREACH
    ADVERTISING
    SEARCH_ENGINE
    OTHER
  }

  enum LeadStatus {
    NEW
    CONTACTED
    QUALIFIED
    PROPOSAL_SENT
    NEGOTIATION
    CONVERTED
    LOST
    DISQUALIFIED
  }

  enum OpportunityStage {
    PROSPECTING
    QUALIFICATION
    PROPOSAL
    NEGOTIATION
    CLOSED_WON
    CLOSED_LOST
  }

  enum LeadActivityType {
    CREATED
    CONTACTED
    QUALIFIED
    PROPOSAL_SENT
    MEETING_SCHEDULED
    MEETING_COMPLETED
    FOLLOW_UP
    CONVERTED
    LOST
    REASSIGNED
    NOTE_ADDED
    EMAIL_SENT
    PHONE_CALL
    OTHER
  }

  type Lead {
    id: ID!
    companyId: ID!
    name: String!
    email: String!
    phone: String
    website: String
    source: LeadSource!
    status: LeadStatus!
    score: Int!
    company: String
    industry: String
    size: String
    annualRevenue: Float
    assignedTo: String
    assignedAt: DateTime
    lastContactedAt: DateTime
    notes: String
    tags: [String!]!
    convertedToCustomerId: String
    convertedAt: DateTime
    company_ref: Company!
    assignedUser: User
    opportunities: [Opportunity!]!
    activities: [LeadActivity!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  type Opportunity {
    id: ID!
    leadId: ID!
    title: String!
    description: String
    amount: Float
    stage: OpportunityStage!
    probability: Int!
    expectedCloseDate: DateTime
    actualCloseDate: DateTime
    notes: String
    tags: [String!]!
    lead: Lead!
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: String
    updatedBy: String
  }

  type LeadActivity {
    id: ID!
    leadId: ID!
    activityType: LeadActivityType!
    description: String
    metadata: JSON
    lead: Lead!
    createdAt: DateTime!
    createdBy: String
  }

  input CreateLeadInput {
    name: String!
    email: String!
    phone: String
    website: String
    source: LeadSource = WEBSITE
    status: LeadStatus = NEW
    score: Int = 0
    company: String
    industry: String
    size: String
    annualRevenue: Float
    assignedTo: String
    notes: String
    tags: [String!]
  }

  input UpdateLeadInput {
    name: String
    email: String
    phone: String
    website: String
    source: LeadSource
    status: LeadStatus
    score: Int
    company: String
    industry: String
    size: String
    annualRevenue: Float
    assignedTo: String
    notes: String
    tags: [String!]
  }

  input CreateOpportunityInput {
    leadId: ID!
    title: String!
    description: String
    amount: Float
    stage: OpportunityStage = PROSPECTING
    probability: Int = 10
    expectedCloseDate: DateTime
    notes: String
    tags: [String!]
  }

  input UpdateOpportunityInput {
    title: String
    description: String
    amount: Float
    stage: OpportunityStage
    probability: Int
    expectedCloseDate: DateTime
    actualCloseDate: DateTime
    notes: String
    tags: [String!]
  }

  input CreateLeadActivityInput {
    leadId: ID!
    activityType: LeadActivityType!
    description: String
    metadata: JSON
  }

  input LeadFilterInput {
    search: String
    source: LeadSource
    status: LeadStatus
    assignedTo: String
    industry: String
    tags: [String!]
    scoreMin: Int
    scoreMax: Int
    createdAfter: DateTime
    createdBefore: DateTime
    lastContactedAfter: DateTime
    lastContactedBefore: DateTime
  }

  input OpportunityFilterInput {
    leadId: ID
    stage: OpportunityStage
    amountMin: Float
    amountMax: Float
    probabilityMin: Int
    probabilityMax: Int
    expectedCloseAfter: DateTime
    expectedCloseBefore: DateTime
  }

  type LeadConnection {
    edges: [LeadEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type LeadEdge {
    node: Lead!
    cursor: String!
  }

  type OpportunityConnection {
    edges: [OpportunityEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type OpportunityEdge {
    node: Opportunity!
    cursor: String!
  }

  type LeadActivityConnection {
    edges: [LeadActivityEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type LeadActivityEdge {
    node: LeadActivity!
    cursor: String!
  }

  extend type Query {
    # Lead queries
    leads(
      first: Int = 10
      after: String
      filter: LeadFilterInput
    ): LeadConnection!
    
    lead(id: ID!): Lead
    
    # Opportunity queries
    opportunities(
      leadId: ID
      first: Int = 10
      after: String
      filter: OpportunityFilterInput
    ): OpportunityConnection!
    
    opportunity(id: ID!): Opportunity
    
    # Lead activity queries
    leadActivities(
      leadId: ID
      first: Int = 10
      after: String
    ): LeadActivityConnection!
    
    leadActivity(id: ID!): LeadActivity
    
    # Lead pipeline queries
    leadPipeline: LeadPipeline!
  }

  extend type Mutation {
    # Lead mutations
    createLead(input: CreateLeadInput!): Lead!
    updateLead(id: ID!, input: UpdateLeadInput!): Lead!
    deleteLead(id: ID!): Boolean!
    
    # Opportunity mutations
    createOpportunity(input: CreateOpportunityInput!): Opportunity!
    updateOpportunity(id: ID!, input: UpdateOpportunityInput!): Opportunity!
    deleteOpportunity(id: ID!): Boolean!
    
    # Lead activity mutations
    createLeadActivity(input: CreateLeadActivityInput!): LeadActivity!
    
    # Lead management operations
    assignLead(leadId: ID!, userId: String!): Lead!
    convertLeadToCustomer(leadId: ID!, customerId: ID!): Lead!
    updateLeadStatus(leadId: ID!, status: LeadStatus!): Lead!
    updateLeadScore(leadId: ID!, score: Int!): Lead!
    updateLeadLastContacted(leadId: ID!): Lead!
    
    # Bulk operations
    bulkUpdateLeadStatus(ids: [ID!]!, status: LeadStatus!): [Lead!]!
    bulkAssignLeads(ids: [ID!]!, userId: String!): [Lead!]!
  }

  type LeadPipeline {
    totalLeads: Int!
    newLeads: Int!
    contactedLeads: Int!
    qualifiedLeads: Int!
    proposalLeads: Int!
    negotiationLeads: Int!
    convertedLeads: Int!
    lostLeads: Int!
    totalOpportunities: Int!
    totalPipelineValue: Float!
    conversionRate: Float!
  }
`;

module.exports = leadTypeDefs; 