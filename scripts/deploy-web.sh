#!/bin/bash

# Deploy web service to Railway
echo "🚀 Deploying web service to Railway..."

# Set build argument for web service
export RAILWAY_BUILD_ARGS="SERVICE_DIR=web-app"

# Deploy using Railway CLI
railway up --service continuo-web

echo "✅ Web service deployment initiated!" 