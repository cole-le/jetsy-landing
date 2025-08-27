#!/usr/bin/env node

/**
 * Test the new screenshot capture endpoint with safeguards
 * Tests: POST /api/projects/:id/capture-screenshot
 */

const PROJECT_ID = process.argv[2] || '2102202872';
const API_BASE = 'https://jetsy-landing.jetsydev.workers.dev';

async function testScreenshotCapture() {
  try {
    console.log(`🧪 Testing screenshot capture for project ${PROJECT_ID}`);
    
    // Test 1: First call - should succeed
    console.log('\n📸 Test 1: First screenshot capture call');
    const response1 = await fetch(`${API_BASE}/api/projects/${PROJECT_ID}/capture-screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result1 = await response1.json();
    console.log(`Status: ${response1.status}`);
    console.log('Response:', JSON.stringify(result1, null, 2));
    
    // Test 2: Immediate second call - should fail with "already in progress"
    console.log('\n📸 Test 2: Immediate second call (should fail)');
    const response2 = await fetch(`${API_BASE}/api/projects/${PROJECT_ID}/capture-screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result2 = await response2.json();
    console.log(`Status: ${response2.status}`);
    console.log('Response:', JSON.stringify(result2, null, 2));
    
    // Test 3: Wait and check if screenshot was created
    console.log('\n⏳ Test 3: Waiting 15 seconds for screenshot to complete...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    const response3 = await fetch(`${API_BASE}/api/projects/${PROJECT_ID}`);
    const result3 = await response3.json();
    
    if (result3.preview_image_url) {
      console.log('✅ Screenshot created successfully!');
      console.log(`🖼️ URL: ${result3.preview_image_url}`);
    } else {
      console.log('❌ Screenshot not created yet');
    }
    
    // Test 4: Call again after completion - should fail with "already exists"
    console.log('\n📸 Test 4: Call after completion (should fail with "already exists")');
    const response4 = await fetch(`${API_BASE}/api/projects/${PROJECT_ID}/capture-screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result4 = await response4.json();
    console.log(`Status: ${response4.status}`);
    console.log('Response:', JSON.stringify(result4, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testScreenshotCapture();
