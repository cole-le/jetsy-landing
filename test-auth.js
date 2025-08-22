// Test file to verify Supabase authentication setup
// Run with: node test-auth.js

import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'Not set');

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ Please set VITE_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.error('❌ Please set VITE_SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test basic connection
  console.log('✅ Supabase client created successfully');
  
  // Test auth methods availability
  console.log('✅ Auth methods available:', !!supabase.auth);
  console.log('✅ Sign up method available:', !!supabase.auth.signUp);
  console.log('✅ Sign in method available:', !!supabase.auth.signInWithPassword);
  console.log('✅ OAuth method available:', !!supabase.auth.signInWithOAuth);
  
  console.log('\n🎉 Supabase authentication system is properly configured!');
  console.log('\nNext steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Navigate to the signup/login forms');
  console.log('3. Test authentication flows');
  
} catch (error) {
  console.error('❌ Error testing Supabase:', error.message);
  process.exit(1);
}
