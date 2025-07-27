#!/usr/bin/env node

// Test script to manually test R2 upload
const API_BASE = 'http://localhost:8787';

async function testR2Upload() {
  console.log('🧪 Testing R2 Upload Directly...\n');
  
  // Create a simple test image (base64 encoded small image)
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
      project_name: "R2 Upload Test",
      user_id: 1,
      files: {
        "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>R2 Upload Test</h1>
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

  // Test direct R2 upload
  console.log('\n☁️ Testing Direct R2 Upload...');
  console.log('─'.repeat(50));
  
  const uploadPayload = {
    project_id: projectId,
    prompt: "Test image for R2 upload",
    aspect_ratio: "1:1",
    number_of_images: 1
  };

  try {
    const startTime = Date.now();
    
    const uploadResponse = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadPayload)
    });

    const responseTime = Date.now() - startTime;
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`HTTP error! status: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`✅ Success: ${uploadResult.success}`);
    console.log(`📝 Message: ${uploadResult.message}`);
    
    if (uploadResult.success && uploadResult.images && uploadResult.images.length > 0) {
      console.log(`🖼️  Generated ${uploadResult.images.length} image(s):`);
      uploadResult.images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      URL: ${image.url}`);
        console.log(`      Size: ${image.width}x${image.height}`);
      });
    } else {
      console.log('\n⚠️  No images generated. Check server logs for R2 binding issues.');
    }
    
  } catch (error) {
    console.error('❌ R2 upload test failed:', error.message);
  }

  console.log('\n✅ R2 upload test completed!');
}

// Run the test
testR2Upload().catch(console.error); 