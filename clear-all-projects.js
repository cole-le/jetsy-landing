#!/usr/bin/env node

import { D1Database } from '@cloudflare/workers-types';

async function clearAllProjects() {
  console.log('🗑️  Clearing all projects from local D1 database...\n');

  try {
    // Connect to the local D1 database
    const db = new D1Database('jetsy-leads');
    
    // First, let's see what we have
    console.log('📊 Current projects in database:');
    const projects = await db.prepare('SELECT id, project_name, created_at FROM projects ORDER BY created_at DESC').all();
    
    if (projects.results.length === 0) {
      console.log('✅ No projects found in database');
      return;
    }
    
    console.log(`Found ${projects.results.length} projects:`);
    projects.results.forEach(project => {
      console.log(`   - ID: ${project.id}, Name: ${project.project_name}, Created: ${project.created_at}`);
    });
    
    // Delete chat messages first (due to foreign key constraints)
    console.log('\n🗑️  Deleting chat messages...');
    const chatResult = await db.prepare('DELETE FROM chat_messages').run();
    console.log(`   Deleted ${chatResult.changes} chat messages`);
    
    // Delete file backups
    console.log('🗑️  Deleting file backups...');
    const backupResult = await db.prepare('DELETE FROM file_backups').run();
    console.log(`   Deleted ${backupResult.changes} file backups`);
    
    // Delete images
    console.log('🗑️  Deleting images...');
    const imageResult = await db.prepare('DELETE FROM images').run();
    console.log(`   Deleted ${imageResult.changes} images`);
    
    // Finally, delete projects
    console.log('🗑️  Deleting projects...');
    const projectResult = await db.prepare('DELETE FROM projects').run();
    console.log(`   Deleted ${projectResult.changes} projects`);
    
    console.log('\n✅ Successfully cleared all data from local D1 database!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

// Run the script
clearAllProjects().catch(console.error); 