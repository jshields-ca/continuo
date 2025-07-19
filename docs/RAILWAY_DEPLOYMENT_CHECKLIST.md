# Railway Deployment Checklist

## ✅ Pre-Deployment Setup

- [x] **Repository renamed** to "Continuo"
- [x] **Production Dockerfiles** created
- [x] **Railway configuration files** added
- [x] **Deployment guide** documented
- [x] **CLI setup script** created
- [x] **Package.json scripts** updated
- [x] **Health check endpoints** configured
- [x] **Next.js production config** updated

## 🚀 Railway Dashboard Setup

### 1. Create Project
- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `jshields-ca/Continuo` repository

### 2. Add Database Services
- [ ] **PostgreSQL Database**
  - Click "New Service" → "Database" → "PostgreSQL"
  - Name: `continuo-db`
  - Note the `DATABASE_URL` from Variables tab

- [ ] **Redis Cache**
  - Click "New Service" → "Database" → "Redis"
  - Name: `continuo-redis`
  - Note the `REDIS_URL` from Variables tab

### 3. Add Application Services
- [ ] **API Service**
  - Click "New Service" → "GitHub Repo"
  - Select your `Continuo` repository
  - Name: `continuo-api`
  - Root Directory: `api`

- [ ] **Web Service**
  - Click "New Service" → "GitHub Repo"
  - Select your `Continuo` repository
  - Name: `continuo-web`
  - Root Directory: `web-app`

## 🔧 Environment Variables

### API Service Variables
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=${{continuo-db.DATABASE_URL}}`
- [ ] `REDIS_URL=${{continuo-redis.REDIS_URL}}`
- [ ] `JWT_SECRET=your-super-secure-jwt-secret-here`
- [ ] `PORT=4000`
- [ ] `CORS_ORIGIN=https://your-web-domain.railway.app`
- [ ] `GRAPHQL_PLAYGROUND=false`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `LOG_FORMAT=combined`

### Web Service Variables
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app/graphql`
- [ ] `PORT=3000`

## 🗄️ Database Setup

- [ ] **Install Railway CLI**: `npm install -g @railway/cli`
- [ ] **Login to Railway**: `railway login`
- [ ] **Link project**: `railway link`
- [ ] **Run migrations**: `railway run --service continuo-api npx prisma migrate deploy`
- [ ] **Seed database** (optional): `railway run --service continuo-api npm run seed`

## 🧪 Testing

### Health Checks
- [ ] API Health: `https://your-api-domain.railway.app/health`
- [ ] Web Health: `https://your-web-domain.railway.app/`

### Application Features
- [ ] User registration/login
- [ ] Dashboard functionality
- [ ] Customer management
- [ ] Lead management
- [ ] Contact management
- [ ] Account management

## 🔒 Security

- [ ] **JWT Secret**: Generate secure random string
- [ ] **CORS Origin**: Set to your web domain
- [ ] **GraphQL Playground**: Disabled in production
- [ ] **Rate Limiting**: Configured and tested
- [ ] **HTTPS**: Railway provides automatic SSL

## 📊 Monitoring

- [ ] **Service Logs**: Monitor in Railway dashboard
- [ ] **Health Checks**: Verify automatic monitoring
- [ ] **Performance**: Check CPU/Memory usage
- [ ] **Uptime**: Monitor service availability

## 🌐 Domain Configuration (Optional)

- [ ] **Custom Domain**: Add in Railway dashboard
- [ ] **DNS Records**: Update as instructed
- [ ] **SSL Certificate**: Automatic with Railway
- [ ] **CORS Update**: Update to include custom domain

## 🚨 Troubleshooting

### Common Issues
- [ ] **Build Failures**: Check Dockerfile syntax
- [ ] **Database Connection**: Verify DATABASE_URL
- [ ] **CORS Errors**: Check CORS_ORIGIN setting
- [ ] **Environment Variables**: Verify all required vars set

### Debug Commands
```bash
# Check service logs
railway logs --service continuo-api
railway logs --service continuo-web

# Check service status
railway status

# Run commands in service
railway run --service continuo-api npx prisma studio
```

## 📈 Post-Deployment

- [ ] **Performance Testing**: Load test the application
- [ ] **Security Audit**: Verify all security measures
- [ ] **Backup Strategy**: Confirm database backups
- [ ] **Monitoring Setup**: Configure alerts
- [ ] **Documentation**: Update deployment docs

---

**Status**: Ready for Railway Setup
**Next Step**: Follow Railway Dashboard Setup section 