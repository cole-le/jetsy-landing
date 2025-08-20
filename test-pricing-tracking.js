/**
 * Test script to verify pricing button click tracking
 * This will generate a test site and check if tracking events are properly sent
 */

const fs = require('fs');
const path = require('path');

// Since staticSiteGenerator.js uses ES6 exports, we need to load it differently
const staticSiteCode = fs.readFileSync('./src/utils/staticSiteGenerator.js', 'utf8');

// Extract the functions we need by evaluating the code
const createCompleteStaticSite = eval(`
  ${staticSiteCode}
  createCompleteStaticSite
`);

// Test template data with pricing plans
const testTemplateData = {
  businessName: 'Test Business',
  tagline: 'Testing Pricing Tracking',
  heroDescription: 'This is a test site to verify pricing button tracking',
  ctaButtonText: 'Get Started',
  showPricingSection: true,
  pricingSectionTitle: 'Choose Your Plan',
  pricingSectionSubtitle: 'Select the perfect plan for your needs',
  pricing: [
    {
      name: 'Basic Plan',
      price: '$9',
      period: 'month',
      description: 'Perfect for getting started',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      ctaText: 'Start Basic',
      featured: false
    },
    {
      name: 'Pro Plan',
      price: '$29',
      period: 'month',
      description: 'Best for growing businesses',
      features: ['All Basic features', 'Feature 4', 'Feature 5', 'Priority support'],
      ctaText: 'Go Pro',
      featured: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      showPeriod: false,
      description: 'For large organizations',
      features: ['All Pro features', 'Custom integrations', 'Dedicated support'],
      ctaText: 'Contact Sales',
      featured: false
    }
  ]
};

// Generate the static site
const projectId = 'test-pricing-tracking-' + Date.now();
const htmlContent = createCompleteStaticSite(testTemplateData, projectId);

// Save to a test file
const testFilePath = path.join(process.cwd(), 'test-pricing-tracking.html');
fs.writeFileSync(testFilePath, htmlContent);

console.log('✅ Test site generated successfully!');
console.log(`📁 File saved to: ${testFilePath}`);
console.log('\n📋 Instructions to test:');
console.log('1. Open the generated HTML file in a browser');
console.log('2. Open browser DevTools (F12) and go to Network tab');
console.log('3. Filter by "track" to see tracking requests');
console.log('4. Click on any pricing button');
console.log('5. You should see a POST request to /api/track with:');
console.log('   - event: "pricing_plan_select"');
console.log('   - data containing plan_name, button_text, etc.');
console.log('\n🔍 What to verify:');
console.log('- Each pricing button click sends a tracking event');
console.log('- The plan_name matches the clicked plan');
console.log('- button_location is "pricing_section"');
console.log('- plan_type is "pricing_button"');
