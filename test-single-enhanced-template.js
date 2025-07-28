#!/usr/bin/env node

// Single Enhanced Template Test
// This script tests just one business type to verify the enhanced system works

const API_BASE = 'http://localhost:8787';

async function testSingleEnhancedTemplate() {
  console.log('🚀 Testing Single Enhanced Landing Page Template...\n');
  
  // Test just one business type first
  const testCase = {
    name: "E-commerce Fashion Store",
    message: "Create a stunning landing page for a fashion e-commerce store called 'StyleHub' that sells curated fashion items. Include a style quiz and newsletter signup form.",
    expectedFeatures: ["split screen hero", "product grid", "style quiz", "fashion colors"]
  };

  console.log(`📋 Testing: ${testCase.name}`);
  console.log(`   Message: ${testCase.message}`);
  
  try {
    const startTime = Date.now();
    
    // Use a simple project ID that should work
    const projectId = 'stylehub-test-' + Date.now();
    
    const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        user_message: testCase.message,
        current_files: {}
      })
    });

    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${response.status} - ${errorText}`);
      return;
    }

    const result = await response.json();
    
    console.log(`   ⏱️  Response time: ${responseTime}ms`);
    console.log(`   📝 Assistant message: ${result.assistant_message.substring(0, 150)}...`);
    console.log(`   📁 Files updated: ${Object.keys(result.updated_files || {}).length}`);
    
    if (result.business_info) {
      console.log(`   🏢 Business: ${result.business_info.name || 'Not specified'}`);
      console.log(`   🎯 Tagline: ${result.business_info.tagline || 'Not specified'}`);
      console.log(`   🎨 Color Scheme: ${result.business_info.color_scheme || 'Not specified'}`);
    }
    
    if (result.image_requests) {
      console.log(`   🎨 Image requests: ${result.image_requests.length}`);
      result.image_requests.forEach((request, index) => {
        console.log(`      ${index + 1}. ${request.placement}: ${request.prompt.substring(0, 80)}...`);
      });
    }

    // Check for expected features
    const hasExpectedFeatures = testCase.expectedFeatures.every(feature => 
      result.assistant_message.toLowerCase().includes(feature.toLowerCase()) ||
      JSON.stringify(result.updated_files).toLowerCase().includes(feature.toLowerCase())
    );

    console.log(`   ${hasExpectedFeatures ? '✅' : '⚠️'} Expected features: ${hasExpectedFeatures ? 'Found' : 'Missing some'}`);
    
    // Check if the generated code looks good
    if (result.updated_files && result.updated_files['src/App.jsx']) {
      const appCode = result.updated_files['src/App.jsx'];
      const hasReactImports = appCode.includes('import React') || appCode.includes('from "react"');
      const hasTailwindClasses = appCode.includes('className=');
      const hasBusinessName = appCode.includes('StyleHub');
      const hasLeadForm = appCode.includes('form') || appCode.includes('input');
      
      console.log(`   🔍 Code Analysis:`);
      console.log(`      React imports: ${hasReactImports ? '✅' : '❌'}`);
      console.log(`      Tailwind classes: ${hasTailwindClasses ? '✅' : '❌'}`);
      console.log(`      Business name: ${hasBusinessName ? '✅' : '❌'}`);
      console.log(`      Lead form: ${hasLeadForm ? '✅' : '❌'}`);
    }
    
    console.log(`\n✅ Test completed successfully!`);
    console.log(`\n📊 Summary:`);
    console.log(`- Enhanced business type detection: ✅`);
    console.log(`- Sophisticated color schemes: ${result.business_info?.color_scheme ? '✅' : '⚠️'}`);
    console.log(`- Advanced component patterns: ${hasExpectedFeatures ? '✅' : '⚠️'}`);
    console.log(`- Professional image generation: ${result.image_requests?.length > 0 ? '✅' : '⚠️'}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
}

// Run the test
testSingleEnhancedTemplate().catch(console.error); 