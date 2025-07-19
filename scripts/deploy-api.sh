#!/bin/bash

# Deploy API service to Railway
echo "🚀 Deploying API service to Railway..."

# Set build argument for API service
export RAILWAY_BUILD_ARGS="SERVICE_DIR=api"

# Deploy using Railway CLI
railway up --service continuo-api

echo "✅ API service deployment initiated!" 