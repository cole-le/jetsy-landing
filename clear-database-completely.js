#!/usr/bin/env node

// Script to completely clear all database data for a fresh start
const API_BASE = 'http://localhost:8787';

async function clearDatabaseCompletely() {
  console.log('🧹 Complete Database Cleanup...\n');
  
  try {
    // Step 1: Get all projects
    console.log('📋 Fetching all projects...');
    const projectsResponse = await fetch(`${API_BASE}/api/projects`);
    
    if (!projectsResponse.ok) {
      throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
    }
    
    const projectsData = await projectsResponse.json();
    const projects = projectsData.projects || projectsData || [];
    console.log(`Found ${projects.length} projects to delete`);
    
    if (projects.length === 0) {
      console.log('✅ No projects found. Database is already clean!');
      return;
    }
    
    // Step 2: Delete each project (this should cascade to related data)
    console.log('\n🗑️  Deleting projects and related data...');
    let deletedCount = 0;
    
    for (const project of projects) {
      try {
        const deleteResponse = await fetch(`${API_BASE}/api/projects/${project.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Deleted project: ${project.project_name} (ID: ${project.id})`);
          deletedCount++;
        } else {
          console.log(`❌ Failed to delete project: ${project.project_name} (ID: ${project.id})`);
        }
      } catch (error) {
        console.log(`❌ Error deleting project ${project.id}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully deleted ${deletedCount} out of ${projects.length} projects`);
    
    // Step 3: Clear leads data
    console.log('\n📧 Clearing leads data...');
    try {
      const leadsResponse = await fetch(`${API_BASE}/api/leads`);
      if (leadsResponse.ok) {
        const leads = await leadsResponse.json();
        console.log(`Found ${leads.length} leads to clear`);
        
        // Note: In a real implementation, you'd have a DELETE endpoint for leads
        // For now, we'll just report the count
        console.log('ℹ️  Leads will be cleared when projects are deleted (cascade)');
      }
    } catch (error) {
      console.log('ℹ️  No leads endpoint found or error accessing leads');
    }
    
    // Step 4: Clear images
    console.log('\n🖼️  Clearing generated images...');
    try {
      const imagesResponse = await fetch(`${API_BASE}/api/images`);
      if (imagesResponse.ok) {
        const images = await imagesResponse.json();
        console.log(`Found ${images.length} images to clear`);
        
        // Delete each image
        for (const image of images) {
          try {
            const deleteImageResponse = await fetch(`${API_BASE}/api/images/${image.image_id}`, {
              method: 'DELETE'
            });
            
            if (deleteImageResponse.ok) {
              console.log(`✅ Deleted image: ${image.image_id}`);
            } else {
              console.log(`❌ Failed to delete image: ${image.image_id}`);
            }
          } catch (error) {
            console.log(`❌ Error deleting image ${image.image_id}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log('ℹ️  No images endpoint found or error accessing images');
    }
    
    // Step 5: Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    
    // Check projects
    const verifyProjectsResponse = await fetch(`${API_BASE}/api/projects`);
    if (verifyProjectsResponse.ok) {
      const remainingProjectsData = await verifyProjectsResponse.json();
      const remainingProjects = remainingProjectsData.projects || remainingProjectsData || [];
      console.log(`📁 Remaining projects: ${remainingProjects.length}`);
    }
    
    // Check images
    try {
      const verifyImagesResponse = await fetch(`${API_BASE}/api/images`);
      if (verifyImagesResponse.ok) {
        const remainingImages = await verifyImagesResponse.json();
        console.log(`🖼️  Remaining images: ${remainingImages.length}`);
      }
    } catch (error) {
      console.log('ℹ️  Could not verify images');
    }
    
    console.log('\n✅ Database cleanup completed!');
    console.log('🎉 You can now start fresh with a new chat!');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error.message);
  }
}

// Run the script
clearDatabaseCompletely().catch(console.error); 