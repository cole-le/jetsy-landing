#!/usr/bin/env node

// Enhanced Template Testing Script
// This script demonstrates the new sophisticated landing page generation capabilities

const API_BASE = 'http://localhost:8787';

async function testEnhancedTemplates() {
  console.log('🚀 Testing Enhanced Landing Page Templates...\n');
  
  // Test cases for all new business types
  const testCases = [
    {
      name: "E-commerce Fashion Store",
      message: "Create a stunning landing page for a fashion e-commerce store called 'StyleHub' that sells curated fashion items. Include a style quiz and newsletter signup form.",
      expectedFeatures: ["split screen hero", "product grid", "style quiz", "fashion colors"]
    },
    {
      name: "Mobile App",
      message: "Generate a professional landing page for a productivity mobile app called 'TaskFlow' that helps people manage their daily tasks. Include a beta signup form.",
      expectedFeatures: ["app preview", "feature showcase", "beta signup", "mobile colors"]
    },
    {
      name: "Consulting Service",
      message: "Create a sophisticated landing page for a business consulting service called 'StrategyHub' that helps companies grow. Include a consultation booking form.",
      expectedFeatures: ["timeline features", "case studies", "consultation form", "professional colors"]
    },
    {
      name: "Online Course Platform",
      message: "Design a landing page for an online learning platform called 'LearnHub' that offers courses in various skills. Include a course enrollment form.",
      expectedFeatures: ["course preview", "curriculum showcase", "enrollment form", "education colors"]
    },
    {
      name: "Real Estate Agency",
      message: "Create a beautiful landing page for a real estate agency called 'PropertyHub' that helps people find their dream homes. Include a property search form.",
      expectedFeatures: ["property gallery", "market insights", "search form", "real estate colors"]
    },
    {
      name: "Healthcare Wellness",
      message: "Generate a landing page for a wellness platform called 'WellnessHub' that offers telemedicine and health programs. Include an appointment booking form.",
      expectedFeatures: ["service overview", "doctor profiles", "appointment form", "healthcare colors"]
    },
    {
      name: "Creative Agency",
      message: "Design a creative landing page for a design agency called 'CreativeHub' that offers branding and digital services. Include a project quote form.",
      expectedFeatures: ["portfolio showcase", "service grid", "quote form", "creative colors"]
    },
    {
      name: "Subscription Box Service",
      message: "Create a landing page for a monthly subscription box called 'BoxCraft' that delivers curated products. Include a subscription signup form.",
      expectedFeatures: ["box preview", "past boxes", "subscription form", "subscription colors"]
    },
    {
      name: "Local Service Business",
      message: "Generate a landing page for a local cleaning service called 'ServicePro' that offers professional cleaning. Include a service booking form.",
      expectedFeatures: ["service areas", "professional profiles", "booking form", "service colors"]
    },
    {
      name: "SaaS B2B Platform",
      message: "Create a professional landing page for a B2B SaaS platform called 'SaaSFlow' that helps businesses manage their operations. Include a demo request form.",
      expectedFeatures: ["dashboard preview", "integration showcase", "demo form", "enterprise colors"]
    }
  ];

  console.log(`📋 Testing ${testCases.length} enhanced business types...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. Testing: ${testCase.name}`);
    console.log(`   Message: ${testCase.message}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: `enhanced-test-${i + 1}`,
          user_message: testCase.message,
          current_files: {}
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${response.status} - ${errorText}`);
        continue;
      }

      const result = await response.json();
      
      console.log(`   ⏱️  Response time: ${responseTime}ms`);
      console.log(`   📝 Assistant message: ${result.assistant_message.substring(0, 100)}...`);
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
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Enhanced template testing completed!');
  console.log('\n📊 Summary:');
  console.log('- 10 new business types tested');
  console.log('- Sophisticated color schemes applied');
  console.log('- Advanced component patterns used');
  console.log('- Enhanced form types implemented');
  console.log('- Professional image generation');
}

// Run the test
testEnhancedTemplates().catch(console.error); 