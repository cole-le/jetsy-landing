-- File Backups Table for File History System
-- This table stores version history of project files for each chat interaction

CREATE TABLE IF NOT EXISTS file_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    backup_id TEXT NOT NULL UNIQUE,
    files TEXT NOT NULL, -- JSON string of all project files
    timestamp TEXT NOT NULL, -- ISO timestamp
    user_message TEXT NOT NULL, -- The user message that triggered this backup
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient querying by project_id
CREATE INDEX IF NOT EXISTS idx_file_backups_project_id ON file_backups(project_id);

-- Index for efficient querying by timestamp (for ordering)
CREATE INDEX IF NOT EXISTS idx_file_backups_timestamp ON file_backups(timestamp);

-- Index for backup_id lookups
CREATE INDEX IF NOT EXISTS idx_file_backups_backup_id ON file_backups(backup_id);

-- Add a limit to prevent excessive backups (keep last 50 backups per project)
-- This can be implemented in the application logic 