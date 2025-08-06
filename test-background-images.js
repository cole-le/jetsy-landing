#!/usr/bin/env node

// Test script for background image generation functionality
const API_BASE = 'http://localhost:8787';

async function testBackgroundImageGeneration() {
  console.log('🧪 Testing Background Image Generation with Gemini API...\n');
  
  // First, create a test project
  console.log('📁 Creating test project...');
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_name: "Background Image Test",
      user_id: 1,
      files: {}
    })
  });

  if (!projectResponse.ok) {
    throw new Error(`Failed to create project: ${projectResponse.status}`);
  }

  const projectResult = await projectResponse.json();
  const projectId = projectResult.project_id;
  console.log(`✅ Project created with ID: ${projectId}`);

  // Test 1: Template generation with background images
  console.log('\n🎨 Test 1: Template Generation with Background Images');
  console.log('─'.repeat(50));
  
  const templatePayload = {
    project_id: projectId,
    user_message: "Create a landing page for a futuristic space-themed restaurant in Miami Beach with cosmic cocktails and otherworldly dining experience",
    current_template_data: {
      businessName: 'Cosmic Sips',
      tagline: 'Experience dining beyond this world',
      heroDescription: 'Join us for an otherworldly culinary journey where every dish tells a story from the stars.',
      ctaButtonText: 'Reserve Your Cosmic Table',
      sectionType: 'services',
      sectionTitle: 'Our Cosmic Services',
      sectionSubtitle: 'From stellar cocktails to intergalactic cuisine, every experience is out of this world.',
      features: [
        {
          icon: "🚀",
          title: "Cosmic Cocktails",
          description: "Signature drinks inspired by celestial bodies and cosmic phenomena."
        },
        {
          icon: "⭐",
          title: "Stellar Cuisine",
          description: "Chef's special dishes featuring ingredients from around the galaxy."
        },
        {
          icon: "🌌",
          title: "Otherworldly Atmosphere",
          description: "Immersive space-themed dining environment with stunning visual effects."
        }
      ],
      aboutContent: "Cosmic Sips was born from a vision to create dining experiences that transport guests beyond the ordinary. Our space-themed restaurant combines cutting-edge culinary techniques with immersive atmosphere to create memories that last a lifetime.",
      pricing: [
        {
          name: "Stellar Experience",
          price: "$75",
          period: "/person",
          description: "Perfect for cosmic dining enthusiasts",
          features: ["3-course meal", "Cosmic cocktail", "Atmosphere experience", "Reserved seating"],
          cta: "Book Stellar Experience",
          popular: false
        },
        {
          name: "Galactic Journey",
          price: "$125",
          period: "/person",
          description: "For the ultimate space dining adventure",
          features: ["5-course tasting menu", "Premium cocktails", "VIP atmosphere", "Chef's table option", "Wine pairing", "Exclusive access"],
          cta: "Book Galactic Journey",
          popular: true
        },
        {
          name: "Cosmic Celebration",
          price: "$200",
          period: "/person",
          description: "For special occasions and celebrations",
          features: ["Everything in Galactic", "Private dining room", "Custom menu", "Photography service", "Celebration setup", "Dedicated server"],
          cta: "Book Celebration",
          popular: false
        }
      ],
      contactInfo: {
        email: "reservations@cosmicsips.com",
        phone: "+1 (305) 555-0123",
        office: "Miami Beach, FL"
      },
      trustIndicator1: "Join 5,000+ cosmic diners",
      trustIndicator2: "4.9/5 rating",
      heroBadge: "Now Open - Cosmic Dining Experience",
      aboutSectionTitle: "Built by dreamers, for dreamers",
      aboutSectionSubtitle: "Our team of culinary artists and space enthusiasts work together to create experiences that transcend the ordinary.",
      aboutBenefits: [
        "Award-winning chef team",
        "Immersive space technology",
        "Sustainable cosmic ingredients"
      ],
      pricingSectionTitle: "Choose your cosmic journey",
      pricingSectionSubtitle: "Select the experience that matches your cosmic appetite. All journeys include our signature atmosphere and service.",
      contactSectionTitle: "Ready for your cosmic journey?",
      contactSectionSubtitle: "Let's discuss how we can create the perfect space-themed dining experience for you. Our team is ready to transport you to another world.",
      contactFormPlaceholders: {
        name: "Your cosmic name",
        email: "your@cosmic.email",
        company: "Your planet",
        message: "Tell us about your cosmic dreams..."
      },
      footerDescription: "Experience dining beyond this world at Cosmic Sips. Where every meal is a journey through the stars.",
      footerProductLinks: ["Menu", "Reservations", "Events", "Gallery"],
      footerCompanyLinks: ["About", "Blog", "Careers", "Contact"],
      landingPagesCreated: "5,000+ Cosmic Journeys Created"
    }
  };

  try {
    const startTime = Date.now();
    console.log('🔄 Generating template with background images...');
    
    const templateResponse = await fetch(`${API_BASE}/api/template-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templatePayload)
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (templateResponse.ok) {
      const templateResult = await templateResponse.json();
      console.log(`✅ Template generation completed in ${duration}ms`);
      console.log(`📊 Success: ${templateResult.success}`);
      console.log(`💬 Assistant message: ${templateResult.assistant_message}`);
      
      if (templateResult.generated_images && templateResult.generated_images.length > 0) {
        console.log(`🎨 Generated ${templateResult.generated_images.length} background images:`);
        templateResult.generated_images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.placement}: ${img.url}`);
        });
      } else {
        console.log('⚠️  No background images generated');
      }
      
      if (templateResult.template_data) {
        console.log(`📝 Template data updated with ${Object.keys(templateResult.template_data).length} fields`);
      }
    } else {
      const errorText = await templateResponse.text();
      console.error(`❌ Template generation failed: ${templateResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Template generation error:', error);
  }

  // Test 2: Direct background image generation
  console.log('\n🎨 Test 2: Direct Background Image Generation');
  console.log('─'.repeat(50));
  
  const backgroundImagePayload = {
    project_id: projectId,
    prompt: "A futuristic space-themed background for Cosmic Sips restaurant with cosmic nebula, stars, and otherworldly atmosphere, perfect for hero section background",
    aspect_ratio: "16:9",
    number_of_images: 1
  };

  try {
    const startTime = Date.now();
    console.log('🔄 Generating hero background image...');
    
    const imageResponse = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backgroundImagePayload)
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (imageResponse.ok) {
      const imageResult = await imageResponse.json();
      console.log(`✅ Background image generation completed in ${duration}ms`);
      console.log(`📊 Success: ${imageResult.success}`);
      
      if (imageResult.images && imageResult.images.length > 0) {
        console.log(`🎨 Generated ${imageResult.images.length} background image(s):`);
        imageResult.images.forEach((img, index) => {
          console.log(`   ${index + 1}. URL: ${img.url}`);
          console.log(`      ID: ${img.id}`);
          console.log(`      Size: ${img.file_size} bytes`);
          console.log(`      Dimensions: ${img.width}x${img.height}`);
        });
      } else {
        console.log('⚠️  No background images generated');
      }
    } else {
      const errorText = await imageResponse.text();
      console.error(`❌ Background image generation failed: ${imageResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Background image generation error:', error);
  }

  // Test 3: Get project images
  console.log('\n📸 Test 3: Get Project Images');
  console.log('─'.repeat(50));
  
  try {
    const imagesResponse = await fetch(`${API_BASE}/api/images?project_id=${projectId}`);
    
    if (imagesResponse.ok) {
      const imagesResult = await imagesResponse.json();
      console.log(`✅ Retrieved ${imagesResult.images?.length || 0} images for project`);
      
      if (imagesResult.images && imagesResult.images.length > 0) {
        console.log('📸 Project images:');
        imagesResult.images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.placement || 'Unknown'}: ${img.r2_url}`);
          console.log(`      Created: ${img.created_at}`);
          console.log(`      Size: ${img.file_size} bytes`);
        });
      } else {
        console.log('⚠️  No images found for project');
      }
    } else {
      const errorText = await imagesResponse.text();
      console.error(`❌ Failed to get project images: ${imagesResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Get project images error:', error);
  }

  console.log('\n🎉 Background image generation test completed!');
}

// Run the test
testBackgroundImageGeneration().catch(console.error); 