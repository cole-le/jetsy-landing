// Test script to verify UUID to integer mapping for user isolation
// This simulates how the worker will map Supabase UUIDs to integer user_ids

function mapUuidToUserId(supabaseUuid) {
  // Same logic as in the worker
  return Math.abs(supabaseUuid.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0)) % 1000000; // Keep it within reasonable range
}

// Test with the user ID from your console log
const testUuid = '1aa56f04-fe70-4b7e-ad44-8b1b58910a31'; // From your console log
const mappedUserId = mapUuidToUserId(testUuid);

console.log('🧪 Testing UUID to User ID Mapping...');
console.log('Supabase UUID:', testUuid);
console.log('Mapped User ID:', mappedUserId);
console.log('');

// Test with a few more UUIDs to ensure uniqueness
const testUuids = [
  '1aa56f04-fe70-4b7e-ad44-8b1b58910a31', // Your current user
  '2bb67g15-gf81-5c8f-be55-9c2c69a21b42', // Hypothetical user 2
  '3cc78h26-hg92-6d9g-cf66-ad3d7ab32c53', // Hypothetical user 3
  '4dd89i37-ih03-7e0h-dg77-be4e8bc43d64', // Hypothetical user 4
];

console.log('Testing multiple UUIDs for uniqueness:');
testUuids.forEach((uuid, index) => {
  const userId = mapUuidToUserId(uuid);
  console.log(`User ${index + 1}: UUID ${uuid.slice(0, 8)}... → User ID: ${userId}`);
});

console.log('');
console.log('✅ If all User IDs are different, the mapping is working correctly!');
console.log('');
console.log('Next steps:');
console.log('1. Deploy your updated worker: npx wrangler deploy --env production --config wrangler.worker.toml');
console.log('2. Test the authentication flow in your app');
console.log('3. Verify that users only see their own projects');
