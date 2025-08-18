-- Migration to add ads data columns to projects table
-- Run this on existing databases to add the new columns for AI ads generation

-- Add ads data columns to projects table
ALTER TABLE projects ADD COLUMN ads_data TEXT; -- JSON data for ads (copy text, images, etc.)
ALTER TABLE projects ADD COLUMN ads_generated_at TEXT; -- When ads were last generated
ALTER TABLE projects ADD COLUMN ads_image_url TEXT; -- URL of the generated ads image (stored in R2)
ALTER TABLE projects ADD COLUMN ads_image_id TEXT; -- ID of the generated ads image

-- Update existing projects to have NULL values for these columns
UPDATE projects SET 
  ads_data = NULL,
  ads_generated_at = NULL,
  ads_image_url = NULL,
  ads_image_id = NULL
WHERE ads_data IS NULL;

-- Create index for better query performance on ads data
CREATE INDEX IF NOT EXISTS idx_projects_ads_data ON projects(ads_data, ads_generated_at);
CREATE INDEX IF NOT EXISTS idx_projects_ads_image ON projects(ads_image_url, ads_image_id);
