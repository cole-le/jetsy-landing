#!/usr/bin/env node

// Script to manually delete remaining projects
const API_BASE = 'http://localhost:8787';

async function deleteRemainingProjects() {
  console.log('🗑️  Deleting remaining projects...\n');
  
  try {
    // Get all projects
    const projectsResponse = await fetch(`${API_BASE}/api/projects`);
    const projectsData = await projectsResponse.json();
    const projects = projectsData.projects || projectsData || [];
    
    console.log(`Found ${projects.length} projects to delete\n`);
    
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const project of projects) {
      try {
        console.log(`Attempting to delete: ${project.project_name} (ID: ${project.id})`);
        
        const deleteResponse = await fetch(`${API_BASE}/api/projects/${project.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Successfully deleted: ${project.project_name}`);
          deletedCount++;
        } else {
          const errorText = await deleteResponse.text();
          console.log(`❌ Failed to delete: ${project.project_name} - Status: ${deleteResponse.status}`);
          console.log(`   Error: ${errorText}`);
          failedCount++;
        }
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Error deleting ${project.project_name}: ${error.message}`);
        failedCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully deleted: ${deletedCount}`);
    console.log(`   ❌ Failed to delete: ${failedCount}`);
    console.log(`   📁 Total projects: ${projects.length}`);
    
    if (deletedCount > 0) {
      console.log('\n🎉 Some projects were successfully deleted!');
    } else {
      console.log('\n⚠️  No projects could be deleted. You may need to manually clear the database.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
deleteRemainingProjects().catch(console.error); 