import { gql } from '@apollo/client';

// Authentication Queries
export const ME_QUERY = gql`
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
`;

// User Queries
export const GET_USERS = gql`
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
`;

export const GET_USER = gql`
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
`;

// Company Queries
export const GET_MY_COMPANY = gql`
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
`;

export const GET_COMPANY = gql`
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
`;