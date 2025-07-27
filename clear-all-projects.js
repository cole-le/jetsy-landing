#!/usr/bin/env node

// Script to delete all projects from the database
const API_BASE = 'http://localhost:8787';

async function clearAllProjects() {
  console.log('🗑️  Clearing all projects from database...\n');
  
  try {
    // Step 1: Get all projects
    console.log('📋 Fetching all projects...');
    const projectsResponse = await fetch(`${API_BASE}/api/projects`);
    
    if (!projectsResponse.ok) {
      throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
    }
    
    const projects = await projectsResponse.json();
    console.log(`Found ${projects.length} projects to delete`);
    
    if (projects.length === 0) {
      console.log('✅ No projects found. Database is already clean!');
      return;
    }
    
    // Step 2: Delete each project
    console.log('\n🗑️  Deleting projects...');
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
    
    // Step 3: Verify all projects are deleted
    console.log('\n🔍 Verifying deletion...');
    const verifyResponse = await fetch(`${API_BASE}/api/projects`);
    
    if (verifyResponse.ok) {
      const remainingProjects = await verifyResponse.json();
      if (remainingProjects.length === 0) {
        console.log('✅ All projects successfully deleted! Database is now clean.');
      } else {
        console.log(`⚠️  ${remainingProjects.length} projects still remain in database`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error clearing projects:', error.message);
  }
}

// Run the script
clearAllProjects().catch(console.error); 