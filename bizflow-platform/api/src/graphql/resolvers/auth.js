const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError, AuthenticationError } = require('apollo-server-express');
const { validateEmail, validatePassword } = require('../../shared/utils/validation');
const { generateSlug } = require('../../shared/utils/helpers');
const crypto = require('crypto');

const authResolvers = {
  Query: {
    me: async (parent, args, { user, prisma, requireAuth }) => {
      const currentUser = requireAuth();
      
      return await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { company: true }
      });
    },

    verifyEmail: async (parent, { token }, { prisma }) => {
      const user = await prisma.user.findFirst({
        where: { emailVerificationToken: token }
      });

      if (!user) {
        throw new UserInputError('Invalid verification token');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
          status: 'ACTIVE'
        }
      });

      return true;
    },
  },

  Mutation: {
    register: async (parent, { input }, { prisma }) => {
      const { email, firstName, lastName, password, companyName, phone } = input;

      // Validate input
      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }

      if (!validatePassword(password)) {
        throw new UserInputError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new UserInputError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate company slug
      const companySlug = await generateUniqueSlug(companyName, prisma);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create company and user in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: companyName,
            slug: companySlug,
            status: 'TRIAL',
            subscriptionPlan: 'FREE',
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          }
        });

        // Create user
        const user = await tx.user.create({
          data: {
            email,
            firstName,
            lastName,
            password: hashedPassword,
            phone,
            role: 'OWNER',
            status: 'PENDING',
            companyId: company.id,
            emailVerificationToken,
          },
          include: { company: true }
        });

        return { user, company };
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: result.user.id, 
          email: result.user.email, 
          role: result.user.role,
          companyId: result.user.companyId 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // TODO: Send verification email
      console.log(`Verification token for ${email}: ${emailVerificationToken}`);

      return {
        token,
        user: result.user,
        company: result.company
      };
    },

    login: async (parent, { input }, { prisma }) => {
      const { email, password } = input;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: { company: true }
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (user.status === 'SUSPENDED') {
        throw new AuthenticationError('Your account has been suspended');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          companyId: user.companyId 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        token,
        user,
        company: user.company
      };
    },

    logout: async (parent, args, { user }) => {
      // For JWT tokens, logout is handled client-side by removing the token
      // In a production app, you might want to implement a token blacklist
      return true;
    },

    forgotPassword: async (parent, { email }, { prisma }) => {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists or not
        return true;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetTokenExpiry
        }
      });

      // TODO: Send password reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return true;
    },

    resetPassword: async (parent, { input }, { prisma }) => {
      const { token, password } = input;

      if (!validatePassword(password)) {
        throw new UserInputError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      }

      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new UserInputError('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null
        }
      });

      return true;
    },

    changePassword: async (parent, { input }, { user, prisma, requireAuth }) => {
      const currentUser = requireAuth();
      const { currentPassword, newPassword } = input;

      if (!validatePassword(newPassword)) {
        throw new UserInputError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      }

      const userRecord = await prisma.user.findUnique({
        where: { id: currentUser.id }
      });

      const isValidPassword = await bcrypt.compare(currentPassword, userRecord.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Current password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: currentUser.id },
        data: { password: hashedPassword }
      });

      return true;
    },

    resendVerificationEmail: async (parent, args, { user, prisma, requireAuth }) => {
      const currentUser = requireAuth();

      const userRecord = await prisma.user.findUnique({
        where: { id: currentUser.id }
      });

      if (userRecord.emailVerifiedAt) {
        throw new UserInputError('Email is already verified');
      }

      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      await prisma.user.update({
        where: { id: currentUser.id },
        data: { emailVerificationToken }
      });

      // TODO: Send verification email
      console.log(`New verification token for ${userRecord.email}: ${emailVerificationToken}`);

      return true;
    },
  },

  Subscription: {},
};

// Helper function to generate unique company slug
async function generateUniqueSlug(name, prisma) {
  let slug = generateSlug(name);
  let counter = 1;
  
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }
  
  return slug;
}

module.exports = { authResolvers };