#!/usr/bin/env node
require('dotenv').config();

// Direct OpenAI API test
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env file.');
  process.exit(1);
}

async function testOpenAIDirect() {
  console.log('🧪 Direct OpenAI API Test...\n');
  
  const models = ['o4-mini', 'gpt-4o-mini', 'gpt-4o', 'gpt-4.1'];
  
  for (const model of models) {
    console.log(`🔍 Testing model: ${model}`);
    console.log('─'.repeat(40));
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'user', content: 'Say "Hello from ' + model + '" and nothing else.' }
          ],
          max_tokens: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${model} - SUCCESS`);
        console.log(`   Response: ${data.choices[0].message.content}`);
        console.log(`   Usage: ${JSON.stringify(data.usage)}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${model} - FAILED (${response.status})`);
        console.log(`   Error: ${errorText.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ${model} - ERROR: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('📋 Summary:');
  console.log('- Check which models are available in your OpenAI account');
  console.log('- Verify API key has access to the models');
  console.log('- Update the Worker code with the correct model name');
}

// Run the test
testOpenAIDirect(); 