#!/usr/bin/env node

// Debug Consulting Service Generated Code
// This script analyzes the actual generated code to see what's missing

const API_BASE = 'http://localhost:8787';

async function debugConsultingCode() {
  console.log('🔍 Debugging Consulting Service Generated Code...\n');
  
  const testMessage = "Generate a professional landing page for a business consulting firm called 'Strategic Solutions' that helps companies optimize their operations and increase profitability. Include a consultation booking form and case studies section.";
  
  try {
    console.log('📤 Sending request to generate consulting service code...');
    
    const response = await fetch(`${API_BASE}/api/llm-orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: `debug-consulting-${Date.now()}`,
        user_message: testMessage,
        current_files: {}
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.status} - ${errorText}`);
      return;
    }

    const result = await response.json();
    const generatedCode = result.updated_files['src/App.jsx'] || '';
    
    console.log('✅ Code generated successfully!');
    console.log(`📄 Generated code length: ${generatedCode.length} characters`);
    console.log(`📄 Lines of code: ${generatedCode.split('\n').length}`);
    
    // Analyze the actual code structure
    console.log('\n🔍 CODE STRUCTURE ANALYSIS:');
    
    // Check for React imports
    const hasReactImport = generatedCode.includes('import React');
    const hasUseState = generatedCode.includes('useState');
    const hasUseEffect = generatedCode.includes('useEffect');
    console.log(`   React Import: ${hasReactImport ? '✅' : '❌'}`);
    console.log(`   useState Hook: ${hasUseState ? '✅' : '❌'}`);
    console.log(`   useEffect Hook: ${hasUseEffect ? '✅' : '❌'}`);
    
    // Check for function component
    const hasFunctionComponent = generatedCode.includes('function') && generatedCode.includes('return');
    console.log(`   Function Component: ${hasFunctionComponent ? '✅' : '❌'}`);
    
    // Check for JSX
    const hasJSX = generatedCode.includes('jsx') || generatedCode.includes('<div') || generatedCode.includes('<section');
    console.log(`   JSX Elements: ${hasJSX ? '✅' : '❌'}`);
    
    // Check for Tailwind classes
    const hasTailwind = generatedCode.includes('className=') && (
      generatedCode.includes('bg-') || generatedCode.includes('text-') || generatedCode.includes('p-') || generatedCode.includes('m-')
    );
    console.log(`   Tailwind CSS: ${hasTailwind ? '✅' : '❌'}`);
    
    // Check for responsive design
    const hasResponsive = generatedCode.includes('md:') || generatedCode.includes('lg:') || generatedCode.includes('sm:') || generatedCode.includes('xl:');
    console.log(`   Responsive Design: ${hasResponsive ? '✅' : '❌'}`);
    
    // Check for specific sections
    console.log('\n📄 SECTION ANALYSIS:');
    const sections = ['hero', 'about', 'contact', 'services', 'features', 'testimonials', 'case studies'];
    sections.forEach(section => {
      const found = generatedCode.toLowerCase().includes(section.toLowerCase());
      console.log(`   ${section}: ${found ? '✅' : '❌'}`);
    });
    
    // Check for forms
    console.log('\n📝 FORM ANALYSIS:');
    const formKeywords = ['form', 'input', 'button', 'onSubmit', 'handleSubmit', 'consultation', 'booking', 'appointment'];
    formKeywords.forEach(keyword => {
      const found = generatedCode.toLowerCase().includes(keyword.toLowerCase());
      console.log(`   ${keyword}: ${found ? '✅' : '❌'}`);
    });
    
    // Check for specific consulting features
    console.log('\n🏢 CONSULTING FEATURES ANALYSIS:');
    const consultingFeatures = [
      'consultation booking',
      'case studies', 
      'expert profiles',
      'service offerings',
      'trust indicators',
      'client testimonials',
      'professional design',
      'strategic',
      'business',
      'consulting',
      'optimize',
      'profitability'
    ];
    
    consultingFeatures.forEach(feature => {
      const found = generatedCode.toLowerCase().includes(feature.toLowerCase());
      console.log(`   ${feature}: ${found ? '✅' : '❌'}`);
    });
    
    // Check for color scheme application
    console.log('\n🎨 COLOR SCHEME ANALYSIS:');
    const colorClasses = ['bg-blue', 'text-blue', 'bg-violet', 'text-violet', 'bg-amber', 'text-amber'];
    colorClasses.forEach(color => {
      const found = generatedCode.toLowerCase().includes(color.toLowerCase());
      console.log(`   ${color}: ${found ? '✅' : '❌'}`);
    });
    
    // Check for business name and tagline
    console.log('\n🏢 BUSINESS CONTENT ANALYSIS:');
    const businessContent = [
      'Strategic Solutions',
      'business consulting',
      'optimize operations',
      'increase profitability'
    ];
    
    businessContent.forEach(content => {
      const found = generatedCode.includes(content);
      console.log(`   "${content}": ${found ? '✅' : '❌'}`);
    });
    
    // Show actual code snippets
    console.log('\n📄 CODE SNIPPETS ANALYSIS:');
    
    // Look for form structure
    const formMatch = generatedCode.match(/<form[^>]*>[\s\S]*?<\/form>/gi);
    if (formMatch) {
      console.log('   ✅ Form found:');
      formMatch.forEach((form, index) => {
        console.log(`      Form ${index + 1}: ${form.substring(0, 100)}...`);
      });
    } else {
      console.log('   ❌ No form found in code');
    }
    
    // Look for section structure
    const sectionMatch = generatedCode.match(/<section[^>]*>[\s\S]*?<\/section>/gi);
    if (sectionMatch) {
      console.log(`   ✅ ${sectionMatch.length} sections found`);
      sectionMatch.forEach((section, index) => {
        const sectionTitle = section.match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>/i);
        const title = sectionTitle ? sectionTitle[1] : `Section ${index + 1}`;
        console.log(`      ${title}: ${section.substring(0, 80)}...`);
      });
    } else {
      console.log('   ❌ No sections found in code');
    }
    
    // Show the first 500 characters of the code
    console.log('\n📄 FIRST 500 CHARACTERS OF GENERATED CODE:');
    console.log('```jsx');
    console.log(generatedCode.substring(0, 500));
    console.log('```');
    
    // Show the last 500 characters of the code
    console.log('\n📄 LAST 500 CHARACTERS OF GENERATED CODE:');
    console.log('```jsx');
    console.log(generatedCode.substring(generatedCode.length - 500));
    console.log('```');
    
    // Business info analysis
    if (result.business_info) {
      console.log('\n🏢 BUSINESS INFO:');
      console.log(`   Name: ${result.business_info.name}`);
      console.log(`   Tagline: ${result.business_info.tagline}`);
      console.log(`   Color Scheme: ${result.business_info.color_scheme}`);
    }
    
    // Image requests analysis
    if (result.image_requests && result.image_requests.length > 0) {
      console.log('\n🖼️  IMAGE REQUESTS:');
      result.image_requests.forEach((request, index) => {
        console.log(`   ${index + 1}. ${request.placement}: ${request.prompt}`);
      });
    }
    
    console.log('\n🎉 Debug analysis completed!');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run the debug
debugConsultingCode().catch(console.error); 