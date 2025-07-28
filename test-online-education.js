#!/usr/bin/env node

// Test Online Education/Course Landing Page Quality
// This script evaluates the quality and completeness of generated landing pages for online education platforms

const API_BASE = 'http://localhost:8787';

async function testOnlineEducation() {
  console.log('🎓 Testing Online Education/Course Landing Page Quality...\n');
  
  const testCase = {
    message: "Generate a professional landing page for an online learning platform called 'SkillMaster' that offers courses in programming, design, and business skills. Include course previews, student testimonials, and enrollment forms.",
    businessType: 'online_education',
    expectedFeatures: [
      'course previews',
      'student testimonials',
      'enrollment forms',
      'course categories',
      'learning modules',
      'certification badges',
      'professional design'
    ],
    expectedSections: ['hero', 'courses', 'about', 'contact'],
    expectedForms: ['enrollment form']
  };

  console.log('📋 Testing: Online Education/Course');
  console.log(`   Message: ${testCase.message}`);
  console.log(`   Expected Features: ${testCase.expectedFeatures.length}`);
  console.log(`   Expected Sections: ${testCase.expectedSections.length}`);
  console.log(`   Expected Forms: ${testCase.expectedForms.length}\n`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: `test-education-${Date.now()}`,
        user_message: testCase.message,
        current_files: {}
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.status} - ${errorText}`);
      return;
    }

    const result = await response.json();
    const responseTime = Date.now() - startTime;

    console.log(`⏱️  Response time: ${responseTime}ms\n`);

    // Business info analysis
    if (result.business_info) {
      console.log('🏢 Business Info:');
      console.log(`   Name: ${result.business_info.name}`);
      console.log(`   Tagline: ${result.business_info.tagline}`);
      console.log(`   Color Scheme: ${result.business_info.color_scheme}`);
    }

    // Code quality analysis
    const generatedCode = result.updated_files['src/App.jsx'] || '';
    const codeQuality = analyzeCodeQuality(generatedCode, testCase);
    
    console.log('📊 Code Quality Analysis:');
    console.log(`   React Components: ${codeQuality.hasReact ? '✅' : '❌'}`);
    console.log(`   Tailwind CSS: ${codeQuality.hasTailwind ? '✅' : '❌'}`);
    console.log(`   Responsive Design: ${codeQuality.hasResponsive ? '✅' : '❌'}`);
    console.log(`   Navigation: ${codeQuality.hasNavigation ? '✅' : '❌'}`);
    console.log(`   Hero Section: ${codeQuality.hasHero ? '✅' : '❌'}`);
    console.log(`   Forms: ${codeQuality.formsFound}/${testCase.expectedForms.length}`);
    console.log(`   Sections: ${codeQuality.sectionsFound.join(',')}/${testCase.expectedSections.length}`);
    console.log(`   Features: ${codeQuality.featuresFound.join(',')}/${testCase.expectedFeatures.length}`);
    console.log(`   Images: ${result.image_requests ? result.image_requests.length : 0} generated`);

    // Feature analysis
    console.log('\n🔍 Feature Analysis:');
    testCase.expectedFeatures.forEach(feature => {
      const found = codeQuality.featuresFound.includes(feature);
      console.log(`   ${found ? '✅' : '❌'} ${feature}`);
    });

    // Form analysis
    console.log('\n📝 Form Analysis:');
    testCase.expectedForms.forEach(form => {
      const found = codeQuality.formsFound.includes(form);
      console.log(`   ${found ? '✅' : '❌'} ${form}`);
    });

    // Section analysis
    console.log('\n📄 Section Analysis:');
    testCase.expectedSections.forEach(section => {
      const found = codeQuality.sectionsFound.includes(section);
      console.log(`   ${found ? '✅' : '❌'} ${section}`);
    });

    // Calculate quality score
    const qualityScore = calculateQualityScore(codeQuality, testCase);
    const assessment = getOverallAssessment(qualityScore);

    console.log(`\n🏆 Quality Score: ${qualityScore}/100`);
    console.log(`🏷️  Business Type Detection: ${result.business_info ? '✅' : '❌'}`);
    console.log(`${assessment} Overall: ${getQualityLevel(qualityScore)}`);

    // Code preview
    console.log('\n📄 Generated Code Preview:');
    console.log(`   Lines of code: ${generatedCode.split('\n').length}`);
    console.log(`   Has React imports: ${generatedCode.includes('import React') ? '✅' : '❌'}`);
    console.log(`   Has useState: ${generatedCode.includes('useState') ? '✅' : '❌'}`);
    console.log(`   Has useEffect: ${generatedCode.includes('useEffect') ? '✅' : '❌'}`);
    console.log(`   Has form handling: ${generatedCode.includes('handleSubmit') ? '✅' : '❌'}`);

    // Image requests
    if (result.image_requests && result.image_requests.length > 0) {
      console.log('\n🖼️  Image Requests:');
      result.image_requests.forEach((request, index) => {
        console.log(`   ${index + 1}. ${request.placement}: ${request.prompt.substring(0, 60)}...`);
      });
    }

    console.log('\n🎉 Online education test completed!');

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

function analyzeCodeQuality(code, testCase) {
  const codeLower = code.toLowerCase();
  
  // Basic React structure
  const hasReact = code.includes('import React') || code.includes('import {');
  const hasTailwind = code.includes('className=') && (code.includes('bg-') || code.includes('text-') || code.includes('p-') || code.includes('m-'));
  const hasResponsive = code.includes('md:') || code.includes('lg:') || code.includes('sm:') || code.includes('xl:');
  const hasNavigation = code.includes('nav') || code.includes('navigation');
  const hasHero = code.includes('hero') || code.includes('banner');

  // Section detection
  const sectionsFound = [];
  testCase.expectedSections.forEach(section => {
    if (codeLower.includes(section.toLowerCase())) {
      sectionsFound.push(section);
    }
  });

  // Feature detection with flexible matching
  const featuresFound = [];
  const featureKeywords = {
    'course previews': ['course', 'preview', 'lesson', 'module', 'curriculum'],
    'student testimonials': ['testimonial', 'student', 'review', 'feedback', 'learner'],
    'enrollment forms': ['enroll', 'enrollment', 'signup', 'register', 'join course'],
    'course categories': ['category', 'categories', 'programming', 'design', 'business'],
    'learning modules': ['module', 'learning', 'lesson', 'unit', 'chapter'],
    'certification badges': ['certificate', 'certification', 'badge', 'completion', 'diploma'],
    'professional design': ['professional', 'modern', 'design', 'clean', 'educational']
  };

  testCase.expectedFeatures.forEach(feature => {
    const keywords = featureKeywords[feature] || [feature];
    const found = keywords.some(keyword => codeLower.includes(keyword.toLowerCase()));
    if (found) {
      featuresFound.push(feature);
    }
  });

  // Form detection with flexible matching
  const formsFound = [];
  const formKeywords = {
    'enrollment form': ['enroll', 'enrollment', 'signup', 'register', 'join course', 'course form']
  };

  testCase.expectedForms.forEach(form => {
    const keywords = formKeywords[form] || [form];
    const found = keywords.some(keyword => codeLower.includes(keyword.toLowerCase()));
    if (found) {
      formsFound.push(form);
    }
  });

  return {
    hasReact,
    hasTailwind,
    hasResponsive,
    hasNavigation,
    hasHero,
    sectionsFound,
    featuresFound,
    formsFound
  };
}

function calculateQualityScore(codeQuality, testCase) {
  let score = 0;
  
  // Business type detection (20 points)
  score += 20;
  
  // React structure (15 points)
  if (codeQuality.hasReact) score += 15;
  
  // Styling (10 points)
  if (codeQuality.hasTailwind) score += 5;
  if (codeQuality.hasResponsive) score += 5;
  
  // Navigation and structure (10 points)
  if (codeQuality.hasNavigation) score += 5;
  if (codeQuality.hasHero) score += 5;
  
  // Sections (20 points)
  const sectionScore = (codeQuality.sectionsFound.length / testCase.expectedSections.length) * 20;
  score += sectionScore;
  
  // Features (15 points)
  const featureScore = (codeQuality.featuresFound.length / testCase.expectedFeatures.length) * 15;
  score += featureScore;
  
  // Forms (10 points)
  const formScore = (codeQuality.formsFound.length / testCase.expectedForms.length) * 10;
  score += formScore;
  
  return Math.round(score);
}

function getOverallAssessment(score) {
  if (score >= 90) return '🌟';
  if (score >= 80) return '✅';
  if (score >= 70) return '⚠️';
  if (score >= 60) return '❌';
  return '💥';
}

function getQualityLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Poor';
  return 'Very Poor';
}

// Run the test
testOnlineEducation().catch(console.error); 