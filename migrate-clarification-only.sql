-- Migration to add clarification_state column to chat_messages table
-- This will help us track clarification conversations

-- Add clarification_state column
ALTER TABLE chat_messages ADD COLUMN clarification_state TEXT;
