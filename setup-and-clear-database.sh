#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_status() {
    echo -e "${BLUE}🗑️  $1${NC}"
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

print_status "Setting up and clearing Jetsy Database"
echo "=============================================="

print_warning "This will set up the database schema and delete ALL existing data!"
print_warning "This operation cannot be undone!"

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Database setup cancelled."
    exit 0
fi

# Step 1: Set up database schema
print_status "Step 1: Setting up database schema..."
wrangler d1 execute jetsy-leads --file=setup-database.sql --remote

if [ $? -eq 0 ]; then
    print_success "Database schema created successfully!"
else
    print_error "Failed to create database schema"
    exit 1
fi

# Step 2: Clear all data
print_status "Step 2: Clearing all database records..."
wrangler d1 execute jetsy-leads --file=clear-database.sql --remote

if [ $? -eq 0 ]; then
    print_success "Database cleared successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Test your Jetsy landing page to generate new data"
    echo "2. Deploy the analytics API worker: cd analytics-dashboard && wrangler deploy"
    echo "3. Run the dashboard locally: cd analytics-dashboard && npm run dev"
    echo "4. Access dashboard at: http://localhost:3001"
else
    print_error "Failed to clear database"
    exit 1
fi 