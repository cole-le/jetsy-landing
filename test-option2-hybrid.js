#!/usr/bin/env node

// Test script for Option 2: Hybrid Development Approach
// This demonstrates using local development for everything except image generation

// Set development environment for testing
process.env.LOCAL_DEV = 'true';

import { testImageGeneration, getEnvironmentInfo } from './src/utils/imageGeneration.js';

console.log('🚀 Testing Option 2: Hybrid Development Approach');
console.log('=' .repeat(60));
console.log('📋 This approach uses:');
console.log('   ✅ Local development for fast code changes');
console.log('   ✅ Production for image generation (real R2 storage)');
console.log('   ✅ Automatic environment switching');
console.log('');

// Show environment information
const envInfo = getEnvironmentInfo();
console.log('🔧 Environment Configuration:');
console.log(`   - Current Environment: ${envInfo.environment}`);
console.log(`   - Image Generation URL: ${envInfo.imageGenerationUrl}`);
console.log(`   - API Base URL: ${envInfo.apiBaseUrl}`);
console.log(`   - Using Production for Images: ${envInfo.usingProductionForImages}`);
console.log('');

// Test the hybrid approach
console.log('🧪 Testing Hybrid Image Generation...');
console.log('─'.repeat(50));

try {
  const result = await testImageGeneration();
  
  if (result.success) {
    console.log('✅ Hybrid approach test completed successfully!');
    console.log('');
    console.log('📊 Test Results:');
    console.log(`   - Project ID: ${result.projectId}`);
    console.log(`   - Images Generated: ${result.imageResult.images?.length || 0}`);
    
    if (result.imageResult.images && result.imageResult.images.length > 0) {
      console.log('');
      console.log('🖼️  Generated Images:');
      result.imageResult.images.forEach((image, index) => {
        console.log(`   ${index + 1}. Image ID: ${image.image_id}`);
        console.log(`      URL: ${image.url}`);
        console.log(`      Size: ${image.width}x${image.height}`);
        console.log(`      Aspect Ratio: ${image.aspect_ratio}`);
      });
    }
    
    console.log('');
    console.log('🎉 Option 2 is working perfectly!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Continue using "npm run dev" for local development');
    console.log('   2. Images will automatically be generated on production');
    console.log('   3. Test the /chat feature with image requests');
    console.log('   4. Deploy to production when ready');
    
  } else {
    console.error('❌ Hybrid approach test failed:', result.error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Ensure production is deployed: npm run deploy:production');
    console.log('   2. Check Gemini API key: npx wrangler secret put GEMINI_API_KEY');
    console.log('   3. Verify R2 bucket configuration in wrangler.toml');
  }
  
} catch (error) {
  console.error('❌ Test failed with error:', error.message);
  console.log('');
  console.log('🔧 Common Issues:');
  console.log('   1. Production not deployed - run: npm run deploy:production');
  console.log('   2. Missing API keys - run: npx wrangler secret put GEMINI_API_KEY');
  console.log('   3. Network issues - check internet connection');
}

console.log('');
console.log('📚 Option 2 Workflow Summary:');
console.log('   ┌─────────────────────────────────────────────────┐');
console.log('   │ Development Workflow (Option 2)                │');
console.log('   ├─────────────────────────────────────────────────┤');
console.log('   │ 1. npm run dev          → Local development    │');
console.log('   │ 2. npm run dev:worker   → Local API server     │');
console.log('   │ 3. /chat with images    → Auto-switch to prod  │');
console.log('   │ 4. See real images      → From production R2   │');
console.log('   │ 5. Fast development     → Local changes        │');
console.log('   └─────────────────────────────────────────────────┘');
console.log('');
console.log('🎯 Benefits of Option 2:');
console.log('   ✅ Fast local development');
console.log('   ✅ Real image generation');
console.log('   ✅ No R2 configuration issues');
console.log('   ✅ Best of both worlds');
console.log('');
console.log('🔗 Production URL: https://jetsy-landing.letrungkien208.workers.dev');
console.log('🔗 Local Development: http://localhost:8787'); 