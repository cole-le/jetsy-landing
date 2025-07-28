#!/usr/bin/env node

// Comprehensive Website Quality Test
// This script tests the actual visual quality and completeness of each website type

const API_BASE = 'http://localhost:8787';

async function testWebsiteQuality() {
  console.log('🎨 Testing Website Quality for All Business Types...\n');
  
  // Comprehensive test cases for each business type
  const testCases = [
    {
      name: "E-commerce Fashion Store",
      message: "Create a stunning landing page for a fashion e-commerce store called 'StyleHub' that sells curated fashion items. Include a style quiz, newsletter signup form, and product showcase.",
      businessType: "ecommerce_fashion",
      expectedFeatures: [
        "hero section with business name",
        "product showcase/grid",
        "style quiz form",
        "newsletter signup",
        "fashion-focused design",
        "shopping CTA buttons",
        "responsive navigation"
      ],
      expectedSections: ["hero", "features", "about", "contact"],
      expectedForms: ["style quiz", "newsletter signup"]
    },
    {
      name: "Mobile App Landing",
      message: "Generate a professional landing page for a productivity mobile app called 'TaskFlow' that helps people manage their daily tasks. Include a beta signup form and feature showcase.",
      businessType: "mobile_app",
      expectedFeatures: [
        "app preview/screenshots",
        "feature showcase",
        "beta signup form",
        "download CTA",
        "mobile-focused design",
        "app store badges",
        "user testimonials"
      ],
      expectedSections: ["hero", "features", "about", "contact"],
      expectedForms: ["beta signup"]
    },
    {
      name: "Consulting Service",
      message: "Create a sophisticated landing page for a business consulting service called 'StrategyHub' that helps companies grow. Include a consultation booking form and case studies.",
      businessType: "consulting_service",
      expectedFeatures: [
        "professional hero section",
        "consultation booking form",
        "case studies section",
        "expert profiles",
        "service offerings",
        "professional design",
        "trust indicators"
      ],
      expectedSections: ["hero", "services", "about", "contact"],
      expectedForms: ["consultation booking"]
    },
    {
      name: "Online Course Platform",
      message: "Design a landing page for an online learning platform called 'LearnHub' that offers courses in various skills. Include a course enrollment form and curriculum preview.",
      businessType: "online_education",
      expectedFeatures: [
        "course preview section",
        "curriculum showcase",
        "enrollment form",
        "instructor profiles",
        "learning outcomes",
        "student testimonials",
        "course categories"
      ],
      expectedSections: ["hero", "courses", "about", "contact"],
      expectedForms: ["course enrollment"]
    },
    {
      name: "Real Estate Agency",
      message: "Create a beautiful landing page for a real estate agency called 'PropertyHub' that helps people find their dream homes. Include a property search form and market insights.",
      businessType: "real_estate",
      expectedFeatures: [
        "property search form",
        "property gallery",
        "market insights",
        "agent profiles",
        "location services",
        "property listings",
        "contact forms"
      ],
      expectedSections: ["hero", "properties", "about", "contact"],
      expectedForms: ["property search", "contact"]
    },
    {
      name: "Healthcare Wellness",
      message: "Generate a landing page for a wellness platform called 'WellnessHub' that offers telemedicine and health programs. Include an appointment booking form and service overview.",
      businessType: "healthcare_wellness",
      expectedFeatures: [
        "appointment booking form",
        "service overview",
        "doctor profiles",
        "health programs",
        "telemedicine features",
        "trust indicators",
        "insurance info"
      ],
      expectedSections: ["hero", "services", "about", "contact"],
      expectedForms: ["appointment booking"]
    },
    {
      name: "Creative Agency",
      message: "Design a creative landing page for a design agency called 'CreativeHub' that offers branding and digital services. Include a project quote form and portfolio showcase.",
      businessType: "creative_agency",
      expectedFeatures: [
        "portfolio showcase",
        "project quote form",
        "service offerings",
        "creative team profiles",
        "project timeline",
        "creative design",
        "client testimonials"
      ],
      expectedSections: ["hero", "portfolio", "about", "contact"],
      expectedForms: ["project quote"]
    },
    {
      name: "Subscription Box Service",
      message: "Create a landing page for a monthly subscription box called 'BoxCraft' that delivers curated products. Include a subscription signup form and past box previews.",
      businessType: "subscription_box",
      expectedFeatures: [
        "subscription signup form",
        "past box previews",
        "monthly themes",
        "unboxing experience",
        "subscription tiers",
        "delivery info",
        "customer reviews"
      ],
      expectedSections: ["hero", "boxes", "about", "contact"],
      expectedForms: ["subscription signup"]
    },
    {
      name: "Local Service Business",
      message: "Generate a landing page for a local cleaning service called 'ServicePro' that offers professional cleaning. Include a service booking form and service areas.",
      businessType: "local_service",
      expectedFeatures: [
        "service booking form",
        "service areas map",
        "service offerings",
        "professional profiles",
        "pricing information",
        "local focus",
        "contact forms"
      ],
      expectedSections: ["hero", "services", "about", "contact"],
      expectedForms: ["service booking"]
    },
    {
      name: "SaaS B2B Platform",
      message: "Create a professional landing page for a B2B SaaS platform called 'SaaSFlow' that helps businesses manage their operations. Include a demo request form and integration showcase.",
      businessType: "saas_b2b",
      expectedFeatures: [
        "demo request form",
        "integration showcase",
        "dashboard preview",
        "enterprise features",
        "pricing tiers",
        "customer logos",
        "ROI calculator"
      ],
      expectedSections: ["hero", "features", "about", "contact"],
      expectedForms: ["demo request"]
    }
  ];

  console.log(`📋 Testing ${testCases.length} website types for quality...\n`);

  const results = [];

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
          project_id: `quality-test-${i + 1}`,
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
      
      // Business info analysis
      if (result.business_info) {
        console.log(`   🏢 Business: ${result.business_info.name || 'Not specified'}`);
        console.log(`   🎯 Tagline: ${result.business_info.tagline || 'Not specified'}`);
        console.log(`   🎨 Color Scheme: ${result.business_info.color_scheme || 'Not specified'}`);
      }
      
      // Code quality analysis
      const generatedCode = result.updated_files['src/App.jsx'] || '';
      const codeAnalysis = analyzeCodeQuality(generatedCode, testCase);
      
      console.log(`   📊 Code Quality Analysis:`);
      console.log(`      - React components: ${codeAnalysis.hasReactComponents ? '✅' : '❌'}`);
      console.log(`      - Tailwind CSS: ${codeAnalysis.hasTailwind ? '✅' : '❌'}`);
      console.log(`      - Responsive design: ${codeAnalysis.hasResponsive ? '✅' : '❌'}`);
      console.log(`      - Navigation: ${codeAnalysis.hasNavigation ? '✅' : '❌'}`);
      console.log(`      - Hero section: ${codeAnalysis.hasHero ? '✅' : '❌'}`);
      console.log(`      - Forms: ${codeAnalysis.formsFound}/${testCase.expectedForms.length}`);
      console.log(`      - Sections: ${codeAnalysis.sectionsFound}/${testCase.expectedSections.length}`);
      console.log(`      - Features: ${codeAnalysis.featuresFound}/${testCase.expectedFeatures.length}`);
      console.log(`      - Images: ${result.image_requests?.length || 0} generated`);
      
      // Overall quality score
      const qualityScore = calculateQualityScore(codeAnalysis, testCase, result);
      console.log(`   🏆 Quality Score: ${qualityScore}/100`);
      
      // Business type detection accuracy
      const businessTypeDetected = result.business_info?.color_scheme === testCase.businessType;
      console.log(`   🏷️  Business Type Detection: ${businessTypeDetected ? '✅' : '❌'}`);
      
      // Overall assessment
      const overallAssessment = getOverallAssessment(qualityScore, businessTypeDetected);
      console.log(`   ${overallAssessment.icon} Overall: ${overallAssessment.status}`);
      
      results.push({
        testCase,
        result,
        codeAnalysis,
        qualityScore,
        businessTypeDetected,
        responseTime,
        overallAssessment
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Summary report
  console.log('\n🎉 Website quality testing completed!');
  console.log('\n📊 SUMMARY REPORT:');
  console.log('==================');
  
  const successfulTests = results.filter(r => r.qualityScore > 0);
  const avgQualityScore = successfulTests.length > 0 ? 
    successfulTests.reduce((sum, r) => sum + r.qualityScore, 0) / successfulTests.length : 0;
  
  console.log(`📈 Overall Quality Score: ${avgQualityScore.toFixed(1)}/100`);
  console.log(`✅ Successful Tests: ${successfulTests.length}/${testCases.length}`);
  console.log(`🏷️  Business Type Detection Accuracy: ${results.filter(r => r.businessTypeDetected).length}/${testCases.length}`);
  
  // Top performers
  const topPerformers = results
    .filter(r => r.qualityScore > 70)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 3);
  
  if (topPerformers.length > 0) {
    console.log('\n🏆 TOP PERFORMERS:');
    topPerformers.forEach((result, index) => {
      console.log(`${index + 1}. ${result.testCase.name}: ${result.qualityScore}/100`);
    });
  }
  
  // Areas for improvement
  const lowPerformers = results.filter(r => r.qualityScore < 50);
  if (lowPerformers.length > 0) {
    console.log('\n⚠️  NEEDS IMPROVEMENT:');
    lowPerformers.forEach(result => {
      console.log(`- ${result.testCase.name}: ${result.qualityScore}/100`);
    });
  }
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log('==================');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.testCase.name}`);
    console.log(`   Quality: ${result.qualityScore}/100 | Business Type: ${result.businessTypeDetected ? '✅' : '❌'} | Time: ${result.responseTime}ms`);
    console.log(`   Status: ${result.overallAssessment.status}`);
  });
}

function analyzeCodeQuality(code, testCase) {
  const analysis = {
    hasReactComponents: false,
    hasTailwind: false,
    hasResponsive: false,
    hasNavigation: false,
    hasHero: false,
    formsFound: 0,
    sectionsFound: 0,
    featuresFound: 0
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
  
  // Check for expected forms
  testCase.expectedForms.forEach(form => {
    if (codeLower.includes(form.toLowerCase())) {
      analysis.formsFound++;
    }
  });
  
  // Check for expected sections
  testCase.expectedSections.forEach(section => {
    if (codeLower.includes(section.toLowerCase())) {
      analysis.sectionsFound++;
    }
  });
  
  // Check for expected features
  testCase.expectedFeatures.forEach(feature => {
    if (codeLower.includes(feature.toLowerCase())) {
      analysis.featuresFound++;
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
  const formScore = (codeAnalysis.formsFound / testCase.expectedForms.length) * 15;
  score += formScore;
  
  const sectionScore = (codeAnalysis.sectionsFound / testCase.expectedSections.length) * 10;
  score += sectionScore;
  
  const featureScore = (codeAnalysis.featuresFound / testCase.expectedFeatures.length) * 5;
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
testWebsiteQuality().catch(console.error); 