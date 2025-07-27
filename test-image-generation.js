#!/usr/bin/env node

// Test script for image generation functionality
const API_BASE = 'http://localhost:8787';

async function testImageGeneration() {
  console.log('🧪 Testing Image Generation with Gemini Imagen 4 Preview...\n');
  
  // First, create a test project
  console.log('📁 Creating test project...');
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_name: "Image Generation Test",
      user_id: 1,
      files: {
        "src/App.jsx": `import React from 'react';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Image Generation Test</h1>
        <p className="text-center text-gray-600 mb-8">Testing AI-generated images for landing pages</p>
      </div>
    </div>
  );
}

export default App;`,
        "src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`
      }
    })
  });

  if (!projectResponse.ok) {
    throw new Error(`Failed to create project: ${projectResponse.status}`);
  }

  const projectResult = await projectResponse.json();
  const projectId = projectResult.project_id;
  console.log(`✅ Project created with ID: ${projectId}`);

  // Test 1: Direct image generation
  console.log('\n🎨 Test 1: Direct Image Generation');
  console.log('─'.repeat(50));
  
  const imagePayload = {
    project_id: projectId,
    prompt: "Ultra-realistic photo of a modern SaaS dashboard interface with clean design, blue and white color scheme, showing analytics charts and user interface elements, professional lighting, 4K quality",
    aspect_ratio: "16:9",
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
    
    if (imageResult.images && imageResult.images.length > 0) {
      console.log(`🖼️  Generated ${imageResult.images.length} image(s):`);
      imageResult.images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      URL: ${image.url}`);
        console.log(`      Aspect Ratio: ${image.aspect_ratio}`);
        console.log(`      Dimensions: ${image.width}x${image.height}`);
        console.log(`      Prompt: ${image.prompt.substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Image generation failed:', error.message);
  }

  // Test 2: LLM orchestration with image planning
  console.log('\n🤖 Test 2: LLM Orchestration with Image Planning');
  console.log('─'.repeat(50));
  
  const llmPayload = {
    project_id: projectId,
    user_message: "Create a landing page for a fitness app called 'FitFlow' that helps people track workouts and nutrition. Include a hero image and feature images.",
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
      llmResult.image_requests.forEach((request, index) => {
        console.log(`   ${index + 1}. Prompt: ${request.prompt.substring(0, 100)}...`);
        console.log(`      Aspect Ratio: ${request.aspect_ratio}`);
        console.log(`      Placement: ${request.placement}`);
      });
    }
    
    if (llmResult.generated_images) {
      console.log(`🖼️  Images generated: ${llmResult.generated_images.length}`);
      llmResult.generated_images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      Placement: ${image.placement}`);
        console.log(`      URL: ${image.url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ LLM orchestration failed:', error.message);
  }

  // Test 3: Retrieve images for project
  console.log('\n📚 Test 3: Retrieve Project Images');
  console.log('─'.repeat(50));
  
  try {
    const imagesResponse = await fetch(`${API_BASE}/api/images?project_id=${projectId}`);
    
    if (!imagesResponse.ok) {
      throw new Error(`HTTP error! status: ${imagesResponse.status}`);
    }

    const imagesResult = await imagesResponse.json();
    
    console.log(`✅ Success: ${imagesResult.success}`);
    console.log(`🖼️  Total images: ${imagesResult.images?.length || 0}`);
    
    if (imagesResult.images && imagesResult.images.length > 0) {
      imagesResult.images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      Filename: ${image.filename}`);
        console.log(`      Size: ${image.file_size} bytes`);
        console.log(`      Created: ${image.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to retrieve images:', error.message);
  }

  console.log('\n✅ Image generation tests completed!');
}

// Run the test
testImageGeneration().catch(console.error); 