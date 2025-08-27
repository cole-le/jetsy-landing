#!/usr/bin/env node

/**
 * Standalone test: Capture screenshot of https://jetsy.dev via Cloudflare Browser Rendering REST API
 * Then upload it to our worker's R2 via /api/upload-image and print the resulting URL.
 *
 * Usage:
 *   node test-browser-rendering-screenshot.js [projectId]
 *
 * Environment resolution order:
 * - CF_ACCOUNT_ID, CLOUDFLARE_API_TOKEN from process.env
 * - Fallback: parse ./.dev.vars for CF_ACCOUNT_ID and CLOUDFLARE_API_TOKEN
 */

const fs = await import('node:fs');
const path = await import('node:path');

// Config
const TARGET_URL = 'https://jetsy.dev/';
const API_BASE = process.env.API_BASE || 'https://jetsy-landing.jetsydev.workers.dev';
const PROJECT_ID = process.argv[2] || process.env.PROJECT_ID || '2102202872';

async function readSecretsFromDevVars() {
  try {
    const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
    const content = fs.readFileSync(devVarsPath, 'utf8');
    const lines = content.split(/\r?\n/);
    const out = {};
    for (const line of lines) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      let value = m[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
    return out;
  } catch (_) {
    return {};
  }
}

async function getCfCreds() {
  let { CF_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;
  if (!CF_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    const vars = await readSecretsFromDevVars();
    CF_ACCOUNT_ID = CF_ACCOUNT_ID || vars.CF_ACCOUNT_ID;
    CLOUDFLARE_API_TOKEN = CLOUDFLARE_API_TOKEN || vars.CLOUDFLARE_API_TOKEN || vars.CF_API_TOKEN;
  }
  if (!CF_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing CF_ACCOUNT_ID or CLOUDFLARE_API_TOKEN. Set env or add to .dev.vars');
  }
  return { CF_ACCOUNT_ID, CLOUDFLARE_API_TOKEN };
}

async function captureScreenshotViaCloudflare(url) {
  const { CF_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = await getCfCreds();
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/browser-rendering/screenshot`;
  const body = {
    url,
    screenshotOptions: { type: 'webp' },
    viewport: { width: 1200, height: 630 },
    gotoOptions: { waitUntil: 'networkidle0', timeout: 45000 }
  };
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Screenshot API failed: ${res.status} ${res.statusText} - ${txt}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function toDataUrlWebp(bytes) {
  const b64 = Buffer.from(bytes).toString('base64');
  return `data:image/webp;base64,${b64}`;
}

async function uploadToWorker(dataUrl, projectId) {
  const uploadUrl = `${API_BASE}/api/upload-image`;
  const payload = { project_id: String(projectId), data_url: dataUrl };
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${text}`);
  }
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`Invalid JSON from upload: ${text}`); }
  if (!json.success || !json.url) {
    throw new Error(`Upload response missing url: ${text}`);
  }
  return json.url;
}

(async () => {
  try {
    console.log(`🧪 Capturing screenshot of: ${TARGET_URL}`);
    const bytes = await captureScreenshotViaCloudflare(TARGET_URL);
    console.log(`✅ Screenshot bytes: ${bytes.length.toLocaleString()} bytes`);

    const dataUrl = toDataUrlWebp(bytes);
    console.log('⬆️  Uploading to worker (R2 via /api/upload-image)...');
    const url = await uploadToWorker(dataUrl, PROJECT_ID);

    console.log('🎉 Screenshot uploaded successfully!');
    console.log(`🔗 URL: ${url}`);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exitCode = 1;
  }
})();
