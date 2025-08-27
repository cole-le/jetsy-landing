#!/bin/bash

# Script to apply the billing tables migration to production Cloudflare D1 database
# This will fix the "Failed to load billing (500)" error

echo "🚀 Applying billing tables migration to production database..."
echo "📊 Adding missing tables: user_credits, credit_transactions, file_backups"

# Apply the migration to the production D1 database
npx wrangler d1 execute jetsy-leads --file=./migrate-add-user-credits.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo "🎉 The billing system should now work properly."
    echo "📱 Users will be able to see their credits in the /profile page."
else
    echo "❌ Migration failed! Please check the error messages above."
    exit 1
fi

echo ""
echo "🔍 To verify the migration, check the tables:"
echo "   npx wrangler d1 execute jetsy-leads --command=\"SELECT name FROM sqlite_master WHERE type='table';\""
