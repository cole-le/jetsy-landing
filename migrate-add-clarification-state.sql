-- Migration to add clarification_state column to chat_messages table
-- This will help us track clarification conversations

-- Add clarification_state column
ALTER TABLE chat_messages ADD COLUMN clarification_state TEXT;

-- Add is_initial_message column if it doesn't exist
-- (This should have been applied already from migrate-add-initial-message-flag.sql)
-- but adding it here as a safety measure
ALTER TABLE chat_messages ADD COLUMN is_initial_message BOOLEAN DEFAULT FALSE;
