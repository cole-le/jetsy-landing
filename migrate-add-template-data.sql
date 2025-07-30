-- Migration to add template_data column to projects table
-- Run this on existing databases to add the new column

-- Add template_data column to projects table
ALTER TABLE projects ADD COLUMN template_data TEXT;

-- Update existing projects to have empty template_data (will be populated when they use the new system)
UPDATE projects SET template_data = NULL WHERE template_data IS NULL; 