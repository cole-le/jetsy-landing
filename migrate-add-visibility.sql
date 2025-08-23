-- Add visibility column to projects table
-- This migration adds project visibility functionality

-- Add visibility column with default value 'private'
ALTER TABLE projects ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));

-- Create index for better query performance on public projects
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);

-- Update existing projects to have 'private' visibility by default
UPDATE projects SET visibility = 'public' WHERE visibility IS NULL;

