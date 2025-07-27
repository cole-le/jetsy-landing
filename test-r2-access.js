#!/usr/bin/env node

// Test script to check R2 bucket access
const API_BASE = 'http://localhost:8787';

async function testR2Access() {
  console.log('🔍 Testing R2 Bucket Access');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Test if we can access the R2 bucket through the worker
    console.log('📋 Testing R2 bucket access...');
    const response = await fetch(`${API_BASE}/api/test-r2-access`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ R2 access test failed: ${response.status} - ${errorText}`);
      console.log('\n💡 This might mean the R2 bucket endpoint is not implemented.');
      return;
    }

    const result = await response.json();
    console.log('✅ R2 access test response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 This might mean the worker is not running or the endpoint is not implemented.');
  }
}

// Run the test
testR2Access(); 