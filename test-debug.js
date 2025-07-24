#!/usr/bin/env node

// Debug test to see exact response
async function testDebug() {
  console.log('🔍 Debug LLM Test...\n');
  
  try {
    const response = await fetch('http://localhost:8787/api/llm-orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: 1,
        user_message: "TEST: Say 'Hello from gpt-4o-mini' if you are the real LLM",
        current_files: {}
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Full response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.log('❌ Error detected:', result.error);
    } else if (result.assistant_message) {
      console.log('✅ Success - Assistant message:', result.assistant_message);
    } else {
      console.log('❓ Unexpected response format');
    }
    
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

// Wait for Worker to start
setTimeout(testDebug, 3000); 