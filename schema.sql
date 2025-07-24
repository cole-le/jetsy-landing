-- Jetsy Landing Page Database Schema
-- Cloudflare D1 Database

-- Leads table to store captured email and phone information
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    ts INTEGER NOT NULL, -- timestamp in milliseconds
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced tracking events table with better categorization
CREATE TABLE IF NOT EXISTS tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    event_category TEXT, -- 'user_interaction', 'conversion', 'engagement', 'error', 'performance'
    event_data TEXT, -- JSON string of event data
    timestamp INTEGER NOT NULL, -- timestamp in milliseconds
    user_agent TEXT,
    url TEXT,
    session_id TEXT, -- to group events by session
    page_title TEXT,
    referrer TEXT,
    website_id TEXT, -- for Jetsy-generated websites
    user_id TEXT, -- for Jetsy-generated websites
    jetsy_generated BOOLEAN DEFAULT FALSE, -- whether this is from a Jetsy-generated site
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table to store submitted startup ideas
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    idea_name TEXT NOT NULL,
    idea_description TEXT NOT NULL,
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Plan selections table to track which plans users selected
CREATE TABLE IF NOT EXISTS plan_selections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    idea_id INTEGER,
    plan_type TEXT NOT NULL, -- 'free', 'pro', 'business'
    selected_at TEXT NOT NULL, -- ISO string
    created_at TEXT NOT NULL, -- ISO string
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (idea_id) REFERENCES ideas(id)
);

-- Onboarding data table to store additional user information
CREATE TABLE IF NOT EXISTS onboarding_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    audience TEXT NOT NULL,
    validation_goal TEXT NOT NULL,
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Funnel completions table to track successful conversions
CREATE TABLE IF NOT EXISTS funnel_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    idea_id INTEGER,
    plan_type TEXT NOT NULL,
    completed_at TEXT NOT NULL, -- ISO string
    created_at TEXT NOT NULL, -- ISO string
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (idea_id) REFERENCES ideas(id)
);

-- Priority access attempts table to track queue skipping attempts
CREATE TABLE IF NOT EXISTS priority_access_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    attempted_at TEXT NOT NULL, -- ISO string
    created_at TEXT NOT NULL, -- ISO string
    FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Jetsy websites table to track generated websites
CREATE TABLE IF NOT EXISTS jetsy_websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_id TEXT UNIQUE NOT NULL, -- unique identifier for the website
    user_id TEXT NOT NULL, -- Jetsy user who created the website
    website_name TEXT NOT NULL,
    website_url TEXT,
    template_type TEXT, -- 'landing_page', 'ecommerce', 'portfolio', etc.
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'deleted'
    created_at TEXT NOT NULL, -- ISO string
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Website performance metrics table
CREATE TABLE IF NOT EXISTS website_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_id TEXT NOT NULL,
    metric_name TEXT NOT NULL, -- 'page_load_time', 'first_contentful_paint', etc.
    metric_value REAL NOT NULL,
    timestamp INTEGER NOT NULL, -- timestamp in milliseconds
    user_agent TEXT,
    url TEXT,
    created_at TEXT NOT NULL, -- ISO string
    FOREIGN KEY (website_id) REFERENCES jetsy_websites(website_id)
);

-- User sessions table for better session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    website_id TEXT, -- NULL for Jetsy main site
    user_id TEXT, -- NULL for anonymous users
    started_at TEXT NOT NULL, -- ISO string
    ended_at TEXT, -- ISO string, NULL if session is still active
    duration_ms INTEGER, -- session duration in milliseconds
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL, -- ISO string
    FOREIGN KEY (website_id) REFERENCES jetsy_websites(website_id)
);

-- Conversion funnels table for tracking multi-step conversions
CREATE TABLE IF NOT EXISTS conversion_funnels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_id TEXT, -- NULL for Jetsy main site
    funnel_name TEXT NOT NULL, -- 'lead_generation', 'purchase', 'signup'
    step_name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    step_data TEXT, -- JSON string with step-specific data
    session_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL, -- timestamp in milliseconds
    created_at TEXT NOT NULL, -- ISO string
    FOREIGN KEY (website_id) REFERENCES jetsy_websites(website_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_events_name ON tracking_events(event_name);
CREATE INDEX IF NOT EXISTS idx_tracking_events_category ON tracking_events(event_category);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session ON tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_website ON tracking_events(website_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_jetsy ON tracking_events(jetsy_generated);
CREATE INDEX IF NOT EXISTS idx_ideas_lead_id ON ideas(lead_id);
CREATE INDEX IF NOT EXISTS idx_plan_selections_lead_id ON plan_selections(lead_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_data_lead_id ON onboarding_data(lead_id);
CREATE INDEX IF NOT EXISTS idx_funnel_completions_lead_id ON funnel_completions(lead_id);
CREATE INDEX IF NOT EXISTS idx_priority_access_attempts_lead_id ON priority_access_attempts(lead_id);
CREATE INDEX IF NOT EXISTS idx_priority_access_attempts_email ON priority_access_attempts(email);
CREATE INDEX IF NOT EXISTS idx_jetsy_websites_user_id ON jetsy_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_jetsy_websites_status ON jetsy_websites(status);
CREATE INDEX IF NOT EXISTS idx_website_performance_website ON website_performance(website_id);
CREATE INDEX IF NOT EXISTS idx_website_performance_timestamp ON website_performance(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_website ON user_sessions(website_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_website ON conversion_funnels(website_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_session ON conversion_funnels(session_id);

-- Insert some sample data for testing (optional)
-- INSERT INTO leads (email, phone, ts, created_at) VALUES 
-- ('test@example.com', '+1234567890', 1640995200000, '2022-01-01T00:00:00.000Z');

-- INSERT INTO tracking_events (event_name, event_data, timestamp, user_agent, url, created_at) VALUES 
-- ('page_view', '{"page": "home"}', 1640995200000, 'Mozilla/5.0...', 'https://jetsy.com', '2022-01-01T00:00:00.000Z'); 