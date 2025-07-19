# Railway Production Deployment Guide

## 🚀 Overview

This guide walks you through deploying Continuo to Railway's production environment.

## 📋 Prerequisites

- [Railway Account](https://railway.app/) (Hobby plan or higher)
- GitHub repository connected to Railway
- Domain name (optional, for custom domain)

## 🏗️ Architecture

```
Railway Services:
├── continuo-api (Backend API)
├── continuo-web (Frontend Web App)
├── continuo-db (PostgreSQL Database)
└── continuo-redis (Redis Cache)
```

## 🚀 Step-by-Step Deployment

### 1. Railway Project Setup

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `Continuo` repository

3. **Add Services**
   - Click "New Service" → "Database" → "PostgreSQL"
   - Click "New Service" → "Database" → "Redis"
   - Click "New Service" → "GitHub Repo" → Select your repo

### 2. Configure Database Service

1. **PostgreSQL Setup**
   - Service Name: `continuo-db`
   - Railway will auto-generate connection details
   - Note the `DATABASE_URL` from Variables tab

2. **Redis Setup**
   - Service Name: `continuo-redis`
   - Note the `REDIS_URL` from Variables tab

### 3. Configure API Service

1. **Create API Service**
   - Service Name: `continuo-api`
   - Source: Your GitHub repo
   - Root Directory: `api`
   - **Important**: Make sure to set the root directory to `api` in the service settings

2. **Set Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=${{continuo-db.DATABASE_URL}}
   REDIS_URL=${{continuo-redis.REDIS_URL}}
   JWT_SECRET=your-super-secure-jwt-secret-here
   PORT=4000
   CORS_ORIGIN=https://your-web-domain.railway.app
   GRAPHQL_PLAYGROUND=false
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_FORMAT=combined
   ```

3. **Deploy API**
   - Railway will auto-deploy when you push to main
   - Check logs for any build errors

### 4. Configure Web Service

1. **Create Web Service**
   - Service Name: `continuo-web`
   - Source: Your GitHub repo
   - Root Directory: `web-app`
   - **Important**: Make sure to set the root directory to `web-app` in the service settings

2. **Set Environment Variables**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app/graphql
   PORT=3000
   ```

3. **Deploy Web App**
   - Railway will auto-deploy when you push to main
   - Check logs for any build errors

### 5. Database Migration

1. **Run Prisma Migrations**
   ```bash
   # Connect to Railway CLI
   railway login
   railway link
   
   # Run migrations on production database
   railway run --service continuo-api npx prisma migrate deploy
   ```

2. **Seed Database (Optional)**
   ```bash
   railway run --service continuo-api npm run seed
   ```

### 6. Domain Configuration

1. **Custom Domain (Optional)**
   - Go to your web service settings
   - Click "Domains" tab
   - Add your custom domain
   - Update DNS records as instructed

2. **Update CORS Settings**
   - Update `CORS_ORIGIN` in API service to include your domain

## 🔧 Environment Variables Reference

### API Service Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | Redis connection | `redis://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-here` |
| `PORT` | API port | `4000` |
| `CORS_ORIGIN` | Allowed origins | `https://your-domain.com` |
| `GRAPHQL_PLAYGROUND` | Enable playground | `false` |

### Web Service Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_API_URL` | API endpoint | `https://api.railway.app/graphql` |
| `PORT` | Web port | `3000` |

## 🧪 Testing Deployment

### 1. Health Checks
- API: `https://your-api-domain.railway.app/health`
- Web: `https://your-web-domain.railway.app/`

### 2. GraphQL Playground
- URL: `https://your-api-domain.railway.app/graphql`
- Note: Disabled in production by default

### 3. Application Features
- User registration/login
- Dashboard functionality
- Customer management
- Lead management
- Contact management

## 🔍 Monitoring & Logs

### Railway Dashboard
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: Build and deployment history

### Health Monitoring
- Railway automatically monitors service health
- Failed health checks trigger restarts
- Set up alerts for critical issues

## 🔒 Security Considerations

### Environment Variables
- Never commit secrets to Git
- Use Railway's secure variable storage
- Rotate JWT secrets regularly

### Database Security
- Railway provides secure database connections
- Enable SSL for database connections
- Regular backups (automatic with Railway)

### API Security
- Rate limiting enabled
- CORS properly configured
- Helmet.js security headers
- Input validation and sanitization

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Dockerfile syntax
   - Verify all dependencies in package.json
   - Check build logs in Railway dashboard

2. **"Dockerfile does not exist" Error**
   - **Solution**: Make sure to set the correct root directory for each service
   - API service: Root directory = `api`
   - Web service: Root directory = `web-app`
   - The Dockerfiles are in the subdirectories, not the root

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database service is running
   - Run migrations manually if needed

4. **CORS Errors**
   - Update CORS_ORIGIN to match your domain
   - Check API and web service URLs

5. **Environment Variables**
   - Verify all required variables are set
   - Check variable names match code
   - Restart services after variable changes

### Debug Commands
```bash
# Check service logs
railway logs --service continuo-api
railway logs --service continuo-web

# Run commands in service
railway run --service continuo-api npm run test
railway run --service continuo-api npx prisma studio

# Check service status
railway status
```

## 📈 Scaling

### Railway Hobby Plan Limits
- 500 hours/month
- 512MB RAM per service
- Shared CPU resources

### Upgrading for Production
- **Pro Plan**: $20/month
  - Unlimited hours
  - 1GB RAM per service
  - Dedicated CPU
  - Custom domains
  - Team collaboration

## 🔄 Continuous Deployment

### Automatic Deployments
- Railway auto-deploys on push to main branch
- Preview deployments for pull requests
- Rollback to previous deployments

### Deployment Pipeline
1. Push code to GitHub
2. Railway detects changes
3. Builds Docker images
4. Runs health checks
5. Deploys to production
6. Updates domain routing

## 📞 Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Report bugs in your repository

---

**Last Updated**: July 2025
**Version**: 0.2.3 