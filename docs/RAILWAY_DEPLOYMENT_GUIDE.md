# Railway Deployment Guide

## 🚀 **Overview**

This guide covers the complete setup and deployment of the Continuo Platform on Railway, including the new production domain `continuo.pro`.

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

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
- Check build logs in Railway dashboard
- Verify package.json dependencies
- Ensure correct root directory configuration

#### **Runtime Errors**
- Check service logs
- Verify environment variables
- Test database connections

#### **Domain Issues**
- Verify DNS configuration
- Check SSL certificate status
- Test domain routing

### **Useful Commands**
```bash
# View service logs
railway logs --service continuo-api

# Check service status
railway status

# Run commands in service
railway run --service continuo-api npm run db:migrate

# View environment variables
railway variables --service continuo-api
```

## 📊 **Performance Optimization**

### **Hobby Plan Limits**
- **Memory**: 512MB per service
- **CPU**: Shared resources
- **Storage**: 1GB per service
- **Bandwidth**: 100GB/month

### **Optimization Tips**
- Use efficient database queries
- Implement proper caching
- Optimize Docker images
- Monitor resource usage

## 🔒 **Security Considerations**

### **Environment Variables**
- Use strong JWT secrets
- Secure database passwords
- Enable CORS restrictions
- Configure rate limiting

### **SSL/TLS**
- Railway auto-configures SSL
- Force HTTPS redirects
- Validate certificate status

### **Access Control**
- Implement proper authentication
- Use role-based permissions
- Validate user inputs
- Monitor access logs

## 📚 **Additional Resources**

### **Documentation**
- [Railway Documentation](https://docs.railway.app/)
- [Docker Documentation](https://docs.docker.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

### **Support**
- [Railway Support](https://railway.app/support)
- [GitHub Issues](https://github.com/jshields-ca/Continuo/issues)
- [Linear Project](https://linear.app/scootr-ca/team/Business%20Dev/active)

## 🎯 **Success Criteria**

### **Deployment Checklist**
- [ ] All services deployed successfully
- [ ] Custom domain configured (continuo.pro)
- [ ] SSL certificates active
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] Authentication working
- [ ] All business modules functional
- [ ] Performance testing completed
- [ ] Security validation passed

### **Production Readiness**
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Error handling tested
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team access configured

---

**Last Updated**: July 19, 2025  
**Version**: 0.2.3  
**Production Domain**: https://continuo.pro 