#!/usr/bin/env node

// Test script to generate a single image with detailed debugging
const API_BASE = 'https://jetsy-landing.letrungkien208.workers.dev';

async function testSingleImageDebug() {
  console.log('🧪 Testing Single Image Generation with Debug');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Step 1: Create a test project
    console.log('📁 Creating test project...');
    const projectResponse = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: "Single Image Debug Test",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Single Image Debug Test</h1>
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

    // Step 2: Generate a single test image
    console.log('\n🎨 Generating single test image...');
    const imageResponse = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        prompt: "A simple red circle on white background",
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
      console.log(`   - Size: ${image.width}x${image.height}`);

      // Step 3: Test image accessibility
      console.log('\n🔍 Testing image accessibility...');
      const accessResponse = await fetch(image.url, { method: 'HEAD' });
      console.log(`   - Status: ${accessResponse.status}`);
      console.log(`   - Headers:`, Object.fromEntries(accessResponse.headers.entries()));
      
      if (accessResponse.ok) {
        console.log('✅ Image is accessible via R2!');
      } else {
        console.log('❌ Image is NOT accessible via R2');
      }

      // Step 4: Check database record
      console.log('\n💾 Checking database record...');
      const dbResponse = await fetch(`${API_BASE}/api/images/${image.image_id}`);
      
      if (dbResponse.ok) {
        const dbResult = await dbResponse.json();
        console.log('✅ Database record found:');
        console.log(`   - Image ID: ${dbResult.image.image_id}`);
        console.log(`   - Filename: ${dbResult.image.filename}`);
        console.log(`   - R2 URL: ${dbResult.image.r2_url}`);
        console.log(`   - Status: ${dbResult.image.status}`);
      } else {
        console.log('❌ Database record not found');
      }

    } else {
      console.log('❌ No images generated');
    }

    console.log('\n🎉 Single image debug test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSingleImageDebug(); 