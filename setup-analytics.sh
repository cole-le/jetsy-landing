#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_status() {
    echo -e "${BLUE}📊 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "schema.sql" ]; then
    print_error "schema.sql not found. Please run this script from the jetsy root directory."
    exit 1
fi

print_status "Setting up Jetsy Analytics Dashboard"
echo "=========================================="

# Step 1: Clear the database
print_status "Step 1: Clearing all database records..."
wrangler d1 execute jetsy-leads --file=clear-database.sql
if [ $? -eq 0 ]; then
    print_success "Database cleared successfully"
else
    print_error "Failed to clear database"
    exit 1
fi

# Step 2: Set up analytics dashboard
print_status "Step 2: Setting up analytics dashboard..."

cd analytics-dashboard

# Install dependencies
print_status "Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build the dashboard
print_status "Building analytics dashboard..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Dashboard built successfully"
else
    print_error "Failed to build dashboard"
    exit 1
fi

# Deploy the worker
print_status "Deploying analytics dashboard worker..."
wrangler deploy
if [ $? -eq 0 ]; then
    print_success "Analytics dashboard deployed successfully"
else
    print_error "Failed to deploy analytics dashboard"
    exit 1
fi

cd ..

print_success "🎉 Analytics Dashboard Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update your database ID in analytics-dashboard/wrangler.toml"
echo "2. Access your analytics dashboard at: https://jetsy-analytics-dashboard.your-subdomain.workers.dev"
echo "3. Test the queue system on your main Jetsy site"
echo "4. Monitor metrics in the analytics dashboard"
echo ""
echo "Dashboard Features:"
echo "• Overview with key metrics and charts"
echo "• Funnel analysis showing conversion rates"
echo "• Event tracking with detailed logs"
echo "• Priority access attempt monitoring"
echo "• Real-time metrics with auto-refresh"
echo ""
print_warning "Remember to update the database ID in wrangler.toml before deploying!" 