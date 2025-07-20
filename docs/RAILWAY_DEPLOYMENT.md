# Railway Deployment Guide

## 🚀 **Overview**

This guide covers the complete setup, deployment, troubleshooting, and maintenance of the Continuo Platform on Railway, including the production domain `continuo.pro`.

**Current Status**: 90% Complete - API deployed, web service redeploying after fixes

## 📋 **Prerequisites**

- Railway account (Hobby plan or higher)
- GitHub repository access
- Domain name (continuo.pro) configured
- Docker knowledge (basic)

## 🏗️ **Architecture**

### **Services Overview**
```
Railway Project: Continuo
├── continuo-web (Next.js Frontend) - Port 3000
├── continuo-api (Node.js/Express API) - Port 4000
├── continuo-db (PostgreSQL Database) - Auto-configured
└── continuo-redis (Redis Cache) - Auto-configured
```

### **Domain Configuration**
- **Production Domain**: https://continuo.pro
- **Web Service**: https://continuo-web-production.up.railway.app
- **API Service**: https://continuo-api-production.up.railway.app
- **SSL**: Auto-configured by Railway

## 🔧 **Step-by-Step Setup**

### **Phase 1: Project Creation**

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Continuo repository

2. **Configure Project Settings**
   - **Project Name**: Continuo
   - **Repository**: https://github.com/jshields-ca/Continuo
   - **Branch**: main
   - **Auto-deploy**: Enabled

### **Phase 2: Service Configuration**

#### **Web Service Setup**
1. **Add Service**
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - **Service Name**: `continuo-web`
   - **Root Directory**: `web-app`

2. **Configure Build**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: 3000

#### **API Service Setup**
1. **Add Service**
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - **Service Name**: `continuo-api`
   - **Root Directory**: `api`

2. **Configure Build**
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Port**: 4000

#### **Database Setup**
1. **Add PostgreSQL**
   - Click "New Service" → "Database" → "PostgreSQL"
   - **Service Name**: `continuo-db`
   - Railway auto-configures connection variables

#### **Redis Setup**
1. **Add Redis**
   - Click "New Service" → "Database" → "Redis"
   - **Service Name**: `continuo-redis`
   - Railway auto-configures connection variables

### **Phase 3: Environment Configuration**

#### **API Service Environment Variables**
```bash
NODE_ENV=production
DATABASE_URL=${{continuo-db.DATABASE_URL}}
REDIS_URL=${{continuo-redis.REDIS_URL}}
JWT_SECRET=your-super-secure-jwt-secret-here
PORT=4000
CORS_ORIGIN=https://continuo.pro
GRAPHQL_PLAYGROUND=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_FORMAT=combined
```

#### **Web Service Environment Variables**
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://continuo-api-production.up.railway.app/graphql
PORT=3000
```

### **Phase 4: Domain Configuration**

#### **Custom Domain Setup**
1. **Add Custom Domain**
   - Go to your web service settings
   - Click "Custom Domains"
   - Add domain: `continuo.pro`
   - Railway will provide DNS records

2. **Configure DNS**
   - Add CNAME record: `continuo.pro` → `continuo-web-production.up.railway.app`
   - Add CNAME record: `api.continuo.pro` → `continuo-api-production.up.railway.app`

3. **SSL Configuration**
   - Railway auto-configures SSL certificates
   - Wait for certificate validation (5-10 minutes)

### **Phase 5: Database Migration**

1. **Run Migrations**
   ```bash
   railway run --service continuo-api npx prisma migrate deploy
   ```

2. **Seed Database** (Optional)
   ```bash
   railway run --service continuo-api npm run db:seed
   ```

### **Phase 6: Testing & Validation**

#### **Health Checks**
- **Web Service**: https://continuo.pro
- **API Health**: https://continuo-api-production.up.railway.app/health
- **GraphQL Playground**: https://continuo-api-production.up.railway.app/graphql

#### **Functionality Tests**
1. **Authentication Flow**
   - User registration
   - User login
   - JWT token validation

2. **Business Modules**
   - Customer management
   - Contact management
   - Lead management
   - Chart of accounts
   - Transaction management

3. **Multi-tenant Isolation**
   - Company data separation
   - User permissions
   - Role-based access

## 🚨 **Troubleshooting**

### **Common Issues and Solutions**

#### **1. "Dockerfile does not exist" Error**

**Problem**: Railway can't find the Dockerfile when adding the project.

**Solution**: 
1. **Don't deploy the root repository directly**
2. **Create separate services** for each part of the application:

#### For API Service:
1. Click "New Service" → "GitHub Repo"
2. Select your `Continuo` repository
3. **Set Root Directory to**: `api`
4. Service will find `api/Dockerfile`

#### For Web Service:
1. Click "New Service" → "GitHub Repo" 
2. Select your `Continuo` repository
3. **Set Root Directory to**: `web-app`
4. Service will find `web-app/Dockerfile`

#### **2. Build Failures**

**Problem**: Service fails to build after deployment.

**Solutions**:
- Check Railway logs for specific error messages
- Verify all dependencies are in `package.json`
- Ensure Dockerfile syntax is correct
- Check if all required files are present

#### **3. Environment Variables Not Working**

**Problem**: Application can't access environment variables.

**Solutions**:
- Verify variable names match exactly (case-sensitive)
- Check if variables are set in the correct service
- Restart the service after adding variables
- Use Railway's variable reference syntax: `${{service-name.VARIABLE_NAME}}`

#### **4. Database Connection Issues**

**Problem**: API can't connect to PostgreSQL database.

**Solutions**:
- Verify `DATABASE_URL` is set correctly
- Check if database service is running
- Ensure database service is in the same project
- Run migrations: `railway run --service continuo-api npx prisma migrate deploy`

#### **5. CORS Errors**

**Problem**: Frontend can't communicate with API.

**Solutions**:
- Set `CORS_ORIGIN` to your web service domain
- Update `NEXT_PUBLIC_API_URL` to your API service domain
- Check that both services are deployed and running

#### **6. Next.js Standalone Deployment Error**

**Problem**: Web service fails with "Cannot find module '/app/web-app/.next/standalone/server.js'"

**Solution**: 
- Added fallback server.js and updated start script
- Service will use standalone server if available, or fallback to custom server
- Auto-redeploying after fixes applied

### **Debug Commands**

#### **Check Service Status**
```bash
railway status
```

#### **View Service Logs**
```bash
# All services
railway logs

