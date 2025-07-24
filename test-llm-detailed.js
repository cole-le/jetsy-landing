#!/usr/bin/env node

// Detailed test script to verify real vs mock LLM
const API_BASE = 'http://localhost:8787';

async function testLLMDetailed() {
  console.log('🔍 Detailed LLM Integration Test...\n');
  
  const testCases = [
    {
      name: "SaaS Landing Page",
      message: "Create a landing page for my SaaS startup that helps small businesses manage their inventory",
      expectedReal: ["inventory management", "SaaS", "business", "professional"]
    },
    {
      name: "Color Change Request", 
      message: "Change the color scheme to red and purple",
      expectedReal: ["red", "purple", "color scheme", "updated"]
    },
    {
      name: "Complex Feature Request",
      message: "Add a pricing table with 3 tiers: Basic ($29), Pro ($79), Enterprise ($199)",
      expectedReal: ["pricing", "tiers", "Basic", "Pro", "Enterprise", "$29", "$79", "$199"]
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.name}`);
    console.log('─'.repeat(40));
    
    const testPayload = {
      project_id: 1,
      user_message: testCase.message,
      current_files: {
        'src/App.jsx': 'import React from "react";\nfunction App() { return <div>Test</div>; }\nexport default App;',
        'src/index.css': '/* Basic styles */'
      }
    };

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`⏱️  Response time: ${responseTime}ms`);
      console.log(`📝 Message length: ${result.assistant_message.length} chars`);
      console.log(`📁 Files updated: ${Object.keys(result.updated_files).length}`);
      
      // Check for real LLM indicators
      const isRealLLM = testCase.expectedReal.some(keyword => 
        result.assistant_message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Check for mock LLM indicators
      const isMockLLM = result.assistant_message.includes('professional landing page') && 
                       result.assistant_message.includes('hero section') &&
                       result.assistant_message.includes('features section');
      
      if (isRealLLM && !isMockLLM) {
        console.log('✅ REAL LLM (o4-mini) detected!');
        console.log('   - Response matches specific request');
        console.log('   - Generated contextual content');
      } else if (isMockLLM) {
        console.log('⚠️  MOCK LLM detected');
        console.log('   - Using generic response template');
        console.log('   - Check OpenAI API key configuration');
      } else {
        console.log('❓ UNKNOWN - Could be either real or mock');
      }
      
      console.log(`🤖 Response preview: ${result.assistant_message.substring(0, 100)}...`);
      console.log('');

    } catch (error) {
      console.error(`❌ Error in test "${testCase.name}":`, error.message);
      console.log('');
    }
  }
  
  console.log('🔧 Troubleshooting Tips:');
  console.log('1. Check if Worker is running: npx wrangler dev --port 8787');
  console.log('2. Verify OpenAI API key: npx wrangler secret list');
  console.log('3. Check Worker logs for API errors');
  console.log('4. Ensure o4-mini model is available in your OpenAI account');
}

// Run the detailed test
testLLMDetailed(); 