-- Clear all records from all tables in Jetsy database
-- WARNING: This will delete ALL data from the database

-- Clear tracking events
DELETE FROM tracking_events;

-- Clear priority access attempts
DELETE FROM priority_access_attempts;

-- Clear funnel completions
DELETE FROM funnel_completions;

-- Clear onboarding data
DELETE FROM onboarding_data;

-- Clear plan selections
DELETE FROM plan_selections;

-- Clear ideas
DELETE FROM ideas;

-- Clear leads
DELETE FROM leads;

-- Clear website performance
DELETE FROM website_performance;

-- Clear user sessions
DELETE FROM user_sessions;

-- Clear conversion funnels
DELETE FROM conversion_funnels;

-- Clear Jetsy websites
DELETE FROM jetsy_websites;

-- Reset auto-increment counters
DELETE FROM sqlite_sequence WHERE name IN (
  'tracking_events',
  'priority_access_attempts', 
  'funnel_completions',
  'onboarding_data',
  'plan_selections',
  'ideas',
  'leads',
  'website_performance',
  'user_sessions',
  'conversion_funnels',
  'jetsy_websites'
); 