#!/bin/bash

# Jetsy Landing Page Deployment Script
# Updated for light theme design

set -e

echo "🚀 Starting Jetsy deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi
    
    print_success "All dependencies are available"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Build the React application
build_app() {
    print_status "Building React application..."
    
    # Clean previous build
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    
    # Build the app
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not created"
        exit 1
    fi
    
    print_success "React application built successfully"
}

# Deploy to Cloudflare Workers
deploy_worker() {
    print_status "Deploying to Cloudflare Workers..."
    
    # Check if wrangler.toml exists
    if [ ! -f "wrangler.toml" ]; then
        print_error "wrangler.toml not found"
        exit 1
    fi
    
    # Deploy the worker
    wrangler deploy
    
    print_success "Worker deployed successfully"
}

# Deploy to Cloudflare Pages (alternative)
deploy_pages() {
    print_status "Deploying to Cloudflare Pages..."
    
    # Check if dist directory exists
    if [ ! -d "dist" ]; then
        print_error "dist directory not found. Run build first."
        exit 1
    fi
    
    # Deploy to Pages
    wrangler pages deploy dist --project-name jetsy-landing
    
    print_success "Pages deployment initiated"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if schema.sql exists
    if [ ! -f "schema.sql" ]; then
        print_error "schema.sql not found"
        exit 1
    fi
    
    # Apply database schema
    wrangler d1 execute jetsy-leads --file=schema.sql
    
    print_success "Database schema applied"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Build test
    npm run build
    
    # Check if build was successful
    if [ $? -eq 0 ]; then
        print_success "Build test passed"
    else
        print_error "Build test failed"
        exit 1
    fi
}

# Main deployment function
main() {
    echo "🎨 Jetsy Landing Page - Light Theme Deployment"
    echo "=============================================="
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Run tests
    run_tests
    
    # Build application
    build_app
    
    # Setup database
    setup_database
    
    # Deploy worker
    deploy_worker
    
    # Optionally deploy to Pages
    read -p "Do you want to deploy to Cloudflare Pages as well? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_pages
    fi
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your GTM ID in index.html"
    echo "2. Add your Jetsy logo to public/jetsy_logo3.png"
    echo "3. Test the application flow"
    echo "4. Monitor analytics in Google Tag Manager"
}

# Handle script arguments
case "${1:-}" in
    "build")
        check_dependencies
        install_dependencies
        build_app
        ;;
    "deploy")
        check_dependencies
        build_app
        deploy_worker
        ;;
    "pages")
        check_dependencies
        build_app
        deploy_pages
        ;;
    "db")
        setup_database
        ;;
    "test")
        run_tests
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build   - Build the React application"
        echo "  deploy  - Deploy to Cloudflare Workers"
        echo "  pages   - Deploy to Cloudflare Pages"
        echo "  db      - Setup database schema"
        echo "  test    - Run build tests"
        echo "  help    - Show this help message"
        echo ""
        echo "If no command is provided, runs full deployment pipeline"
        ;;
    *)
        main
        ;;
esac 