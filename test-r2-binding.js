#!/usr/bin/env node

// Test script to verify R2 bucket binding in development environment
const API_BASE = 'http://localhost:8787';

async function testR2Binding() {
  console.log('🧪 Testing R2 Bucket Binding in Development');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Create a simple test project
    console.log('📁 Creating test project...');
    const projectResponse = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: "R2 Binding Test",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>R2 Binding Test</h1>
    </div>
  );
}
export default App;`
        }
      })
    });

    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      throw new Error(`Failed to create project: ${projectResponse.status} - ${errorText}`);
    }

    const projectResult = await projectResponse.json();
    const projectId = projectResult.project_id;
    console.log(`✅ Project created with ID: ${projectId}`);

    // Test image generation
    console.log('\n🎨 Testing image generation...');
    const imageResponse = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        prompt: "A simple blue square",
        aspect_ratio: "1:1",
        number_of_images: 1
      })
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      throw new Error(`Image generation failed: ${imageResponse.status} - ${errorText}`);
    }

    const imageResult = await imageResponse.json();
    console.log('✅ Image generation response:', JSON.stringify(imageResult, null, 2));

    if (imageResult.success && imageResult.images && imageResult.images.length > 0) {
      const image = imageResult.images[0];
      console.log(`\n✅ Image generated successfully!`);
      console.log(`   - Image ID: ${image.image_id}`);
      console.log(`   - URL: ${image.url}`);
      
      // Test image accessibility
      console.log('\n🔍 Testing image accessibility...');
      const accessResponse = await fetch(image.url, { method: 'HEAD' });
      console.log(`   - Status: ${accessResponse.status}`);
      
      if (accessResponse.ok) {
        console.log('✅ Image is accessible via R2!');
      } else {
        console.log('❌ Image is NOT accessible via R2');
      }
    }

    console.log('\n🎉 R2 binding test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testR2Binding(); 