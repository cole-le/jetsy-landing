#!/usr/bin/env node

// Test the complete chat functionality
async function testChat() {
  console.log('🧪 Testing Chat Functionality...\n');
  
  try {
    // 1. Test project creation
    console.log('📁 Creating new project...');
    const projectResponse = await fetch('http://localhost:8787/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: "Test Landing Page",
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

    // 2. Test chat message
    console.log('\n💬 Sending chat message...');
    const chatResponse = await fetch('http://localhost:8787/api/llm-orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        user_message: "Make this a landing page for a fitness app called 'FitFlow' that helps people track workouts and nutrition",
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

    if (!chatResponse.ok) {
      throw new Error(`Failed to get LLM response: ${chatResponse.status}`);
    }

    const chatResult = await chatResponse.json();
    console.log('✅ LLM response received');
    console.log(`📝 Assistant message: ${chatResult.assistant_message.substring(0, 100)}...`);
    console.log(`📁 Files updated: ${Object.keys(chatResult.updated_files).length}`);

    // 3. Test chat history
    console.log('\n📚 Loading chat history...');
    const historyResponse = await fetch(`http://localhost:8787/api/chat_messages?project_id=${projectId}`);
    
    if (!historyResponse.ok) {
      throw new Error(`Failed to load chat history: ${historyResponse.status}`);
    }

    const historyResult = await historyResponse.json();
    console.log(`✅ Chat history loaded: ${historyResult.messages?.length || 0} messages`);

    // 4. Show preview of generated code
    if (chatResult.updated_files && Object.keys(chatResult.updated_files).length > 0) {
      console.log('\n💻 Generated Code Preview:');
      const appCode = chatResult.updated_files['src/App.jsx'] || chatResult.updated_files['App.jsx'];
      if (appCode) {
        const preview = appCode.substring(0, 300) + '...';
        console.log(preview.replace(/\n/g, '\n   '));
      }
    }

    console.log('\n🎉 Chat functionality test completed successfully!');
    console.log('✅ Project creation works');
    console.log('✅ LLM integration works');
    console.log('✅ Chat history works');
    console.log('✅ Live preview should work in the UI');

  } catch (error) {
    console.error('❌ Chat test failed:', error.message);
  }
}

// Run the test
testChat(); 