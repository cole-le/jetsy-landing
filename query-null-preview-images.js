#!/usr/bin/env node

/**
 * Script to query the remote Cloudflare database for projects with null preview_image_url
 * 
 * This script fetches all public projects and identifies those without preview images
 * 
 * Usage:
 *   node query-null-preview-images.js
 */

const API_BASE = process.env.API_BASE || 'https://jetsy-landing.jetsydev.workers.dev';

async function queryProjectsWithoutPreviewImages() {
  console.log('🔍 Querying projects without preview images from remote database...');
  console.log(`📡 API Base: ${API_BASE}`);
  
  try {
    // First, let's try to get some public projects to see the structure
    console.log('\n📊 Fetching public projects...');
    const publicResponse = await fetch(`${API_BASE}/api/projects/public?limit=50`);
    
    if (!publicResponse.ok) {
      throw new Error(`Failed to fetch public projects: ${publicResponse.status} ${publicResponse.statusText}`);
    }
    
    const publicResult = await publicResponse.json();
    console.log(`✅ Found ${publicResult.projects?.length || 0} public projects`);
    
    if (publicResult.projects && publicResult.projects.length > 0) {
      console.log('\n📋 Sample project structure:');
      const sampleProject = publicResult.projects[0];
      console.log(`   ID: ${sampleProject.id}`);
      console.log(`   Name: ${sampleProject.project_name}`);
      console.log(`   Preview Image: ${sampleProject.preview_image_url || 'NULL'}`);
      console.log(`   Has Template Data: ${sampleProject.template_data ? 'Yes' : 'No'}`);
    }
    
    // Filter projects without preview images
    const projectsWithoutPreview = publicResult.projects?.filter(p => !p.preview_image_url) || [];
    
    console.log(`\n🎯 Projects without preview images: ${projectsWithoutPreview.length}`);
    
    if (projectsWithoutPreview.length > 0) {
      console.log('\n📝 Projects needing preview images:');
      projectsWithoutPreview.forEach((project, index) => {
        console.log(`   ${index + 1}. ID: ${project.id}, Name: ${project.project_name}`);
      });
      
      // Pick the first one for testing
      const testProject = projectsWithoutPreview[0];
      console.log(`\n🧪 Recommended test project: --start-id ${testProject.id}`);
      console.log(`   Name: ${testProject.project_name}`);
      console.log(`   Has Template Data: ${testProject.template_data ? 'Yes' : 'No'}`);
      
    } else {
      console.log('\n✅ All public projects already have preview images!');
    }
    
    // Also try to get some individual projects to see if there are more
    console.log('\n🔍 Checking individual project IDs...');
    const testIds = [1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    const foundProjects = [];
    
    for (const id of testIds) {
      try {
        const response = await fetch(`${API_BASE}/api/projects/${id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.project) {
            const project = result.project;
            foundProjects.push({
              id: project.id,
              name: project.project_name,
              hasPreview: !!project.preview_image_url,
              hasTemplate: !!project.template_data
            });
          }
        }
      } catch (error) {
        // Project not found or other error, continue
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (foundProjects.length > 0) {
      console.log(`\n📊 Found ${foundProjects.length} projects by direct ID lookup:`);
      foundProjects.forEach(project => {
        const status = project.hasPreview ? '✅' : '❌';
        console.log(`   ${status} ID: ${project.id}, Name: ${project.name}, Preview: ${project.hasPreview ? 'Yes' : 'No'}`);
      });
      
      // Find projects without preview images
      const withoutPreview = foundProjects.filter(p => !p.hasPreview);
      if (withoutPreview.length > 0) {
        console.log(`\n🎯 Projects without preview images (by ID lookup): ${withoutPreview.length}`);
        withoutPreview.forEach(project => {
          console.log(`   ID: ${project.id}, Name: ${project.name}`);
        });
        
        const testProject = withoutPreview[0];
        console.log(`\n🧪 Recommended test project: --start-id ${testProject.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    process.exitCode = 1;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  queryProjectsWithoutPreviewImages();
}
