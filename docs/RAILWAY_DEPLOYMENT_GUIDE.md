# Railway Deployment Guide for Continuo Platform

## Overview

This guide provides step-by-step instructions for deploying the Continuo platform to Railway's Hobby plan for production testing and initial launch.

## 🚀 Railway Platform Setup

### Account Status
- **Plan**: Hobby Plan ($5/month)
- **Status**: ✅ Account established
- **Ready for**: Production deployment configuration

### Railway Hobby Plan Limits
- **RAM**: 512MB per service
- **Storage**: 1GB per service
- **Bandwidth**: Unlimited
- **Deployments**: Unlimited
- **Custom Domains**: ✅ Supported
- **SSL Certificates**: ✅ Automatic

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Railway account created (Hobby plan)
- [x] GitHub repository connected
- [x] Project rebranded to "Continuo"
- [x] Docker configuration updated
- [x] Environment variables documented

### 🔄 Pending Tasks
- [ ] Create Railway project configuration
- [ ] Set up environment variables
- [ ] Configure database service
- [ ] Set up Redis service
- [ ] Configure web application service
- [ ] Set up API service
- [ ] Test deployment pipeline
- [ ] Configure custom domain
- [ ] Set up monitoring

**Note**: All tasks are tracked in Linear issue [BUS-16](https://linear.app/scootr-ca/issue/BUS-16/configure-railway-deployment-for-continuo-platform-production-testing)

## 🏗️ Railway Project Structure

### Services Required
1. **PostgreSQL Database** (Railway managed)
2. **Redis Cache** (Railway managed)
3. **API Service** (Custom Docker container)
4. **Web Application** (Custom Docker container)

### Service Configuration
```
Continuo Platform (Railway Project)
├── continuo-database (PostgreSQL)
├── continuo-redis (Redis)
├── continuo-api (Node.js API)
└── continuo-web (Next.js Web App)
```

## 📁 Required Configuration Files

### 1. Railway Configuration (`railway.json`)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Production Dockerfile (`Dockerfile.prod`)
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 3. API Production Dockerfile (`api/Dockerfile.prod`)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

## 🔧 Environment Variables

### Railway Environment Variables Setup

#### Database Service Variables
```bash
# PostgreSQL (Railway managed)
DATABASE_URL=postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}
```

#### API Service Variables
```bash
# Application
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=${DATABASE_URL}

# Redis
REDIS_URL=${REDIS_URL}

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Security
CORS_ORIGIN=${CORS_ORIGIN}
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Web Application Variables
```bash
# Application
NODE_ENV=production
PORT=3000

# API Configuration
NEXT_PUBLIC_API_URL=${API_URL}/graphql
NEXT_PUBLIC_APP_URL=${APP_URL}

# Security
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${APP_URL}

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=${ANALYTICS_ID}
```

## 🚀 Deployment Steps

### Step 1: Create Railway Project
1. **Login to Railway Dashboard**
2. **Create New Project**
   - Name: `continuo-platform`
   - Description: `Continuo - AI-powered business management platform`
   - Template: `Empty Project`

### Step 2: Add Database Service
1. **Add Service** → **Database** → **PostgreSQL**
2. **Configure Database**:
   - Name: `continuo-database`
   - Version: `15`
   - Plan: `Hobby`

### Step 3: Add Redis Service
1. **Add Service** → **Database** → **Redis**
2. **Configure Redis**:
   - Name: `continuo-redis`
   - Version: `7`
   - Plan: `Hobby`

### Step 4: Add API Service
1. **Add Service** → **GitHub Repo**
2. **Select Repository**: `jeremyshields/continuo-platform`
3. **Configure Service**:
   - Name: `continuo-api`
   - Root Directory: `api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Step 5: Add Web Application Service
1. **Add Service** → **GitHub Repo**
2. **Select Repository**: `jeremyshields/continuo-platform`
3. **Configure Service**:
   - Name: `continuo-web`
   - Root Directory: `web-app`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Step 6: Configure Environment Variables
1. **API Service Variables**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=${continuo-database.DATABASE_URL}
   REDIS_URL=${continuo-redis.REDIS_URL}
   JWT_SECRET=your-super-secure-jwt-secret-key
   CORS_ORIGIN=https://your-domain.railway.app
   ```

2. **Web Service Variables**:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://continuo-api.railway.app/graphql
   NEXT_PUBLIC_APP_URL=https://continuo-web.railway.app
   ```

### Step 7: Configure Domains
1. **Custom Domain Setup**:
   - Domain: `continuo.yourdomain.com`
   - SSL: Automatic (Railway handles)
   - DNS: Configure CNAME record

2. **Railway Domains**:
   - API: `continuo-api.railway.app`
   - Web: `continuo-web.railway.app`

## 🔄 Deployment Pipeline

### GitHub Integration
1. **Connect GitHub Repository**
2. **Configure Auto-Deploy**:
   - Branch: `main`
   - Auto-deploy: ✅ Enabled
   - Preview deployments: ✅ Enabled

### Deployment Triggers
- **Push to main**: Automatic deployment
- **Pull Request**: Preview deployment
- **Manual**: Manual deployment from dashboard

## 📊 Monitoring and Health Checks

### Health Check Endpoints
- **API Health**: `GET /health`
- **Web Health**: `GET /api/health`
- **Database Health**: Connection test
- **Redis Health**: Connection test

### Railway Monitoring
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, network usage
- **Alerts**: Automatic alerting for issues
- **Uptime**: Service availability monitoring

## 🔒 Security Configuration

### SSL/TLS
- **Automatic SSL**: Railway provides certificates
- **HTTPS Only**: Force HTTPS redirects
- **HSTS**: HTTP Strict Transport Security

### Environment Security
- **Secrets Management**: Railway handles sensitive data
- **Access Control**: Team member permissions
- **Audit Logs**: Deployment and access logs

## 📈 Scaling Considerations

### Hobby Plan Limits
- **RAM**: 512MB per service (sufficient for testing)
- **Storage**: 1GB per service
- **Concurrent Users**: ~50-100 users

### Upgrade Path
- **Pro Plan**: $20/month for more resources
- **Enterprise**: Custom pricing for large deployments
- **Migration**: Easy migration to other platforms

## 🧪 Testing Deployment

### Pre-Deployment Testing
1. **Local Testing**: Verify Docker builds work
2. **Environment Variables**: Test all variables
3. **Database Migration**: Test migration scripts
4. **API Endpoints**: Verify all endpoints work

### Post-Deployment Testing
1. **Health Checks**: Verify all services healthy
2. **Functionality**: Test all application features
3. **Performance**: Monitor response times
4. **Security**: Verify HTTPS and authentication

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**: Check Dockerfile and dependencies
2. **Environment Variables**: Verify all variables set
3. **Database Connection**: Check DATABASE_URL format
4. **Port Conflicts**: Ensure correct port configuration

### Debug Commands
```bash
# Check service logs
railway logs

# Check service status
railway status

# Restart service
railway restart

# View environment variables
railway variables
```

## 📞 Support Resources

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [Deployment Guide](https://docs.railway.app/deploy/deployments)
- [Environment Variables](https://docs.railway.app/deploy/environment-variables)

### Community Support
- [Railway Discord](https://discord.gg/railway)
- [GitHub Issues](https://github.com/railwayapp/railway/issues)
- [Community Forum](https://community.railway.app/)

---

**Last Updated**: July 19, 2025  
**Status**: Ready for Implementation  
**Next Step**: Linear issue BUS-16 created for deployment tasks 