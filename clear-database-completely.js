#!/usr/bin/env node

import { execSync } from 'child_process';

async function clearDatabase() {
  console.log('🗑️  Clearing all data from local D1 database...\n');

  try {
    // First, let's see what's in the database
    console.log('📊 Current projects in database:');
    const projectsOutput = execSync('npx wrangler d1 execute jetsy-leads --local --command "SELECT id, project_name, created_at FROM projects ORDER BY created_at DESC;"', { encoding: 'utf8' });
    console.log(projectsOutput);

    // Clear all tables in the correct order (respecting foreign key constraints)
    console.log('\n🗑️  Deleting chat messages...');
    execSync('npx wrangler d1 execute jetsy-leads --local --command "DELETE FROM chat_messages;"', { encoding: 'utf8' });
    
    console.log('🗑️  Deleting file backups...');
    execSync('npx wrangler d1 execute jetsy-leads --local --command "DELETE FROM file_backups;"', { encoding: 'utf8' });
    
    console.log('🗑️  Deleting images...');
    execSync('npx wrangler d1 execute jetsy-leads --local --command "DELETE FROM images;"', { encoding: 'utf8' });
    
    console.log('🗑️  Deleting projects...');
    execSync('npx wrangler d1 execute jetsy-leads --local --command "DELETE FROM projects;"', { encoding: 'utf8' });
    
    console.log('\n✅ Successfully cleared all data from local D1 database!');
    
    // Verify the database is empty
    console.log('\n🔍 Verifying database is empty...');
    const verifyOutput = execSync('npx wrangler d1 execute jetsy-leads --local --command "SELECT COUNT(*) as project_count FROM projects; SELECT COUNT(*) as chat_count FROM chat_messages; SELECT COUNT(*) as image_count FROM images; SELECT COUNT(*) as backup_count FROM file_backups;"', { encoding: 'utf8' });
    console.log(verifyOutput);
    
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
}

// Run the script
clearDatabase().catch(console.error); 