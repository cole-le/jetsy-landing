#!/usr/bin/env node

// Test script to verify image replacement logic
const API_BASE = 'http://localhost:8787';

async function testImageReplacement() {
  console.log('🧪 Testing Image Replacement Logic...\n');
  
  // Create a test project
  console.log('📁 Creating test project...');
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_name: "Image Replacement Test",
      user_id: 1,
      files: {
        "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Image Replacement Test</h1>
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

  // Test LLM orchestration with image generation
  console.log('\n🤖 Testing LLM Orchestration with Image Generation...');
  console.log('─'.repeat(50));
  
  const llmPayload = {
    project_id: projectId,
    user_message: "Create a landing page for a coffee shop with a hero image and feature images",
    current_files: {
      "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Test Page</h1>
    </div>
  );
}
export default App;`
    }
  };

  try {
    const startTime = Date.now();
    
    const llmResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(llmPayload)
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
    
    if (llmResult.image_requests) {
      console.log(`🎨 Image requests planned: ${llmResult.image_requests.length}`);
    }
    
    if (llmResult.generated_images) {
      console.log(`🖼️  Images generated: ${llmResult.generated_images.length}`);
      llmResult.generated_images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      URL: ${image.url}`);
        console.log(`      Placement: ${image.placement}`);
      });
    }
    
    // Check if images are properly replaced in the code
    if (llmResult.updated_files) {
      console.log('\n📄 Checking image replacement in code:');
      Object.keys(llmResult.updated_files).forEach(filename => {
        const content = llmResult.updated_files[filename];
        const r2Urls = content.match(/https:\/\/pub-.*\.r2\.dev\/[^"'\s]+/g) || [];
        const placeholders = content.match(/\{GENERATED_IMAGE_URL\}/g) || [];
        
        console.log(`   ${filename}:`);
        console.log(`      R2 URLs found: ${r2Urls.length}`);
        console.log(`      Placeholders remaining: ${placeholders.length}`);
        
        if (r2Urls.length > 0) {
          console.log(`      Sample URL: ${r2Urls[0]}`);
        }
        
        if (placeholders.length > 0) {
          console.log(`      ⚠️  Placeholders not replaced: ${placeholders.length}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ LLM orchestration failed:', error.message);
  }

  console.log('\n✅ Image replacement test completed!');
}

// Run the test
testImageReplacement().catch(console.error); 