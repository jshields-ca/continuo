# Railway Deployment Troubleshooting

## 🚨 Common Issues and Solutions

### 1. "Dockerfile does not exist" Error

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

### 2. Build Failures

**Problem**: Service fails to build after deployment.

**Solutions**:
- Check Railway logs for specific error messages
- Verify all dependencies are in `package.json`
- Ensure Dockerfile syntax is correct
- Check if all required files are present

### 3. Environment Variables Not Working

**Problem**: Application can't access environment variables.

**Solutions**:
- Verify variable names match exactly (case-sensitive)
- Check if variables are set in the correct service
- Restart the service after adding variables
- Use Railway's variable reference syntax: `${{service-name.VARIABLE_NAME}}`

### 4. Database Connection Issues

**Problem**: API can't connect to PostgreSQL database.

**Solutions**:
- Verify `DATABASE_URL` is set correctly
- Check if database service is running
- Ensure database service is in the same project
- Run migrations: `railway run --service continuo-api npx prisma migrate deploy`

### 5. CORS Errors

**Problem**: Frontend can't communicate with API.

**Solutions**:
- Set `CORS_ORIGIN` to your web service domain
- Update `NEXT_PUBLIC_API_URL` to your API service domain
- Check that both services are deployed and running

## 🔧 Debug Commands

### Check Service Status
```bash
railway status
```

### View Service Logs
```bash
# All services
railway logs

# Specific service
railway logs --service continuo-api
railway logs --service continuo-web
```

### Run Commands in Service
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

### Check Service Configuration
```bash
# View service variables
railway variables

# View service settings
railway service
```

## 📋 Deployment Checklist

### Before Deploying:
- [ ] Repository is pushed to GitHub
- [ ] All tests pass locally
- [ ] Environment variables are documented
- [ ] Database migrations are ready

### After Deploying:
- [ ] All services are running (green status)
- [ ] Health checks pass
- [ ] Database migrations completed
- [ ] Application features work
- [ ] Logs show no errors

## 🆘 Getting Help

### Railway Resources:
- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)

### Project Resources:
- [Deployment Guide](RAILWAY_DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](RAILWAY_DEPLOYMENT_CHECKLIST.md)
- [GitHub Issues](https://github.com/jshields-ca/Continuo/issues)

---

**Last Updated**: July 2025
**Version**: 0.2.3 