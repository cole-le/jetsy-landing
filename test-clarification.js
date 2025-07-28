import fetch from 'node-fetch';

async function testClarificationSystem() {
  console.log('🧪 Testing Clarification System...\n');

  const testCases = [
    {
      message: "a space themed bar",
      expectedClarification: true
    },
    {
      message: "Generate a professional landing page for a productivity mobile app called 'TaskFlow' that helps people manage their daily tasks. Include a beta signup form and feature showcase.",
      expectedClarification: false
    },
    {
      message: "create a website",
      expectedClarification: true
    },
    {
      message: "Build a landing page for my restaurant",
      expectedClarification: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: "${testCase.message}"`);
    console.log(`   Expected Clarification: ${testCase.expectedClarification}`);

    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:8787/api/llm-orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: `test-clarification-${Date.now()}`,
          user_message: testCase.message
        })
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;

      console.log(`⏱️  Response time: ${responseTime}ms`);

      if (result.needs_clarification) {
        console.log(`✅ Clarification Requested:`);
        console.log(`   Message: ${result.message}`);
        console.log(`   Questions: ${result.clarification_questions.length} questions`);
        result.clarification_questions.forEach((q, i) => {
          console.log(`   ${i + 1}. ${q}`);
        });
      } else {
        console.log(`✅ No Clarification Needed - Proceeding with website generation`);
        if (result.business_info) {
          console.log(`   Business: ${result.business_info.name}`);
          console.log(`   Type: ${result.business_info.color_scheme}`);
        }
      }

      console.log(''); // Empty line for readability

    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

// Run the test
testClarificationSystem().catch(console.error); 