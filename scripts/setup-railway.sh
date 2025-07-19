#!/bin/bash

# Railway Production Deployment Setup Script
# This script helps set up Railway CLI and initial deployment

set -e

echo "🚀 Setting up Railway deployment for Continuo..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI already installed"
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Link to project (will prompt for project selection)
echo "🔗 Linking to Railway project..."
railway link

# Show project info
echo "📋 Project Information:"
railway status

echo ""
echo "🎉 Railway setup complete!"
echo ""
echo "Next steps:"
echo "1. Create services in Railway dashboard:"
echo "   - PostgreSQL database"
echo "   - Redis cache"
echo "   - API service (from GitHub repo, root: api)"
echo "   - Web service (from GitHub repo, root: web-app)"
echo ""
echo "2. Set environment variables for each service"
echo ""
echo "3. Run database migrations:"
echo "   railway run --service continuo-api npx prisma migrate deploy"
echo ""
echo "4. Deploy services:"
echo "   git push origin main"
echo ""
echo "📖 See docs/RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions" 