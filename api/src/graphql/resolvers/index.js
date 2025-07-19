const { DateTimeResolver, JSONResolver } = require('graphql-scalars');
const { authResolvers } = require('./auth');
const { userResolvers } = require('./user');
const { companyResolvers } = require('./company');
const customerResolvers = require('./customer');

const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  
  Query: {
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...companyResolvers.Query,
    ...customerResolvers.Query,
  },
  
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...companyResolvers.Mutation,
    ...customerResolvers.Mutation,
  },
  
  Subscription: {
    ...authResolvers.Subscription,
    ...userResolvers.Subscription,
    ...companyResolvers.Subscription,
  },
  
  // Type resolvers
  User: userResolvers.User,
  Company: companyResolvers.Company,
};

module.exports = { resolvers };