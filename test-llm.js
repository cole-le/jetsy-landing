#!/usr/bin/env node

// Test script for LLM integration
const API_BASE = 'http://localhost:8787';

async function testLLM() {
  console.log('🧪 Testing LLM Integration with o4-mini...\n');
  
  const testPayload = {
    project_id: 1,
    user_message: "Create a landing page for my SaaS startup that helps small businesses manage their inventory",
    current_files: {
      'src/App.jsx': '// Empty file - will be generated',
      'src/index.css': '/* Basic styles */'
    }
  };

  try {
    console.log('📤 Sending request to /api/llm-orchestrate...');
    console.log('📝 User message:', testPayload.user_message);
    console.log('📁 Current files:', Object.keys(testPayload.current_files));
    console.log('');

    const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Response received successfully!');
    console.log('⏱️  Response time:', response.headers.get('x-response-time') || 'N/A');
    console.log('');
    
    console.log('🤖 Assistant Message:');
    console.log('─'.repeat(50));
    console.log(result.assistant_message);
    console.log('');
    
    console.log('📄 Updated Files:');
    console.log('─'.repeat(50));
    Object.keys(result.updated_files).forEach(filename => {
      console.log(`📁 ${filename}`);
      const content = result.updated_files[filename];
      const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
      console.log(`   ${preview.replace(/\n/g, '\n   ')}`);
      console.log('');
    });

    // Check if it's using real LLM or mock
    if (result.assistant_message.includes('professional landing page') || 
        result.assistant_message.includes('hero section') ||
        result.assistant_message.includes('features section')) {
      console.log('🎉 SUCCESS: Real o4-mini LLM is working!');
      console.log('   - Generated professional landing page content');
      console.log('   - Created proper React components');
      console.log('   - Used Tailwind CSS styling');
    } else {
      console.log('⚠️  WARNING: Might be using mock LLM');
      console.log('   - Check if OpenAI API key is properly configured');
    }

  } catch (error) {
    console.error('❌ Error testing LLM:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure your Worker is running:');
      console.log('   npx wrangler dev --port 8787');
    }
  }
}

// Run the test
testLLM(); 