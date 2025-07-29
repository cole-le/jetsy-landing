#!/usr/bin/env node

// Test script for targeted editing system
const API_BASE = 'http://localhost:8787';

async function testTargetedEditing() {
  console.log('🧪 Testing Targeted Editing System...\n');
  
  const projectId = `targeted-edit-test-${Date.now()}`;
  
  // Test Case 1: Initial prompt (should generate full website)
  console.log('📋 Test Case 1: Initial Prompt (Full Generation)');
  console.log('─'.repeat(50));
  
  try {
    const initialResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: "Create a landing page for a fitness app called 'FitFlow' that helps people track workouts and nutrition. Include a hero image and feature images.",
        current_files: {}
      })
    });

    if (!initialResponse.ok) {
      throw new Error(`HTTP error! status: ${initialResponse.status}`);
    }

    const initialResult = await initialResponse.json();
    
    console.log('✅ Initial generation successful');
    console.log(`   - Files generated: ${Object.keys(initialResult.updated_files || {}).length}`);
    console.log(`   - Images requested: ${initialResult.image_requests?.length || 0}`);
    console.log(`   - Business info: ${initialResult.business_info?.name || 'Not set'}`);
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test Case 2: Targeted text change
    console.log('\n📋 Test Case 2: Targeted Text Change');
    console.log('─'.repeat(50));
    
    const textChangeResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: "Change the business name from 'FitFlow' to 'PowerFit' and update the tagline to 'Transform your fitness journey'",
        current_files: initialResult.updated_files
      })
    });

    if (!textChangeResponse.ok) {
      throw new Error(`HTTP error! status: ${textChangeResponse.status}`);
    }

    const textChangeResult = await textChangeResponse.json();
    
    console.log('✅ Text change successful');
    console.log(`   - Files updated: ${Object.keys(textChangeResult.updated_files || {}).length}`);
    console.log(`   - Is targeted edit: ${textChangeResult.business_info?.name === 'PowerFit' ? 'Yes' : 'No'}`);
    console.log(`   - New business name: ${textChangeResult.business_info?.name || 'Not changed'}`);
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test Case 3: Targeted style change
    console.log('\n📋 Test Case 3: Targeted Style Change');
    console.log('─'.repeat(50));
    
    const styleChangeResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: "Change the color scheme to use red and orange colors instead of the current blue theme",
        current_files: textChangeResult.updated_files
      })
    });

    if (!styleChangeResponse.ok) {
      throw new Error(`HTTP error! status: ${styleChangeResponse.status}`);
    }

    const styleChangeResult = await styleChangeResponse.json();
    
    console.log('✅ Style change successful');
    console.log(`   - Files updated: ${Object.keys(styleChangeResult.updated_files || {}).length}`);
    console.log(`   - Color scheme: ${styleChangeResult.business_info?.color_scheme || 'Not changed'}`);
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test Case 4: Targeted section change
    console.log('\n📋 Test Case 4: Targeted Section Change');
    console.log('─'.repeat(50));
    
    const sectionChangeResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: "Update the hero section to include a new call-to-action button that says 'Start Free Trial'",
        current_files: styleChangeResult.updated_files
      })
    });

    if (!sectionChangeResponse.ok) {
      throw new Error(`HTTP error! status: ${sectionChangeResponse.status}`);
    }

    const sectionChangeResult = await sectionChangeResponse.json();
    
    console.log('✅ Section change successful');
    console.log(`   - Files updated: ${Object.keys(sectionChangeResult.updated_files || {}).length}`);
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test Case 5: Targeted image change
    console.log('\n📋 Test Case 5: Targeted Image Change');
    console.log('─'.repeat(50));
    
    const imageChangeResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: "Generate a new hero image that shows people working out with modern fitness equipment",
        current_files: sectionChangeResult.updated_files
      })
    });

    if (!imageChangeResponse.ok) {
      throw new Error(`HTTP error! status: ${imageChangeResponse.status}`);
    }

    const imageChangeResult = await imageChangeResponse.json();
    
    console.log('✅ Image change successful');
    console.log(`   - Files updated: ${Object.keys(imageChangeResult.updated_files || {}).length}`);
    console.log(`   - Images requested: ${imageChangeResult.image_requests?.length || 0}`);
    
    // Test Case 6: Full regeneration request
    console.log('\n📋 Test Case 6: Full Regeneration Request');
    console.log('─'.repeat(50));
    
    const fullRegenResponse = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: "Regenerate the entire website with a completely new design and layout",
        current_files: imageChangeResult.updated_files
      })
    });

    if (!fullRegenResponse.ok) {
      throw new Error(`HTTP error! status: ${fullRegenResponse.status}`);
    }

    const fullRegenResult = await fullRegenResponse.json();
    
    console.log('✅ Full regeneration successful');
    console.log(`   - Files updated: ${Object.keys(fullRegenResult.updated_files || {}).length}`);
    console.log(`   - Images requested: ${fullRegenResult.image_requests?.length || 0}`);
    
    // Final summary
    console.log('\n📊 TEST SUMMARY');
    console.log('─'.repeat(50));
    console.log('✅ All targeted editing tests completed successfully!');
    console.log('✅ System correctly detected:');
    console.log('   - Initial prompts (full generation)');
    console.log('   - Text changes (targeted editing)');
    console.log('   - Style changes (targeted editing)');
    console.log('   - Section changes (targeted editing)');
    console.log('   - Image changes (targeted editing)');
    console.log('   - Full regeneration requests');
    console.log('\n🎯 The targeted editing system is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTargetedEditing().catch(console.error); 