-- Migration: Add missing billing tables for Jetsy AI service
-- This migration adds the missing user_credits and credit_transactions tables
-- that are causing the "Failed to load billing (500)" error

-- 1. Create user_credits table for storing user credit information
CREATE TABLE IF NOT EXISTS user_credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, -- Supabase UUID
    credits INTEGER NOT NULL DEFAULT 15, -- Current available credits
    plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'business'
    credits_per_month INTEGER NOT NULL DEFAULT 15, -- Monthly credit allowance
    last_refresh_date TEXT, -- ISO string for when credits were last refreshed
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create credit_transactions table for logging all credit operations
CREATE TABLE IF NOT EXISTS credit_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, -- Supabase UUID
    transaction_type TEXT NOT NULL, -- 'grant', 'deduct', 'refund', 'plan_upgrade'
    feature_name TEXT NOT NULL, -- 'chat', 'image_generation', 'plan_upgrade', etc.
    credits_before INTEGER NOT NULL, -- Credits before transaction
    credits_after INTEGER NOT NULL, -- Credits after transaction
    credits_change INTEGER NOT NULL, -- Net change in credits (positive for grants, negative for deductions)
    metadata TEXT, -- JSON string with additional transaction details
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create file_backups table for storing file version history
CREATE TABLE IF NOT EXISTS file_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    backup_id TEXT NOT NULL UNIQUE,
    files TEXT NOT NULL, -- JSON string of all project files
    timestamp TEXT NOT NULL, -- ISO timestamp
    user_message TEXT NOT NULL, -- The user message that triggered this backup
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_plan_type ON user_credits(plan_type);
CREATE INDEX IF NOT EXISTS idx_user_credits_created_at ON user_credits(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_transaction_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_feature_name ON credit_transactions(feature_name);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_file_backups_project_id ON file_backups(project_id);
CREATE INDEX IF NOT EXISTS idx_file_backups_timestamp ON file_backups(timestamp);
CREATE INDEX IF NOT EXISTS idx_file_backups_backup_id ON file_backups(backup_id);

-- Note: The application will automatically initialize new users with 15 free credits
-- when they first access the billing endpoints
