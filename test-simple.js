#!/usr/bin/env node

// Simple test to trigger LLM and see logs
async function testSimple() {
  console.log('🧪 Simple LLM Test...\n');
  
  try {
    const response = await fetch('http://localhost:8787/api/llm-orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: 1,
        user_message: "TEST: Say 'Hello from o4-mini' if you are the real LLM",
        current_files: {}
      })
    });

    const result = await response.json();
    console.log('Response:', result.assistant_message);
    
    if (result.assistant_message && result.assistant_message.includes('Hello from gpt-4o-mini')) {
      console.log('✅ REAL LLM detected!');
    } else if (result.assistant_message && result.assistant_message.includes('professional landing page')) {
      console.log('✅ REAL LLM detected! (Generated landing page)');
    } else {
      console.log('⚠️  Mock LLM detected or unexpected response');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Wait for Worker to start
setTimeout(testSimple, 3000); 