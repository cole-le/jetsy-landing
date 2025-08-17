-- Migration to add business information columns to projects table
-- Run this on existing databases to add the new columns for ads generation

-- Add business information columns to projects table
ALTER TABLE projects ADD COLUMN business_name TEXT;
ALTER TABLE projects ADD COLUMN business_description TEXT;
ALTER TABLE projects ADD COLUMN target_audience TEXT;

-- Update existing projects to have NULL values for these columns
UPDATE projects SET 
  business_name = NULL,
  business_description = NULL,
  target_audience = NULL
WHERE business_name IS NULL;

-- Create index for better query performance on business info
CREATE INDEX IF NOT EXISTS idx_projects_business_info ON projects(business_name, business_description, target_audience);
