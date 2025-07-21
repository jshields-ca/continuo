# Deployment Workflow

## Environment Strategy

### Current Setup
- **Development Environment**: `continuo-web` (Railway)
  - Domain: `continuo-web-production.up.railway.app`
  - Branch: `main`
  - Purpose: Development, testing, and feature validation

- **Production Environment**: `continuo-web-prod` (Railway)
  - Domain: Custom domain (e.g., `app.continuo.com`)
  - Branch: `production`
  - Purpose: Live production application

## Workflow

### Daily Development
1. **Work on `main` branch**
   ```bash
   git checkout main
   # Make changes
   git add .
   git commit -m "feat: new feature"
   git push
   ```

2. **Automatic deployment to DEV**
   - Railway automatically deploys `main` branch to development environment
   - Test features at `continuo-web-production.up.railway.app`

### Production Release
1. **Merge to production branch**
   ```bash
   git checkout production
   git merge main
   git push origin production
   ```

2. **Deploy to production**
   - Railway deploys `production` branch to production environment
   - Live at custom domain

## Environment Variables

### Development Environment
- `NODE_ENV`: development
- `NEXT_PUBLIC_API_URL`: https://continuo-api-production.up.railway.app
- `NEXT_PUBLIC_GRAPHQL_URL`: https://continuo-api-production.up.railway.app/graphql

### Production Environment
- `NODE_ENV`: production
- `NEXT_PUBLIC_API_URL`: https://continuo-api-production.up.railway.app
- `NEXT_PUBLIC_GRAPHQL_URL`: https://continuo-api-production.up.railway.app/graphql

## Railway Configuration

### Development Service (`continuo-web`)
- Root Directory: `/`
- Branch: `main`
- Auto-deploy: Enabled
- Configuration: `web-app/railway.dev.json`

### Production Service (`continuo-web-prod`)
- Root Directory: `/`
- Branch: `production`
- Auto-deploy: Enabled
- Configuration: `web-app/railway.json`
- Custom Domain: Configured

## Best Practices

### For Single Developer
1. **Keep it simple**: Two environments are sufficient
2. **Test in DEV**: Always test features in development first
3. **Regular releases**: Deploy to production weekly or when features are stable
4. **Backup strategy**: Use Git for version control and rollback capability

### Branch Strategy
- `main`: Development and testing
- `production`: Live production code
- Feature branches: Create as needed for major features

### Deployment Checklist
- [ ] All tests pass locally
- [ ] Features tested in development environment
- [ ] Environment variables configured correctly
- [ ] Database migrations applied (if needed)
- [ ] Performance tested
- [ ] Security review completed

## Troubleshooting

### Common Issues
1. **Environment variable mismatch**: Check Railway service variables
2. **Build failures**: Verify Dockerfile and dependencies
3. **Database connection issues**: Check API service status
4. **Domain issues**: Verify custom domain configuration

### Rollback Procedure
1. Revert to previous commit on production branch
2. Push changes to trigger Railway redeployment
3. Verify rollback was successful

## Cost Optimization

### Railway Pricing
- Development environment: Free tier or minimal cost
- Production environment: Paid tier for custom domain and better performance
- API service: Shared between environments

### Recommendations
- Use Railway's free tier for development
- Upgrade to paid tier only for production
- Monitor usage and optimize as needed 