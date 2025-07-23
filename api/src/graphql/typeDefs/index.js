const { gql } = require('apollo-server-express');

// Base types
const baseTypes = gql`
  scalar DateTime
  scalar JSON
  
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
  
  type Subscription {
    _empty: String
  }
`;

// Import individual type definitions
const { userTypeDefs } = require('./user');
const { companyTypeDefs } = require('./company');
const { authTypeDefs } = require('./auth');
const customerTypeDefs = require('./customer');
const leadTypeDefs = require('./lead');
const accountTypeDefs = require('./account');
const invoiceTypeDefs = require('./invoice');

// Combine all type definitions
const typeDefs = [
  baseTypes,
  authTypeDefs,
  userTypeDefs,
  companyTypeDefs,
  customerTypeDefs,
  leadTypeDefs,
  accountTypeDefs,
  invoiceTypeDefs,
];

module.exports = { typeDefs };