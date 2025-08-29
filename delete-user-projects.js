#!/usr/bin/env node

// Script to delete all projects created by a specific user ID
// Usage: node delete-user-projects.js <userId>
// Example: node delete-user-projects.js 1

import { execSync } from 'child_process';
import readline from 'readline';

async function deleteUserProjects() {
  // Get user ID from command line arguments
  const userId = process.argv[2];
  
  if (!userId || isNaN(userId)) {
    console.log('❌ Please provide a valid user ID to delete projects for');
    console.log('Usage: node delete-user-projects.js <userId>');
    console.log('Example: node delete-user-projects.js 1');
    process.exit(1);
  }

  console.log(`🗑️  Deleting ALL projects for user ID: ${userId}\n`);
  console.log('⚠️  WARNING: This will permanently delete ALL projects and associated data for this user!\n');

  try {
    // First, find all projects for this user
    console.log('🔍 Finding projects for user...');
    console.log('🌐 Connecting to REMOTE Cloudflare D1 database...');
    
    const findQuery = `SELECT id, project_name, user_id, created_at FROM projects WHERE user_id = ${userId} ORDER BY created_at DESC`;
    
    const findResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${findQuery}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // Parse the JSON results
    let jsonData;
    try {
      const lines = findResult.trim().split('\n');
      let jsonStart = false;
      let jsonContent = '';

      for (const line of lines) {
        if (line.trim().startsWith('[')) {
          jsonStart = true;
        }
        if (jsonStart) {
          jsonContent += line + '\n';
        }
      }

      jsonData = JSON.parse(jsonContent.trim());
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      console.log('Raw response:', findResult);
      return;
    }

    const projects = jsonData[0]?.results || [];
    
    if (projects.length === 0) {
      console.log(`✅ No projects found for user ID: ${userId}`);
      return;
    }

    console.log(`📁 Found ${projects.length} projects for user ID ${userId}:`);
    projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.project_name} (ID: ${project.id}) - Created: ${project.created_at}`);
    });

    console.log('\n⚠️  This will also delete:');
    console.log('   - All project files and configuration');
    console.log('   - All chat messages for these projects');
    console.log('   - All generated images for these projects');
    console.log('   - All image placements and metadata');
    console.log('   - All vercel deployments and related data');
    console.log('   - All project metadata and settings');

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirm = await new Promise((resolve) => {
      rl.question('\n🔒 Type "DELETE ALL" to confirm deletion of ALL projects (or anything else to cancel): ', resolve);
    });

    rl.close();

    if (confirm !== 'DELETE ALL') {
      console.log('❌ Deletion cancelled');
      return;
    }

    // Double confirmation
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const doubleConfirm = await new Promise((resolve) => {
      rl2.question('\n🔒 Type "YES" to confirm one more time: ', resolve);
    });

    rl2.close();

    if (doubleConfirm !== 'YES') {
      console.log('❌ Deletion cancelled');
      return;
    }

    console.log('\n🚀 Proceeding with deletion of ALL projects...');

    let deletedCount = 0;
    let failedCount = 0;

    // Process each project
    for (const project of projects) {
      console.log(`\n🗑️  Processing project: ${project.project_name} (ID: ${project.id})`);
      
      try {
        // Delete chat messages first
        console.log('   🗑️  Deleting chat messages...');
        const chatDeleteQuery = `DELETE FROM chat_messages WHERE project_id = ${project.id}`;
        
        try {
          execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${chatDeleteQuery}"`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          console.log('   ✅ Chat messages deleted');
        } catch (error) {
          console.log('   ⚠️  Warning: Could not delete chat messages (may not exist)');
        }

        // Delete image placements
        console.log('   🗑️  Deleting image placements...');
        const imagePlacementDeleteQuery = `DELETE FROM image_placements WHERE project_id = ${project.id}`;
        
        try {
          execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${imagePlacementDeleteQuery}"`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          console.log('   ✅ Image placements deleted');
        } catch (error) {
          console.log('   ⚠️  Warning: Could not delete image placements (may not exist)');
        }

        // Delete images
        console.log('   🗑️  Deleting images...');
        const imageDeleteQuery = `DELETE FROM images WHERE project_id = ${project.id}`;
        
        try {
          execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${imageDeleteQuery}"`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          console.log('   ✅ Images deleted');
        } catch (error) {
          console.log('   ⚠️  Warning: Could not delete images (may not exist)');
        }

        // Delete vercel deployments
        console.log('   🗑️  Deleting vercel deployments...');
        const vercelDeploymentsDeleteQuery = `DELETE FROM vercel_deployments WHERE project_id = ${project.id}`;
        
        try {
          execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${vercelDeploymentsDeleteQuery}"`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          console.log('   ✅ Vercel deployments deleted');
        } catch (error) {
          console.log('   ⚠️  Warning: Could not delete vercel deployments (may not exist)');
        }

        // Finally, delete the project
        console.log('   🗑️  Deleting project...');
        const projectDeleteQuery = `DELETE FROM projects WHERE id = ${project.id}`;
        
        execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${projectDeleteQuery}"`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        console.log('   ✅ Project deleted successfully!');
        deletedCount++;

        // Add a small delay between projects to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`   ❌ Error deleting project ${project.project_name}: ${error.message}`);
        failedCount++;
      }
    }

    // Final verification
    console.log('\n🔍 Verifying deletion...');
    const verifyQuery = `SELECT COUNT(*) as count FROM projects WHERE user_id = ${userId}`;
    
    const verifyResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${verifyQuery}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // Parse verification result
    try {
      const lines = verifyResult.trim().split('\n');
      let jsonStart = false;
      let jsonContent = '';

      for (const line of lines) {
        if (line.trim().startsWith('[')) {
          jsonStart = true;
        }
        if (jsonStart) {
          jsonContent += line + '\n';
        }
      }

      const verifyData = JSON.parse(jsonContent.trim());
      const count = verifyData[0]?.results?.[0]?.count || 0;
      
      if (count === 0) {
        console.log('✅ Verification successful: All projects for this user have been deleted');
      } else {
        console.log(`⚠️  Warning: ${count} projects still exist for this user`);
      }
    } catch (error) {
      console.log('⚠️  Could not verify deletion');
    }

    console.log('\n📊 Deletion Summary:');
    console.log(`   ✅ Successfully deleted: ${deletedCount} projects`);
    console.log(`   ❌ Failed to delete: ${failedCount} projects`);
    console.log(`   📁 Total projects processed: ${projects.length}`);

    if (deletedCount > 0) {
      console.log('\n🎉 User projects deletion completed!');
    } else {
      console.log('\n⚠️  No projects could be deleted. Check the error messages above.');
    }

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
  }
}

// Run the script
deleteUserProjects().catch(console.error);
