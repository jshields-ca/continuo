import { gql } from '@apollo/client';

// Authentication Mutations
export const REGISTER_MUTATION = gql`
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
          subscriptionPlan
          status
        }
      }
      company {
        id
        name
        slug
        subscriptionPlan
        status
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
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
          subscriptionPlan
          status
        }
      }
      company {
        id
        name
        slug
        subscriptionPlan
        status
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

// Invoice Mutations
export const CREATE_INVOICE_MUTATION = gql`
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
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

export const UPDATE_INVOICE_MUTATION = gql`
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
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

export const DELETE_INVOICE_MUTATION = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id)
  }
`;

export const SEND_INVOICE_MUTATION = gql`
  mutation SendInvoice($id: ID!) {
    sendInvoice(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const VOID_INVOICE_MUTATION = gql`
  mutation VoidInvoice($id: ID!) {
    voidInvoice(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const DUPLICATE_INVOICE_MUTATION = gql`
  mutation DuplicateInvoice($id: ID!) {
    duplicateInvoice(id: $id) {
      id
      number
      status
      createdAt
    }
  }
`;

export const ADD_INVOICE_ITEM_MUTATION = gql`
  mutation AddInvoiceItem($invoiceId: ID!, $input: CreateInvoiceItemInput!) {
    addInvoiceItem(invoiceId: $invoiceId, input: $input) {
      id
      invoiceId
      description
      quantity
      unitPrice
      taxRate
      vatRate
      amount
      customFields
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_INVOICE_ITEM_MUTATION = gql`
  mutation UpdateInvoiceItem($id: ID!, $input: UpdateInvoiceItemInput!) {
    updateInvoiceItem(id: $id, input: $input) {
      id
      invoiceId
      description
      quantity
      unitPrice
      taxRate
      vatRate
      amount
      customFields
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_INVOICE_ITEM_MUTATION = gql`
  mutation DeleteInvoiceItem($id: ID!) {
    deleteInvoiceItem(id: $id)
  }
`;

export const CREATE_PAYMENT_MUTATION = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      invoiceId
      amount
      currency
      paymentDate
      paymentMethod
      reference
      notes
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PAYMENT_MUTATION = gql`
  mutation UpdatePayment($id: ID!, $input: UpdatePaymentInput!) {
    updatePayment(id: $id, input: $input) {
      id
      invoiceId
      amount
      currency
      paymentDate
      paymentMethod
      reference
      notes
      status
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PAYMENT_MUTATION = gql`
  mutation DeletePayment($id: ID!) {
    deletePayment(id: $id)
  }
`;

export const GENERATE_INVOICE_PDF_MUTATION = gql`
  mutation GenerateInvoicePDF($id: ID!) {
    generateInvoicePDF(id: $id)
  }
`;

export const RESEND_VERIFICATION_EMAIL_MUTATION = gql`
  mutation ResendVerificationEmail {
    resendVerificationEmail
  }
`;

// User Mutations
export const UPDATE_USER_MUTATION = gql`
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
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const INVITE_USER_MUTATION = gql`
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
`;

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($id: ID!, $role: UserRole!) {
    updateUserRole(id: $id, role: $role) {
      id
      role
      updatedAt
    }
  }
`;

export const UPDATE_USER_STATUS_MUTATION = gql`
  mutation UpdateUserStatus($id: ID!, $status: UserStatus!) {
    updateUserStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

// Company Mutations
export const UPDATE_COMPANY_MUTATION = gql`
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
`;

export const UPDATE_SUBSCRIPTION_MUTATION = gql`
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
`;

// Transaction Mutations
export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      accountId
      type
      amount
      description
      reference
      category
      tags
      date
      createdAt
      updatedAt
      account {
        id
        name
        code
      }
    }
  }
`;

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      accountId
      type
      amount
      description
      reference
      category
      tags
      date
      createdAt
      updatedAt
      account {
        id
        name
        code
      }
    }
  }
`;

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;