#!/usr/bin/env node

// Simple project deletion script by project name
// Usage: node delete-project.js "Project Name"

import { execSync } from 'child_process';
import readline from 'readline';

async function deleteProjectByName() {
  // Get project name from command line arguments
  const projectName = process.argv[2];
  
  if (!projectName) {
    console.log('❌ Please provide a project name to delete');
    console.log('Usage: node delete-project.js "Project Name"');
    console.log('Example: node delete-project.js "LaundroCafé"');
    process.exit(1);
  }

  console.log(`🗑️  Deleting project: "${projectName}"\n`);
  console.log('⚠️  WARNING: This will permanently delete the project and all associated data!\n');

  try {
    // First, find the project by name
    console.log('🔍 Finding project...');
    
    const findQuery = `
      SELECT id, project_name, user_id, created_at 
      FROM projects 
      WHERE project_name = '${projectName.replace(/'/g, "''")}'
    `;
    
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
      return;
    }

    const projects = jsonData[0]?.results || [];
    
    if (projects.length === 0) {
      console.log(`❌ No project found with name: "${projectName}"`);
      return;
    }

    const project = projects[0];
    console.log(`📁 Found project: ${project.project_name} (ID: ${project.id})`);
    console.log(`   Created: ${project.created_at}`);
    console.log(`   User ID: ${project.user_id}\n`);

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirm = await new Promise((resolve) => {
      rl.question('🔒 Type "DELETE" to confirm deletion (or anything else to cancel): ', resolve);
    });

    rl.close();

    if (confirm !== 'DELETE') {
      console.log('❌ Deletion cancelled');
      return;
    }

    console.log('\n🚀 Proceeding with deletion...');

    // Delete chat messages first
    console.log('🗑️  Deleting chat messages...');
    const chatDeleteQuery = `DELETE FROM chat_messages WHERE project_id = ${project.id}`;
    
    try {
      execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${chatDeleteQuery}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Chat messages deleted');
    } catch (error) {
      console.log('⚠️  Warning: Could not delete chat messages (may not exist)');
    }

    // Delete image placements
    console.log('🗑️  Deleting image placements...');
    const imagePlacementDeleteQuery = `DELETE FROM image_placements WHERE project_id = ${project.id}`;
    
    try {
      execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${imagePlacementDeleteQuery}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Image placements deleted');
    } catch (error) {
      console.log('⚠️  Warning: Could not delete image placements (may not exist)');
    }

    // Delete images
    console.log('🗑️  Deleting images...');
    const imageDeleteQuery = `DELETE FROM images WHERE project_id = ${project.id}`;
    
    try {
      execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${imageDeleteQuery}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Images deleted');
    } catch (error) {
      console.log('⚠️  Warning: Could not delete images (may not exist)');
    }

    // Delete vercel deployments
    console.log('🗑️  Deleting vercel deployments...');
    const vercelDeploymentsDeleteQuery = `DELETE FROM vercel_deployments WHERE project_id = ${project.id}`;
    
    try {
      execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${vercelDeploymentsDeleteQuery}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Vercel deployments deleted');
    } catch (error) {
      console.log('⚠️  Warning: Could not delete vercel deployments (may not exist)');
    }

    // Finally, delete the project
    console.log('🗑️  Deleting project...');
    const projectDeleteQuery = `DELETE FROM projects WHERE id = ${project.id}`;
    
    execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${projectDeleteQuery}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Project deleted successfully!');

    // Verify deletion
    console.log('\n🔍 Verifying deletion...');
    const verifyQuery = `SELECT COUNT(*) as count FROM projects WHERE project_name = '${projectName.replace(/'/g, "''")}'`;
    
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
        console.log('✅ Verification successful: Project no longer exists in database');
      } else {
        console.log(`⚠️  Warning: Project still exists (count: ${count})`);
      }
    } catch (error) {
      console.log('⚠️  Could not verify deletion');
    }

    console.log('\n🎉 Project deletion completed!');

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
deleteProjectByName().catch(console.error);
