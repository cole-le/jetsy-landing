#!/usr/bin/env node

// DALL-E 3 Image Generation Test
// This script generates images using OpenAI's DALL-E 3 API

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY in .env file or .dev.vars');
  console.log('💡 Make sure you have set up your OpenAI API key');
  process.exit(1);
}

// The three prompts for image generation
const PROMPTS = [
  {
    name: "Miami Beach Bar Startup",
    prompt: "Ultra-realistic photo of a trendy beach bar startup in Miami during sunset. Wooden bar hut with hanging lights, palm trees in the background, a vibrant beach crowd enjoying cocktails, ocean waves in the distance, golden sky, Instagram-worthy mood. Wide angle, cinematic lighting, 4K quality."
  },
  {
    name: "Sunset Sips Logo",
    prompt: "Minimalistic logo for a startup called 'Sunset Sips' — a beach bar in Miami. Include stylized palm trees, ocean wave icon, and bold modern text 'Sunset Sips' below the icon. Use a tropical, high-contrast color palette (sunset orange, teal, white). Vector style, transparent background."
  },
  {
    name: "Sunset Sips Bar Hut",
    prompt: "Photorealistic image of a Miami beach bar hut with a wooden sign that reads 'Sunset Sips'. The bar is built from driftwood, with hanging lanterns, surfboards, and tropical plants. Sign text should be clear and readable, integrated naturally into the scene. Sunset sky, ocean visible behind the bar"
  }
];

async function generateDALLE3Image(prompt, imageName) {
  console.log(`🎨 Generating DALL-E 3 image: ${imageName}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
  console.log('─'.repeat(80));

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      console.log(`✅ Image generated successfully!`);
      console.log(`🔗 URL: ${imageUrl}`);
      console.log(`💰 Usage: ${JSON.stringify(data.usage)}`);
      
      // Save the URL to a file for easy access
      const outputDir = './generated-images';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const filename = `${outputDir}/dalle3-${imageName.toLowerCase().replace(/\s+/g, '-')}.txt`;
      fs.writeFileSync(filename, `DALL-E 3 Generated Image: ${imageName}\nPrompt: ${prompt}\nURL: ${imageUrl}\nGenerated: ${new Date().toISOString()}`);
      
      console.log(`💾 Image details saved to: ${filename}`);
    } else {
      throw new Error('No image data received from API');
    }

  } catch (error) {
    console.error(`❌ Error generating image "${imageName}":`, error.message);
    if (error.message.includes('billing')) {
      console.log('💡 This might be a billing issue. Check your OpenAI account credits.');
    }
  }
  
  console.log('');
}

async function runDALLE3Tests() {
  console.log('🚀 DALL-E 3 Image Generation Test');
  console.log('='.repeat(80));
  console.log(`🔑 API Key: ${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('');

  for (let i = 0; i < PROMPTS.length; i++) {
    const { name, prompt } = PROMPTS[i];
    console.log(`📸 Test ${i + 1}/${PROMPTS.length}`);
    await generateDALLE3Image(prompt, name);
    
    // Add a small delay between requests to be respectful to the API
    if (i < PROMPTS.length - 1) {
      console.log('⏳ Waiting 2 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('🎉 DALL-E 3 Image Generation Complete!');
  console.log('📁 Check the ./generated-images/ directory for saved image URLs');
  console.log('💡 You can download the images by visiting the URLs in the saved files');
}

// Run the tests
runDALLE3Tests().catch(console.error); 