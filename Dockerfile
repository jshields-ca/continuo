# Root Dockerfile for Railway deployment
# This file helps Railway understand the monorepo structure

FROM node:18-alpine

WORKDIR /app

# Copy the entire repository
COPY . .

# Check if we're in a subdirectory context
ARG SERVICE_DIR
ENV SERVICE_DIR=${SERVICE_DIR:-web-app}

# Change to the service directory
WORKDIR /app/${SERVICE_DIR}

# Install dependencies for the specific service
RUN npm ci

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app/${SERVICE_DIR}

USER nextjs

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 