/* Automated E2E test for screenshot capture and serving */

const BASE = 'https://jetsy-landing.jetsydev.workers.dev';

async function jsonOrText(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createProject() {
  const body = { project_name: 'E2E Screenshot Test', visibility: 'public', files: [] };
  const res = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Create project failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data?.id || data?.project?.id || data?.project_id;
}

async function main() {
  console.log('🧪 Starting screenshot E2E test');

  // Allow using an existing project via env
  let id = process.env.PROJECT_ID;
  if (!id) {
    id = await createProject();
    if (!id) throw new Error('No project id from create');
    console.log('✅ Project created with id:', id);
  } else {
    console.log('ℹ️ Using existing project id:', id);
  }

  // 2) Update template_data (triggers screenshot)
  const tpl = {
    template_data: {
      name: 'E2E Screenshot Test',
      hero: { headline: 'Capture Demo', subheadline: 'Verifying pipeline' },
      sections: [{ type: 'features', items: ['Fast', 'Reliable', 'Scalable'] }]
    }
  };
  const putRes = await fetch(`${BASE}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tpl)
  });
  const putBody = await jsonOrText(putRes);
  console.log('✅ Template update status:', putRes.status, putBody);

  // 3) Poll for preview_image_url
  const deadline = Date.now() + 120_000; // up to 120s
  let previewUrl;
  while (Date.now() < deadline) {
    await sleep(4000);
    const getRes = await fetch(`${BASE}/api/projects/${id}`);
    const proj = await getRes.json();
    previewUrl = proj?.project?.preview_image_url || proj?.preview_image_url || proj?.project?.preview_image;
    console.log('⏳ Polling preview_image_url:', previewUrl || '(pending)');
    if (previewUrl) break;
  }
  if (!previewUrl) throw new Error('Timed out waiting for preview_image_url');
  console.log('✅ Preview image URL:', previewUrl);

  // 4) Fetch the image and verify content headers
  const imgRes = await fetch(previewUrl);
  if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
  const ct = imgRes.headers.get('content-type');
  const cc = imgRes.headers.get('cache-control');
  console.log('🖼️ Image headers:', { 'content-type': ct, 'cache-control': cc });
  if (!ct || !ct.includes('image/')) throw new Error('Unexpected content-type for image');
  const buf = await imgRes.arrayBuffer();
  console.log('📏 Image bytes:', buf.byteLength);

  console.log('🎉 E2E test passed');
}

main().catch(err => {
  console.error('❌ E2E test failed:', err);
  process.exit(1);
});
