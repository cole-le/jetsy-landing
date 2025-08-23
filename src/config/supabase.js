import { createClient } from '@supabase/supabase-js';

// These will be set in your environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Warn if placeholder values are being used
if (
  typeof window !== 'undefined' &&
  (supabaseUrl.includes('your-project.supabase.co') || supabaseAnonKey === 'your-anon-key')
) {
  console.warn(
    'Supabase is not fully configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local. Sign up/auth will fail until these are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get user from session
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

// Helper function to get session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};
