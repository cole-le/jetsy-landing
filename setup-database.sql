-- Setup Jetsy database schema
-- This creates all the tables needed for the analytics dashboard

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  phone TEXT,
  user_id INTEGER DEFAULT 1, -- Added for associating with a user
  project_id INTEGER DEFAULT 1, -- Added for associating with a project
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Added for explicit submission time
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Create tracking events table
CREATE TABLE IF NOT EXISTS tracking_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_data TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  url TEXT,
  session_id TEXT
);

-- Create priority access attempts table
CREATE TABLE IF NOT EXISTS priority_access_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  phone TEXT,
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create funnel completions table
CREATE TABLE IF NOT EXISTS funnel_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  funnel_step TEXT NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create onboarding data table
CREATE TABLE IF NOT EXISTS onboarding_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  startup_idea TEXT,
  visibility TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create plan selections table
CREATE TABLE IF NOT EXISTS plan_selections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  plan_name TEXT,
  plan_price DECIMAL(10,2),
  selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  idea_text TEXT,
  visibility TEXT DEFAULT 'private',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create website performance table
CREATE TABLE IF NOT EXISTS website_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  load_time INTEGER,
  performance_score DECIMAL(3,2),
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE,
  email TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create conversion funnels table
CREATE TABLE IF NOT EXISTS conversion_funnels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  funnel_name TEXT,
  step_name TEXT,
  user_id TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Jetsy websites table
CREATE TABLE IF NOT EXISTS jetsy_websites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create demo_leads table
CREATE TABLE IF NOT EXISTS demo_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT NOT NULL,
  created_at TEXT NOT NULL,
  timestamp INTEGER
);

-- Add projects table for AI-powered landing page builder
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1, -- Default user ID for now
  project_name TEXT NOT NULL,
  files TEXT NOT NULL, -- JSON mapping filenames to content
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add chat_messages table for AI chat history
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_name ON tracking_events(event_name);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON tracking_events(created_at);
CREATE INDEX IF NOT EXISTS idx_priority_access_email ON priority_access_attempts(email);
CREATE INDEX IF NOT EXISTS idx_priority_access_created_at ON priority_access_attempts(created_at); 