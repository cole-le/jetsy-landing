-- Migration script to enable proper user isolation for projects
-- This script updates the projects table to use TEXT for user_id to support Supabase UUIDs

-- First, let's create a backup of the current projects
CREATE TABLE IF NOT EXISTS projects_backup AS SELECT * FROM projects;

-- Update the projects table to use TEXT for user_id (to support Supabase UUIDs)
-- Note: SQLite doesn't support ALTER COLUMN TYPE, so we need to recreate the table

-- Create new projects table with TEXT user_id
CREATE TABLE IF NOT EXISTS projects_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, -- Changed from INTEGER to TEXT to support Supabase UUIDs
    project_name TEXT NOT NULL,
    files TEXT NOT NULL, -- JSON mapping filenames to content
    template_data TEXT, -- JSON data for template-based system
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data, converting user_id to string format
INSERT INTO projects_new (id, user_id, project_name, files, template_data, created_at, updated_at)
SELECT 
    id, 
    CAST(user_id AS TEXT), -- Convert existing integer user_ids to text
    project_name, 
    files, 
    template_data, 
    created_at, 
    updated_at
FROM projects;

-- Drop the old table and rename the new one
DROP TABLE projects;
ALTER TABLE projects_new RENAME TO projects;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Update existing projects to use a placeholder user_id for now
-- This will be updated when users authenticate
UPDATE projects SET user_id = 'legacy-user-1' WHERE user_id = '1';

-- Verify the migration
SELECT 'Migration completed. Projects table now supports TEXT user_id for Supabase UUIDs.' as status;
SELECT COUNT(*) as total_projects FROM projects;
SELECT user_id, COUNT(*) as project_count FROM projects GROUP BY user_id;
