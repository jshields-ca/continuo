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
        subscriptionPlan
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
      subscriptionPlan
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
      subscriptionPlan
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

// Invoice Queries
export const GET_INVOICES = gql`
  query GetInvoices($filter: InvoiceFilterInput, $orderBy: InvoiceOrderByInput, $limit: Int, $offset: Int) {
    invoices(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {
      id
      companyId
      customerId
      number
      status
      issueDate
      dueDate
      currency
      subtotal
      taxAmount
      vatAmount
      total
      notes
      pdfUrl
      customFields
      customerName
      customerAddress
      customerTaxId
      companyName
      companyAddress
      companyTaxId
      customer {
        id
        name
        email
        phone
      }
      items {
        id
        description
        quantity
        unitPrice
        taxRate
        vatRate
        amount
        customFields
      }
      payments {
        id
        amount
        currency
        paymentDate
        paymentMethod
        reference
        notes
        status
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      id
      companyId
      customerId
      number
      status
      issueDate
      dueDate
      currency
      subtotal
      taxAmount
      vatAmount
      total
      notes
      pdfUrl
      customFields
      customerName
      customerAddress
      customerTaxId
      companyName
      companyAddress
      companyTaxId
      customer {
        id
        name
        email
        phone
        address
      }
      items {
        id
        description
        quantity
        unitPrice
        taxRate
        vatRate
        amount
        customFields
      }
      payments {
        id
        amount
        currency
        paymentDate
        paymentMethod
        reference
        notes
        status
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_INVOICE_BY_NUMBER = gql`
  query GetInvoiceByNumber($number: String!) {
    invoiceByNumber(number: $number) {
      id
      companyId
      customerId
      number
      status
      issueDate
      dueDate
      currency
      subtotal
      taxAmount
      vatAmount
      total
      notes
      pdfUrl
      customFields
      customerName
      customerAddress
      customerTaxId
      companyName
      companyAddress
      companyTaxId
      customer {
        id
        name
        email
        phone
        address
      }
      items {
        id
        description
        quantity
        unitPrice
        taxRate
        vatRate
        amount
        customFields
      }
      payments {
        id
        amount
        currency
        paymentDate
        paymentMethod
        reference
        notes
        status
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_INVOICE_STATS = gql`
  query GetInvoiceStats($filter: InvoiceFilterInput) {
    invoiceStats(filter: $filter) {
      totalInvoices
      totalAmount
      paidAmount
      overdueAmount
      draftAmount
      averageInvoiceAmount
      currencyBreakdown {
        currency
        count
        totalAmount
      }
      statusBreakdown {
        status
        count
        totalAmount
      }
    }
  }
`;

export const GET_INVOICE_HISTORY = gql`
  query GetInvoiceHistory($invoiceId: ID!, $limit: Int, $offset: Int) {
    invoiceHistory(invoiceId: $invoiceId, limit: $limit, offset: $offset) {
      id
      invoiceId
      userId
      action
      field
      itemId
      oldValue
      newValue
      createdAt
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_NEXT_INVOICE_NUMBER = gql`
  query GetNextInvoiceNumber {
    nextInvoiceNumber
  }
`;

export const GET_CUSTOMERS = gql`
  query GetCustomers($filter: CustomerFilterInput, $first: Int, $after: String) {
    customers(filter: $filter, first: $first, after: $after) {
      edges {
        node {
          id
          name
          email
          phone
          type
          status
          address
          industry
          annualRevenue
          notes
          tags
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;