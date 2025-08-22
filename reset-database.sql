-- Complete database reset script
-- This will drop all tables and recreate them with proper user isolation support

-- Drop all tables that reference projects first
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS image_placements;
DROP TABLE IF EXISTS file_backups;
DROP TABLE IF EXISTS test_runs;
DROP TABLE IF EXISTS deployments;
DROP TABLE IF EXISTS vercel_deployments;
DROP TABLE IF EXISTS vercel_custom_domains;

-- Drop the projects table
DROP TABLE IF EXISTS projects;

-- Drop other tables that might have dependencies
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS tracking_events;
DROP TABLE IF EXISTS priority_access_attempts;
DROP TABLE IF EXISTS onboarding_data;
DROP TABLE IF EXISTS funnel_completions;
DROP TABLE IF EXISTS plan_selections;
DROP TABLE IF EXISTS ideas;
DROP TABLE IF EXISTS website_performance;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS conversion_funnels;
DROP TABLE IF EXISTS demo_leads;
DROP TABLE IF EXISTS jetsy_websites;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS custom_domains;

-- Reset auto-increment sequences
DELETE FROM sqlite_sequence;

-- Recreate the projects table with TEXT user_id for Supabase UUIDs
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, -- TEXT to support Supabase UUIDs
    project_name TEXT NOT NULL,
    files TEXT NOT NULL, -- JSON mapping filenames to content
    template_data TEXT, -- JSON data for template-based system
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    vercel_enabled BOOLEAN DEFAULT FALSE,
    vercel_project_name TEXT,
    current_deployment_id TEXT,
    current_deployment_url TEXT,
    custom_domain TEXT,
    business_name TEXT,
    business_description TEXT,
    target_audience TEXT,
    ads_data TEXT,
    ads_images TEXT,
    ads_generated_at TEXT,
    ads_platform TEXT DEFAULT 'linkedin',
    ads_image_url TEXT,
    ads_image_id TEXT,
    website_id TEXT
);

-- Recreate the chat_messages table
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL, -- ISO string
    clarification_state TEXT, -- JSON string
    is_initial_message BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Recreate the images table
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id TEXT UNIQUE NOT NULL, -- unique identifier for the image
    project_id INTEGER NOT NULL,
    filename TEXT NOT NULL, -- filename in R2 storage
    original_prompt TEXT NOT NULL, -- the prompt used to generate the image
    aspect_ratio TEXT NOT NULL, -- '1:1', '16:9', '4:3', etc.
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size INTEGER NOT NULL, -- file size in bytes
    mime_type TEXT NOT NULL, -- 'image/jpeg', 'image/png', etc.
    r2_url TEXT NOT NULL, -- Cloudflare R2 URL
    status TEXT DEFAULT 'active', -- 'active', 'deleted', 'processing'
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Recreate the image_placements table
CREATE TABLE image_placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    placement_type TEXT NOT NULL, -- 'hero', 'gallery', 'testimonial', etc.
    placement_data TEXT, -- JSON string with placement-specific data
    created_at TEXT NOT NULL, -- ISO string
    FOREIGN KEY (image_id) REFERENCES images(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Recreate the leads table
CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    phone TEXT,
    full_name TEXT,
    company TEXT,
    project_id INTEGER,
    source TEXT DEFAULT 'landing_page',
    status TEXT DEFAULT 'new',
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT, -- TEXT to support Supabase UUIDs
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Recreate other essential tables
CREATE TABLE tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_data TEXT, -- JSON string
    timestamp INTEGER NOT NULL, -- timestamp in milliseconds
    created_at TEXT NOT NULL, -- ISO string
    url TEXT,
    user_agent TEXT,
    session_id TEXT
);

CREATE TABLE priority_access_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    phone TEXT,
    full_name TEXT,
    company TEXT,
    attempt_count INTEGER DEFAULT 1,
    last_attempt_at TEXT NOT NULL, -- ISO string
    created_at TEXT NOT NULL, -- ISO string
    user_id TEXT -- TEXT to support Supabase UUIDs
);

CREATE TABLE onboarding_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    phone TEXT,
    full_name TEXT,
    company TEXT,
    business_type TEXT,
    business_description TEXT,
    target_audience TEXT,
    created_at TEXT NOT NULL, -- ISO string
    user_id TEXT -- TEXT to support Supabase UUIDs
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX idx_images_project_id ON images(project_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_project_id ON leads(project_id);
CREATE INDEX idx_tracking_events_timestamp ON tracking_events(timestamp);

-- Verify the new schema
SELECT 'Database reset completed successfully!' as status;
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
