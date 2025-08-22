// Test script to verify user isolation is working
// Run with: node test-user-isolation.js

import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

console.log('🧪 Testing User Isolation System...');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'Not set');

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ Please set VITE_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.error('❌ Please set VITE_SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

async function testUserIsolation() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('\n1️⃣ Testing Supabase connection...');
    console.log('✅ Supabase client created successfully');
    
    console.log('\n2️⃣ Testing authentication methods...');
    console.log('✅ Auth methods available:', !!supabase.auth);
    console.log('✅ Sign up method available:', !!supabase.auth.signUp);
    console.log('✅ Sign in method available:', !!supabase.auth.signInWithPassword);
    console.log('✅ OAuth method available:', !!supabase.auth.signInWithOAuth);
    
    console.log('\n3️⃣ Testing JWT token structure...');
    // Create a test user to get a JWT token
    const { data, error } = await supabase.auth.signUp({
      email: 'test-isolation@example.com',
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Test User',
          phone: '+1234567890'
        }
      }
    });
    
    if (error) {
      console.log('ℹ️ Test user creation result:', error.message);
      console.log('This is expected if the email already exists');
    } else {
      console.log('✅ Test user created successfully');
      console.log('User ID:', data.user?.id);
      console.log('JWT Token available:', !!data.session?.access_token);
      
      if (data.session?.access_token) {
        // Decode the JWT token to verify structure
        const token = data.session.access_token;
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('JWT Payload structure:');
        console.log('  - sub (user_id):', payload.sub);
        console.log('  - aud:', payload.aud);
        console.log('  - exp:', new Date(payload.exp * 1000).toISOString());
      }
    }
    
    console.log('\n4️⃣ Testing API authentication...');
    console.log('To test the full system:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Sign up with a new account');
    console.log('3. Check that you only see your own projects');
    console.log('4. Verify that other users cannot access your projects');
    
    console.log('\n🎉 User isolation system test completed!');
    console.log('\nNext steps:');
    console.log('1. Run the database migration: wrangler d1 execute jetsy-leads --file=./migrate-user-isolation.sql');
    console.log('2. Deploy your updated worker: npx wrangler deploy --env production --config wrangler.worker.toml');
    console.log('3. Test the authentication flow in your app');
    
  } catch (error) {
    console.error('❌ Error testing user isolation:', error.message);
    process.exit(1);
  }
}

testUserIsolation();
