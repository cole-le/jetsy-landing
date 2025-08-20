// Test script for project tracking implementation
const API_BASE = 'http://localhost:8787';

async function testProjectTracking() {
  console.log('🧪 Testing Project Tracking Implementation...\n');

  // Test 1: Send a tracking event
  console.log('1. Testing event tracking...');
  try {
    const eventResponse = await fetch(`${API_BASE}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        data: { 
          project_id: '123',
          page_title: 'Test Page',
          referrer: 'https://google.com'
        },
        timestamp: Date.now(),
        userAgent: 'Test User Agent',
        url: 'https://test.com',
        category: 'user_interaction',
        sessionId: 'test_session_123',
        pageTitle: 'Test Page',
        referrer: 'https://google.com',
        websiteId: '123',
        userId: '123',
        jetsyGenerated: true
      })
    });

    if (eventResponse.ok) {
      console.log('✅ Event tracking successful');
    } else {
      console.log('❌ Event tracking failed:', await eventResponse.text());
    }
  } catch (error) {
    console.log('❌ Event tracking error:', error.message);
  }

  // Test 2: Get project tracking summary
  console.log('\n2. Testing project tracking summary...');
  try {
    const summaryResponse = await fetch(`${API_BASE}/api/project-tracking-summary?project_id=123`);
    
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      console.log('✅ Project tracking summary successful');
      console.log('   Totals:', summary.totals);
    } else {
      console.log('❌ Project tracking summary failed:', await summaryResponse.text());
    }
  } catch (error) {
    console.log('❌ Project tracking summary error:', error.message);
  }

  // Test 3: Get project tracking events
  console.log('\n3. Testing project tracking events...');
  try {
    const eventsResponse = await fetch(`${API_BASE}/api/project-tracking?project_id=123&limit=10`);
    
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      console.log('✅ Project tracking events successful');
      console.log('   Events count:', events.events?.length || 0);
    } else {
      console.log('❌ Project tracking events failed:', await eventsResponse.text());
    }
  } catch (error) {
    console.log('❌ Project tracking events error:', error.message);
  }

  console.log('\n🎯 Testing complete!');
}

// Run the test
testProjectTracking().catch(console.error);
