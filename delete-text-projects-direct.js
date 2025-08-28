#!/usr/bin/env node

// Direct deletion script for projects with names starting with "text"
// WARNING: This will permanently delete projects and all associated data!

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function deleteTextProjectsDirect() {
  console.log('🗑️  DIRECT DELETION SCRIPT for projects with names starting with "text"\n');
  console.log('⚠️  WARNING: This script will permanently delete projects and all associated data!\n');
  
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
      rl.close();
      return;
    }
    
    console.log(`\n📊 Found ${projectIds.length} projects to delete`);
    
    // Show what will be deleted
    console.log('\n🗑️  The following projects will be deleted:');
    projectIds.forEach(project => {
      console.log(`   - ${project.name} (ID: ${project.id})`);
    });
    
    console.log('\n⚠️  This will also delete:');
    console.log('   - All project files and configuration');
    console.log('   - All chat messages for these projects');
    console.log('   - All generated images for these projects');
    console.log('   - All project metadata and settings');
    
    // Ask for confirmation
    const confirm = await question('\n🔒 Type "DELETE" to confirm deletion (or anything else to cancel): ');
    
    if (confirm !== 'DELETE') {
      console.log('❌ Deletion cancelled');
      rl.close();
      return;
    }
    
    // Double confirmation
    const doubleConfirm = await question('\n🔒 Type "YES" to confirm one more time: ');
    
    if (doubleConfirm !== 'YES') {
      console.log('❌ Deletion cancelled');
      rl.close();
      return;
    }
    
    console.log('\n🚀 Proceeding with deletion...');
    
    // Delete chat messages first (due to foreign key constraints)
    console.log('\n🗑️  Deleting chat messages for these projects...');
    const chatDeleteQuery = `
      DELETE FROM chat_messages 
      WHERE project_id IN (${projectIds.map(p => p.id).join(',')})
    `;
    
    try {
      const chatDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${chatDeleteQuery}"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Chat messages deleted');
      console.log(chatDeleteResult);
    } catch (error) {
      console.log('⚠️  Warning: Could not delete chat messages (may not exist):', error.message);
    }
    
    // Delete image placements
    console.log('\n🗑️  Deleting image placements for these projects...');
    const imagePlacementDeleteQuery = `
      DELETE FROM image_placements 
      WHERE project_id IN (${projectIds.map(p => p.id).join(',')})
    `;
    
    try {
      const imagePlacementDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${imagePlacementDeleteQuery}"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Image placements deleted');
      console.log(imagePlacementDeleteResult);
    } catch (error) {
      console.log('⚠️  Warning: Could not delete image placements (may not exist):', error.message);
    }
    
    // Delete images
    console.log('\n🗑️  Deleting images for these projects...');
    const imageDeleteQuery = `
      DELETE FROM images 
      WHERE project_id IN (${projectIds.map(p => p.id).join(',')})
    `;
    
    try {
      const imageDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${imageDeleteQuery}"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Images deleted');
      console.log(imageDeleteResult);
    } catch (error) {
      console.log('⚠️  Warning: Could not delete images (may not exist):', error.message);
    }
    
    // Finally, delete the projects
    console.log('\n🗑️  Deleting projects...');
    const projectDeleteQuery = `
      DELETE FROM projects 
      WHERE project_name LIKE 'text%'
    `;
    
    const projectDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${projectDeleteQuery}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Projects deleted successfully!');
    console.log(projectDeleteResult);
    
    // Verify deletion
    console.log('\n🔍 Verifying deletion...');
    const verifyQuery = `
      SELECT COUNT(*) as count 
      FROM projects 
      WHERE project_name LIKE 'text%'
    `;
    
    const verifyResult = execSync(`npx wrangler d1 execute jetsy-leads --command "${verifyQuery}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('📊 Verification result:');
    console.log(verifyResult);
    
    console.log('\n🎉 Deletion completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during deletion:', error.message);
    
    if (error.message.includes('command not found')) {
      console.log('\n💡 Make sure you have wrangler CLI installed:');
      console.log('   npm install -g wrangler');
    }
    
    if (error.message.includes('jetsy-leads')) {
      console.log('\n💡 Make sure you have the correct database binding name:');
      console.log('   Check your wrangler.toml file for the D1 database binding');
    }
  } finally {
    rl.close();
  }
}

// Run the script
deleteTextProjectsDirect().catch(console.error);
