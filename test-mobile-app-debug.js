import fetch from 'node-fetch';

async function testMobileAppDebug() {
  console.log('🔍 Testing Mobile App Generation Debug...\n');

  const testCase = {
    message: "Generate a professional landing page for a productivity mobile app called 'TaskFlow' that helps people manage their daily tasks. Include a beta signup form and feature showcase.",
    businessType: 'mobile_app',
    expectedFeatures: [
      'hero section with app name',
      'app store badges',
      'beta signup form',
      'feature showcase',
      'screenshots section',
      'user testimonials',
      'about section',
      'contact section'
    ],
    expectedSections: ['hero', 'features', 'about', 'contact'],
    expectedForms: ['beta signup']
  };

  console.log('📋 Testing:', testCase.message);
  console.log('   Expected Business Type:', testCase.businessType);
  console.log('   Expected Features:', testCase.expectedFeatures.length);
  console.log('   Expected Sections:', testCase.expectedSections.length);
  console.log('   Expected Forms:', testCase.expectedForms.length);

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:8787/api/llm-orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_message: testCase.message,
        project_id: 'test-mobile-app-debug'
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`\n⏱️  Response time: ${responseTime}ms`);
    console.log('\n🏢 Business Info:');
    console.log('   Name:', result.business_info?.name);
    console.log('   Tagline:', result.business_info?.tagline);
    console.log('   Color Scheme:', result.business_info?.color_scheme);

    console.log('\n📄 Generated Code Analysis:');
    if (result.updated_files && result.updated_files['src/App.jsx']) {
      const code = result.updated_files['src/App.jsx'];
      console.log('   Lines of code:', code.split('\n').length);
      console.log('   Has React imports:', code.includes('import React'));
      console.log('   Has useState:', code.includes('useState'));
      console.log('   Has useEffect:', code.includes('useEffect'));
      console.log('   Has form handling:', code.includes('handleSubmit') || code.includes('onSubmit'));
      
      // Check for specific mobile app features
      console.log('\n🔍 Mobile App Feature Check:');
      console.log('   Has "TaskFlow" app name:', code.includes('TaskFlow'));
      console.log('   Has app store badges:', code.includes('App Store') || code.includes('Google Play'));
      console.log('   Has beta signup form:', code.includes('beta') || code.includes('signup'));
      console.log('   Has feature showcase:', code.includes('feature') || code.includes('showcase'));
      console.log('   Has screenshots section:', code.includes('screenshot') || code.includes('mockup'));
      console.log('   Has testimonials:', code.includes('testimonial') || code.includes('review'));
      
      // Check for placeholder content
      console.log('\n⚠️  Placeholder Check:');
      console.log('   Contains placeholder text:', code.includes('Welcome to Your Landing Page'));
      console.log('   Contains "This is a placeholder"', code.includes('This is a placeholder'));
      
      console.log('\n📄 First 500 characters of generated code:');
      console.log(code.substring(0, 500));
      
      console.log('\n📄 Last 500 characters of generated code:');
      console.log(code.substring(code.length - 500));
      
    } else {
      console.log('   ❌ No App.jsx file generated');
    }

    console.log('\n🖼️  Image Requests:');
    if (result.image_requests && result.image_requests.length > 0) {
      result.image_requests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.placement}: ${req.prompt}`);
      });
    } else {
      console.log('   ❌ No image requests generated');
    }

    console.log('\n💰 Cost Breakdown:');
    console.log('   GPT-4o-mini:', result.cost_breakdown?.gpt4o_mini || 'Not available');
    console.log('   Total Cost:', result.cost_breakdown?.total || 'Not available');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testMobileAppDebug(); 