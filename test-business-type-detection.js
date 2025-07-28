import fetch from 'node-fetch';

async function testBusinessTypeDetection() {
  console.log('🧪 Testing Business Type Detection and Creative Content Generation...\n');

  const testCases = [
    {
      message: "Generate a professional landing page for a productivity mobile app called 'TaskFlow' that helps people manage their daily tasks. Include a beta signup form and feature showcase.",
      expectedType: "mobile_app"
    },
    {
      message: "Create a landing page for a space theme bar",
      expectedType: "local_service"
    },
    {
      message: "Build a website for an online fashion store",
      expectedType: "ecommerce_fashion"
    },
    {
      message: "Design a landing page for a business consulting service",
      expectedType: "consulting_service"
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.message.substring(0, 80)}...`);
    console.log(`   Expected Business Type: ${testCase.expectedType}`);

    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:8787/api/llm-orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: `test-${Date.now()}`,
          user_message: testCase.message
        })
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;

      console.log(`⏱️  Response time: ${responseTime}ms`);

      if (result.business_info) {
        console.log(`🏢 Business Info:`);
        console.log(`   Name: ${result.business_info.name}`);
        console.log(`   Tagline: ${result.business_info.tagline}`);
        console.log(`   Color Scheme: ${result.business_info.color_scheme}`);
        console.log(`   Primary Color: ${result.business_info.colors?.primary}`);
        
        // Check if business type detection worked
        const detectedType = result.business_info.color_scheme;
        const isCorrect = detectedType === testCase.expectedType;
        console.log(`✅ Business Type Detection: ${isCorrect ? 'PASS' : 'FAIL'} (Expected: ${testCase.expectedType}, Got: ${detectedType})`);
        
        // Check if content is creative (not generic)
        const isCreative = !result.business_info.name.includes('Business Name') && 
                          !result.business_info.name.includes('Business') &&
                          result.business_info.name.length > 0;
        console.log(`🎨 Creative Content: ${isCreative ? 'PASS' : 'FAIL'} (Name: ${result.business_info.name})`);
        
      } else {
        console.log(`❌ No business info in response`);
      }

      if (result.image_requests) {
        console.log(`🖼️  Image Requests: ${result.image_requests.length} images`);
        result.image_requests.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.placement}: ${req.prompt.substring(0, 60)}...`);
        });
      }

      console.log(''); // Empty line for readability

    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

// Run the test
testBusinessTypeDetection().catch(console.error); 