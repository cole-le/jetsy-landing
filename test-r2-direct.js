#!/usr/bin/env node

// Test script to directly test R2 upload
const API_BASE = 'https://jetsy-landing.letrungkien208.workers.dev';

async function testR2Direct() {
  console.log('🧪 Testing Direct R2 Upload');
  console.log('=' .repeat(50));
  console.log('');

  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // Convert to Uint8Array
    const binaryString = atob(testImageBase64);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    console.log('📁 Creating test project...');
    const projectResponse = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: "R2 Direct Test",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>R2 Direct Test</h1>
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

    // Test direct image generation
    console.log('\n🎨 Testing image generation...');
    const imageResponse = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        prompt: "A simple red square",
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
      console.log(`\n✅ Image generated!`);
      console.log(`   - Image ID: ${image.image_id}`);
      console.log(`   - URL: ${image.url}`);
      
      // Test accessibility
      console.log('\n🔍 Testing image accessibility...');
      const accessResponse = await fetch(image.url, { method: 'HEAD' });
      console.log(`   - Status: ${accessResponse.status}`);
      console.log(`   - Headers:`, Object.fromEntries(accessResponse.headers.entries()));
      
      if (accessResponse.ok) {
        console.log('✅ Image is accessible!');
      } else {
        console.log('❌ Image is not accessible');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testR2Direct(); 