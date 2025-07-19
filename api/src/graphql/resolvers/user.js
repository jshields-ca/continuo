const { UserInputError, ForbiddenError } = require('apollo-server-express');
const { validatePersonName, validatePhone } = require('../../shared/utils/validation');
const { formatName } = require('../../shared/utils/helpers');
const logger = require('../../shared/utils/logger');

const userResolvers = {
  Query: {
    users: async (parent, { companyId }, { user, prisma, requireAuth }) => {
      const currentUser = requireAuth();
      
      // Ensure user can only access users from their own company
      if (currentUser.companyId !== companyId) {
        throw new ForbiddenError('You can only access users from your own company');
      }

      return await prisma.user.findMany({
        where: { companyId },
        include: { company: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    user: async (parent, { id }, { user, prisma, requireAuth }) => {
      const currentUser = requireAuth();

      const targetUser = await prisma.user.findUnique({
        where: { id },
        include: { company: true }
      });

      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      // Ensure user can only access users from their own company
      if (currentUser.companyId !== targetUser.companyId) {
        throw new ForbiddenError('You can only access users from your own company');
      }

      return targetUser;
    },
  },

  Mutation: {
    updateUser: async (parent, { id, input }, { user, prisma, requireAuth }) => {
      const currentUser = requireAuth();

      const targetUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      // Users can only update their own profile or admins can update their company users
      if (currentUser.id !== id && 
          currentUser.companyId !== targetUser.companyId &&
          !['OWNER', 'ADMIN'].includes(currentUser.role)) {
        throw new ForbiddenError('You do not have permission to update this user');
      }

      // Validate input
      if (input.firstName && !validatePersonName(input.firstName)) {
        throw new UserInputError('Invalid first name');
      }

      if (input.lastName && !validatePersonName(input.lastName)) {
        throw new UserInputError('Invalid last name');
      }

      if (input.phone && !validatePhone(input.phone)) {
        throw new UserInputError('Invalid phone number format');
      }

      // Format names
      const updateData = { ...input };
      if (updateData.firstName) {
        updateData.firstName = formatName(updateData.firstName);
      }
      if (updateData.lastName) {
        updateData.lastName = formatName(updateData.lastName);
      }

      return await prisma.user.update({
        where: { id },
        data: updateData,
        include: { company: true }
      });
    },

    deleteUser: async (parent, { id }, { user, prisma, requireRole }) => {
      const currentUser = requireRole(['OWNER', 'ADMIN']);

      const targetUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      // Ensure user is from the same company
      if (currentUser.companyId !== targetUser.companyId) {
        throw new ForbiddenError('You can only delete users from your own company');
      }

      // Cannot delete yourself
      if (currentUser.id === id) {
        throw new UserInputError('You cannot delete your own account');
      }

      // Cannot delete other owners
      if (targetUser.role === 'OWNER') {
        throw new ForbiddenError('Cannot delete company owner');
      }

      await prisma.user.delete({
        where: { id }
      });

      return true;
    },

    inviteUser: async (parent, { input }, { user, prisma, requireRole }) => {
      const currentUser = requireRole(['OWNER', 'ADMIN', 'MANAGER']);

      // Validate input
      if (!validatePersonName(input.firstName)) {
        throw new UserInputError('Invalid first name');
      }

      if (!validatePersonName(input.lastName)) {
        throw new UserInputError('Invalid last name');
      }

      if (input.phone && !validatePhone(input.phone)) {
        throw new UserInputError('Invalid phone number format');
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email }
      });

      if (existingUser) {
        throw new UserInputError('User with this email already exists');
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-10);
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: input.email,
          firstName: formatName(input.firstName),
          lastName: formatName(input.lastName),
          phone: input.phone,
          password: hashedPassword,
          role: input.role,
          status: 'PENDING',
          companyId: currentUser.companyId,
        },
        include: { company: true }
      });

      // TODO: Send invitation email with temporary password
      // For now, log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Temporary password for ${input.email}: ${tempPassword}`);
      }

      return newUser;
    },

    updateUserRole: async (parent, { id, role }, { user, prisma, requireRole }) => {
      const currentUser = requireRole(['OWNER', 'ADMIN']);

      const targetUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      // Ensure user is from the same company
      if (currentUser.companyId !== targetUser.companyId) {
        throw new ForbiddenError('You can only update users from your own company');
      }

      // Cannot change your own role
      if (currentUser.id === id) {
        throw new UserInputError('You cannot change your own role');
      }

      // Only owners can create other owners
      if (role === 'OWNER' && currentUser.role !== 'OWNER') {
        throw new ForbiddenError('Only company owners can assign owner role');
      }

      return await prisma.user.update({
        where: { id },
        data: { role },
        include: { company: true }
      });
    },

    updateUserStatus: async (parent, { id, status }, { user, prisma, requireRole }) => {
      const currentUser = requireRole(['OWNER', 'ADMIN']);

      const targetUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      // Ensure user is from the same company
      if (currentUser.companyId !== targetUser.companyId) {
        throw new ForbiddenError('You can only update users from your own company');
      }

      // Cannot change your own status
      if (currentUser.id === id) {
        throw new UserInputError('You cannot change your own status');
      }

      return await prisma.user.update({
        where: { id },
        data: { status },
        include: { company: true }
      });
    },
  },

  Subscription: {},

  // Type resolvers
  User: {
    fullName: (parent) => {
      return `${parent.firstName} ${parent.lastName}`;
    },
    
    company: async (parent, args, { prisma }) => {
      return await prisma.company.findUnique({
        where: { id: parent.companyId }
      });
    },
  },
};

module.exports = { userResolvers };