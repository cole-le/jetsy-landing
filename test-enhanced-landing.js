#!/usr/bin/env node

// Enhanced Landing Page Generation Test
// This script demonstrates the new AI capabilities for generating beautiful landing pages

const API_BASE = 'http://localhost:8787';

async function testEnhancedLanding() {
  console.log('🚀 Testing Enhanced Landing Page Generation...\n');
  
  // Test cases for different business types
  const testCases = [
    {
      name: "Miami Beach Bar",
      message: "Create a stunning landing page for a Miami Beach bar with neon lights, tropical cocktails, and ocean views. Include a lead capture form for reservations.",
      expectedFeatures: ["hero image", "lead form", "neon colors", "cocktails"]
    },
    {
      name: "Tech Startup",
      message: "Generate a professional landing page for a SaaS startup that helps small businesses manage their inventory. Include a free trial signup form.",
      expectedFeatures: ["hero image", "lead form", "blue theme", "features"]
    },
    {
      name: "Restaurant",
      message: "Create a beautiful landing page for an upscale restaurant with farm-to-table ingredients and chef's specials. Include a reservation form.",
      expectedFeatures: ["hero image", "lead form", "warm colors", "food"]
    },
    {
      name: "Fitness App",
      message: "Design a landing page for a fitness app that helps people track workouts and nutrition. Include a waitlist signup form.",
      expectedFeatures: ["hero image", "lead form", "green theme", "fitness"]
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      // Step 1: Create a test project
      console.log('📁 Creating test project...');
      const projectResponse = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: `${testCase.name} Test`,
          user_id: 1,
          files: {
            "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <p className="text-gray-600">Start chatting to customize this page.</p>
      </div>
    </div>
  );
}
export default App;`
          }
        })
      });

      if (!projectResponse.ok) {
        throw new Error(`Failed to create project: ${projectResponse.status}`);
      }

      const projectResult = await projectResponse.json();
      const projectId = projectResult.project_id;
      console.log(`✅ Project created with ID: ${projectId}`);

      // Step 2: Call enhanced LLM orchestration
      console.log('\n🤖 Calling Enhanced LLM Orchestration...');
      const startTime = Date.now();
      
      const llmResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          user_message: testCase.message,
          current_files: {
            "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <p className="text-gray-600">Start chatting to customize this page.</p>
      </div>
    </div>
  );
}
export default App;`
          }
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        throw new Error(`HTTP error! status: ${llmResponse.status} - ${errorText}`);
      }

      const llmResult = await llmResponse.json();
      
      console.log(`⏱️  Response time: ${responseTime}ms`);
      console.log(`📝 Assistant message: ${llmResult.assistant_message.substring(0, 200)}...`);
      console.log(`📁 Files updated: ${Object.keys(llmResult.updated_files || {}).length}`);
      
      // Check for business info
      if (llmResult.business_info) {
        console.log('\n🏢 Business Information:');
        console.log(`   Name: ${llmResult.business_info.name || 'Not specified'}`);
        console.log(`   Tagline: ${llmResult.business_info.tagline || 'Not specified'}`);
        console.log(`   Color Scheme: ${llmResult.business_info.color_scheme || 'Not specified'}`);
      }
      
      // Check for image requests
      if (llmResult.image_requests) {
        console.log(`\n🎨 Image requests planned: ${llmResult.image_requests.length}`);
        llmResult.image_requests.forEach((request, index) => {
          console.log(`   ${index + 1}. ${request.placement}: ${request.prompt.substring(0, 80)}...`);
          console.log(`      Aspect Ratio: ${request.aspect_ratio}`);
        });
      }
      
      // Check for generated images
      if (llmResult.generated_images) {
        console.log(`\n🖼️  Images generated: ${llmResult.generated_images.length}`);
        llmResult.generated_images.forEach((image, index) => {
          console.log(`   ${index + 1}. ${image.placement}: ${image.url}`);
        });
      }
      
      // Analyze the generated code
      if (llmResult.updated_files && llmResult.updated_files['src/App.jsx']) {
        const appCode = llmResult.updated_files['src/App.jsx'];
        console.log('\n📄 Code Analysis:');
        
        // Check for lead capture forms
        const hasLeadForm = appCode.includes('form') || appCode.includes('input') || appCode.includes('button');
        console.log(`   Lead Capture Form: ${hasLeadForm ? '✅ Found' : '❌ Not found'}`);
        
        // Check for interactive elements
        const hasInteractions = appCode.includes('hover') || appCode.includes('transition') || appCode.includes('animate');
        console.log(`   Interactive Elements: ${hasInteractions ? '✅ Found' : '❌ Not found'}`);
        
        // Check for responsive design
        const hasResponsive = appCode.includes('md:') || appCode.includes('lg:') || appCode.includes('sm:');
        console.log(`   Responsive Design: ${hasResponsive ? '✅ Found' : '❌ Not found'}`);
        
        // Check for modern styling
        const hasModernStyling = appCode.includes('gradient') || appCode.includes('rounded') || appCode.includes('shadow');
        console.log(`   Modern Styling: ${hasModernStyling ? '✅ Found' : '❌ Not found'}`);
        
        // Check for multiple sections
        const hasMultipleSections = (appCode.match(/section/g) || []).length > 1;
        console.log(`   Multiple Sections: ${hasMultipleSections ? '✅ Found' : '❌ Not found'}`);
      }
      
      console.log('\n✅ Test completed successfully!\n');
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎉 All enhanced landing page tests completed!');
}

// Run the test
testEnhancedLanding().catch(console.error); 