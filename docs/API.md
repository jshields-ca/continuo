# BizFlow API Documentation

> **Note**: "BizFlow" is a placeholder name and may not reflect the final chosen name for the software.

## Overview

The BizFlow API is built with GraphQL using Apollo Server, providing a flexible and efficient way to interact with the platform's data. This documentation covers all available queries, mutations, and types.

## Base URL

- **Development**: http://localhost:4000/graphql
- **Production**: https://api.[final-domain].com/graphql

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## GraphQL Playground

In development mode, you can access the GraphQL Playground at the same URL to explore the API interactively.

## Core Types

### User

```graphql
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
```

### Company

```graphql
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
  plan: SubscriptionPlan!
  planStartedAt: DateTime
  planExpiresAt: DateTime
  users: [User!]!
  userCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Enums

```graphql
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
```

## Queries

### Authentication Queries

#### Get Current User

```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
    fullName
    role
    status
    avatar
    phone
    companyId
    company {
      id
      name
      slug
      plan
      status
    }
    lastLoginAt
    emailVerifiedAt
    createdAt
  }
}
```

#### Verify Email

```graphql
query VerifyEmail($token: String!) {
  verifyEmail(token: $token)
}
```

### User Queries

#### Get Company Users

```graphql
query GetUsers($companyId: String!) {
  users(companyId: $companyId) {
    id
    email
    firstName
    lastName
    fullName
    role
    status
    avatar
    phone
    lastLoginAt
    emailVerifiedAt
    createdAt
  }
}
```

#### Get Specific User

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    fullName
    role
    status
    avatar
    phone
    companyId
    lastLoginAt
    emailVerifiedAt
    createdAt
    updatedAt
  }
}
```

### Company Queries

#### Get My Company

```graphql
query GetMyCompany {
  myCompany {
    id
    name
    slug
    email
    phone
    website
    address
    city
    state
    zipCode
    country
    industry
    description
    logo
    status
    plan
    planStartedAt
    planExpiresAt
    userCount
    createdAt
    updatedAt
  }
}
```

#### Get Specific Company

```graphql
query GetCompany($id: ID!) {
  company(id: $id) {
    id
    name
    slug
    email
    phone
    website
    address
    city
    state
    zipCode
    country
    industry
    description
    logo
    status
    plan
    planStartedAt
    planExpiresAt
    users {
      id
      firstName
      lastName
      email
      role
      status
    }
    userCount
    createdAt
    updatedAt
  }
}
```

## Mutations

### Authentication Mutations

#### Register User

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
      fullName
      role
      status
      companyId
      company {
        id
        name
        slug
        plan
        status
      }
    }
    company {
      id
      name
      slug
      plan
      status
    }
  }
}
```

**Input Type:**
```graphql
input RegisterInput {
  email: String!
  firstName: String!
  lastName: String!
  password: String!
  companyName: String!
  phone: String
}
```

#### Login User

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
      fullName
      role
      status
      companyId
      company {
        id
        name
        slug
        plan
        status
      }
    }
    company {
      id
      name
      slug
      plan
      status
    }
  }
}
```

**Input Type:**
```graphql
input LoginInput {
  email: String!
  password: String!
}
```

#### Logout

```graphql
mutation Logout {
  logout
}
```

#### Forgot Password

```graphql
mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
```

#### Reset Password

```graphql
mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input)
}
```

**Input Type:**
```graphql
input ResetPasswordInput {
  token: String!
  password: String!
}
```

#### Change Password

```graphql
mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input)
}
```

**Input Type:**
```graphql
input ChangePasswordInput {
  currentPassword: String!
  newPassword: String!
}
```

#### Resend Verification Email

```graphql
mutation ResendVerificationEmail {
  resendVerificationEmail
}
```

### User Mutations

#### Update User

```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    email
    firstName
    lastName
    fullName
    role
    status
    avatar
    phone
    companyId
    updatedAt
  }
}
```

**Input Type:**
```graphql
input UpdateUserInput {
  firstName: String
  lastName: String
  phone: String
  avatar: String
}
```

#### Delete User

```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

#### Invite User

```graphql
mutation InviteUser($input: InviteUserInput!) {
  inviteUser(input: $input) {
    id
    email
    firstName
    lastName
    fullName
    role
    status
    phone
    createdAt
  }
}
```

**Input Type:**
```graphql
input InviteUserInput {
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  phone: String
}
```

#### Update User Role

```graphql
mutation UpdateUserRole($id: ID!, $role: UserRole!) {
  updateUserRole(id: $id, role: $role) {
    id
    role
    updatedAt
  }
}
```

#### Update User Status

```graphql
mutation UpdateUserStatus($id: ID!, $status: UserStatus!) {
  updateUserStatus(id: $id, status: $status) {
    id
    status
    updatedAt
  }
}
```

### Company Mutations

#### Update Company

```graphql
mutation UpdateCompany($input: UpdateCompanyInput!) {
  updateCompany(input: $input) {
    id
    name
    email
    phone
    website
    address
    city
    state
    zipCode
    country
    industry
    description
    logo
    updatedAt
  }
}
```

**Input Type:**
```graphql
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
```

#### Update Subscription

```graphql
mutation UpdateSubscription($plan: SubscriptionPlan!) {
  updateSubscription(plan: $plan) {
    id
    plan
    planStartedAt
    planExpiresAt
    status
    updatedAt
  }
}
```

## Error Handling

The API returns GraphQL errors with the following structure:

```json
{
  "errors": [
    {
      "message": "Error description",
      "locations": [{"line": 1, "column": 10}],
      "path": ["fieldName"],
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

### Common Error Codes

- `GRAPHQL_VALIDATION_FAILED`: Invalid GraphQL query
- `UNAUTHENTICATED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `BAD_USER_INPUT`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- **GraphQL queries**: 100 requests per 15 minutes per IP

## Pagination

For queries that return lists, pagination is supported:

```graphql
query GetUsers($companyId: String!, $first: Int, $after: String) {
  users(companyId: $companyId, first: $first, after: $after) {
    edges {
      node {
        id
        email
        firstName
        lastName
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

## WebSocket Subscriptions

Real-time features are planned for future sprints. The WebSocket endpoint will be available at:

- **Development**: ws://localhost:4000/graphql
- **Production**: wss://api.[final-domain].com/graphql

## Health Check

Check API health at:

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-19T02:35:23.561Z",
  "version": "0.1.0"
}
```

## Examples

### Complete Authentication Flow

```javascript
// 1. Register a new user
const registerResponse = await fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          token
          user { id email firstName lastName }
          company { id name }
        }
      }
    `,
    variables: {
      input: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
        companyName: 'Example Corp'
      }
    }
  })
});

// 2. Login
const loginResponse = await fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
          user { id email firstName lastName }
        }
      }
    `,
    variables: {
      input: {
        email: 'john@example.com',
        password: 'SecurePass123!'
      }
    }
  })
});

// 3. Get user data with token
const userResponse = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: `
      query Me {
        me {
          id
          email
          firstName
          lastName
          company { name plan status }
        }
      }
    `
  })
});
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @apollo/client graphql
```

### React

```bash
npm install @apollo/client graphql
```

### Python

```bash
pip install gql[requests]
```

### Ruby

```bash
gem install graphql-client
```

## Support

For API support:

- **Documentation**: This file
- **GraphQL Playground**: http://localhost:4000/graphql (development)
- **Issues**: Create an issue on GitHub
- **Health Check**: http://localhost:4000/health

---

*Last updated: July 19, 2025* 