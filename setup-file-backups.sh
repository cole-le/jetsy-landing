#!/bin/bash

# Setup File Backups Table for File History System
echo "Setting up file_backups table..."

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler is not installed or not in PATH"
    exit 1
fi

# Execute the SQL migration
echo "Creating file_backups table..."
wrangler d1 execute jetsy-leads --file=setup-file-backups.sql

echo "✅ File backups table setup complete!"
echo ""
echo "The file_backups table has been created with the following structure:"
echo "- project_id: Links to the project"
echo "- backup_id: Unique identifier for each backup"
echo "- files: JSON string of all project files"
echo "- timestamp: ISO timestamp of when backup was created"
echo "- user_message: The user message that triggered the backup"
echo "- created_at: Database timestamp"
echo ""
echo "This enables the file history system with restore functionality." 