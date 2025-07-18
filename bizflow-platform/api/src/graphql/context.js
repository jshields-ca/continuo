const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { AuthenticationError } = require('apollo-server-express');

const prisma = new PrismaClient();

const createContext = ({ req, res }) => {
  // Get token from request headers
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  let user = null;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = decoded;
    } catch (error) {
      // Token is invalid, but don't throw error here
      // Let individual resolvers handle authentication requirements
    }
  }
  
  return {
    prisma,
    user,
    req,
    res,
    // Helper function to require authentication
    requireAuth: () => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      return user;
    },
    // Helper function to require specific roles
    requireRole: (roles) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      if (!roles.includes(user.role)) {
        throw new AuthenticationError('You do not have permission to perform this action');
      }
      return user;
    },
  };
};

module.exports = { createContext, prisma };