#!/usr/bin/env node

// Color Scheme Debug Test
// This script tests the color scheme application in the enhanced landing page system

const API_BASE = 'http://localhost:8787';

async function testColorSchemes() {
  console.log('🎨 Testing Color Scheme Application...\n');
  
  // Test cases for different business types and their expected color schemes
  const testCases = [
    {
      name: "E-commerce Fashion Store",
      message: "Create a landing page for a fashion store called 'StyleHub' with pink and blue colors.",
      expectedColors: ["pink", "blue", "rose", "purple"],
      businessType: "ecommerce_fashion"
    },
    {
      name: "Mobile App",
      message: "Generate a landing page for a productivity app called 'TaskFlow' with indigo and pink colors.",
      expectedColors: ["indigo", "pink", "emerald", "violet"],
      businessType: "mobile_app"
    },
    {
      name: "Consulting Service",
      message: "Create a professional landing page for a consulting service called 'StrategyHub' with blue and violet colors.",
      expectedColors: ["blue", "violet", "amber", "indigo"],
      businessType: "consulting_service"
    },
    {
      name: "Online Course Platform",
      message: "Design a landing page for an online learning platform called 'LearnHub' with emerald and violet colors.",
      expectedColors: ["emerald", "violet", "amber", "green"],
      businessType: "education"
    }
  ];

  console.log(`📋 Testing ${testCases.length} color scheme scenarios...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. Testing: ${testCase.name}`);
    console.log(`   Message: ${testCase.message}`);
    console.log(`   Expected Colors: ${testCase.expectedColors.join(', ')}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: `color-test-${i + 1}`,
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
      
      if (result.business_info) {
        console.log(`   🏢 Business: ${result.business_info.name || 'Not specified'}`);
        console.log(`   🎯 Tagline: ${result.business_info.tagline || 'Not specified'}`);
        console.log(`   🎨 Color Scheme: ${result.business_info.color_scheme || 'Not specified'}`);
      }
      
      // Analyze the generated code for color usage
      const generatedCode = result.updated_files['src/App.jsx'] || '';
      const colorAnalysis = analyzeColorUsage(generatedCode, testCase.expectedColors);
      
      console.log(`   🎨 Color Analysis:`);
      console.log(`      - Colors found: ${colorAnalysis.foundColors.join(', ') || 'None'}`);
      console.log(`      - Expected colors found: ${colorAnalysis.expectedFound}/${testCase.expectedColors.length}`);
      console.log(`      - Color classes used: ${colorAnalysis.colorClasses.length}`);
      console.log(`      - Gradient usage: ${colorAnalysis.hasGradients ? 'Yes' : 'No'}`);
      console.log(`      - Background colors: ${colorAnalysis.backgroundColors.join(', ') || 'None'}`);
      console.log(`      - Text colors: ${colorAnalysis.textColors.join(', ') || 'None'}`);
      
      // Check if business type was detected correctly
      const businessTypeDetected = result.business_info?.color_scheme === testCase.businessType;
      console.log(`   🏷️  Business Type Detection: ${businessTypeDetected ? '✅' : '❌'}`);
      
      // Overall color scheme success
      const colorSuccess = colorAnalysis.expectedFound >= testCase.expectedColors.length * 0.5;
      console.log(`   ${colorSuccess ? '✅' : '❌'} Color Scheme: ${colorSuccess ? 'Applied' : 'Missing'}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Color scheme testing completed!');
  console.log('\n📊 Summary:');
  console.log('- Color scheme detection tested');
  console.log('- Business type inference verified');
  console.log('- Component color application analyzed');
  console.log('- Gradient and accent color usage checked');
}

function analyzeColorUsage(code, expectedColors) {
  const analysis = {
    foundColors: [],
    expectedFound: 0,
    colorClasses: [],
    hasGradients: false,
    backgroundColors: [],
    textColors: []
  };
  
  // Convert to lowercase for easier matching
  const codeLower = code.toLowerCase();
  const expectedColorsLower = expectedColors.map(c => c.toLowerCase());
  
  // Find all Tailwind color classes
  const colorClassRegex = /(bg-|text-|border-|from-|to-|via-)([a-z]+-\d+)/g;
  const matches = [...codeLower.matchAll(colorClassRegex)];
  
  matches.forEach(match => {
    const fullClass = match[0];
    const colorName = match[2].split('-')[0];
    
    analysis.colorClasses.push(fullClass);
    
    // Check if it's an expected color
    if (expectedColorsLower.some(expected => colorName.includes(expected))) {
      analysis.foundColors.push(colorName);
      analysis.expectedFound++;
    }
    
    // Categorize by type
    if (fullClass.startsWith('bg-')) {
      analysis.backgroundColors.push(colorName);
    } else if (fullClass.startsWith('text-')) {
      analysis.textColors.push(colorName);
    }
  });
  
  // Check for gradients
  analysis.hasGradients = codeLower.includes('gradient') || 
                         codeLower.includes('from-') || 
                         codeLower.includes('to-') ||
                         codeLower.includes('via-');
  
  return analysis;
}

// Run the test
testColorSchemes().catch(console.error); 