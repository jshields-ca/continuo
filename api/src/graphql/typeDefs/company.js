const { gql } = require('apollo-server-express');

const companyTypeDefs = gql`
  enum CompanyStatus {
    TRIAL
    ACTIVE
    SUSPENDED
    CANCELLED
  }

  enum SubscriptionPlan {
    FREE
    STARTER
    PROFESSIONAL
    ENTERPRISE
  }

  type Company {
    id: ID!
    name: String!
    slug: String!
    email: String
    phone: String
    website: String
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    industry: String
    description: String
    logo: String
    status: CompanyStatus!
    subscriptionPlan: SubscriptionPlan!
    subscriptionStartDate: DateTime
    subscriptionEndDate: DateTime
    users: [User!]!
    userCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type Query {
    company(id: ID!): Company
    myCompany: Company
  }

  extend type Mutation {
    updateCompany(input: UpdateCompanyInput!): Company!
    updateSubscription(plan: SubscriptionPlan!): Company!
  }

  input UpdateCompanyInput {
    name: String
    email: String
    phone: String
    website: String
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    industry: String
    description: String
    logo: String
  }
`;

module.exports = { companyTypeDefs };