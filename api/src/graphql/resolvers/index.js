const { DateTimeResolver, JSONResolver } = require('graphql-scalars');
const { authResolvers } = require('./auth');
const { userResolvers } = require('./user');
const { companyResolvers } = require('./company');
const customerResolvers = require('./customer');
const leadResolvers = require('./lead');
const accountResolvers = require('./account');
const invoiceResolvers = require('./invoice');

const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  
  Query: {
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...companyResolvers.Query,
    ...customerResolvers.Query,
    ...leadResolvers.Query,
    ...accountResolvers.Query,
    ...invoiceResolvers.Query,
  },
  
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...companyResolvers.Mutation,
    ...customerResolvers.Mutation,
    ...leadResolvers.Mutation,
    ...accountResolvers.Mutation,
    ...invoiceResolvers.Mutation,
  },
  
  Subscription: {
    ...authResolvers.Subscription,
    ...userResolvers.Subscription,
    ...companyResolvers.Subscription,
  },
  
  // Type resolvers
  User: userResolvers.User,
  Company: companyResolvers.Company,
  Account: accountResolvers.Account,
  Transaction: accountResolvers.Transaction,
  Invoice: invoiceResolvers.Invoice,
  InvoiceItem: invoiceResolvers.InvoiceItem,
  Payment: invoiceResolvers.Payment,
};

module.exports = { resolvers };