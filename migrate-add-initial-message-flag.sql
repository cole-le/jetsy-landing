-- Migration to add is_initial_message flag to chat_messages table
-- This will help us track which message was the initial prompt for each project

ALTER TABLE chat_messages ADD COLUMN is_initial_message BOOLEAN DEFAULT FALSE;

-- Update existing records to mark the first message of each project as initial
UPDATE chat_messages 
SET is_initial_message = TRUE 
WHERE id IN (
  SELECT MIN(id) 
  FROM chat_messages 
  GROUP BY project_id
); 