# Railway Deployment & Environment Workflow (v0.2.5)

## Current State
- **Production**: https://continuo.pro (live, stable)
- **Dev Web**: https://continuo-web-dev.up.railway.app (live, health endpoint returns status 'ok')
- **Dev API**: https://continuo-api-dev.up.railway.app (live, health endpoint returns status 'ok')
- **Database/Redis**: Both environments use the same Railway Postgres and Redis instance for now
- **CORS/API Connectivity**: Dynamic CORS origin handling, all network issues resolved
- **GraphQL**: All dashboard queries use 'limit' for pagination, matching backend
- **Seeding**: Automated workflow for seeding dev data and restoring environments

## Workflow
- **main branch**: Ongoing development, dev deployments
- **production branch**: Production deployments
- **Seeding**: Temporarily set start command to `npm run db:seed` in `api/railway.json`, then revert to `npm start`
- **Deployment**: See this doc for full deployment and troubleshooting steps

## References
- For database migrations: [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md)
- For API details: [API.md](./API.md)

---

*All other outdated or duplicate deployment/environment docs have been removed or merged here for v0.2.5.* 