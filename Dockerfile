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
RUN npm install

# For API service, generate Prisma client
RUN if [ "$SERVICE_DIR" = "api" ]; then npx prisma generate; fi

# For web service, build the application
RUN if [ "$SERVICE_DIR" = "web-app" ]; then npm run build; fi

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app/${SERVICE_DIR}

USER nextjs

# Set environment variables
ENV NODE_ENV=production

# Set port based on service
ARG SERVICE_PORT=3000
ENV PORT=$SERVICE_PORT

# Expose port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"] 