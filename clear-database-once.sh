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

print_status "Clearing Jetsy Database (One-time operation)"
echo "=================================================="

print_warning "This will delete ALL data from your Jetsy database!"
print_warning "This operation cannot be undone!"

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Database clearing cancelled."
    exit 0
fi

# Clear the database
print_status "Clearing all database records..."
wrangler d1 execute jetsy-leads --file=clear-database.sql --remote

if [ $? -eq 0 ]; then
    print_success "Database cleared successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Test your Jetsy landing page to generate new data"
    echo "2. Run the analytics dashboard locally: cd analytics-dashboard && npm run dev"
    echo "3. Access dashboard at: http://localhost:3001"
else
    print_error "Failed to clear database"
    exit 1
fi 