# Specific service
railway logs --service continuo-api
railway logs --service continuo-web
```

#### **Run Commands in Service**
```bash
# Check environment variables
railway run --service continuo-api env

# Run database migrations
railway run --service continuo-api npx prisma migrate deploy

# Open Prisma Studio
railway run --service continuo-api npx prisma studio

# Check if files exist
railway run --service continuo-api ls -la
```

#### **Check Service Configuration**
```bash
# View service variables
railway variables

# View service settings
railway service
```

## 📋 **Deployment Checklist**

### **Before Deploying:**
- [x] Repository is pushed to GitHub
- [x] All tests pass locally
- [x] Environment variables are documented
- [x] Database migrations are ready
- [x] Production Dockerfiles created
- [x] Health check endpoints configured
- [x] Next.js production config updated

### **After Deploying:**
- [x] All services are running (green status)
- [x] Health checks pass
- [x] Database migrations completed
- [x] Application features work
- [x] Logs show no errors

### **Current Deployment Status:**
- [x] **API Service**: Deployed and running ✅
- [x] **Database**: PostgreSQL with migrations completed ✅
- [x] **Redis Cache**: Configured and working ✅
- [x] **Web Service**: Redeploying after Next.js fixes 🔄
- [x] **Domain**: https://continuo.pro configured ✅

## 🔍 **Monitoring & Maintenance**

### **Railway Dashboard**
- **URL**: https://railway.app/dashboard
- **Features**: Logs, metrics, deployments, environment variables

### **Service Monitoring**
- **Health Checks**: Automatic monitoring
- **Logs**: Real-time log streaming
- **Metrics**: CPU, memory, network usage

### **Deployment Monitoring**
- **Auto-deploy**: Enabled for main branch
- **Build Status**: Real-time build monitoring
- **Rollback**: Easy rollback to previous versions

## 🆘 **Getting Help**

### **Railway Resources:**
- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)

### **Project Resources:**
- [GitHub Issues](https://github.com/jshields-ca/Continuo/issues)
- [Linear Project](https://linear.app/scootr-ca/team/Business%20Dev/active)

## 📊 **Current Status**

### **Deployment Progress (90% Complete)**

#### ✅ Successfully Deployed
- **API Service**: `continuo-api-production.up.railway.app` ✅
- **Database**: PostgreSQL with migrations completed ✅
- **Redis Cache**: Configured and working ✅
- **Health Endpoint**: API responding correctly ✅

#### 🔄 Currently Deploying
- **Web Service**: `continuo-web-production.up.railway.app` 🔄
- **Issue**: Next.js standalone deployment error (FIXED)
- **Status**: Auto-redeploying after fixes

#### Recent Deployment Fixes
- **Issue**: Next.js standalone deployment error
- **Solution**: Added fallback server.js and updated start script
- **Status**: Changes committed and pushed to GitHub

#### Next Steps
1. **Monitor Web Service Deployment**: Wait for redeployment completion
2. **Configure Environment Variables**: Set up web service environment variables
3. **Test Login Functionality**: Verify Admin test user can sign in
4. **Verify API Connectivity**: Test frontend-backend communication
5. **Configure Domain**: Set up custom domain routing

### **Production Infrastructure**
- **Platform**: Railway (Hobby Plan)
- **Domain**: https://continuo.pro (configured)
- **Services**: API, Web, Database, Redis
- **SSL**: Auto-configured by Railway
- **Monitoring**: Railway dashboard monitoring

---

**Last Updated**: July 20, 2025  
**Status**: 90% Complete - Web Service Redeploying  
**Next Update**: After web service deployment completion 