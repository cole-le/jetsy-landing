-- Vercel Integration Database Schema Migration
-- Add tables to track Vercel deployments and custom domains

-- Vercel deployments table
CREATE TABLE IF NOT EXISTS vercel_deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    deployment_id TEXT UNIQUE NOT NULL, -- Vercel deployment ID
    deployment_url TEXT NOT NULL, -- Vercel deployment URL (e.g., example-abc123.vercel.app)
    status TEXT DEFAULT 'building', -- 'building', 'ready', 'error', 'canceled'
    vercel_project_name TEXT, -- Vercel project name (auto-generated or custom)
    build_time_ms INTEGER, -- Build time in milliseconds
    error_message TEXT, -- Error message if deployment failed
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Custom domains table for Vercel deployments
CREATE TABLE IF NOT EXISTS vercel_custom_domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    deployment_id TEXT NOT NULL,
    domain_name TEXT UNIQUE NOT NULL, -- Custom domain (e.g., mysite.com)
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    dns_configured BOOLEAN DEFAULT FALSE, -- Whether DNS is properly configured
    ssl_status TEXT DEFAULT 'pending', -- 'pending', 'ready', 'failed'
    vercel_domain_id TEXT, -- Vercel's internal domain ID
    dns_records TEXT, -- JSON string of required DNS records
    verification_errors TEXT, -- JSON string of verification errors
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (deployment_id) REFERENCES vercel_deployments(deployment_id)
);

-- Enhanced projects table with Vercel-specific fields
ALTER TABLE projects ADD COLUMN vercel_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN vercel_project_name TEXT;
ALTER TABLE projects ADD COLUMN current_deployment_id TEXT;
ALTER TABLE projects ADD COLUMN current_deployment_url TEXT;
ALTER TABLE projects ADD COLUMN custom_domain TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vercel_deployments_project_id ON vercel_deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_vercel_deployments_status ON vercel_deployments(status);
CREATE INDEX IF NOT EXISTS idx_vercel_deployments_deployment_id ON vercel_deployments(deployment_id);
CREATE INDEX IF NOT EXISTS idx_vercel_custom_domains_project_id ON vercel_custom_domains(project_id);
CREATE INDEX IF NOT EXISTS idx_vercel_custom_domains_domain_name ON vercel_custom_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_vercel_custom_domains_deployment_id ON vercel_custom_domains(deployment_id);
CREATE INDEX IF NOT EXISTS idx_vercel_custom_domains_verification_status ON vercel_custom_domains(verification_status);
