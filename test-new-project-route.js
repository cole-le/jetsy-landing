/**
 * Test the new project route implementation
 * This tests the /{projectId} route that serves projects and triggers screenshot capture
 */

// const API_BASE = 'http://localhost:8787'; // Local worker
const API_BASE = 'https://jetsy-landing.jetsydev.workers.dev'; // Live worker

// Auth token from user session
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IlJyUWVNVG5WQUpyb0gvQVkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2J1emxpcW9wdmx4cnRvZWd6b2lzLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxYWE1NmYwNC1mZTcwLTRiN2UtYWQ0NC04YjFiNTg5MTBhMzEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2MzE1MzQyLCJpYXQiOjE3NTYzMTE3NDIsImVtYWlsIjoiY29sZWxlMjA4QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiLCJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmd2b29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKalhLNmZRNk1zY01RbjRjand3Rng3LUN0aDdrREdrSUc0REN0ZDl2TlRrU3BZdUY4PXMyNi1jIiwiZW1haWwiOiJjb2xlbGUyMDhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkNvbGUgTGUiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiQ29sZSBMZSIsInBob25lIjoiMTM1Mjc0MDUxOTUiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xnMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKalhLNmZRNk1zY01RbjRjand3Rng3LUN0aDdrREdrSUc0REN0ZDl2TlRrU3BZdUY4PXMyNi1jIiwicHJvdmlkZXJfaWQiOiIxMTE0Mjg0MDYzMjI4MTA4Njc1MiIsInN1YiI6IjExMTQyODQwMDYzMjI4MTA4Njc1MiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU2MzExNzQyfV0sInNlc3Npb25faWQiOiJmYmM0YTQyNS0wOTlhLTQ4YTQtYTA3NC0wOGE3YjI1ODdjYzUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.5x5ZxYFAo1Z8uNHSMev-mNgVEH-89v_HvZ3ZLjnx91w';

async function testProjectRoute() {
  console.log('🧪 Testing new project route implementation...');
  
  try {
    const projectId = '2102202872';
    console.log(`✅ Using existing project ID: ${projectId}`);
    
    // Test the new project route (should work without auth)
    console.log(`🌐 Testing GET /${projectId} (public route)...`);
    const response = await fetch(`${API_BASE}/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Project route failed: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ Project route successful! HTML length: ${html.length}`);
    
    // Check if HTML contains expected content
    if (html.includes('<!DOCTYPE html>') && html.includes('<title>')) {
      console.log('✅ HTML looks valid');
    } else {
      console.log('⚠️ HTML may be malformed');
    }
    
    // Wait a bit for screenshot to be captured
    console.log('⏳ Waiting for screenshot capture...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if screenshot was captured using auth (required for API access)
    console.log('🔍 Checking project details with auth...');
    const projectResponse = await fetch(`${API_BASE}/api/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    if (projectResponse.ok) {
      const project = await projectResponse.json();
      if (project.project?.preview_image_url) {
        console.log(`✅ Screenshot captured: ${project.project.preview_image_url}`);
      } else {
        console.log('⚠️ No screenshot URL yet (may still be processing)');
        console.log('Project data:', JSON.stringify(project.project, null, 2));
      }
    } else {
      console.log(`⚠️ Failed to get project details: ${projectResponse.status}`);
      const errorText = await projectResponse.text();
      console.log('Error response:', errorText);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProjectRoute();
