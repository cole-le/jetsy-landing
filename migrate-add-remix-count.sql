-- Migration: add remix_count to projects and backfill to 0
ALTER TABLE projects ADD COLUMN IF NOT EXISTS remix_count INTEGER DEFAULT 0;

-- Backfill nulls to 0 (for older rows)
UPDATE projects SET remix_count = 0 WHERE remix_count IS NULL;

-- Optional index for sorting/filtering by popularity
CREATE INDEX IF NOT EXISTS idx_projects_remix_count ON projects(remix_count);
