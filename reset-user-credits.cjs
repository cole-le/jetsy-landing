#!/usr/bin/env node

const { execSync } = require('child_process');

const USER_ID = '1aa56f04-fe70-4b7e-ad44-8b1b58910a31';
const NEW_CREDITS = 0;

console.log(`🔄 Resetting credits for user ${USER_ID} to ${NEW_CREDITS}...`);

// First, let's check current credits
console.log('\n📊 Checking current credits...');
try {
  const currentCreditsQuery = `SELECT user_id, credits, plan_type, credits_per_month, updated_at FROM user_credits WHERE user_id = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`;
  console.log(`Executing: ${currentCreditsQuery}`);
  const currentResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${currentCreditsQuery}" --remote`, {
    encoding: 'utf8'
  });
  console.log('Current credits:', currentResult);
} catch (error) {
  console.error('Error checking current credits:', error.message);
}

// Update credits to 0
console.log(`\n⚡ Updating credits to ${NEW_CREDITS}...`);
try {
  const updateQuery = `UPDATE user_credits SET credits = ${NEW_CREDITS}, updated_at = CURRENT_TIMESTAMP WHERE user_id = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`;
  console.log(`Executing: ${updateQuery}`);
  const updateResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${updateQuery}" --remote`, {
    encoding: 'utf8'
  });
  console.log('Update result:', updateResult);
} catch (error) {
  console.error('Error updating credits:', error.message);
  process.exit(1);
}

// Verify the update
console.log('\n✅ Verifying the update...');
try {
  const verifyQuery = `SELECT user_id, credits, plan_type, credits_per_month, updated_at FROM user_credits WHERE user_id = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`;
  console.log(`Executing: ${verifyQuery}`);
  const verifyResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${verifyQuery}" --remote`, {
    encoding: 'utf8'
  });
  console.log('Updated credits:', verifyResult);
  console.log(`\n🎉 Successfully reset credits for user ${USER_ID} to ${NEW_CREDITS}!`);
} catch (error) {
  console.error('Error verifying update:', error.message);
}
