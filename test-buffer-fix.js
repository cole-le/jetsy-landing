#!/usr/bin/env node

// Test script to verify Buffer fix for Cloudflare Workers
const API_BASE = 'http://localhost:8787';

async function testBufferFix() {
  console.log('🧪 Testing Buffer Fix for Cloudflare Workers...\n');
  
  // Create a test project
  console.log('📁 Creating test project...');
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_name: "Buffer Fix Test",
      user_id: 1,
      files: {
        "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Buffer Fix Test</h1>
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

  // Test direct image generation (this should not throw Buffer error)
  console.log('\n🎨 Testing Direct Image Generation...');
  console.log('─'.repeat(50));
  
  const imagePayload = {
    project_id: projectId,
    prompt: "A simple test image of a blue circle on white background",
    aspect_ratio: "1:1",
    number_of_images: 1
  };

  try {
    const startTime = Date.now();
    
    const imageResponse = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imagePayload)
    });

    const responseTime = Date.now() - startTime;
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      throw new Error(`HTTP error! status: ${imageResponse.status} - ${errorText}`);
    }

    const imageResult = await imageResponse.json();
    
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`✅ Success: ${imageResult.success}`);
    console.log(`📝 Message: ${imageResult.message}`);
    
    if (imageResult.success && imageResult.images && imageResult.images.length > 0) {
      console.log(`🖼️  Generated ${imageResult.images.length} image(s):`);
      imageResult.images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      URL: ${image.url}`);
        console.log(`      Size: ${image.width}x${image.height}`);
      });
      console.log('\n✅ Buffer fix successful! No "Buffer is not defined" errors.');
    } else {
      console.log('\n⚠️  Image generation failed, but no Buffer errors occurred.');
    }
    
  } catch (error) {
    if (error.message.includes('Buffer is not defined')) {
      console.error('❌ Buffer fix failed:', error.message);
    } else {
      console.error('❌ Other error occurred:', error.message);
    }
  }

  console.log('\n✅ Buffer fix test completed!');
}

// Run the test
testBufferFix().catch(console.error); 