-- Migration script for production database
-- Add missing tables for image generation feature

-- Add projects table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1, -- Default user ID for now
    project_name TEXT NOT NULL,
    files TEXT NOT NULL, -- JSON mapping filenames to content
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Add chat_messages table for AI chat history
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL, -- ISO string
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Add images table to store generated images metadata
CREATE TABLE IF NOT EXISTS images (
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

-- Add image placements table to track where images are used in projects
CREATE TABLE IF NOT EXISTS image_placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    file_path TEXT NOT NULL, -- which file the image is used in (e.g., 'src/App.jsx')
    component_name TEXT, -- which component uses the image
    placement_type TEXT NOT NULL, -- 'hero', 'feature', 'gallery', 'background', etc.
    css_class TEXT, -- CSS classes applied to the image
    alt_text TEXT, -- alt text for accessibility
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images(image_id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_images_project_id ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_image_id ON images(image_id);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_image_placements_image_id ON image_placements(image_id);
CREATE INDEX IF NOT EXISTS idx_image_placements_project_id ON image_placements(project_id); 