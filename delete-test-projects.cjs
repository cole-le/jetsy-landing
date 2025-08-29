#!/usr/bin/env node

// Direct deletion script for projects with names starting with "test"
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

async function deleteTestProjectsDirect() {
  console.log('🗑️  DIRECT DELETION SCRIPT for projects with names starting with "test"\n');
  console.log('⚠️  WARNING: This script will permanently delete projects and all associated data!\n');

  try {
    // First, let's see what projects exist with names starting with "test"
    console.log('🔍 Finding projects with names starting with "test"...');

    const findQuery = `
      SELECT id, project_name, user_id, created_at
      FROM projects
      WHERE project_name LIKE 'test%'
      ORDER BY created_at DESC
    `;

        const findResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${findQuery}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    console.log('📋 Query result:');
    console.log(findResult);

        // Parse the JSON results to get project IDs
    let jsonData;
    try {
      // Extract JSON from wrangler output (skip the header lines)
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
      console.log('❌ Error parsing JSON response:', error.message);
      console.log('Raw response:', findResult);
      return;
    }

    const projects = jsonData[0]?.results || [];
    const projectIds = [];

    // Extract project IDs and names
    for (const project of projects) {
      if (project.id && project.project_name) {
        projectIds.push({ id: project.id, name: project.project_name });
        console.log(`📁 Found project: ${project.project_name} (ID: ${project.id})`);
      }
    }

    if (projectIds.length === 0) {
      console.log('✅ No projects found with names starting with "test"');
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
            const chatDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${chatDeleteQuery}"`, {
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
            const imagePlacementDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${imagePlacementDeleteQuery}"`, {
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
            const imageDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${imageDeleteQuery}"`, {
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
      WHERE project_name LIKE 'test%'
    `;

        const projectDeleteResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${projectDeleteQuery}"`, {
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
      WHERE project_name LIKE 'test%'
    `;

        const verifyResult = execSync(`npx wrangler d1 execute jetsy-leads --remote --command "${verifyQuery}"`, {
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
deleteTestProjectsDirect().catch(console.error);
