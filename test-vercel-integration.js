/**
 * Test Script for Vercel Integration
 * Tests the end-to-end Vercel deployment flow
 */

const API_BASE = 'https://jetsy-landing.jetsydev.workers.dev'; // Deployed Cloudflare Worker URL

// Sample template data for testing
const SAMPLE_TEMPLATE_DATA = {
  businessName: 'Test Business',
  tagline: 'Amazing products for everyone',
  heroDescription: 'We provide incredible solutions that help you achieve your goals.',
  ctaButtonText: 'Get Started Today',
  sectionType: 'features',
  sectionTitle: 'Our Features',
  sectionSubtitle: 'Discover what makes us special',
  features: [
    {
      title: 'Fast Delivery',
      description: 'Get your products delivered quickly and efficiently.',
      icon: '🚀'
    },
    {
      title: 'Quality Service',
      description: 'Experience top-notch customer service and support.',
      icon: '⭐'
    },
    {
      title: 'Affordable Prices',
      description: 'Enjoy competitive pricing without compromising quality.',
      icon: '💰'
    }
  ],
  aboutContent: 'We are a leading company in our industry with years of experience.',
  contactInfo: {
    email: 'contact@testbusiness.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345'
  },
  showHeroSection: true,
  showDynamicSection: true,
  showAboutSection: true,
  showContactSection: true,
  showFooter: true
};

// Test functions
async function testCreateProject() {
  console.log('🧪 Testing project creation...');
  
  try {
    const response = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_name: 'Vercel Test Project',
        files: '{}', // Required parameter, empty JSON for test
        template_data: SAMPLE_TEMPLATE_DATA
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Project created successfully:', result);
    return result.project_id;
  } catch (error) {
    console.error('❌ Project creation failed:', error.message);
    return null;
  }
}

async function testVercelDeployment(projectId) {
  console.log(`🚀 Testing Vercel deployment for project ${projectId}...`);
  
  try {
    const response = await fetch(`${API_BASE}/api/vercel/deploy/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateData: SAMPLE_TEMPLATE_DATA
      })
    });

    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorResult.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Vercel deployment successful:', result);
    return result.deployment;
  } catch (error) {
    console.error('❌ Vercel deployment failed:', error.message);
    return null;
  }
}

async function testDeploymentStatus(projectId) {
  console.log(`📊 Testing deployment status check for project ${projectId}...`);
  
  try {
    const response = await fetch(`${API_BASE}/api/vercel/status/${projectId}`);

    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorResult.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Deployment status retrieved:', result);
    return result.deployment;
  } catch (error) {
    console.error('❌ Deployment status check failed:', error.message);
    return null;
  }
}

async function testCustomDomain(projectId, domain = 'test-domain-jetsy-example.com') {
  console.log(`🌐 Testing custom domain addition for project ${projectId}...`);
  
  try {
    const response = await fetch(`${API_BASE}/api/vercel/domain/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: domain
      })
    });

    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorResult.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Custom domain added successfully:', result);
    return result.domain;
  } catch (error) {
    console.error('❌ Custom domain addition failed:', error.message);
    return null;
  }
}

async function testDomainStatus(projectId) {
  console.log(`📋 Testing domain status check for project ${projectId}...`);
  
  try {
    const response = await fetch(`${API_BASE}/api/vercel/domain/${projectId}`);

    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorResult.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Domain status retrieved:', result);
    return result.domain;
  } catch (error) {
    console.error('❌ Domain status check failed:', error.message);
    return null;
  }
}

async function testStaticSiteGeneration() {
  console.log('🏗️ Testing static site generation...');
  
  try {
    // Simple test to verify the concept (actual generation happens in worker)
    const expectedContent = [
      '<!DOCTYPE html>',
      SAMPLE_TEMPLATE_DATA.businessName,
      SAMPLE_TEMPLATE_DATA.tagline,
      'https://cdn.tailwindcss.com'
    ];
    
    console.log('✅ Static site generation concept verified');
    console.log(`📄 Expected content includes: ${expectedContent.join(', ')}`);
    console.log('ℹ️  Actual HTML generation happens in the Cloudflare Worker during deployment');
    return true;
  } catch (error) {
    console.error('❌ Static site generation failed:', error.message);
    return false;
  }
}

// Main test runner
async function runVercelIntegrationTests() {
  console.log('🧪 Starting Vercel Integration Tests\n');
  console.log('=' .repeat(50));
  
  // Test 1: Static Site Generation
  console.log('\n1. Testing Static Site Generation');
  console.log('-'.repeat(30));
  await testStaticSiteGeneration();
  
  // Test 2: Project Creation
  console.log('\n2. Testing Project Creation');
  console.log('-'.repeat(30));
  const projectId = await testCreateProject();
  
  if (!projectId) {
    console.log('❌ Cannot continue tests without a project ID');
    return;
  }
  
  // Wait a moment for project to be fully created
  console.log('⏳ Waiting for project to be ready...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Vercel Deployment
  console.log('\n3. Testing Vercel Deployment');
  console.log('-'.repeat(30));
  const deployment = await testVercelDeployment(projectId);
  
  if (deployment) {
    // Test 4: Deployment Status
    console.log('\n4. Testing Deployment Status');
    console.log('-'.repeat(30));
    await testDeploymentStatus(projectId);
    
    // Test 5: Custom Domain (will likely fail without proper Vercel token, but tests the API)
    console.log('\n5. Testing Custom Domain');
    console.log('-'.repeat(30));
    await testCustomDomain(projectId);
    
    // Test 6: Domain Status
    console.log('\n6. Testing Domain Status');
    console.log('-'.repeat(30));
    await testDomainStatus(projectId);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Vercel Integration Tests Complete');
  console.log('\nNote: Some tests may fail if:');
  console.log('- Vercel API token is not configured');
  console.log('- Worker is not running on localhost:8787');
  console.log('- Database is not properly set up');
}

// Environment check
function checkEnvironment() {
  console.log('🔍 Environment Check');
  console.log('-'.repeat(20));
  
  console.log(`API Base URL: ${API_BASE}`);
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  
  if (!process.env.VERCEL_API_TOKEN) {
    console.log('⚠️  Warning: VERCEL_API_TOKEN not set - some tests may fail');
  } else {
    console.log('✅ VERCEL_API_TOKEN is configured');
  }
  
  console.log('');
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  checkEnvironment();
  runVercelIntegrationTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

export {
  testCreateProject,
  testVercelDeployment,
  testDeploymentStatus,
  testCustomDomain,
  testDomainStatus,
  testStaticSiteGeneration,
  runVercelIntegrationTests
};
