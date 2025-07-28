#!/usr/bin/env node

// Consulting Service Landing Page Quality Test
// This script tests the quality and completeness of consulting service landing pages

const API_BASE = 'http://localhost:8787';

async function testConsultingService() {
  console.log('🏢 Testing Consulting Service Landing Page Quality...\n');
  
  const testCase = {
    name: "Consulting Service",
    message: "Generate a professional landing page for a business consulting firm called 'Strategic Solutions' that helps companies optimize their operations and increase profitability. Include a consultation booking form and case studies section.",
    businessType: "consulting_service",
    expectedFeatures: [
      "consultation booking form",
      "case studies section",
      "expert profiles",
      "service offerings",
      "trust indicators",
      "client testimonials",
      "professional design"
    ],
    expectedSections: ["hero", "services", "about", "contact"],
    expectedForms: ["consultation booking"]
  };

  console.log(`📋 Testing: ${testCase.name}`);
  console.log(`   Message: ${testCase.message}`);
  console.log(`   Expected Features: ${testCase.expectedFeatures.length}`);
  console.log(`   Expected Sections: ${testCase.expectedSections.length}`);
  console.log(`   Expected Forms: ${testCase.expectedForms.length}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: `consulting-test-${Date.now()}`,
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
    
    console.log(`\n⏱️  Response time: ${responseTime}ms`);
    
    // Business info analysis
    if (result.business_info) {
      console.log(`\n🏢 Business Info:`);
      console.log(`   Name: ${result.business_info.name || 'Not specified'}`);
      console.log(`   Tagline: ${result.business_info.tagline || 'Not specified'}`);
      console.log(`   Color Scheme: ${result.business_info.color_scheme || 'Not specified'}`);
    }
    
    // Code quality analysis
    const generatedCode = result.updated_files['src/App.jsx'] || '';
    const codeAnalysis = analyzeCodeQuality(generatedCode, testCase);
    
    console.log(`\n📊 Code Quality Analysis:`);
    console.log(`   React Components: ${codeAnalysis.hasReactComponents ? '✅' : '❌'}`);
    console.log(`   Tailwind CSS: ${codeAnalysis.hasTailwind ? '✅' : '❌'}`);
    console.log(`   Responsive Design: ${codeAnalysis.hasResponsive ? '✅' : '❌'}`);
    console.log(`   Navigation: ${codeAnalysis.hasNavigation ? '✅' : '❌'}`);
    console.log(`   Hero Section: ${codeAnalysis.hasHero ? '✅' : '❌'}`);
    console.log(`   Forms: ${codeAnalysis.formsFound}/${testCase.expectedForms.length}`);
    console.log(`   Sections: ${codeAnalysis.sectionsFound}/${testCase.expectedSections.length}`);
    console.log(`   Features: ${codeAnalysis.featuresFound}/${testCase.expectedFeatures.length}`);
    console.log(`   Images: ${result.image_requests?.length || 0} generated`);
    
    // Detailed feature analysis
    console.log(`\n🔍 Feature Analysis:`);
    testCase.expectedFeatures.forEach(feature => {
      const found = codeAnalysis.featuresFound.includes(feature);
      console.log(`   ${found ? '✅' : '❌'} ${feature}`);
    });
    
    // Form analysis
    console.log(`\n📝 Form Analysis:`);
    testCase.expectedForms.forEach(form => {
      const found = codeAnalysis.formsFound.includes(form);
      console.log(`   ${found ? '✅' : '❌'} ${form}`);
    });
    
    // Section analysis
    console.log(`\n📄 Section Analysis:`);
    testCase.expectedSections.forEach(section => {
      const found = codeAnalysis.sectionsFound.includes(section);
      console.log(`   ${found ? '✅' : '❌'} ${section}`);
    });
    
    // Overall quality score
    const qualityScore = calculateQualityScore(codeAnalysis, testCase, result);
    console.log(`\n🏆 Quality Score: ${qualityScore}/100`);
    
    // Business type detection accuracy
    const businessTypeDetected = result.business_info?.color_scheme === testCase.businessType;
    console.log(`🏷️  Business Type Detection: ${businessTypeDetected ? '✅' : '❌'}`);
    
    // Overall assessment
    const overallAssessment = getOverallAssessment(qualityScore, businessTypeDetected);
    console.log(`${overallAssessment.icon} Overall: ${overallAssessment.status}`);
    
    // Code preview
    console.log(`\n📄 Generated Code Preview:`);
    console.log(`   Lines of code: ${generatedCode.split('\n').length}`);
    console.log(`   Has React imports: ${generatedCode.includes('import React') ? '✅' : '❌'}`);
    console.log(`   Has useState: ${generatedCode.includes('useState') ? '✅' : '❌'}`);
    console.log(`   Has useEffect: ${generatedCode.includes('useEffect') ? '✅' : '❌'}`);
    console.log(`   Has form handling: ${generatedCode.includes('onSubmit') || generatedCode.includes('handleSubmit') ? '✅' : '❌'}`);
    
    // Image requests analysis
    if (result.image_requests && result.image_requests.length > 0) {
      console.log(`\n🖼️  Image Requests:`);
      result.image_requests.forEach((request, index) => {
        console.log(`   ${index + 1}. ${request.placement}: ${request.prompt.substring(0, 60)}...`);
      });
    }
    
    console.log(`\n🎉 Consulting service test completed!`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

function analyzeCodeQuality(code, testCase) {
  const analysis = {
    hasReactComponents: false,
    hasTailwind: false,
    hasResponsive: false,
    hasNavigation: false,
    hasHero: false,
    formsFound: [],
    sectionsFound: [],
    featuresFound: []
  };
  
  const codeLower = code.toLowerCase();
  
  // Check for React components
  analysis.hasReactComponents = code.includes('function') && code.includes('return') && code.includes('jsx');
  
  // Check for Tailwind CSS
  analysis.hasTailwind = code.includes('className=') && (
    code.includes('bg-') || code.includes('text-') || code.includes('p-') || code.includes('m-')
  );
  
  // Check for responsive design
  analysis.hasResponsive = code.includes('md:') || code.includes('lg:') || code.includes('sm:') || code.includes('xl:');
  
  // Check for navigation
  analysis.hasNavigation = code.includes('nav') || code.includes('navigation') || code.includes('header');
  
  // Check for hero section
  analysis.hasHero = code.includes('hero') || code.includes('banner') || code.includes('main');
  
  // Check for expected forms with more flexible matching
  testCase.expectedForms.forEach(form => {
    const formLower = form.toLowerCase();
    let found = false;
    
    if (formLower.includes('consultation booking')) {
      found = codeLower.includes('consultation') || codeLower.includes('booking') || codeLower.includes('appointment') || 
              (codeLower.includes('form') && (codeLower.includes('date') || codeLower.includes('time') || codeLower.includes('service')));
    } else {
      found = codeLower.includes(formLower);
    }
    
    if (found) {
      analysis.formsFound.push(form);
    }
  });
  
  // Check for expected sections
  testCase.expectedSections.forEach(section => {
    if (codeLower.includes(section.toLowerCase())) {
      analysis.sectionsFound.push(section);
    }
  });
  
  // Check for expected features with more flexible matching
  testCase.expectedFeatures.forEach(feature => {
    const featureLower = feature.toLowerCase();
    let found = false;
    
    // More flexible matching for different ways features might be implemented
    if (featureLower.includes('consultation booking')) {
      found = codeLower.includes('consultation') || codeLower.includes('booking') || codeLower.includes('appointment') || codeLower.includes('schedule');
    } else if (featureLower.includes('case studies')) {
      found = codeLower.includes('case') && (codeLower.includes('study') || codeLower.includes('studies') || codeLower.includes('success'));
    } else if (featureLower.includes('expert profiles')) {
      found = codeLower.includes('expert') || codeLower.includes('team') || codeLower.includes('profile') || codeLower.includes('consultant');
    } else if (featureLower.includes('service offerings')) {
      found = codeLower.includes('service') && (codeLower.includes('offer') || codeLower.includes('solution') || codeLower.includes('consulting'));
    } else if (featureLower.includes('trust indicators')) {
      found = codeLower.includes('trust') || codeLower.includes('certification') || codeLower.includes('award') || codeLower.includes('experience');
    } else if (featureLower.includes('client testimonials')) {
      found = codeLower.includes('testimonial') || codeLower.includes('client') || codeLower.includes('review') || codeLower.includes('feedback');
    } else if (featureLower.includes('professional design')) {
      found = codeLower.includes('professional') || codeLower.includes('business') || codeLower.includes('corporate') || codeLower.includes('consulting');
    } else {
      found = codeLower.includes(featureLower);
    }
    
    if (found) {
      analysis.featuresFound.push(feature);
    }
  });
  
  return analysis;
}

function calculateQualityScore(codeAnalysis, testCase, result) {
  let score = 0;
  
  // Basic structure (20 points)
  if (codeAnalysis.hasReactComponents) score += 10;
  if (codeAnalysis.hasTailwind) score += 5;
  if (codeAnalysis.hasResponsive) score += 5;
  
  // Navigation and layout (20 points)
  if (codeAnalysis.hasNavigation) score += 10;
  if (codeAnalysis.hasHero) score += 10;
  
  // Forms and functionality (30 points)
  const formScore = (codeAnalysis.formsFound.length / testCase.expectedForms.length) * 15;
  score += formScore;
  
  const sectionScore = (codeAnalysis.sectionsFound.length / testCase.expectedSections.length) * 10;
  score += sectionScore;
  
  const featureScore = (codeAnalysis.featuresFound.length / testCase.expectedFeatures.length) * 5;
  score += featureScore;
  
  // Images and visual elements (20 points)
  const imageCount = result.image_requests?.length || 0;
  if (imageCount >= 5) score += 20;
  else if (imageCount >= 3) score += 15;
  else if (imageCount >= 1) score += 10;
  
  // Business type detection (10 points)
  if (result.business_info?.color_scheme === testCase.businessType) score += 10;
  
  return Math.min(100, Math.round(score));
}

function getOverallAssessment(qualityScore, businessTypeDetected) {
  if (qualityScore >= 80 && businessTypeDetected) {
    return { status: 'Excellent', icon: '🌟' };
  } else if (qualityScore >= 60 && businessTypeDetected) {
    return { status: 'Good', icon: '✅' };
  } else if (qualityScore >= 40) {
    return { status: 'Fair', icon: '⚠️' };
  } else {
    return { status: 'Needs Improvement', icon: '❌' };
  }
}

// Run the test
testConsultingService().catch(console.error); 