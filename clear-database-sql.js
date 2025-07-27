#!/usr/bin/env node

// Script to clear database using direct SQL commands
const API_BASE = 'http://localhost:8787';

async function clearDatabaseWithSQL() {
  console.log('🧹 Complete Database Cleanup with SQL...\n');
  
  try {
    // Step 1: Clear all tables using SQL
    console.log('🗑️  Clearing all database tables...');
    
    const clearQueries = [
      'DELETE FROM chat_messages',
      'DELETE FROM images',
      'DELETE FROM ideas',
      'DELETE FROM plan_selections',
      'DELETE FROM priority_access_attempts',
      'DELETE FROM leads',
      'DELETE FROM projects'
    ];
    
    for (const query of clearQueries) {
      try {
        const response = await fetch(`${API_BASE}/api/db-execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Executed: ${query}`);
        } else {
          console.log(`❌ Failed to execute: ${query}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not execute: ${query} (${error.message})`);
      }
    }
    
    // Step 2: Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    
    const verifyQueries = [
      'SELECT COUNT(*) as count FROM projects',
      'SELECT COUNT(*) as count FROM leads',
      'SELECT COUNT(*) as count FROM images',
      'SELECT COUNT(*) as count FROM chat_messages'
    ];
    
    for (const query of verifyQueries) {
      try {
        const response = await fetch(`${API_BASE}/api/db-query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (response.ok) {
          const result = await response.json();
          const tableName = query.split('FROM ')[1];
          console.log(`📊 ${tableName}: ${result.count || 0} records`);
        }
      } catch (error) {
        console.log(`⚠️  Could not verify: ${query}`);
      }
    }
    
    console.log('\n✅ Database cleanup completed!');
    console.log('🎉 You can now start fresh with a new chat!');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error.message);
  }
}

// Run the script
clearDatabaseWithSQL().catch(console.error); 