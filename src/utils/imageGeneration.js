// Image Generation Utility
// This file handles image generation with automatic environment switching for Option 2

import { getUrlForOperation, shouldUseProductionForImages } from '../config/environment.js';

/**
 * Generate an image using the appropriate environment
 * Automatically switches to production for image generation in development
 */
export async function generateImage(imageRequest) {
  const isDevelopment = shouldUseProductionForImages();
  const baseUrl = getUrlForOperation('image-generation');
  
  console.log(`🎨 Generating image (${isDevelopment ? 'DEV → PROD' : 'PROD'})...`);
  console.log(`   - Base URL: ${baseUrl}`);
  console.log(`   - Request:`, imageRequest);
  
  try {
    const response = await fetch(`${baseUrl}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Image generated successfully!`);
      console.log(`   - Generated ${result.images?.length || 0} image(s)`);
      return result;
    } else {
      throw new Error(result.error || 'Image generation failed');
    }
  } catch (error) {
    console.error('❌ Image generation error:', error);
    throw error;
  }
}

/**
 * Get images for a project using the appropriate environment
 */
export async function getProjectImages(projectId) {
  const baseUrl = getUrlForOperation('api');
  
  try {
    const response = await fetch(`${baseUrl}/api/images?project_id=${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get images: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Get images error:', error);
    throw error;
  }
}

/**
 * Delete an image using the appropriate environment
 */
export async function deleteImage(imageId) {
  const baseUrl = getUrlForOperation('api');
  
  try {
    const response = await fetch(`${baseUrl}/api/images/${imageId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Delete image error:', error);
    throw error;
  }
}

/**
 * Test image generation functionality
 */
export async function testImageGeneration() {
  console.log('🧪 Testing image generation with environment switching...');
  
  // Create a test project first
  const baseUrl = getUrlForOperation('api');
  
  try {
    // Create test project
    const projectResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: "Image Generation Test",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Image Generation Test</h1>
    </div>
  );
}
export default App;`
        }
      })
    });

    if (!projectResponse.ok) {
      throw new Error(`Failed to create test project: ${projectResponse.status}`);
    }

    const projectResult = await projectResponse.json();
    const projectId = projectResult.project_id;
    
    console.log(`✅ Test project created: ${projectId}`);

    // Test image generation
    const imageResult = await generateImage({
      project_id: projectId,
      prompt: "A modern tech startup office with clean design, blue theme, professional lighting",
      aspect_ratio: "16:9",
      number_of_images: 1
    });

    console.log('✅ Image generation test completed successfully!');
    return {
      success: true,
      projectId,
      imageResult
    };
    
  } catch (error) {
    console.error('❌ Image generation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get environment information for debugging
 */
export function getEnvironmentInfo() {
  const isDevelopment = shouldUseProductionForImages();
  const imageUrl = getUrlForOperation('image-generation');
  const apiUrl = getUrlForOperation('api');
  
  return {
    environment: isDevelopment ? 'development' : 'production',
    imageGenerationUrl: imageUrl,
    apiBaseUrl: apiUrl,
    usingProductionForImages: isDevelopment
  };
} 