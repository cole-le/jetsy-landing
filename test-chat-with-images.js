#!/usr/bin/env node

// Test script to test the complete chat feature with image generation
const API_BASE = 'https://jetsy-landing.letrungkien208.workers.dev';

async function testChatWithImages() {
  console.log('🧪 Testing Chat with Image Generation');
  console.log('=' .repeat(50));
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
        project_name: "Chat with Images Test",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Chat with Images Test</h1>
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

    // Step 2: Send a chat message requesting images
    console.log('\n💬 Sending chat message with image request...');
    const chatResponse = await fetch(`${API_BASE}/api/chat_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        role: 'user',
        message: 'Create a landing page for a coffee shop with hero image and feature images'
      })
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`Chat message failed: ${chatResponse.status} - ${errorText}`);
    }

    const chatResult = await chatResponse.json();
    console.log('✅ Chat message sent successfully');

    // Step 3: Call LLM orchestration to generate the landing page with images
    console.log('\n🤖 Calling LLM orchestration...');
    const llmResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: 'Create a landing page for a coffee shop with hero image and feature images'
      })
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      throw new Error(`LLM orchestration failed: ${llmResponse.status} - ${errorText}`);
    }

    const llmResult = await llmResponse.json();
    console.log('✅ LLM orchestration completed');
    console.log('   - Assistant message:', llmResult.assistant_message);
    console.log('   - Generated images:', llmResult.generated_images?.length || 0);

    if (llmResult.generated_images && llmResult.generated_images.length > 0) {
      console.log('\n🖼️  Generated Images:');
      llmResult.generated_images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      URL: ${image.url}`);
        console.log(`      Placement: ${image.placement}`);
        console.log(`      Size: ${image.width}x${image.height}`);
      });

      // Step 4: Test image accessibility
      console.log('\n🔍 Testing image accessibility...');
      for (const image of llmResult.generated_images) {
        const accessResponse = await fetch(image.url, { method: 'HEAD' });
        console.log(`   - ${image.placement} image: ${accessResponse.status === 200 ? '✅ Accessible' : '❌ Not accessible'}`);
      }
    }

    // Step 5: Check the updated project files
    console.log('\n📄 Checking updated project files...');
    const projectFilesResponse = await fetch(`${API_BASE}/api/projects/${projectId}`);
    
    if (projectFilesResponse.ok) {
      const projectFiles = await projectFilesResponse.json();
      const files = JSON.parse(projectFiles.files);
      
      if (files['src/App.jsx']) {
        const content = files['src/App.jsx'];
        const imageUrls = content.match(/https:\/\/pub-.*\.r2\.dev\/[^"'\s]+/g) || [];
        console.log(`   - Found ${imageUrls.length} image URLs in App.jsx`);
        imageUrls.forEach((url, index) => {
          console.log(`     ${index + 1}. ${url}`);
        });
      }
    }

    console.log('\n🎉 Chat with images test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testChatWithImages(); 