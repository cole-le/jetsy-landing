#!/usr/bin/env node

const { execSync } = require('child_process');

const USER_ID = '1aa56f04-fe70-4b7e-ad44-8b1b58910a31';
const GRANT_CREDITS = 200;
const USE_LOCAL = false; // Set to false for remote database

console.log(`🎁 Granting ${GRANT_CREDITS} credits to user ${USER_ID} on ${USE_LOCAL ? 'LOCAL' : 'REMOTE'} database...`);

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

// Grant credits by adding to current amount
console.log(`\n⚡ Adding ${GRANT_CREDITS} credits to current balance...`);
try {
  const grantQuery = `UPDATE user_credits SET credits = credits + ${GRANT_CREDITS}, updated_at = CURRENT_TIMESTAMP WHERE user_id = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`;
  console.log(`Executing: ${grantQuery}`);
  const command = USE_LOCAL
    ? `npx wrangler d1 execute jetsy-leads --command "${grantQuery}" --local`
    : `npx wrangler d1 execute jetsy-leads --command "${grantQuery}" --remote`;
  const grantResult = execSync(command, {
    encoding: 'utf8'
  });
  console.log('Grant result:', grantResult);
} catch (error) {
  console.error('Error granting credits:', error.message);
  process.exit(1);
}

// Verify the update
console.log('\n✅ Verifying the credit grant...');
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
  console.log(`\n🎉 Successfully granted ${GRANT_CREDITS} credits to user ${USER_ID} on ${USE_LOCAL ? 'LOCAL' : 'REMOTE'} database!`);
} catch (error) {
  console.error('Error verifying credit grant:', error.message);
}

// Also log this transaction in credit_transactions table
console.log('\n📝 Recording transaction in credit_transactions table...');
try {
  // First get the credits after the grant for the transaction log
  const getCreditsAfterQuery = `SELECT credits FROM user_credits WHERE user_id = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`;
  const getCreditsCommand = USE_LOCAL
    ? `npx wrangler d1 execute jetsy-leads --command "${getCreditsAfterQuery}" --local`
    : `npx wrangler d1 execute jetsy-leads --command "${getCreditsAfterQuery}" --remote`;
  const creditsAfterResult = execSync(getCreditsCommand, {
    encoding: 'utf8'
  });

  // Extract credits after value from the result (this is a bit crude but works for our simple case)
  const creditsAfterMatch = creditsAfterResult.match(/(\d+)/);
  const creditsAfter = creditsAfterMatch ? parseInt(creditsAfterMatch[1]) : 0;
  const creditsBefore = creditsAfter - GRANT_CREDITS;

  const transactionQuery = `INSERT INTO credit_transactions (user_id, transaction_type, feature_name, credits_before, credits_after, credits_change, metadata, created_at) VALUES ('${USER_ID}', 'grant', 'admin_grant', ${creditsBefore}, ${creditsAfter}, ${GRANT_CREDITS}, '{"reason": "Admin credit grant via script", "amount": ${GRANT_CREDITS}}', CURRENT_TIMESTAMP);`;
  console.log(`Executing: ${transactionQuery}`);
  const transactionCommand = USE_LOCAL
    ? `npx wrangler d1 execute jetsy-leads --command "${transactionQuery}" --local`
    : `npx wrangler d1 execute jetsy-leads --command "${transactionQuery}" --remote`;
  const transactionResult = execSync(transactionCommand, {
    encoding: 'utf8'
  });
  console.log('Transaction recorded:', transactionResult);
} catch (error) {
  console.error('Error recording transaction:', error.message);
}
