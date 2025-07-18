const { gql } = require('apollo-server-express');

const userTypeDefs = gql`
  enum UserRole {
    OWNER
    ADMIN
    MANAGER
    EMPLOYEE
    VIEWER
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    PENDING
    SUSPENDED
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    role: UserRole!
    status: UserStatus!
    avatar: String
    phone: String
    companyId: String!
    company: Company!
    lastLoginAt: DateTime
    emailVerifiedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type Query {
    users(companyId: String!): [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    inviteUser(input: InviteUserInput!): User!
    updateUserRole(id: ID!, role: UserRole!): User!
    updateUserStatus(id: ID!, status: UserStatus!): User!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    phone: String
    avatar: String
  }

  input InviteUserInput {
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    phone: String
  }
`;

module.exports = { userTypeDefs };