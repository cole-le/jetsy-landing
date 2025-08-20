# 🚀 Jetsy Deployment Guide

This document contains all the deployment commands and procedures for deploying Jetsy to Cloudflare production servers.

## 📋 Prerequisites

- Node.js v20+ installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account configured with API tokens
- Environment variables set in `.dev.vars`

## 🔧 Build Commands

### Build the Project
```bash
npm run build
```
This creates the `dist/` directory with compiled production assets.

## 🚀 Deployment Commands

### 1. Deploy Frontend (jetsy-pages) to Production
```bash
npx wrangler pages deploy dist --project-name=jetsy-pages --branch=main
```

**What this does:**
- Deploys the built frontend to Cloudflare Pages
- Project name: `jetsy-pages`
- Production branch: `main`
- Build output: `dist/` directory

### 2. Deploy Worker (jetsy-landing) to Production
```bash
npx wrangler deploy --config wrangler.worker.toml
```

**What this does:**
- Deploys the backend worker to Cloudflare Workers
- Uses configuration from `wrangler.worker.toml`
- Includes D1 database and R2 bucket bindings

## 🔄 Complete Deployment Workflow

```bash
# Step 1: Build the project
npm run build

# Step 2: Deploy frontend to production
npx wrangler pages deploy dist --project-name=jetsy-pages --branch=main

# Step 3: Deploy worker to production
npx wrangler deploy --config wrangler.worker.toml
```

## 📍 Service URLs

### Production URLs
- **Frontend (jetsy-pages)**: https://a998a7dd.jetsy-pages.pages.dev
- **Worker (jetsy-landing)**: https://jetsy-landing.jetsydev.workers.dev

## ⚠️ Important Notes

1. **Always build first**: Run `npm run build` before deploying to ensure latest code is compiled
2. **Build output**: The `dist/` directory must exist and contain compiled assets
3. **Environment variables**: Ensure `.dev.vars` contains all required secrets
4. **Database bindings**: D1 database and R2 bucket are automatically configured via wrangler.toml

## 🔍 Troubleshooting

### Common Issues
- **Build fails**: Check for syntax errors in source code
- **Deployment fails**: Verify Cloudflare API tokens and account permissions
- **Missing assets**: Ensure `dist/` directory contains all required files

### Verification Commands
```bash
# Check if dist directory exists and has content
ls -la dist/

# Verify wrangler configuration
npx wrangler whoami
```

## 📚 Related Documentation

- `wrangler.pages.toml` - Cloudflare Pages configuration
- `wrangler.worker.toml` - Cloudflare Worker configuration
- `.dev.vars` - Environment variables and secrets

---

**Last Updated**: $(date)
**Version**: 1.0
