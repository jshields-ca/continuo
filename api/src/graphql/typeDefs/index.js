const { gql } = require('apollo-server-express');

// Base types
const baseTypes = gql`
  scalar DateTime
  scalar JSON
  
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

// Combine all type definitions
const typeDefs = [
  baseTypes,
  authTypeDefs,
  userTypeDefs,
  companyTypeDefs,
];

module.exports = { typeDefs };