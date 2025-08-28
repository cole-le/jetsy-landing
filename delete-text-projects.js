#!/usr/bin/env node

// Script to delete all projects with names starting with "text" from remote Cloudflare D1 database
// This script directly queries the D1 database to find and delete matching projects

import { execSync } from 'child_process';

async function deleteTextProjects() {
  console.log('🗑️  Deleting projects with names starting with "text"...\n');
  
  try {
    // First, let's see what projects exist with names starting with "text"
    console.log('🔍 Finding projects with names starting with "text"...');
    
    const findQuery = `
      SELECT id, project_name, user_id, created_at 
      FROM projects 
      WHERE project_name LIKE 'text%' 
      ORDER BY created_at DESC
    `;
    
    const findResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${findQuery}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('📋 Query result:');
    console.log(findResult);
    
    // Parse the results to get project IDs
    const lines = findResult.trim().split('\n');
    const projectIds = [];
    
    // Skip header lines and extract project IDs
    for (let i = 2; i < lines.length; i++) { // Skip first 2 lines (headers)
      const line = lines[i].trim();
      if (line && !line.startsWith('---')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          const projectId = parts[0];
          const projectName = parts[1];
          if (projectId && !isNaN(projectId)) {
            projectIds.push({ id: projectId, name: projectName });
            console.log(`📁 Found project: ${projectName} (ID: ${projectId})`);
          }
        }
      }
    }
    
    if (projectIds.length === 0) {
      console.log('✅ No projects found with names starting with "text"');
      return;
    }
    
    console.log(`\n📊 Found ${projectIds.length} projects to delete`);
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete these projects and all associated data!');
    console.log('   This includes:');
    console.log('   - Project files and configuration');
    console.log('   - Chat messages');
    console.log('   - Generated images');
    console.log('   - All project metadata');
    
    // For safety, we'll require manual confirmation by showing the exact command
    console.log('\n🔒 To proceed with deletion, run this command manually:');
    console.log(`\n   npx wrangler d1 execute jetsy-leads --command "DELETE FROM projects WHERE project_name LIKE 'text%';"`);
    
    console.log('\n📝 Or to delete specific projects by ID, run:');
    projectIds.forEach(project => {
      console.log(`   npx wrangler d1 execute jetsy-leads --command "DELETE FROM projects WHERE id = ${project.id};"`);
    });
    
    console.log('\n💡 Alternative: Use the safer API endpoint for each project:');
    console.log('   (This requires authentication but is safer)');
    projectIds.forEach(project => {
      console.log(`   curl -X DELETE https://jetsy-landing.jetsydev.workers.dev/api/projects/${project.id}`);
    });
    
    console.log('\n🔍 To verify deletion, run:');
    console.log(`   npx wrangler d1 execute jetsy-leads --command "SELECT COUNT(*) FROM projects WHERE project_name LIKE 'text%';"`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('command not found')) {
      console.log('\n💡 Make sure you have wrangler CLI installed:');
      console.log('   npm install -g wrangler');
    }
    
    if (error.message.includes('jetsy-leads')) {
      console.log('\n💡 Make sure you have the correct database binding name:');
      console.log('   Check your wrangler.toml file for the D1 database binding');
    }
  }
}

// Run the script
deleteTextProjects().catch(console.error);
