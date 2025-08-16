#!/bin/bash

echo "🚀 Deploying Jetsy to Cloudflare..."

# Deploy the main worker (jetsy-landing)
echo "📦 Deploying main worker (jetsy-landing)..."
npx wrangler deploy

# Build and deploy the frontend
echo "🌐 Building and deploying frontend..."
cd jetsy-pages && npm run build
npx wrangler pages deploy dist --project-name=jetsy-pages --branch=main

echo "✅ Deployment complete!"
echo "🌍 Main worker: https://jetsy-landing.jetsydev.workers.dev"
echo "🌐 Frontend: https://jetsy-pages.pages.dev" 