#!/bin/bash

# Option 2 Setup Script
# This script helps you get started with the hybrid development approach

echo "🚀 Setting up Option 2: Hybrid Development Approach"
echo "============================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the jetsy project root directory"
    exit 1
fi

echo "📋 Checking prerequisites..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is available"

# Check if wrangler is installed
if ! command -v npx wrangler &> /dev/null; then
    echo "⚠️  Wrangler not found. Installing dependencies..."
    npm install
fi

echo "✅ Wrangler is available"
echo ""

# Check if production is deployed
echo "🔍 Checking production deployment..."
if curl -s "https://jetsy-landing.letrungkien208.workers.dev" > /dev/null; then
    echo "✅ Production is accessible"
else
    echo "⚠️  Production might not be deployed. You may need to run:"
    echo "   npm run deploy:production"
    echo ""
fi

# Check if Gemini API key is configured
echo "🔑 Checking Gemini API key..."
if npx wrangler secret list 2>/dev/null | grep -q "GEMINI_API_KEY"; then
    echo "✅ Gemini API key is configured"
else
    echo "⚠️  Gemini API key not found. You'll need to add it:"
    echo "   npx wrangler secret put GEMINI_API_KEY"
    echo ""
fi

echo ""
echo "🎯 Option 2 Setup Complete!"
echo ""

echo "📝 Next Steps:"
echo "1. Start development environment:"
echo "   npm run dev          # Terminal 1"
echo "   npm run dev:worker   # Terminal 2"
echo ""
echo "2. Test the hybrid approach:"
echo "   npm run test:option2"
echo ""
echo "3. Try the chat feature:"
echo "   Go to http://localhost:3000/chat"
echo "   Ask for a landing page with images"
echo ""

echo "🔗 Useful URLs:"
echo "   - Local Development: http://localhost:3000"
echo "   - Production: https://jetsy-landing.letrungkien208.workers.dev"
echo "   - Documentation: OPTION2_HYBRID_DEVELOPMENT.md"
echo ""

echo "🎉 You're ready to use Option 2!"
echo "   Fast local development + Real image generation" 