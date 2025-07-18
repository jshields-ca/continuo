const { gql } = require('apollo-server-express');

const authTypeDefs = gql`
  extend type Query {
    me: User
    verifyEmail(token: String!): Boolean!
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(input: ResetPasswordInput!): Boolean!
    changePassword(input: ChangePasswordInput!): Boolean!
    resendVerificationEmail: Boolean!
  }

  input RegisterInput {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    companyName: String!
    phone: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ResetPasswordInput {
    token: String!
    password: String!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  type AuthPayload {
    token: String!
    user: User!
    company: Company!
  }
`;

module.exports = { authTypeDefs };