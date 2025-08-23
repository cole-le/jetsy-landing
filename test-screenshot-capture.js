#!/usr/bin/env node

const API_BASE = process.env.API_BASE || 'http://localhost:8787';
const AUTH_BEARER = process.env.AUTH_BEARER || null; // Supabase JWT token (without the 'Bearer ' prefix)

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${API_BASE}/`);
      if (res.ok || res.status === 404) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server not available at ${API_BASE} after ${timeoutMs}ms`);
}

async function createTestProject() {
  if (!AUTH_BEARER) {
    throw new Error('AUTH_BEARER env is required to create a project (Supabase JWT). Set AUTH_BEARER and retry.');
  }
  const body = {
    project_name: `Screenshot Test ${Date.now()}`,
    user_id: 1,
    files: {
      "src/App.jsx": `import React from 'react';\nexport default function App(){return (<div className=\"min-h-screen flex items-center justify-center bg-white\"><h1 className=\"text-3xl font-bold\">Preview Screenshot Test</h1></div>);}`,
      "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
    }
  };
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AUTH_BEARER}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Create project failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  const projectId = data.project_id || data.id;
  if (!projectId) throw new Error('Project ID missing in response');
  return projectId;
}

async function hitPreview(projectId) {
  const res = await fetch(`${API_BASE}/preview/${projectId}`);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GET /preview/${projectId} failed: ${res.status} ${t}`);
  }
  const html = await res.text();
  return html.length;
}

async function triggerScreenshot(projectId) {
  const headers = AUTH_BEARER ? { 'Authorization': `Bearer ${AUTH_BEARER}` } : {};
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/preview/screenshot`, { method: 'POST', headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`Screenshot endpoint failed: ${res.status} ${text}`);
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Invalid JSON from screenshot endpoint: ${text}`); }
  if (!data.success) throw new Error(`Screenshot endpoint returned error: ${text}`);
  if (!data.preview_image_url) throw new Error(`No preview_image_url in response: ${text}`);
  return data.preview_image_url;
}

async function checkImage(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    return { status: res.status, ok: res.ok, contentType: res.headers.get('content-type') };
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  console.log(`🧪 Screenshot Capture Test (API_BASE=${API_BASE})`);
  console.log('⏳ Waiting for local worker to be available...');
  await waitForServer();

  console.log('📁 Creating a test project...');
  const projectId = await createTestProject();
  console.log(`✅ Project created: ${projectId}`);

  console.log('🔎 Hitting preview route to ensure it renders...');
  const htmlLen = await hitPreview(projectId);
  console.log(`✅ Preview HTML length: ${htmlLen}`);

  console.log('📸 Triggering screenshot capture...');
  const imageUrl = await triggerScreenshot(projectId);
  console.log(`✅ Screenshot queued/saved. URL: ${imageUrl}`);

  console.log('🧭 Checking image availability (best-effort)...');
  const imageCheck = await checkImage(imageUrl);
  if (imageCheck.error) {
    console.log(`⚠️  Could not fetch image yet: ${imageCheck.error}`);
  } else {
    console.log(`🖼️  Image fetch status: ${imageCheck.status}, ok=${imageCheck.ok}, content-type=${imageCheck.contentType}`);
  }

  console.log('\n✅ Test completed. If screenshot failed due to Cloudflare credentials, ensure CF_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are configured.');
}

main().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
