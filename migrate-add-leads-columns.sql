-- Migration to add missing columns to leads table
-- Add user_id, project_id, and submitted_at columns

-- Add user_id column
ALTER TABLE leads ADD COLUMN user_id INTEGER DEFAULT 1;

-- Add project_id column  
ALTER TABLE leads ADD COLUMN project_id INTEGER DEFAULT 1;

-- Add submitted_at column
ALTER TABLE leads ADD COLUMN submitted_at TEXT;
