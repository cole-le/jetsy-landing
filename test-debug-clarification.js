import fetch from 'node-fetch';

async function testDebugClarification() {
  console.log('🧪 Debug Testing Clarification System...\n');

  const testMessage = "a space themed bar";

  console.log(`📋 Testing: "${testMessage}"`);

  try {
    const response = await fetch('http://localhost:8787/api/llm-orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_id: `debug-test-${Date.now()}`,
        user_message: testMessage
      })
    });

    const result = await response.json();
    console.log(`📊 Response:`, JSON.stringify(result, null, 2));

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run the test
testDebugClarification().catch(console.error); 