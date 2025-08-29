#!/usr/bin/env node

const { execSync } = require('child_process');

const USER_ID = '1aa56f04-fe70-4b7e-ad44-8b1b58910a31';
const NEW_CREDITS = 0;
const USE_LOCAL = true; // Set to false for remote database

console.log(`🔄 Resetting credits for user ${USER_ID} to ${NEW_CREDITS} on ${USE_LOCAL ? 'LOCAL' : 'REMOTE'} database...`);

// First, let's check current credits
console.log('\n📊 Checking current credits...');
try {
  const currentCreditsQuery = `SELECT user_id, credits, plan_type, credits_per_month, updated_at FROM user_credits WHERE user_id = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`;
  console.log(`Executing: ${currentCreditsQuery}`);
  const command = USE_LOCAL
    ? `npx wrangler d1 execute jetsy-leads --command "${currentCreditsQuery}" --local`
    : `npx wrangler d1 execute jetsy-leads --command "${currentCreditsQuery}" --remote`;
  const currentResult = execSync(command, {
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
  const command = USE_LOCAL
    ? `npx wrangler d1 execute jetsy-leads --command "${updateQuery}" --local`
    : `npx wrangler d1 execute jetsy-leads --command "${updateQuery}" --remote`;
  const updateResult = execSync(command, {
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
  const command = USE_LOCAL
    ? `npx wrangler d1 execute jetsy-leads --command "${verifyQuery}" --local`
    : `npx wrangler d1 execute jetsy-leads --command "${verifyQuery}" --remote`;
  const verifyResult = execSync(command, {
    encoding: 'utf8'
  });
  console.log('Updated credits:', verifyResult);
  console.log(`\n🎉 Successfully reset credits for user ${USER_ID} to ${NEW_CREDITS} on ${USE_LOCAL ? 'LOCAL' : 'REMOTE'} database!`);
} catch (error) {
  console.error('Error verifying update:', error.message);
}
