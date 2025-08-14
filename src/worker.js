// Helper function to get the worker URL based on the current request
function getWorkerUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      // API routes
      if (path === '/api/lead' && request.method === 'POST') {
        // Use the new handler logic from functions/api/leads.js
        return await handleLeadSubmissionV2(request, env, corsHeaders);
      }
      if (path === '/api/lead' && request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }
      // Support both /api/lead and /api/leads for POST
      if (path === '/api/leads' && request.method === 'POST') {
        return await handleLeadSubmissionV2(request, env, corsHeaders);
      }
      if (path === '/api/leads' && request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path === '/api/onboarding' && request.method === 'POST') {
        return await handleOnboardingSubmission(request, env, corsHeaders);
      }

      if (path === '/api/track' && request.method === 'POST') {
        return await handleTrackingData(request, env, corsHeaders);
      }

      if (path === '/api/jetsy-analytics' && request.method === 'POST') {
        return await handleJetsyAnalytics(request, env, corsHeaders);
      }

      if (path === '/api/leads' && request.method === 'GET') {
        return await getLeads(request, env, corsHeaders);
      }

      if (path === '/api/analytics' && request.method === 'GET') {
        return await getAnalytics(request, env, corsHeaders);
      }

      if (path === '/api/priority-access' && request.method === 'POST') {
        return await handlePriorityAccess(request, env, corsHeaders);
      }

      if (path === '/api/priority-access' && request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      // --- Simple password verification endpoint for /chat gating ---
      if (path === '/api/chat-password-verify' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const provided = String(body.password || '');
        const expected = (env.ADMIN_CHAT_PASSWORD || '').trim();
        if (!expected) {
          return new Response(JSON.stringify({ ok: false, error: 'not-configured' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        if (provided && provided === expected) {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        return new Response(JSON.stringify({ ok: false }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // --- Contact Submissions API ---
      if (path === '/api/contact' && request.method === 'POST') {
        return await handleContactSubmission(request, env, corsHeaders);
      }
      if (path === '/api/contact' && request.method === 'GET') {
        return await getContactSubmissions(request, env, corsHeaders);
      }
      if (path === '/api/contact' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Projects API ---
      if (path.startsWith('/api/projects')) {
        // Extract project id if present
        const projectIdMatch = path.match(/^\/api\/projects\/(\d+)$/);
        if (request.method === 'GET' && path === '/api/projects') {
          // GET /api/projects - list all projects for user
          return await getProjects(request, env, corsHeaders);
        }
        if (request.method === 'GET' && projectIdMatch) {
          // GET /api/projects/:id
          return await getProjectById(projectIdMatch[1], env, corsHeaders);
        }
        if (request.method === 'POST' && path === '/api/projects') {
          // POST /api/projects
          return await createProject(request, env, corsHeaders);
        }
        if (request.method === 'PUT' && projectIdMatch) {
          // PUT /api/projects/:id
          return await updateProjectFiles(projectIdMatch[1], request, env, corsHeaders);
        }
        if (request.method === 'DELETE' && projectIdMatch) {
          // DELETE /api/projects/:id
          return await deleteProject(projectIdMatch[1], env, corsHeaders);
        }
        if (request.method === 'OPTIONS') {
          return new Response(null, { status: 200, headers: corsHeaders });
        }
      }

      // --- Custom Domains API (Cloudflare Custom Hostnames integration) ---
      if (path === '/api/domain/resolve' && request.method === 'GET') {
        const hostHeader = request.headers.get('Host') || new URL(request.url).hostname;
        try {
          await ensureCustomDomainsTable(env);
          const row = await env.DB.prepare('SELECT project_id, status FROM custom_domains WHERE domain = ?').bind(hostHeader).first();
          const projectId = row && row.status === 'active' ? row.project_id : null;
          return new Response(JSON.stringify({ project_id: projectId }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } catch (e) {
          return new Response(JSON.stringify({ project_id: null }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
      }

      // List by project_id: GET /api/custom-domains?project_id=123
      if (path === '/api/custom-domains' && request.method === 'GET') {
        try {
          await ensureCustomDomainsTable(env);
          const urlObj = new URL(request.url);
          const projectIdParam = urlObj.searchParams.get('project_id');
          if (!projectIdParam) {
            return new Response(JSON.stringify({ domains: [] }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }
          const pid = parseInt(projectIdParam, 10);
          if (Number.isNaN(pid)) {
            return new Response(JSON.stringify({ domains: [] }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }
          const result = await env.DB.prepare('SELECT domain, project_id, user_id, status, created_at, verified_at FROM custom_domains WHERE project_id = ?')
            .bind(pid)
            .all();
          const rows = result?.results || result?.rows || [];
          return new Response(JSON.stringify({ domains: rows }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'list-failed', message: e?.message || String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
      }

      if (path === '/api/custom-domains' && request.method === 'POST') {
        try {
          await ensureCustomDomainsTable(env);
          const body = await request.json();
          const domain = String(body.domain || '').toLowerCase().trim();
          const projectId = Number(body.project_id);
          const userId = Number(body.user_id || 0);
          if (!domain || !projectId) {
            return new Response(JSON.stringify({ error: 'invalid-params' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }

          if (!env.CF_ZONE_ID || !env.CF_API_TOKEN) {
            console.error('Missing CF env: CF_ZONE_ID or CF_API_TOKEN not set');
            return new Response(JSON.stringify({ error: 'missing-cloudflare-env', detail: 'CF_ZONE_ID or CF_API_TOKEN not configured' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }

          // Upsert mapping row as pending
          await env.DB.prepare(
            'INSERT INTO custom_domains (domain, project_id, user_id, status) VALUES (?, ?, ?, COALESCE((SELECT status FROM custom_domains WHERE domain = ?), "pending")) ON CONFLICT(domain) DO UPDATE SET project_id=excluded.project_id, user_id=excluded.user_id'
          ).bind(domain, projectId, userId, domain).run();

          // Create custom hostname via CF API (DV CNAME)
          const cfReqBody = {
            hostname: domain,
            ssl: { type: 'dv', method: 'http' },
            custom_origin_server: 'sites.jetsy.dev',
            custom_origin_sni: 'sites.jetsy.dev'
          };
          console.log('Creating CF custom hostname', { zone: env.CF_ZONE_ID, domain, body: cfReqBody });
          const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/custom_hostnames`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.CF_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cfReqBody),
          });
          const cfText = await cfRes.text();
          let cfJson;
          try { cfJson = JSON.parse(cfText); } catch { cfJson = { raw: cfText }; }
          console.log('CF create response', { status: cfRes.status, ok: cfRes.ok, json: cfJson });

          // Best-effort status sync
          if (!cfRes.ok || cfJson?.success === false) {
            await env.DB.prepare('UPDATE custom_domains SET status = ? WHERE domain = ?').bind('failed', domain).run();
            return new Response(JSON.stringify({ ok: false, cf: cfJson }), { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }

          const status = (cfJson?.result?.status) || 'pending';
          await env.DB.prepare('UPDATE custom_domains SET status = ? WHERE domain = ?').bind(status, domain).run();

          return new Response(JSON.stringify({ ok: true, cf: cfJson }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } catch (e) {
          console.error('Error creating custom hostname', e);
          return new Response(JSON.stringify({ error: 'create-failed', message: e?.message || String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
      }

      const matchDomainStatus = path.match(/^\/api\/custom-domains\/(.+)$/);
      if (matchDomainStatus && request.method === 'GET') {
        try {
          await ensureCustomDomainsTable(env);
          const domain = decodeURIComponent(matchDomainStatus[1]).toLowerCase();
          const row = await env.DB.prepare('SELECT domain, project_id, user_id, status, created_at, verified_at FROM custom_domains WHERE domain = ?').bind(domain).first();
          if (!row) {
            return new Response(JSON.stringify({ error: 'not-found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }

          // Refresh status from CF (optional)
          const listRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(domain)}`, {
            headers: { 'Authorization': `Bearer ${env.CF_API_TOKEN}` },
          });
          const listText = await listRes.text();
          let listJson; try { listJson = JSON.parse(listText); } catch { listJson = { raw: listText }; }
          console.log('CF list response', { status: listRes.status, ok: listRes.ok, json: listJson });
          const latest = listJson?.result?.[0];
          // If pending with an id, nudge validation with PATCH per docs when HTTP method is used
          if (latest?.id) {
            try {
              const patchBody = {
                ssl: { type: 'dv', method: 'http' },
                custom_origin_server: 'sites.jetsy.dev',
                custom_origin_sni: 'sites.jetsy.dev'
              };
              const patchRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/custom_hostnames/${latest.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(patchBody),
              });
              const patchText = await patchRes.text();
              let patchJson; try { patchJson = JSON.parse(patchText); } catch { patchJson = { raw: patchText }; }
              console.log('CF patch response', { status: patchRes.status, ok: patchRes.ok, json: patchJson });
            } catch (e) {
              console.log('CF patch error', e?.message || String(e));
            }
          }
          // If CF has no record for this domain and our local status is not active, clean up local row and return 404
          if ((!latest || !Array.isArray(listJson?.result) || listJson.result.length === 0) && row.status !== 'active') {
            await env.DB.prepare('DELETE FROM custom_domains WHERE domain = ?').bind(domain).run();
            return new Response(JSON.stringify({ error: 'not-found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }
          if (latest?.status && latest.status !== row.status) {
            const now = new Date().toISOString();
            await env.DB.prepare('UPDATE custom_domains SET status = ?, verified_at = CASE WHEN ? = "active" THEN ? ELSE verified_at END WHERE domain = ?')
              .bind(latest.status, latest.status, now, domain).run();
            row.status = latest.status;
            if (latest.status === 'active') row.verified_at = now;
          }

          return new Response(JSON.stringify({ mapping: row, cf: listJson }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'status-failed', message: e?.message || String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
      }

      // Allow manual deletion
      if (matchDomainStatus && request.method === 'DELETE') {
        try {
          await ensureCustomDomainsTable(env);
          const domain = decodeURIComponent(matchDomainStatus[1]).toLowerCase();
          await env.DB.prepare('DELETE FROM custom_domains WHERE domain = ?').bind(domain).run();
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'delete-failed', message: e?.message || String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
      }
      // --- Chat Messages API ---
      if (path === '/api/chat_messages') {
        if (request.method === 'GET') {
          // GET /api/chat_messages?project_id=...
          return await getChatMessages(request, env, corsHeaders);
        }
        if (request.method === 'POST') {
          // POST /api/chat_messages
          return await addChatMessage(request, env, corsHeaders);
        }
        if (request.method === 'OPTIONS') {
          return new Response(null, { status: 200, headers: corsHeaders });
        }
      }

      // --- Template Generation API ---
      if (path === '/api/template-generate' && request.method === 'POST') {
        return await handleTemplateGeneration(request, env, corsHeaders);
      }
      if (path === '/api/template-generate' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- LLM Orchestration API ---
      if (path === '/api/llm-orchestrate' && request.method === 'POST') {
        return await handleLLMOrchestration(request, env, corsHeaders);
      }
      if (path === '/api/llm-orchestrate' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Image Generation API ---
      if (path === '/api/generate-image' && request.method === 'POST') {
        return await handleImageGeneration(request, env, corsHeaders);
      }
      if (path === '/api/generate-image' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Image Upload API (user-provided images e.g., logo) ---
      if (path === '/api/upload-image' && request.method === 'POST') {
        return await handleUploadImage(request, env, corsHeaders);
      }
      if (path === '/api/upload-image' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- R2 Test API ---
      if (path === '/api/test-r2-access' && request.method === 'GET') {
        return await handleTestR2Access(request, env, corsHeaders);
      }
      if (path === '/api/test-r2-access' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Image Management API ---
      if (path === '/api/images' && request.method === 'GET') {
        return await handleGetImages(request, env, corsHeaders);
      }
      if (path === '/api/images' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      if (path.match(/^\/api\/images\/[^\/]+$/) && request.method === 'GET') {
        return await handleGetImage(request, env, corsHeaders);
      }
      if (path.match(/^\/api\/images\/[^\/]+$/) && request.method === 'DELETE') {
        return await handleDeleteImage(request, env, corsHeaders);
      }
      if (path.match(/^\/api\/images\/[^\/]+$/) && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Image Serving API ---
      if (path.match(/^\/api\/serve-image\/[^\/]+$/) && request.method === 'GET') {
        return await handleServeImage(request, env, corsHeaders);
      }
      if (path.match(/^\/api\/serve-image\/[^\/]+$/) && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Smart Placeholder Generation API ---
      if (path === '/api/generate-placeholders' && request.method === 'POST') {
        return await handleGeneratePlaceholders(request, env, corsHeaders);
      }
      if (path === '/api/generate-placeholders' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Code Analysis API ---
      if (path === '/api/analyze-code' && request.method === 'POST') {
        return await handleAnalyzeCode(request, env, corsHeaders);
      }
      if (path === '/api/analyze-code' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- Multi-Task Parser API ---
      if (path === '/api/parse-multi-task' && request.method === 'POST') {
        return await handleParseMultiTask(request, env, corsHeaders);
      }
      if (path === '/api/parse-multi-task' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // --- File History & Restore API ---
      if (path === '/api/restore-web' && request.method === 'POST') {
        return await handleRestoreWeb(request, env, corsHeaders);
      }
      if (path === '/api/restore-web' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      if (path === '/api/backups' && request.method === 'GET') {
        return await handleGetBackups(request, env, corsHeaders);
      }
      if (path === '/api/backups' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      // Serve static files
      return await serveStaticFiles(request, env);

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};

// Ensure mapping table exists
async function ensureCustomDomainsTable(env) {
  if (!env?.DB) return;
  // Prefer simple, portable statements; avoid exec multi-stmt quirks
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS custom_domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL UNIQUE,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      verified_at TEXT
    )`).run();
  } catch (e) {
    // ignore if exists
  }
  try {
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_custom_domains_project ON custom_domains(project_id)`).run();
  } catch (e) {
    // ignore if exists
  }
}

// --- Admin auth helpers ---
function isAdminAuthorized(request) {
  const cookie = request.headers.get('Cookie') || '';
  return /admin_chat=1/.test(cookie);
}
function setAdminCookie(response) {
  const existing = response.headers.get('Set-Cookie');
  const cookie = 'admin_chat=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000';
  response.headers.set('Set-Cookie', existing ? existing + ', ' + cookie : cookie);
}
function clearAdminCookie(response) {
  const cookie = 'admin_chat=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
  response.headers.set('Set-Cookie', cookie);
}
// Store contact form submissions
async function handleContactSubmission(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { name, email, company, message, project_id, submitted_at } = body;
    if (!email || !message) {
      return new Response(JSON.stringify({ error: 'Email and message are required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    const db = env.DB;
    // Ensure table exists in dev/prod without manual migration
    await ensureContactSubmissionsTable(db);
    const now = submitted_at || new Date().toISOString();
    const pid = project_id || 1;
    const result = await db.prepare(
      `INSERT INTO contact_submissions (name, email, company, message, project_id, submitted_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(name || '', email, company || '', message, pid, now, now).run();
    if (!result.success) throw new Error('Insert failed');
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    console.error('Contact submission error:', err);
    return new Response(JSON.stringify({ error: 'Failed to store contact submission' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

// Get contact form submissions
async function getContactSubmissions(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const projectId = url.searchParams.get('project_id');
    const db = env.DB;
    // Ensure table exists; return empty if not present
    await ensureContactSubmissionsTable(db);
    let query = `SELECT id, name, email, company, message, project_id, submitted_at, created_at FROM contact_submissions`;
    const params = [];
    if (projectId) {
      query += ` WHERE project_id = ?`;
      params.push(parseInt(projectId, 10));
    }
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const result = await db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify({ success: true, submissions: result.results }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    console.error('Get contact submissions error:', err);
    return new Response(JSON.stringify({ error: 'Failed to retrieve contact submissions' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

// Ensure contact_submissions table and indexes exist
async function ensureContactSubmissionsTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT NOT NULL,
      company TEXT,
      message TEXT NOT NULL,
      project_id INTEGER,
      submitted_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_contact_project_id ON contact_submissions(project_id);`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_submissions(created_at);`).run();
}

// Handle lead submission with enhanced data
async function handleLeadSubmission(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { 
      email, 
      phone, 
      startupIdea, 
      visibility, 
      planType, 
      timestamp 
    } = body;

    // Validate required fields
    if (!email || !phone) {
      return new Response(JSON.stringify({ error: 'Email and phone are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const db = env.DB;
    const currentTime = new Date().toISOString();
    const ts = timestamp || Date.now();

    // Store lead in D1 database
    const leadResult = await db.prepare(
      "INSERT INTO leads (email, phone, ts, created_at) VALUES (?, ?, ?, ?)"
    ).bind(email, phone, ts, currentTime).run();

    if (!leadResult.success) {
      throw new Error('Failed to store lead');
    }

    const leadId = leadResult.meta.last_row_id;

    // Store startup idea if provided
    if (startupIdea) {
      const ideaResult = await db.prepare(
        "INSERT INTO ideas (lead_id, idea_name, idea_description, created_at) VALUES (?, ?, ?, ?)"
      ).bind(leadId, 'Startup Idea', startupIdea, currentTime).run();

      if (!ideaResult.success) {
        console.error('Failed to store idea, but lead was stored');
      }
    }

    // Store plan selection if provided
    if (planType) {
      const planResult = await db.prepare(
        "INSERT INTO plan_selections (lead_id, plan_type, selected_at, created_at) VALUES (?, ?, ?, ?)"
      ).bind(leadId, planType, currentTime, currentTime).run();

      if (!planResult.success) {
        console.error('Failed to store plan selection, but lead was stored');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Lead stored successfully',
      leadId: leadId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ Lead submission error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Failed to store lead', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

  // Add the new handler logic (align with functions/api/leads.js and UI expectations)
async function handleLeadSubmissionV2(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      startupIdea,
      visibility,
      planType,
      user_id, // New: allow user_id from request
      project_id, // New: allow project_id from request
      submitted_at // New: allow submitted_at from request
    } = body;

      // Validate required fields: phone is optional to support editor toggle
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const db = env.DB;
    const submissionTime = submitted_at || new Date().toISOString();
    const uid = user_id || 1;
    const pid = project_id || 1;

    // Store lead in D1 database
    const leadResult = await db.prepare(
      "INSERT INTO leads (email, phone, ts, user_id, project_id, submitted_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(email, phone || 'N/A', Date.now(), uid, pid, submissionTime, submissionTime).run();

    if (!leadResult.success) {
      throw new Error('Failed to store lead');
    }

    const leadId = leadResult.meta.last_row_id;

    // Store startup idea if provided
    if (startupIdea) {
      const ideaResult = await db.prepare(
        "INSERT INTO ideas (lead_id, idea_name, idea_description, created_at) VALUES (?, ?, ?, ?)"
      ).bind(leadId, 'Startup Idea', startupIdea, submissionTime).run();

      if (!ideaResult.success) {
        console.error('Failed to store idea, but lead was stored');
      }
    }

    // Store plan selection if provided
    if (planType) {
      const planResult = await db.prepare(
        "INSERT INTO plan_selections (lead_id, plan_type, selected_at, created_at) VALUES (?, ?, ?, ?)"
      ).bind(leadId, planType, submissionTime, submissionTime).run();

      if (!planResult.success) {
        console.error('Failed to store plan selection, but lead was stored');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Lead stored successfully',
      leadId: leadId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ Lead submission error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Failed to store lead', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Handle onboarding submission
async function handleOnboardingSubmission(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { 
      ideaTitle, 
      description, 
      audience, 
      validationGoal,
      leadId,
      planType, 
      timestamp 
    } = body;

    // Validate required fields
    if (!ideaTitle || !description || !audience || !validationGoal) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const db = env.DB;
    const currentTime = new Date().toISOString();

    // Update existing idea or create new one
    if (leadId) {
      const updateResult = await db.prepare(
        "UPDATE ideas SET idea_name = ?, idea_description = ? WHERE lead_id = ?"
      ).bind(ideaTitle, description, leadId).run();

      if (!updateResult.success) {
        console.error('Failed to update idea');
      }
    } else {
      // Create new idea entry
      const ideaResult = await db.prepare(
        "INSERT INTO ideas (idea_name, idea_description, created_at) VALUES (?, ?, ?)"
      ).bind(ideaTitle, description, currentTime).run();

      if (!ideaResult.success) {
        console.error('Failed to store idea');
      }
    }

    // Store additional onboarding data
    const onboardingResult = await db.prepare(
      "INSERT INTO onboarding_data (lead_id, audience, validation_goal, created_at) VALUES (?, ?, ?, ?)"
    ).bind(leadId || null, audience, validationGoal, currentTime).run();

    if (!onboardingResult.success) {
      console.error('Failed to store onboarding data');
    }

    // Store funnel completion
    const funnelResult = await db.prepare(
      "INSERT INTO funnel_completions (lead_id, plan_type, completed_at, created_at) VALUES (?, ?, ?, ?)"
    ).bind(leadId || null, planType || 'free', currentTime, currentTime).run();

    if (!funnelResult.success) {
      console.error('Failed to store funnel completion');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Onboarding data stored successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Onboarding submission error:', error);
    return new Response(JSON.stringify({ error: 'Failed to store onboarding data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Handle priority access attempts
async function handlePriorityAccess(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { email, phone, leadId } = body;

    // Validate required fields
    if (!email || !phone) {
      return new Response(JSON.stringify({ error: 'Email and phone are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const db = env.DB;
    const currentTime = new Date().toISOString();

    // Store priority access attempt in D1 database
    const result = await db.prepare(
      "INSERT INTO priority_access_attempts (lead_id, email, phone, attempted_at, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(leadId || null, email, phone, currentTime, currentTime).run();

    if (!result.success) {
      throw new Error('Failed to store priority access attempt');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Priority access attempt recorded',
      id: result.meta.last_row_id 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error processing priority access attempt:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Handle tracking data
async function handleTrackingData(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { 
      event, 
      data, 
      timestamp, 
      userAgent, 
      url,
      category,
      sessionId,
      pageTitle,
      referrer,
      websiteId,
      userId,
      jetsyGenerated = false
    } = body;

    // Validate required fields
    if (!event) {
      return new Response(JSON.stringify({ error: 'Event name is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Store tracking data in D1
    const db = env.DB;
    const currentTime = new Date().toISOString();
    const ts = timestamp || Date.now();

    // Insert into tracking_events table
    const result = await db.prepare(
      "INSERT INTO tracking_events (event_name, event_category, event_data, timestamp, user_agent, url, session_id, page_title, referrer, website_id, user_id, jetsy_generated, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      event,
      category || 'user_interaction',
      JSON.stringify(data || {}),
      ts,
      userAgent || '',
      url || '',
      sessionId || '',
      pageTitle || '',
      referrer || '',
      websiteId || null,
      userId || null,
      jetsyGenerated ? 1 : 0,
      currentTime
    ).run();

    if (!result.success) {
      throw new Error('Database insertion failed');
    }

    // Handle session tracking
    if (sessionId) {
      await handleSessionTracking(db, sessionId, websiteId, userId, currentTime);
    }

    // Handle conversion funnel tracking
    if (event.includes('funnel') || event.includes('conversion')) {
      await handleFunnelTracking(db, event, data, sessionId, websiteId, ts, currentTime);
    }

    // Handle performance tracking
    if (event === 'performance' || event === 'jetsy_performance') {
      await handlePerformanceTracking(db, data, websiteId, userAgent, url, ts, currentTime);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Tracking data stored successfully' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Tracking data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to store tracking data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Handle Jetsy analytics data
async function handleJetsyAnalytics(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { 
      websiteId, 
      userId, 
      sessionId, 
      event, 
      data, 
      timestamp, 
      userAgent, 
      url, 
      category, 
      pageTitle, 
      referrer, 
      jetsyGenerated = false
    } = body;

    // Validate required fields
    if (!websiteId || !userId || !sessionId || !event) {
      return new Response(JSON.stringify({ error: 'Website ID, User ID, Session ID, and Event are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const db = env.DB;
    const currentTime = new Date().toISOString();
    const ts = timestamp || Date.now();

    // Insert into tracking_events table
    const result = await db.prepare(
      "INSERT INTO tracking_events (event_name, event_category, event_data, timestamp, user_agent, url, session_id, page_title, referrer, website_id, user_id, jetsy_generated, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      event,
      category || 'user_interaction',
      JSON.stringify(data || {}),
      ts,
      userAgent || '',
      url || '',
      sessionId,
      pageTitle || '',
      referrer || '',
      websiteId,
      userId,
      jetsyGenerated ? 1 : 0,
      currentTime
    ).run();

    if (!result.success) {
      throw new Error('Database insertion failed for Jetsy analytics');
    }

    // Handle session tracking
    if (sessionId) {
      await handleSessionTracking(db, sessionId, websiteId, userId, currentTime);
    }

    // Handle conversion funnel tracking
    if (event.includes('funnel') || event.includes('conversion')) {
      await handleFunnelTracking(db, event, data, sessionId, websiteId, ts, currentTime);
    }

    // Handle performance tracking
    if (event === 'performance' || event === 'jetsy_performance') {
      await handlePerformanceTracking(db, data, websiteId, userAgent, url, ts, currentTime);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Jetsy analytics data stored successfully' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Jetsy analytics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to store Jetsy analytics data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Handle session tracking
async function handleSessionTracking(db, sessionId, websiteId, userId, currentTime) {
  try {
    // Check if session exists
    const existingSession = await db.prepare(
      "SELECT id FROM user_sessions WHERE session_id = ?"
    ).bind(sessionId).first();

    if (!existingSession) {
      // Create new session
      await db.prepare(
        "INSERT INTO user_sessions (session_id, website_id, user_id, started_at, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(sessionId, websiteId || null, userId || null, currentTime, currentTime).run();
    } else {
      // Update existing session with page view count
      await db.prepare(
        "UPDATE user_sessions SET page_views = page_views + 1, events_count = events_count + 1 WHERE session_id = ?"
      ).bind(sessionId).run();
    }
  } catch (error) {
    console.error('Session tracking error:', error);
  }
}

// Handle funnel tracking
async function handleFunnelTracking(db, event, data, sessionId, websiteId, timestamp, currentTime) {
  try {
    const funnelName = data?.funnel_name || 'general';
    const stepName = data?.step || event;
    const stepOrder = data?.step_number || 1;
    const stepData = JSON.stringify(data || {});

    await db.prepare(
      "INSERT INTO conversion_funnels (website_id, funnel_name, step_name, step_order, step_data, session_id, timestamp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      websiteId || null,
      funnelName,
      stepName,
      stepOrder,
      stepData,
      sessionId || '',
      timestamp,
      currentTime
    ).run();
  } catch (error) {
    console.error('Funnel tracking error:', error);
  }
}

// Handle performance tracking
async function handlePerformanceTracking(db, data, websiteId, userAgent, url, timestamp, currentTime) {
  try {
    if (data?.metrics && typeof data.metrics === 'object') {
      for (const [metricName, metricValue] of Object.entries(data.metrics)) {
        await db.prepare(
          "INSERT INTO website_performance (website_id, metric_name, metric_value, timestamp, user_agent, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          websiteId || null,
          metricName,
          metricValue,
          timestamp,
          userAgent || '',
          url || '',
          currentTime
        ).run();
      }
    }
  } catch (error) {
    console.error('Performance tracking error:', error);
  }
}

// Get leads (for admin purposes)
async function getLeads(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const projectId = url.searchParams.get('project_id');

    const db = env.DB;
    let query = `
      SELECT 
        l.id,
        l.email,
        l.phone,
        l.submitted_at,
        l.created_at,
        l.project_id
      FROM leads l
    `;
    const params = [];
    if (projectId) {
      query += ` WHERE l.project_id = ?`;
      params.push(parseInt(projectId, 10));
    }
    query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const result = await db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
      success: true, 
      leads: result.results,
      total: result.results.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Get leads error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve leads' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Get analytics data (for admin purposes)
async function getAnalytics(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date') || '2023-01-01';
    const endDate = url.searchParams.get('end_date') || new Date().toISOString().slice(0, 10);
    const websiteId = url.searchParams.get('website_id');
    const eventType = url.searchParams.get('event_type');

    const db = env.DB;

    let query = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN id END) as page_views,
        COUNT(DISTINCT CASE WHEN event_name = 'funnel_completion' THEN id END) as funnel_completions,
        COUNT(DISTINCT CASE WHEN event_name = 'conversion' THEN id END) as conversions,
        COUNT(DISTINCT CASE WHEN event_name = 'performance' THEN id END) as performance_metrics
      FROM tracking_events
      WHERE timestamp >= ? AND timestamp <= ?
    `;

    const params = [startDate, endDate];

    if (websiteId) {
      query += ` AND website_id = ?`;
      params.push(websiteId);
    }

    if (eventType) {
      query += ` AND event_name = ?`;
      params.push(eventType);
    }

    query += ` GROUP BY date ORDER BY date`;

    const result = await db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
      success: true, 
      analytics: result.results,
      total: result.results.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve analytics data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// --- Projects Handlers ---
async function getProjects(request, env, corsHeaders) {
  const db = env.DB;
  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id') || 1; // Default to user_id 1 for now
    
    const result = await db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').bind(user_id).all();
    return new Response(JSON.stringify({ success: true, projects: result.results }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), { status: 500, headers: corsHeaders });
  }
}

async function getProjectById(id, env, corsHeaders) {
  const db = env.DB;
  try {
    const result = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    if (!result) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true, project: result }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch project' }), { status: 500, headers: corsHeaders });
  }
}

async function createProject(request, env, corsHeaders) {
  const db = env.DB;
  try {
    const { project_name, files, user_id = 1, template_data } = await request.json();
    if (!project_name || !files) {
      return new Response(JSON.stringify({ error: 'project_name and files are required' }), { status: 400, headers: corsHeaders });
    }
    const now = new Date().toISOString();
    
    let query, params;
    if (template_data) {
      query = 'INSERT INTO projects (user_id, project_name, files, template_data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
      params = [user_id, project_name, JSON.stringify(files), JSON.stringify(template_data), now, now];
    } else {
      query = 'INSERT INTO projects (user_id, project_name, files, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
      params = [user_id, project_name, JSON.stringify(files), now, now];
    }
    
    const result = await db.prepare(query).bind(...params).run();
    if (!result.success) {
      throw new Error('Failed to create project');
    }
    return new Response(JSON.stringify({ success: true, project_id: result.meta.last_row_id }), { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('createProject error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create project', details: error.message, stack: error.stack }), { status: 500, headers: corsHeaders });
  }
}

async function updateProjectFiles(id, request, env, corsHeaders) {
  const db = env.DB;
  try {
    const { files, project_name, template_data } = await request.json();
    if (!files && !project_name && !template_data) {
      return new Response(JSON.stringify({ error: 'files, project_name, or template_data are required' }), { status: 400, headers: corsHeaders });
    }
    const now = new Date().toISOString();
    
    let query, params;
    if (files && project_name && template_data) {
      query = 'UPDATE projects SET files = ?, project_name = ?, template_data = ?, updated_at = ? WHERE id = ?';
      params = [JSON.stringify(files), project_name, JSON.stringify(template_data), now, id];
    } else if (files && project_name) {
      query = 'UPDATE projects SET files = ?, project_name = ?, updated_at = ? WHERE id = ?';
      params = [JSON.stringify(files), project_name, now, id];
    } else if (files && template_data) {
      query = 'UPDATE projects SET files = ?, template_data = ?, updated_at = ? WHERE id = ?';
      params = [JSON.stringify(files), JSON.stringify(template_data), now, id];
    } else if (project_name && template_data) {
      query = 'UPDATE projects SET project_name = ?, template_data = ?, updated_at = ? WHERE id = ?';
      params = [project_name, JSON.stringify(template_data), now, id];
    } else if (files) {
      query = 'UPDATE projects SET files = ?, updated_at = ? WHERE id = ?';
      params = [JSON.stringify(files), now, id];
    } else if (project_name) {
      query = 'UPDATE projects SET project_name = ?, updated_at = ? WHERE id = ?';
      params = [project_name, now, id];
    } else if (template_data) {
      query = 'UPDATE projects SET template_data = ?, updated_at = ? WHERE id = ?';
      params = [JSON.stringify(template_data), now, id];
    }
    
    const result = await db.prepare(query).bind(...params).run();
    if (!result.success) {
      throw new Error('Failed to update project');
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update project' }), { status: 500, headers: corsHeaders });
  }
}

async function deleteProject(id, env, corsHeaders) {
  const db = env.DB;
  try {
    console.log('🗑️ Deleting project:', id);
    
    // First delete all chat messages for this project
    const chatDeleteResult = await db.prepare('DELETE FROM chat_messages WHERE project_id = ?').bind(id).run();
    console.log('Chat messages deleted:', chatDeleteResult.meta.changes);
    
    // Then delete the project
    const result = await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
    console.log('Project delete result:', result);
    
    if (!result.success) {
      throw new Error('Failed to delete project');
    }
    
    console.log('✅ Project deleted successfully');
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete project' }), { status: 500, headers: corsHeaders });
  }
}
// --- Chat Messages Handlers ---
async function getChatMessages(request, env, corsHeaders) {
  const db = env.DB;
  try {
    const url = new URL(request.url);
    const project_id = url.searchParams.get('project_id');
    if (!project_id) {
      return new Response(JSON.stringify({ error: 'project_id is required' }), { status: 400, headers: corsHeaders });
    }
    const result = await db.prepare('SELECT * FROM chat_messages WHERE project_id = ? ORDER BY timestamp ASC').bind(project_id).all();
    return new Response(JSON.stringify({ success: true, messages: result.results }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch chat messages' }), { status: 500, headers: corsHeaders });
  }
}

async function addChatMessage(request, env, corsHeaders) {
  const db = env.DB;
  try {
    const { project_id, role, message, clarification_state, is_initial_message } = await request.json();
    if (!project_id || !role || !message) {
      return new Response(JSON.stringify({ error: 'project_id, role, and message are required' }), { status: 400, headers: corsHeaders });
    }
    const now = new Date().toISOString();
    console.log('📝 Adding chat message:', { project_id, role, message: message.substring(0, 100) + '...', is_initial_message });
    const result = await db.prepare('INSERT INTO chat_messages (project_id, role, message, timestamp, clarification_state, is_initial_message) VALUES (?, ?, ?, ?, ?, ?)').bind(project_id, role, message, now, clarification_state || null, is_initial_message || false).run();
    if (!result.success) {
      console.error('❌ Database insert failed:', result);
      throw new Error('Failed to add chat message');
    }
    console.log('✅ Chat message added successfully:', result.meta.last_row_id);
    return new Response(JSON.stringify({ success: true, message_id: result.meta.last_row_id }), { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('❌ addChatMessage error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Failed to add chat message', details: error.message }), { status: 500, headers: corsHeaders });
  }
}

// --- LLM Orchestration Handler ---
async function handleLLMOrchestration(request, env, corsHeaders) {
  try {
    // Reset cost tracking for this request
    totalCost = {
      nano: { input_tokens: 0, output_tokens: 0, cost: 0 },
      mini: { input_tokens: 0, output_tokens: 0, cost: 0 },
      total: 0
    };
    
    const { project_id, user_message, current_files } = await request.json();
    
    if (!project_id || !user_message) {
      return new Response(JSON.stringify({ error: 'project_id and user_message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Only use the secret from env.OPENAI_API_KEY. Do not use any fallback.
    if (!env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required but not found. Please configure OPENAI_API_KEY as a Wrangler secret (npx wrangler secret put OPENAI_API_KEY) or use a .dev.vars file for local development.');
    }
    const apiKey = env.OPENAI_API_KEY;

    // Fetch current project files from database if not provided
    let projectFiles = current_files;
    let projectExists = false;
    
    if (!projectFiles) {
      console.log('📁 Fetching project files from database...');
      const stmt = env.DB.prepare('SELECT files FROM projects WHERE id = ?');
      const result = await stmt.bind(project_id).first();
      if (result) {
        projectFiles = JSON.parse(result.files);
        projectExists = true;
      } else {
        console.log('📁 Project not found, creating new project...');
        projectFiles = {};
        // Create the project in the database
        const now = new Date().toISOString();
        const createResult = await env.DB.prepare(
          'INSERT INTO projects (user_id, project_name, files, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(1, project_id, JSON.stringify(projectFiles), now, now).run();
        
        if (createResult.success) {
          projectExists = true;
          console.log('✅ Project created successfully');
        } else {
          console.log('⚠️ Failed to create project, continuing without database storage');
        }
      }
    }

    // === FILE HISTORY SYSTEM ===
    // Create a backup of current files before making changes
    const backupFiles = JSON.parse(JSON.stringify(projectFiles));
    const backupTimestamp = new Date().toISOString();
    const backupId = generateBackupId();
    
    // Store backup in database
    await storeFileBackup(project_id, backupId, backupFiles, backupTimestamp, user_message, env);
    
    // === INTELLIGENT SECTION DETECTION ===
    const sectionAnalysis = await analyzeUserRequest(user_message, projectFiles, env, project_id);
    
    // Check if we need to ask for clarification
    if (sectionAnalysis.needsClarification) {
      const currentQuestion = sectionAnalysis.clarificationQuestions[sectionAnalysis.currentQuestionIndex];
      const questionNumber = sectionAnalysis.currentQuestionIndex + 1;
      const totalQuestions = sectionAnalysis.clarificationQuestions.length;
      
      const clarificationResponse = {
        needs_clarification: true,
        clarification_questions: sectionAnalysis.clarificationQuestions,
        current_question: currentQuestion,
        current_question_index: sectionAnalysis.currentQuestionIndex,
        clarification_answers: sectionAnalysis.clarificationAnswers,
        message: `Great! Let's build your perfect landing page. ${currentQuestion.question}`,
        updated_files: projectFiles,
        image_requests: [],
        generated_images: [],
        backup_id: backupId,
        backup_timestamp: backupTimestamp,
        can_restore: false,
        business_info: null
      };
      
      return new Response(JSON.stringify(clarificationResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Use the isInitialPrompt from sectionAnalysis instead of recalculating
    const isInitialPrompt = sectionAnalysis.operationType === 'create';
    
    // For initial prompts, ALWAYS generate images regardless of user message content
    // For subsequent prompts, only generate images if user explicitly requests them
    const isImageRequest = isInitialPrompt || 
                          user_message.trim() === '' || 
                          user_message.toLowerCase().includes('image') || 
                          user_message.toLowerCase().includes('photo') || 
                          user_message.toLowerCase().includes('picture') ||
                          user_message.toLowerCase().includes('add') && user_message.toLowerCase().includes('image') ||
                          user_message.toLowerCase().includes('new') && user_message.toLowerCase().includes('image') ||
                          user_message.toLowerCase().includes('generate') && user_message.toLowerCase().includes('image');
    
    // Detect specific section requests
    const sectionKeywords = {
      'hero': ['hero', 'main', 'header', 'banner'],
      'about': ['about', 'about us', 'about section'],
      'features': ['feature', 'features', 'feature section'],
      'contact': ['contact', 'contact us', 'contact section'],
      'gallery': ['gallery', 'photos', 'images'],
      'logo': ['logo', 'brand', 'branding']
    };
    
    let requestedSections = [];
    const userMessageLower = user_message.toLowerCase();
    
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => userMessageLower.includes(keyword))) {
        requestedSections.push(section);
      }
    }
    
    // If no specific section mentioned but image request, try to infer from context
    if (isImageRequest && requestedSections.length === 0) {
      // Look for custom section names in the user message
      const customSectionMatch = userMessageLower.match(/(?:create|add|new)\s+(?:a\s+)?(?:new\s+)?(?:section\s+)?(?:called\s+)?([a-zA-Z]+)/);
      if (customSectionMatch) {
        requestedSections = [customSectionMatch[1].toLowerCase()];
      }
    }
    
    // Generate smart placeholders based on detected sections
    const generateSmartPlaceholders = (sections) => {
      const placeholders = [];
      sections.forEach(section => {
        switch(section) {
          case 'hero':
            placeholders.push('{GENERATED_IMAGE_URL_HERO}');
            break;
          case 'logo':
            placeholders.push('{GENERATED_IMAGE_URL_LOGO}');
            break;
          case 'about':
            placeholders.push('{GENERATED_IMAGE_URL_ABOUT}');
            break;
          case 'features':
            placeholders.push('{GENERATED_IMAGE_URL_FEATURE_1}', '{GENERATED_IMAGE_URL_FEATURE_2}', '{GENERATED_IMAGE_URL_FEATURE_3}');
            break;
          case 'contact':
            placeholders.push('{GENERATED_IMAGE_URL_CONTACT}');
            break;
          case 'gallery':
            placeholders.push('{GENERATED_IMAGE_URL_GALLERY}');
            break;
          default:
            placeholders.push(`{GENERATED_IMAGE_URL_${section.toUpperCase()}}`);
        }
      });
      return placeholders;
    };
    
    // Generate creative image prompts based on business type and section
    const generateCreativeImagePrompts = (businessType, businessName, section) => {
      const prompts = {
        hero: {
          ecommerce_fashion: `A stunning hero image showcasing ${businessName} fashion collection with modern models, elegant styling, and premium fashion photography`,
          mobile_app: `A dynamic hero image featuring ${businessName} mobile app interface with smartphone mockups, modern UI design, and tech-savvy users`,
          consulting_service: `A professional hero image representing ${businessName} consulting services with business professionals, strategic planning, and corporate excellence`,
          online_education: `An inspiring hero image for ${businessName} online learning platform with students, digital education, and knowledge empowerment`,
          real_estate: `A beautiful hero image showcasing ${businessName} real estate with luxury properties, modern homes, and dream living spaces`,
          healthcare_wellness: `A warm and caring hero image for ${businessName} healthcare services with medical professionals, wellness, and health-focused environment`,
          creative_agency: `A creative and vibrant hero image for ${businessName} design agency with artistic elements, creative workspace, and innovative design`,
          subscription_box: `An exciting hero image for ${businessName} subscription service with curated products, unboxing experience, and monthly surprises`,
          local_service: `A trustworthy hero image for ${businessName} local services with professional workers, quality craftsmanship, and community focus`,
          bar_restaurant: `A stunning hero image for ${businessName} restaurant/bar with elegant dining atmosphere, delicious food presentation, and inviting ambiance`,
          saas_b2b: `A modern hero image for ${businessName} business software with enterprise technology, data visualization, and business growth`
        },
        logo: {
          ecommerce_fashion: `Abstract, text-free logo mark for ${businessName}. Unique, memorable symbol only (no letters, no words, no typography). Minimal modern vector emblem, clean geometric forms, flat scalable design, strong silhouette, 1:1`,
          mobile_app: `Abstract, text-free logo mark for ${businessName}. Unique symbol only; clean geometric icon, modern minimal vector, scalable, 1:1`,
          consulting_service: `Abstract, text-free logo mark for ${businessName}. Trustworthy, professional symbol only, minimal vector, geometric, 1:1`,
          online_education: `Abstract, text-free logo mark for ${businessName}. Learning-inspired symbol only, minimal vector, geometric, 1:1`,
          real_estate: `Abstract, text-free logo mark for ${businessName}. Home/shelter feeling via geometry, symbol only, minimal vector, 1:1`,
          healthcare_wellness: `Abstract, text-free logo mark for ${businessName}. Care/wellness feeling via shapes, symbol only, minimal vector, 1:1`,
          creative_agency: `Abstract, text-free logo mark for ${businessName}. Creative, bold symbol only, minimal vector, geometric, 1:1`,
          subscription_box: `Abstract, text-free logo mark for ${businessName}. Discovery/curation feeling, symbol only, minimal vector, 1:1`,
          local_service: `Abstract, text-free logo mark for ${businessName}. Reliable helpful feeling, symbol only, minimal vector, 1:1`,
          bar_restaurant: `Abstract, text-free logo mark for ${businessName}. Hospitality/culinary feeling, symbol only, minimal vector, 1:1`,
          saas_b2b: `Abstract, text-free logo mark for ${businessName}. Tech/efficiency feeling, symbol only, minimal vector, 1:1`
        },
        feature_1: {
          ecommerce_fashion: `A feature icon representing fashion curation and style recommendations for ${businessName}`,
          mobile_app: `A feature icon representing task management and productivity for ${businessName} app`,
          consulting_service: `A feature icon representing strategic planning and business growth for ${businessName}`,
          online_education: `A feature icon representing interactive learning and skill development for ${businessName}`,
          real_estate: `A feature icon representing property search and real estate services for ${businessName}`,
          healthcare_wellness: `A feature icon representing health monitoring and wellness services for ${businessName}`,
          creative_agency: `A feature icon representing creative design and branding services for ${businessName}`,
          subscription_box: `A feature icon representing curated products and monthly surprises for ${businessName}`,
          local_service: `A feature icon representing professional service and local expertise for ${businessName}`,
          bar_restaurant: `A feature icon representing exceptional cuisine and dining experience for ${businessName}`,
          saas_b2b: `A feature icon representing business automation and enterprise solutions for ${businessName}`
        },
        feature_2: {
          ecommerce_fashion: `A feature icon representing personalized shopping and fashion advice for ${businessName}`,
          mobile_app: `A feature icon representing collaboration and team productivity for ${businessName} app`,
          consulting_service: `A feature icon representing market analysis and competitive insights for ${businessName}`,
          online_education: `A feature icon representing expert instructors and mentorship for ${businessName}`,
          real_estate: `A feature icon representing virtual tours and property visualization for ${businessName}`,
          healthcare_wellness: `A feature icon representing telemedicine and remote care for ${businessName}`,
          creative_agency: `A feature icon representing digital marketing and brand strategy for ${businessName}`,
          subscription_box: `A feature icon representing quality products and value for money for ${businessName}`,
          local_service: `A feature icon representing quick response and reliable service for ${businessName}`,
          bar_restaurant: `A feature icon representing warm hospitality and customer service for ${businessName}`,
          saas_b2b: `A feature icon representing data analytics and business intelligence for ${businessName}`
        },
        feature_3: {
          ecommerce_fashion: `A feature icon representing secure payments and seamless shopping for ${businessName}`,
          mobile_app: `A feature icon representing data sync and cloud storage for ${businessName} app`,
          consulting_service: `A feature icon representing implementation support and ongoing guidance for ${businessName}`,
          online_education: `A feature icon representing certification and achievement tracking for ${businessName}`,
          real_estate: `A feature icon representing financing options and mortgage assistance for ${businessName}`,
          healthcare_wellness: `A feature icon representing preventive care and health education for ${businessName}`,
          creative_agency: `A feature icon representing project management and client collaboration for ${businessName}`,
          subscription_box: `A feature icon representing customer support and satisfaction for ${businessName}`,
          local_service: `A feature icon representing warranty and quality assurance for ${businessName}`,
          bar_restaurant: `A feature icon representing fresh ingredients and quality dining for ${businessName}`,
          saas_b2b: `A feature icon representing integration and scalability for ${businessName}`
        },
        about: {
          ecommerce_fashion: `An about section image showcasing ${businessName} brand story and fashion philosophy`,
          mobile_app: `An about section image representing ${businessName} app development and user experience`,
          consulting_service: `An about section image showing ${businessName} team expertise and company values`,
          online_education: `An about section image representing ${businessName} educational mission and learning approach`,
          real_estate: `An about section image showcasing ${businessName} real estate expertise and community involvement`,
          healthcare_wellness: `An about section image representing ${businessName} healthcare mission and patient care philosophy`,
          creative_agency: `An about section image showing ${businessName} creative process and design philosophy`,
          subscription_box: `An about section image representing ${businessName} curation process and product selection`,
          local_service: `An about section image showcasing ${businessName} local roots and community commitment`,
          bar_restaurant: `An about section image showcasing ${businessName} culinary story and chef expertise`,
          saas_b2b: `An about section image representing ${businessName} technology innovation and business solutions`
        },
        contact: {
          ecommerce_fashion: `A contact section image representing customer service and support for ${businessName} fashion`,
          mobile_app: `A contact section image representing user support and feedback for ${businessName} app`,
          consulting_service: `A contact section image representing client consultation and partnership for ${businessName}`,
          online_education: `A contact section image representing student support and guidance for ${businessName}`,
          real_estate: `A contact section image representing client consultation and property guidance for ${businessName}`,
          healthcare_wellness: `A contact section image representing patient care and medical consultation for ${businessName}`,
          creative_agency: `A contact section image representing client collaboration and project discussion for ${businessName}`,
          subscription_box: `A contact section image representing customer service and product support for ${businessName}`,
          local_service: `A contact section image representing local consultation and service coordination for ${businessName}`,
          bar_restaurant: `A contact section image representing reservation booking and customer service for ${businessName}`,
          saas_b2b: `A contact section image representing business consultation and technical support for ${businessName}`
        }
      };
      
      return prompts[section]?.[businessType] || `A professional image for the ${section} section of ${businessName}`;
    };



    // === ENHANCED PROMPT ENGINEERING USING ACE METHOD ===
    // Approach: Visualize targeted changes only
    // Instructions: Clear, specific section targeting
    // Requirements: Non-negotiable preservation rules
    
    const enhancedPrompt = buildEnhancedPrompt(user_message, projectFiles, sectionAnalysis, isInitialPrompt);
    
    // Call OpenAI with enhanced prompt
    console.log(`🤖 Calling OpenAI with targeted editing analysis...`);
    console.log(`   - Is targeted edit: ${sectionAnalysis.isTargetedEdit}`);
    console.log(`   - Edit scope: ${sectionAnalysis.editScope}`);
    console.log(`   - Target sections: ${sectionAnalysis.targetSections.join(', ') || 'none'}`);
    
    const response = await callOpenAI(user_message, projectFiles, { ...env, OPENAI_API_KEY: apiKey }, null, null, null, enhancedPrompt);
    
    // === TARGETED CODE UPDATES ===
    if (response.updated_files) {
      console.log(`🎯 Applying targeted updates to preserve existing code...`);
      response.updated_files = await applyTargetedUpdates(response.updated_files, projectFiles, sectionAnalysis, env);
    }
    
    // === INTELLIGENT IMAGE GENERATION ===
    if (response.image_requests && response.image_requests.length > 0) {
      if (isInitialPrompt) {
        console.log('🎨 Generating images for initial prompt:', response.image_requests.length, 'images');
        
        // Always use web-searched prompts (with resilient internal fallback inside the function)
        const searched = await generateWebSearchedBackgroundPrompts(sectionAnalysis.comprehensivePrompt || user_message, sectionAnalysis.businessType, sectionAnalysis.businessInfo.name, env);
        const heroBackgroundPrompt = searched.hero_background_prompt;
        const aboutBackgroundPrompt = searched.about_background_prompt;
        
        response.image_requests.push(
          {
            prompt: heroBackgroundPrompt,
            aspect_ratio: '16:9',
            placement: 'hero_background'
          },
          {
            prompt: aboutBackgroundPrompt,
            aspect_ratio: '16:9',
            placement: 'about_background'
          }
        );
        
        console.log('🎨 Added background image requests for initial prompt');
      } else {
        // Filter image requests to only target requested sections
        let filteredImageRequests = response.image_requests.filter(request => {
          const requestPlacement = request.placement?.toLowerCase();
          return requestedSections.length === 0 || 
                 requestedSections.some(section => 
                   requestPlacement?.includes(section) || 
                   requestPlacement === section
                 );
        });
        
        if (filteredImageRequests.length === 0) {
          // If no matching requests found, create a new request for the first requested section
          const firstSection = requestedSections[0];
          const businessName = sectionAnalysis.businessInfo.name;
          const creativePrompt = `A high-quality, relevant image for the ${firstSection} section of ${businessName}, cohesive with the brand style, visually clear, and production-ready`;
          filteredImageRequests = [{
            prompt: creativePrompt,
            aspect_ratio: '4:3',
            placement: firstSection
          }];
        }
        
        response.image_requests = filteredImageRequests;
        console.log('🎨 Generating targeted images for sections:', requestedSections);
      }
      
      const generatedImages = [];
      
      for (const imageRequest of response.image_requests) {
        try {
          // Use the prompt provided by the LLM when available; otherwise build a simple, section-aware prompt
          const businessName = sectionAnalysis.businessInfo.name;
          const creativePrompt = imageRequest.prompt || `A high-quality, relevant image for the ${imageRequest.placement} section of ${businessName}, cohesive with the brand style, visually clear, and production-ready${imageRequest.placement === 'logo' ? ' — abstract, text-free symbol only (no letters, no words)' : ''}`;
          
          const imageResponse = await fetch(`${new URL(request.url).origin}/api/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: project_id,
              prompt: creativePrompt,
              aspect_ratio: imageRequest.aspect_ratio || '1:1',
              number_of_images: 1
            })
          });
          
          if (imageResponse.ok) {
            const imageResult = await imageResponse.json();
            if (imageResult.success && imageResult.images.length > 0) {
              generatedImages.push({
                ...imageResult.images[0],
                placement: imageRequest.placement
              });
              
                  // === INTELLIGENT IMAGE PLACEMENT ===
    if (imageRequest.placement && response.updated_files) {
      console.log(`🎯 Attempting to place image for: ${imageRequest.placement}`);
      console.log(`📄 Generated code preview:`, response.updated_files['src/App.jsx']?.substring(0, 1000));
      await replaceImageInSection(response.updated_files, imageRequest.placement, imageResult.images[0].url, projectFiles);
    }
            }
          }
        } catch (error) {
          console.error('Failed to generate image:', error);
          // Continue with other images even if one fails
        }
      }
      
      response.generated_images = generatedImages;
    } else if (!isInitialPrompt) {
      console.log('🎨 No image requests - keeping existing images');
    }
    
    // Add backup information to response
    response.backup_id = backupId;
    response.backup_timestamp = backupTimestamp;
    response.can_restore = true;
    
    // Add detected business info to response
    response.business_info = sectionAnalysis.businessInfo;
    
    // Log business info
    console.log('🏢 Business info detected:', response.business_info);
    
    // Log total cost for this request
    logTotalCost();
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to process LLM request',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Cost tracking for AI system
let totalCost = {
  nano: { input_tokens: 0, output_tokens: 0, cost: 0 },
  mini: { input_tokens: 0, output_tokens: 0, cost: 0 },
  total: 0
};

// Pricing constants (per 1M tokens)
const PRICING = {
  nano: {
    input: 0.10,    // $0.10 per 1M input tokens (GPT-4.1-nano)
    output: 0.40    // $0.40 per 1M output tokens (GPT-4.1-nano)
  },
  mini: {
    input: 1.10,    // $1.10 per 1M input tokens (GPT-4o-mini)
    output: 4.40    // $4.40 per 1M output tokens (GPT-4o-mini)
  }
};

// Calculate cost from tokens
function calculateCost(inputTokens, outputTokens, model) {
  const inputCost = (inputTokens / 1000000) * PRICING[model].input;
  const outputCost = (outputTokens / 1000000) * PRICING[model].output;
  return inputCost + outputCost;
}

// Log total cost
function logTotalCost() {
  console.log('💰 COST BREAKDOWN:');
  console.log(`   GPT-4o-mini: ${totalCost.mini.input_tokens} input + ${totalCost.mini.output_tokens} output tokens = $${totalCost.mini.cost.toFixed(6)}`);
  console.log(`   TOTAL COST: $${totalCost.total.toFixed(6)}`);
}

// Stage 1: GPT-4.1 Nano for task parsing and preprocessing
async function callOpenAINano(userMessage, env) {
  const openaiUrl = 'https://api.openai.com/v1/responses';
  
            const nanoPrompt = `USER REQUEST: ${userMessage}

CRITICAL SYSTEM REQUIREMENTS:
- You MUST respond with ONLY valid JSON
- No explanations, no markdown formatting, no code blocks
- No additional text before or after the JSON
- The response must be parseable by JSON.parse()
- If you cannot parse the request, return a valid JSON with error information

TASK PARSING INSTRUCTIONS:
1. Identify if this is a single task or multi-step request
2. For multi-step requests, break them down into individual tasks
3. For each task, identify:
   - Task type (add_section, delete_section, add_image, change_text, etc.)
   - Target section (hero, about, features, contact, etc.)
   - Task details (what specifically to change)
   - Priority order

4. Detect task separators like "then", "next", "also", "after that", semicolons, etc.

5. Handle task dependencies (e.g., don't modify sections that will be deleted)

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no code blocks.

OUTPUT FORMAT (JSON ONLY):
{
  "is_multi_step": true/false,
  "total_tasks": number,
  "tasks": [
    {
      "id": 1,
      "type": "task_type",
      "section": "section_name",
      "details": "specific_changes",
      "priority": 1
    }
  ],
  "processed_prompt": "cleaned_and_structured_prompt_for_stage_2"
}

Examples:
- "add image to About section" → {"is_multi_step": false, "total_tasks": 1, "tasks": [{"id": 1, "type": "add_image", "section": "about", "details": "add image to About section", "priority": 1}], "processed_prompt": "add image to About section"}
- "add image to About section, then change text in Hero section" → {"is_multi_step": true, "total_tasks": 2, "tasks": [{"id": 1, "type": "add_image", "section": "about", "details": "add image to About section", "priority": 1}, {"id": 2, "type": "change_text", "section": "hero", "details": "change text in Hero section", "priority": 2}], "processed_prompt": "add image to About section, then change text in Hero section"}

Parse this request and return ONLY the JSON object.`;

  try {
    console.log('📤 Sending request to OpenAI GPT-4.1-nano API for task parsing...');
    
              const response = await fetch(openaiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'responses=v1'
            },
            body: JSON.stringify({
              model: 'gpt-4.1-nano',
              input: [
                {
                  "role": "system",
                  "content": [
                    {
                      "type": "input_text",
                      "text": "You are a task parser and preprocessor. Your job is to analyze user requests and break them down into structured tasks."
                    }
                  ]
                },
                {
                  "role": "user",
                  "content": [
                    {
                      "type": "input_text",
                      "text": nanoPrompt
                    }
                  ]
                }
              ],
              text: {
                format: {
                  type: 'text'
                }
              },
              reasoning: {},
              tools: [],
              temperature: 0.1, // Low temperature for consistent parsing
              max_output_tokens: 2048,
              top_p: 1,
              store: false
            })
          });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI GPT-4.1-nano API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

                const data = await response.json();
            console.log('✅ OpenAI GPT-4.1-nano API call successful for task parsing');
                console.log('📊 GPT-4.1-nano response structure:', {
      has_choices: !!data.choices,
      has_content: !!data.content,
      has_text: !!data.text,
      has_output: !!data.output,
      response_keys: Object.keys(data)
    });
    
    if (data.output && data.output.length > 0) {
      console.log('🔍 data.output[0] structure:', {
        id: data.output[0].id,
        type: data.output[0].type,
        role: data.output[0].role,
        content_length: data.output[0].content?.length || 0,
        content_types: data.output[0].content?.map(c => c.type) || []
      });
    }
    
    // Track token usage and calculate cost
    if (data.usage) {
      totalCost.nano.input_tokens = data.usage.input_tokens || 0;
      totalCost.nano.output_tokens = data.usage.output_tokens || 0;
      totalCost.nano.cost = calculateCost(totalCost.nano.input_tokens, totalCost.nano.output_tokens, 'nano');
      totalCost.total += totalCost.nano.cost;
      
      console.log('💰 GPT-4.1-nano cost:', {
        input_tokens: totalCost.nano.input_tokens,
        output_tokens: totalCost.nano.output_tokens,
        cost: `$${totalCost.nano.cost.toFixed(6)}`
      });
    }
    
                                // Parse the response - NO FALLBACK, FAIL FAST
    let responseContent;
    
    // According to OpenAI Responses API documentation:
    // The response is in data.output[0].content[0].text
    if (data.output && data.output.length > 0 && 
        data.output[0].content && data.output[0].content.length > 0 && 
        data.output[0].content[0].text) {
      // Correct Responses API format
      responseContent = data.output[0].content[0].text;
    } else if (data.text && typeof data.text === 'string') {
      // Direct text response (fallback)
      responseContent = data.text;
    } else {
      console.error('❌ Unexpected GPT-4.1-nano response structure:', data);
      console.log('🔍 Available data keys:', Object.keys(data));
      if (data.output) {
        console.log('🔍 data.output structure:', JSON.stringify(data.output, null, 2));
      }
      if (data.text) console.log('🔍 data.text type:', typeof data.text, data.text);
      throw new Error('Unexpected GPT-4.1-nano response structure - missing output[0].content[0].text');
    }
            
            console.log('📝 GPT-4.1-nano raw response:', responseContent);
            
            // Validate JSON response
            if (!responseContent.trim().startsWith('{')) {
              throw new Error(`GPT-4.1-nano did not return JSON. Response: ${responseContent.substring(0, 100)}...`);
            }
            
            const parsedResult = JSON.parse(responseContent);
            
            // Validate required fields
            if (!parsedResult.hasOwnProperty('is_multi_step') || !parsedResult.hasOwnProperty('total_tasks') || !parsedResult.hasOwnProperty('tasks')) {
              throw new Error(`GPT-4.1-nano returned invalid JSON structure. Missing required fields. Response: ${JSON.stringify(parsedResult)}`);
            }
            
            // Validate data types
            if (typeof parsedResult.is_multi_step !== 'boolean') {
              throw new Error(`GPT-4.1-nano returned invalid is_multi_step type. Expected boolean, got ${typeof parsedResult.is_multi_step}`);
            }
            
            if (typeof parsedResult.total_tasks !== 'number' || parsedResult.total_tasks < 0) {
              throw new Error(`GPT-4.1-nano returned invalid total_tasks. Expected positive number, got ${parsedResult.total_tasks}`);
            }
            
            if (!Array.isArray(parsedResult.tasks)) {
              throw new Error(`GPT-4.1-nano returned invalid tasks. Expected array, got ${typeof parsedResult.tasks}`);
            }
            
            // Validate each task has required fields
            parsedResult.tasks.forEach((task, index) => {
              if (!task.id || !task.type || !task.details) {
                throw new Error(`GPT-4.1-nano returned invalid task at index ${index}. Missing required fields: ${JSON.stringify(task)}`);
              }
            });

    console.log('📊 Stage 1 parsing result:', {
      is_multi_step: parsedResult.is_multi_step,
      total_tasks: parsedResult.total_tasks,
      tasks: parsedResult.tasks?.map(t => `${t.type}: ${t.section}`)
    });

    return parsedResult;

  } catch (error) {
    console.error('❌ Stage 1 (GPT-4.1-nano) error:', error);
    throw error;
  }
}

// Stage 2: GPT-4o-mini for complex reasoning and code generation
async function callOpenAI(userMessage, currentFiles, env, codeAnalysis = null, nanoAnalysis = null, multiTaskAnalysis = null, enhancedPrompt = null) {
  const openaiUrl = 'https://api.openai.com/v1/chat/completions';
  
  // Use enhanced prompt if provided, otherwise use default system prompt
  const systemPrompt = enhancedPrompt || `You are an expert React developer, UI/UX designer, and business strategist. Your task is to create stunning, conversion-optimized landing pages that generate leads and drive business growth.

${codeAnalysis ? `
CURRENT CODE ANALYSIS:
- Existing sections: ${codeAnalysis.sections.join(', ')}
- Existing images: ${codeAnalysis.existing_images.length} images
- Target section: ${codeAnalysis.target_section?.name || 'Not found'}
- Target section has image: ${codeAnalysis.target_section?.has_image ? 'Yes' : 'No'}
- Target section placeholder: ${codeAnalysis.target_section?.image_placeholder || 'None'}
- Target section boundaries: ${codeAnalysis.target_section?.boundaries ? `Lines ${codeAnalysis.target_section.boundaries.start}-${codeAnalysis.target_section.boundaries.end}` : 'Not found'}

TARGETED EDITING INSTRUCTIONS:
- ONLY modify the target section: ${codeAnalysis.target_section?.name || 'Unknown'}
- Preserve ALL other sections and images
- If target section has placeholder, replace it with new image URL
- If target section has no image, add appropriate placeholder
- Make minimal changes to achieve the request
` : ''}

${nanoAnalysis ? `
NANO ANALYSIS (Stage 1):
- Is multi-step: ${nanoAnalysis.is_multi_step}
- Total tasks: ${nanoAnalysis.total_tasks} 
- Tasks to execute:
${nanoAnalysis.tasks?.map((task, index) => `${index + 1}. ${task.type.toUpperCase()}: ${task.section || 'general'} - ${task.details}`).join('\n') || 'No tasks parsed'}

NANO PROCESSED PROMPT: ${nanoAnalysis.processed_prompt || user_message}
` : ''}

${multiTaskAnalysis ? `
LEGACY MULTI-STEP TASK ANALYSIS:
- Total tasks: ${multiTaskAnalysis.total_tasks}
- Tasks to execute:
${multiTaskAnalysis.tasks.map((task, index) => `${index + 1}. ${task.type.toUpperCase()}: ${task.section || 'general'} - ${task.original_text}`).join('\n')}

MULTI-STEP EXECUTION INSTRUCTIONS:
- Execute ALL tasks in the specified order
- Each task should be completed before moving to the next
- For each task, make targeted changes to the specific section
- Preserve all sections and images not being modified
- Handle dependencies (e.g., don't modify a section that will be deleted)
- Generate appropriate image requests for each task that needs images
- Return the final updated code with ALL changes applied
` : ''}

ENHANCED BUSINESS TYPE DETECTION:
Automatically detect business type from user input and apply appropriate:
- Color schemes (ecommerce_fashion, mobile_app, consulting_service, online_course, real_estate, healthcare_wellness, creative_agency, subscription_box, local_service, saas_b2b)
- Layout variants (split_screen, full_screen_video, animated_gradient, parallax_scroll, grid_cards, timeline, comparison_table)
- Form types (newsletter_signup, consultation_booking, style_quiz, trial_signup, demo_request, beta_signup)
- Image guidelines (hero, features, logo, background)

BUSINESS TYPE KEYWORDS:
- E-commerce: "store", "shop", "fashion", "clothing", "retail", "products", "shopping"
- Mobile App: "app", "mobile", "application", "smartphone", "iOS", "Android"
- Consulting: "consulting", "strategy", "business", "advisory", "expert", "professional"
- Education: "course", "learning", "education", "training", "skill", "online course"
- Real Estate: "real estate", "property", "house", "home", "realty", "agent"
- Healthcare: "health", "wellness", "medical", "care", "doctor", "clinic"
- Creative Agency: "design", "creative", "agency", "branding", "marketing", "portfolio"
- Subscription: "subscription", "box", "monthly", "curated", "delivery"
- Local Service: "service", "local", "professional", "plumbing", "cleaning", "repair"
- SaaS B2B: "software", "SaaS", "enterprise", "business", "platform", "tool"

ADVANCED DESIGN PATTERNS:
1. HERO SECTION VARIANTS:
   - Split Screen: Two-column layout with image/text
   - Full Screen Video: Video background with overlay
   - Animated Gradient: Moving gradient background
   - Parallax Scroll: Parallax scrolling effect

2. FEATURE SECTION VARIANTS:
   - Grid Cards: Feature cards in grid layout
   - Timeline: Chronological feature progression
   - Comparison Table: Feature comparison matrix

3. FORM VARIANTS:
   - Newsletter Signup: Email + preferences
   - Consultation Booking: Name, email, phone, service type, date
   - Style Quiz: Interactive quiz for fashion
   - Trial Signup: Business information + trial access
   - Demo Request: Company details + demo scheduling

SOPHISTICATED COLOR SCHEMES:
- ecommerce_fashion: Rose pink (#FF6B9D), Sky blue (#4A90E2), Golden yellow (#F8B500)
- mobile_app: Indigo (#6366F1), Pink (#EC4899), Emerald (#10B981)
- consulting_service: Blue-800 (#1E40AF), Violet-600 (#7C3AED), Amber-500 (#F59E0B)
- online_education: Emerald-600 (#059669), Violet-600 (#7C3AED), Amber-500 (#F59E0B)
- real_estate: Red-600 (#DC2626), Blue-800 (#1E40AF), Amber-500 (#F59E0B)
- healthcare_wellness: Emerald-600 (#059669), Blue-500 (#3B82F6), Amber-500 (#F59E0B)
- creative_agency: Violet-600 (#7C3AED), Pink-500 (#EC4899), Amber-500 (#F59E0B)
- subscription_box: Pink-500 (#EC4899), Violet-500 (#8B5CF6), Amber-500 (#F59E0B)
- local_service: Blue-800 (#1E40AF), Emerald-600 (#059669), Amber-500 (#F59E0B)
- saas_b2b: Blue-800 (#1E40AF), Gray-700 (#374151), Emerald-500 (#10B981)

INTERACTIVE ELEMENTS:
- Animated counters that count up on scroll
- Parallax sections with background images that move
- Sophisticated hover effects and micro-interactions
- Scroll-triggered animations
- Loading states and form interactions

IMPORTANT RULES:
1. Always return valid React JSX code with proper imports and exports
2. Use Tailwind CSS for styling with modern design patterns
3. Make the code production-ready with error handling
4. Respond with JSON format: {"assistant_message": "explanation", "updated_files": {"filename": "code"}, "image_requests": [{"prompt": "description", "aspect_ratio": "1:1", "placement": "hero"}], "business_info": {"name": "Business Name", "tagline": "Tagline", "color_scheme": "theme"}}
5. Only modify files that need changes
6. Keep existing files unchanged unless specifically requested
7. For icons, use Font Awesome 6 via CDN: <i class='fa fa-ICONNAME'></i>
8. When images are needed, include detailed image_requests for Google Gemini Imagen 3 Generate
9. Use descriptive image prompts that match the website's theme and purpose
10. Specify appropriate aspect ratios: "1:1" for logos/icons, "16:9" for hero images, "4:3" for feature images
11. For image placeholders, use: <img src="{GENERATED_IMAGE_URL}" alt="description" className="..." />
12. The LLM will replace {GENERATED_IMAGE_URL} with actual R2 URLs after generation
13. IMPORTANT: Always include a prominent hero section with the business name and tagline at the top of the page
14. Use React hooks (useState, useEffect) for form handling and interactivity
15. Ensure the hero section is the first section and prominently displays the business name and tagline
16. Make sure all React hooks are properly imported and used correctly
17. ALWAYS include a navigation header with smooth scrolling to sections
18. ALWAYS include a prominent CTA button in the hero section
19. Ensure proper text contrast - never use white text on light backgrounds or dark text on dark backgrounds
20. Use text shadows or dark overlays on images to ensure text readability
21. Navigation header must include links to: Home, Features, About, Contact sections
22. Use smooth scrolling behavior for navigation links
23. Make navigation header fixed/sticky at the top of the page
24. SMART IMAGE GENERATION: Always generate images for the initial prompt in a project, regardless of user request
25. COLOR SCHEME PLANNING: Always define a cohesive color scheme first before generating any code
26. BACKGROUND IMAGES: When generating hero and about background images, ensure they contain no text of any kind (no words, lettering, logos, or watermarks)
26. TEXT CONTRAST RULES: Never use white text on white backgrounds, always use contrasting colors
27. BACKGROUND OVERLAY: Always add dark overlays on background images to ensure text readability
28. INITIAL PROMPT DETECTION: If currentFiles is empty or only contains basic files (like index.css), treat this as an initial prompt and ALWAYS generate images
29. IMAGE GENERATION FOR INITIAL PROMPTS: For initial prompts, generate hero image, logo, and feature images regardless of user request
30. IMAGE PLACEHOLDERS: Always include image placeholders in generated code: {GENERATED_IMAGE_URL_HERO}, {GENERATED_IMAGE_URL_LOGO}, {GENERATED_IMAGE_URL_FEATURE_1}, {GENERATED_IMAGE_URL_FEATURE_2}, {GENERATED_IMAGE_URL_FEATURE_3}, {GENERATED_IMAGE_URL_ABOUT}, {GENERATED_IMAGE_URL_CONTACT}, {GENERATED_IMAGE_URL_GALLERY}
31. IMAGE INTEGRATION: Use <img> tags with placeholders in hero sections, logos, and feature cards
32. CRITICAL: For initial prompts, ALWAYS include image placeholders in the React code so images can be integrated
33. IMAGE PLACEHOLDER FORMAT: Use exact format: <img src="{GENERATED_IMAGE_URL_HERO}" alt="description" className="..." />
34. IMAGE REQUEST PLACEMENTS: Generate image requests with specific placements: "hero", "logo", "feature_1", "feature_2", "feature_3"
35. FEATURE IMAGE PLACEMENTS: Each feature card must have a unique placement: feature_1, feature_2, feature_3
36. SMART IMAGE GENERATION: ALWAYS generate image_requests for initial prompts (first prompt in a project), regardless of user message content
37. IMAGE-RELATED REQUESTS: If user mentions "image", "photo", "picture", "add image", "new image", "generate image" - create image_requests
38. SECTION-SPECIFIC IMAGES: When user requests images for specific sections (About Us, Hero, Features, etc.), only generate image_requests for those sections
39. NON-IMAGE PROMPTS: For styling, content, or feature changes (without image mentions), do NOT generate image_requests, keep existing images
40. PRESERVE EXISTING IMAGES: Always keep existing image URLs and placeholders when making non-image changes
41. ADD NEW IMAGES: When adding new images, preserve all existing images and add new placeholders for the new images
42. SMART PLACEMENT: Use specific placements like "about", "hero", "feature_1", "gallery", "contact" for targeted image generation
43. AUTOMATIC PLACEHOLDER GENERATION: Automatically include the correct image placeholders based on the sections being modified
44. SMART PLACEHOLDER DETECTION: When user requests images for specific sections, automatically use the corresponding placeholders without manual specification
45. CUSTOM SECTION SUPPORT: When user creates new sections (like "Testimony", "Gallery", "Team"), automatically generate appropriate placeholders and integrate them into the code
46. DYNAMIC PLACEHOLDER CREATION: For custom sections, create placeholders in format {GENERATED_IMAGE_URL_SECTIONNAME} (e.g., {GENERATED_IMAGE_URL_TESTIMONY})
47. HERO LEAD FORM: ALWAYS include a prominent lead capture form in the Hero section for initial prompts
48. LEAD FORM VISIBILITY: Make the lead form clearly visible with high contrast, proper positioning, and ensure it stays in front of all background elements
49. LEAD FORM STYLING: Use z-index, background overlays, and proper spacing to ensure the lead form is always visible and accessible
50. INITIAL PROMPT IMAGES: CRITICAL - For initial prompts, ALWAYS generate image_requests for hero, logo, and feature images regardless of user message content
51. INITIAL PROMPT LEAD FORM: CRITICAL - For initial prompts, ALWAYS include a lead capture form in the Hero section regardless of user message content
52. SECTION CREATION: When user asks to create a new section, generate complete section code with proper structure, styling, and image placeholders
53. TARGETED CODE EDITING: When modifying existing sections, ONLY change the specific section requested, preserve all other sections and images
54. IMAGE PRESERVATION: Never regenerate or remove existing images when making targeted changes
55. SECTION-SPECIFIC MODIFICATIONS: Use the code analysis to understand current structure and make minimal changes
56. MULTI-STEP TASK HANDLING: When user requests multiple changes, execute them in sequence while preserving all existing content
57. TASK DEPENDENCY MANAGEMENT: Handle task dependencies (e.g., don't modify sections that will be deleted)
58. SEQUENTIAL EXECUTION: Complete each task before moving to the next, ensuring all changes are applied correctly
59. COMPREHENSIVE UPDATES: Return the final code with ALL requested changes applied in the correct order

LANDING PAGE REQUIREMENTS:
- Generate a business name and tagline if not provided
- Create a professional logo concept
- Design smart color schemes based on business type (e.g., Miami Beach bar = neon coral/purple, tech startup = blue/gray)
- Include at least one lead capture form (email input, phone input, or both)
- Add interactive elements (hover effects, animations, smooth scrolling)
- Include multiple sections: Hero, Features, About, Pricing, Contact, Footer
- Use background images with overlay options
- Make it mobile-responsive
- Include clear CTAs (Book Now, Join Waitlist, Pre-purchase, etc.)

REACT COMPONENTS TO USE:
- Modern gradient backgrounds
- Smooth animations with CSS transitions
- Interactive buttons with hover states
- Form components with validation
- Modal/popup components for lead capture
- Responsive grid layouts
- Professional typography with proper hierarchy

COLOR SCHEME PLANNING (ALWAYS DO THIS FIRST):
1. Analyze the business type and choose a cohesive color scheme
2. Define primary, secondary, and accent colors
3. Ensure text colors contrast with background colors
4. Plan overlay colors for background images

COLOR SCHEME GUIDELINES:
- Miami Beach bar: coral pinks (#FF6B6B), ocean blues (#4ECDC4), neon purples (#A55EEA)
- Tech startup: professional blues (#3B82F6), grays (#6B7280), accent colors (#10B981)
- Restaurant/food: warm oranges (#F59E0B), deep reds (#DC2626), cream whites (#FEF3C7)
- Fitness/health: energetic greens (#10B981), dark grays (#1F2937), accent yellows (#F59E0B)
- Luxury/services: deep blacks (#111827), gold accents (#F59E0B), elegant whites (#F9FAFB)
- E-commerce: rose pinks (#FF6B9D), sky blues (#4A90E2), golden yellows (#F8B500)
- Mobile app: indigo (#6366F1), pink (#EC4899), emerald (#10B981)
- Consulting: blue-800 (#1E40AF), violet-600 (#7C3AED), amber-500 (#F59E0B)
- Education: emerald-600 (#059669), violet-600 (#7C3AED), amber-500 (#F59E0B)
- Real estate: red-600 (#DC2626), blue-800 (#1E40AF), amber-500 (#F59E0B)
- Healthcare: emerald-600 (#059669), blue-500 (#3B82F6), amber-500 (#F59E0B)
- Creative agency: violet-600 (#7C3AED), pink-500 (#EC4899), amber-500 (#F59E0B)
- Subscription box: pink-500 (#EC4899), violet-500 (#8B5CF6), amber-500 (#F59E0B)
- Local service: blue-800 (#1E40AF), emerald-600 (#059669), amber-500 (#F59E0B)
- SaaS B2B: blue-800 (#1E40AF), gray-700 (#374151), emerald-500 (#10B981)

TEXT CONTRAST RULES:
- Light backgrounds (white, cream, light gray): Use dark text (text-gray-900, text-gray-800)
- Dark backgrounds (black, dark blue, dark gray): Use light text (text-white, text-gray-100)
- Gradient backgrounds: Use text shadows and dark overlays
- Background images: Always add dark overlay (bg-black bg-opacity-40) before text

Current files structure:
${currentFiles ? Object.keys(currentFiles).map(file => `- ${file}`).join('\n') : 'No files'}

User request: ${userMessage}

${codeAnalysis ? `
CURRENT CODE ANALYSIS:
- Target section: ${codeAnalysis.target_section?.name || 'Not found'}
- Target section has image: ${codeAnalysis.target_section?.has_image ? 'Yes' : 'No'}
- Target section placeholder: ${codeAnalysis.target_section?.image_placeholder || 'None'}
- Existing images to preserve: ${codeAnalysis.existing_images.length}
- All sections: ${codeAnalysis.sections.join(', ')}

TARGETED EDITING REQUIRED:
- ONLY modify the "${codeAnalysis.target_section?.name || 'target'}" section
- Preserve ALL other sections and images
- Make minimal changes to achieve the request
- Current target section content:
${codeAnalysis.target_section?.current_content ? codeAnalysis.target_section.current_content.substring(0, 1000) + (codeAnalysis.target_section.current_content.length > 1000 ? '...' : '') : 'Section not found'}

${nanoAnalysis ? `
NANO TASK EXECUTION (Stage 1 Results):
- Execute ${nanoAnalysis.total_tasks} tasks in sequence:
${nanoAnalysis.tasks?.map((task, index) => `${index + 1}. ${task.type.toUpperCase()}: ${task.section || 'general'} - ${task.details}`).join('\n') || 'No tasks'}

- For each task, make targeted changes to the specific section
- Preserve all sections and images not being modified
- Handle task dependencies properly
- Generate images for tasks that require them
- Return final code with ALL changes applied
` : ''}

${multiTaskAnalysis ? `
LEGACY MULTI-STEP TASK EXECUTION:
- Execute ${multiTaskAnalysis.total_tasks} tasks in sequence:
${multiTaskAnalysis.tasks.map((task, index) => `${index + 1}. ${task.type.toUpperCase()}: ${task.section || 'general'} - ${task.original_text}`).join('\n')}

- For each task, make targeted changes to the specific section
- Preserve all sections and images not being modified
- Handle task dependencies properly
- Generate images for tasks that require them
- Return final code with ALL changes applied
` : ''}
` : ''}`;

  const userPrompt = `Please analyze the user's request and generate a complete, professional landing page with the following features:

CRITICAL REQUIREMENTS FOR INITIAL PROMPTS:
- If this is the first prompt in a project (empty or basic files), ALWAYS generate image_requests for hero, logo, and feature images
- If this is the first prompt in a project, ALWAYS include a prominent lead capture form in the Hero section
- These requirements apply regardless of the user's message content

1. BUSINESS IDENTITY:
- Generate a compelling business name if not provided
- Create a professional tagline
- Design a logo concept
- Choose an appropriate color scheme based on the business type
- MUST include a prominent lead capture form in the Hero section

COLOR SCHEME PLANNING (REQUIRED FIRST STEP):
- Analyze the business type and define a cohesive color palette
- Primary color: Main brand color (e.g., coral for beach bar)
- Secondary color: Supporting color (e.g., ocean blue for beach bar)
- Accent color: Highlight color (e.g., neon purple for beach bar)
- Text colors: Ensure high contrast with backgrounds
- Background colors: Light or dark based on text color choice
- Overlay colors: Dark overlays for background images

INITIAL PROMPT DETECTION:
- If this is the first prompt in a project (empty or basic files), ALWAYS generate images
- Generate hero image, logo, and feature images for initial prompts
- For subsequent prompts, only generate images if specifically requested

IMAGE PLACEHOLDER REQUIREMENTS:
- ALWAYS include image placeholders in the generated React code
- Hero section: <img src="{GENERATED_IMAGE_URL_HERO}" alt="Hero Image" className="w-full h-64 object-cover rounded-lg" />
- Logo: <img src="{GENERATED_IMAGE_URL_LOGO}" alt="Logo" className="h-12 w-auto" />
- Feature images: Use UNIQUE placeholders for each feature card:
  * First feature: <img src="{GENERATED_IMAGE_URL_FEATURE_1}" alt="Feature 1" className="w-full h-32 object-cover rounded-lg" />
  * Second feature: <img src="{GENERATED_IMAGE_URL_FEATURE_2}" alt="Feature 2" className="w-full h-32 object-cover rounded-lg" />
  * Third feature: <img src="{GENERATED_IMAGE_URL_FEATURE_3}" alt="Feature 3" className="w-full h-32 object-cover rounded-lg" />
- Section-specific images:
  * About section: <img src="{GENERATED_IMAGE_URL_ABOUT}" alt="About Us" className="w-full h-64 object-cover rounded-lg" />
  * Contact section: <img src="{GENERATED_IMAGE_URL_CONTACT}" alt="Contact" className="w-full h-64 object-cover rounded-lg" />
  * Gallery section: <img src="{GENERATED_IMAGE_URL_GALLERY}" alt="Gallery" className="w-full h-64 object-cover rounded-lg" />
- Background images: <img src="{GENERATED_IMAGE_URL_BACKGROUND}" alt="Background" className="absolute inset-0 w-full h-full object-cover" />

2. LANDING PAGE STRUCTURE:
- NAVIGATION HEADER: Fixed header with smooth scrolling navigation links to all sections
- HERO SECTION (MOST IMPORTANT): Must be the first section with the business name, tagline, and prominent lead capture form
- Features/benefits section with relevant images
- About section with business story
- Pricing section (if applicable)
- Contact/location section (if applicable)
- Footer without social links or external links (no anchor tags). Use plain text only; do not include social media icons.

3. HERO SECTION REQUIREMENTS:
- Must be the first section of the page
- Must prominently display the business name in large, bold text
- Must display the tagline below the business name
- Should include a hero image if applicable
- MUST have a prominent call-to-action button (e.g., "Book Table" for restaurants, "Join Waitlist" for SaaS, "Get Started" for services)
- MUST include a prominent lead capture form with email and/or phone input fields
- Lead form must be clearly visible with high contrast and proper positioning
- Use z-index and background overlays to ensure lead form stays in front of all background elements
- Use gradient backgrounds or eye-catching colors
- CRITICAL: Ensure proper text contrast - use text shadows or dark overlays on images
- NEVER use white text on light backgrounds or dark text on dark backgrounds
- For light backgrounds: use dark text (text-gray-900, text-gray-800)
- For dark backgrounds: use light text (text-white, text-gray-100)
- For background images: always add dark overlay (bg-black bg-opacity-40) before text
- Use text shadows: text-shadow: 0 2px 4px rgba(0,0,0,0.5)

3. LEAD CAPTURE:
- MUST include a prominent lead capture form in the Hero section
- Options: email input, phone input, or both
- Clear CTA buttons: "Book Now", "Join Waitlist", "Pre-purchase", "Get Started"
- Form validation and error handling
- Lead form must be positioned prominently in the Hero section with high visibility
- Use proper z-index, background overlays, and contrast to ensure form is always visible

4. CTA BUTTON REQUIREMENTS:
- Hero section MUST have a prominent CTA button
- For restaurants/bars: "Book Table", "Reserve Now", "Order Online"
- For SaaS/tech: "Join Waitlist", "Start Free Trial", "Get Started"
- For services: "Get Started", "Contact Us", "Learn More"
- For e-commerce: "Shop Now", "Pre-order", "Buy Now"
- Use contrasting colors and hover effects
- Make buttons large and prominent in the hero section

4. INTERACTIVE ELEMENTS:
- Smooth animations and hover effects
- Background images with overlay options
- Responsive design for all devices
- Professional typography and spacing

5. TEXT CONTRAST AND STYLING:
- Always ensure text is readable against backgrounds
- Use text shadows: text-shadow: 0 2px 4px rgba(0,0,0,0.5)
- Use dark overlays on images: bg-black bg-opacity-50
- For light backgrounds, use dark text: text-gray-900, text-gray-800
- For dark backgrounds, use light text: text-white, text-gray-100
- Test contrast ratios for accessibility
- NEVER use white text on white backgrounds
- NEVER use black text on black backgrounds
- Always add dark overlays to background images: bg-black bg-opacity-40

5. IMAGE PLANNING:
- Hero image that represents the business
- Feature images for key benefits
- Logo concept image
- Background images with appropriate overlays

6. IMAGE INTEGRATION REQUIREMENTS:
- ALWAYS include image placeholders in the generated code
- Hero section: Use <img src="{GENERATED_IMAGE_URL_HERO}" alt="Hero Image" className="..." />
- Logo: Use <img src="{GENERATED_IMAGE_URL_LOGO}" alt="Logo" className="..." />
- Feature images: Use UNIQUE placeholders for each feature card:
  * First feature: <img src="{GENERATED_IMAGE_URL_FEATURE_1}" alt="Feature 1" className="..." />
  * Second feature: <img src="{GENERATED_IMAGE_URL_FEATURE_2}" alt="Feature 2" className="..." />
  * Third feature: <img src="{GENERATED_IMAGE_URL_FEATURE_3}" alt="Feature 3" className="..." />
- Section-specific images:
  * About section: <img src="{GENERATED_IMAGE_URL_ABOUT}" alt="About Us" className="..." />
  * Contact section: <img src="{GENERATED_IMAGE_URL_CONTACT}" alt="Contact" className="..." />
  * Gallery section: <img src="{GENERATED_IMAGE_URL_GALLERY}" alt="Gallery" className="..." />
- Background images: Use <img src="{GENERATED_IMAGE_URL_BACKGROUND}" alt="Background" className="..." />

7. SMART IMAGE GENERATION RULES:
- ALWAYS generate images for the initial prompt in a project (when no existing files or empty project)
- For subsequent prompts, only generate images when user specifically requests them
- If user asks for styling changes only, reuse existing images
- If user asks for "new images" or "different images", then generate
- If user asks for layout/styling/color changes, keep existing images
- If user asks for navigation, contrast, or CTA improvements, keep existing images
- Only generate images when user explicitly mentions images or visual content

8. IMAGE REQUEST SPECIFICATIONS:
- Generate image requests with specific placements for proper integration:
  * Hero image: placement: "hero"
  * Logo: placement: "logo" 
  * Feature 1: placement: "feature_1"
  * Feature 2: placement: "feature_2"
  * Feature 3: placement: "feature_3"
- Each feature card must have a unique placement to avoid duplicate images
- CRITICAL: Generate image_requests for:
  * Initial prompts (first prompt in a project) - generate all standard images
  * When user asks for "new images", "different images", or "generate images" - generate all standard images
  * When user asks to "add image to [specific section]" - generate ONLY for that section
  * When user mentions "image", "photo", "picture" for specific sections - generate ONLY for those sections
- DO NOT generate image_requests for:
  * Styling changes (colors, layout, fonts) without image mentions
  * Content changes (text, descriptions, features) without image mentions
  * Navigation or CTA improvements without image mentions
  * Any non-image-related requests
- SECTION-SPECIFIC PLACEMENTS:
  * "about" or "about us" → placement: "about"
  * "hero" or "main" → placement: "hero"
  * "feature" or "features" → placement: "feature_1", "feature_2", "feature_3"
  * "contact" → placement: "contact"
  * "gallery" → placement: "gallery"

9. IMAGE PRESERVATION RULES:
- When making non-image changes, preserve all existing image URLs and placeholders
- When adding new images, keep all existing images and add new placeholders
- Never remove or replace existing images unless specifically requested
- Use unique placeholders for new images (e.g., {GENERATED_IMAGE_URL_ABOUT_US}, {GENERATED_IMAGE_URL_GALLERY})

Current files content:
${currentFiles ? JSON.stringify(currentFiles, null, 2) : '{}'}

IMPORTANT: 
- ALWAYS generate images for the initial prompt in a project (when no existing files or empty project), REGARDLESS of user message content
- ALWAYS include a prominent lead capture form in the Hero section for initial prompts
- For subsequent prompts, generate images if the user asks for:
  * "new images", "different images", "generate images"
  * "add image", "add photo", "add picture" to any section
  * Any request mentioning "image", "photo", "picture"
- For all other requests (styling, content, features, navigation without image mentions), do NOT generate image_requests - keep existing images and placeholders

AUTOMATIC PLACEHOLDER GENERATION:
- The system will automatically detect which sections need images and include the correct placeholders
- When user says "add image to About Us section" → Automatically include {GENERATED_IMAGE_URL_ABOUT} in the About section
- When user says "add image to Contact section" → Automatically include {GENERATED_IMAGE_URL_CONTACT} in the Contact section
- When user says "add image to Gallery" → Automatically include {GENERATED_IMAGE_URL_GALLERY} in the Gallery section
- When user says "add image to Hero" → Automatically include {GENERATED_IMAGE_URL_HERO} in the Hero section
- When user says "add image to Features" → Automatically include {GENERATED_IMAGE_URL_FEATURE_1}, {GENERATED_IMAGE_URL_FEATURE_2}, {GENERATED_IMAGE_URL_FEATURE_3} in the Features section
- When user says "create a new section called Testimony and add image" → Automatically create {GENERATED_IMAGE_URL_TESTIMONY} and generate complete Testimony section code
- When user says "add new section called Team" → Automatically create {GENERATED_IMAGE_URL_TEAM} and generate complete Team section code
- NO MANUAL PLACEHOLDER SPECIFICATION NEEDED - The system automatically detects and includes the correct placeholders
- CUSTOM SECTIONS: For any new section name, automatically create placeholder in format {GENERATED_IMAGE_URL_SECTIONNAME}

TARGETED EDITING REQUIREMENTS:
- When user requests changes to a specific section (e.g., "add image to About Us section"), ONLY modify that section
- Preserve ALL existing images and sections that are not being modified
- Use the code analysis to understand the current structure before making changes
- Make minimal changes to achieve the requested modification
- If a section already has an image placeholder, replace it with the new image URL
- If a section doesn't have an image, add the appropriate placeholder
- NEVER regenerate the entire file unless explicitly requested

MULTI-STEP TASK HANDLING:
- When user requests multiple changes (e.g., "add image to About section, then change text in Hero section, then delete Contact section"), execute ALL tasks in sequence
- Parse complex requests into individual tasks and execute them one by one
- Handle task dependencies (e.g., don't modify a section that will be deleted)
- Preserve all sections and images not being modified
- Generate appropriate images for each task that requires them
- Return the final code with ALL changes applied in the correct order
- Support separators: "then", "next", "also", "after that", semicolons, etc.

Return only the JSON response with assistant_message, updated_files, image_requests, and business_info.`;

        const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
              max_tokens: 15000
    };



  const response = await fetch(openaiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Track token usage and calculate cost for GPT-4o-mini
  if (data.usage) {
    totalCost.mini.input_tokens = data.usage.prompt_tokens || 0;
    totalCost.mini.output_tokens = data.usage.completion_tokens || 0;
    totalCost.mini.cost = calculateCost(totalCost.mini.input_tokens, totalCost.mini.output_tokens, 'mini');
    totalCost.total += totalCost.mini.cost;
    
    console.log('💰 GPT-4o-mini cost:', {
      input_tokens: totalCost.mini.input_tokens,
      output_tokens: totalCost.mini.output_tokens,
      cost: `$${totalCost.mini.cost.toFixed(6)}`
    });
  }
  
  let content = data.choices[0].message.content;
  // If the response is wrapped in a code block, extract the JSON
  const codeBlockMatch = content.match(/```(?:json)?\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    content = codeBlockMatch[1];
  }
  try {
    // Parse the JSON response from the LLM
    const parsedResponse = JSON.parse(content);
    return {
      assistant_message: parsedResponse.assistant_message,
      updated_files: parsedResponse.updated_files,
      image_requests: parsedResponse.image_requests || [],
      business_info: parsedResponse.business_info || {}
    };
  } catch (parseError) {
    console.error('Failed to parse LLM response:', parseError);
    console.error('Raw response content (first 500 chars):', content.substring(0, 500));
    console.error('Raw response content (last 500 chars):', content.substring(content.length - 500));
    
    // Try to fix common JSON issues
    let fixedContent = content;
    
    // Remove any trailing commas before closing braces/brackets
    fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1');
    
    // Try parsing again with fixed content
    try {
      const parsedResponse = JSON.parse(fixedContent);
      console.log('✅ Successfully parsed after fixing JSON syntax');
      return {
        assistant_message: parsedResponse.assistant_message,
        updated_files: parsedResponse.updated_files,
        image_requests: parsedResponse.image_requests || [],
        business_info: parsedResponse.business_info || {}
      };
    } catch (secondParseError) {
      console.error('Still failed to parse after JSON fixes:', secondParseError);
      // Fallback: extract code from the response
      return extractCodeFromResponse(content, currentFiles);
    }
  }
}

// Fallback function to extract code if JSON parsing fails
function extractCodeFromResponse(content, currentFiles) {
  // Look for code blocks in the response
  const codeBlockRegex = /```(?:jsx?|javascript)?\n([\s\S]*?)```/g;
  const matches = [...content.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    const updatedFiles = { ...(currentFiles || {}) };
    updatedFiles['src/App.jsx'] = matches[0][1];
    
    return {
      assistant_message: "I've generated the code for your landing page. Here's what I created based on your request.",
      updated_files: updatedFiles
    };
  }
  
  // If no code blocks found, return a generic response
  return {
    assistant_message: "I understand your request. Let me help you create a professional landing page.",
    updated_files: currentFiles || {}
  };
}

// Mock LLM response function (fallback)
async function mockLLMResponse(userMessage, currentFiles) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerMessage = userMessage.toLowerCase();
  let updatedFiles = { ...(currentFiles || {}) };
  let assistantMessage = '';

  if (lowerMessage.includes('startup') || lowerMessage.includes('landing page') || lowerMessage.includes('create')) {
    // Create a basic landing page
    updatedFiles['src/App.jsx'] = `import React from 'react';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Amazing Startup
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your idea into reality with our innovative solution. 
            Join thousands of satisfied customers who have already made the leap.
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Get results in minutes, not months.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reliable</h3>
              <p className="text-gray-600">Trusted by thousands of users worldwide.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customizable</h3>
              <p className="text-gray-600">Tailored to your specific needs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and transform your business today.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;`;
    
    assistantMessage = "I've created a professional landing page for your startup! The page includes a hero section with compelling copy, a features section highlighting your key benefits, and a call-to-action section to drive conversions. The design uses a modern gradient background and responsive layout. You can now customize the content, colors, and messaging to match your specific startup idea.";
  
  } else if (lowerMessage.includes('color') || lowerMessage.includes('blue') || lowerMessage.includes('red') || lowerMessage.includes('green')) {
    // Change colors
    let newColor = 'blue';
    if (lowerMessage.includes('red')) newColor = 'red';
    else if (lowerMessage.includes('green')) newColor = 'green';
    else if (lowerMessage.includes('purple')) newColor = 'purple';
    
    updatedFiles['src/App.jsx'] = currentFiles['src/App.jsx'].replace(/bg-blue-600/g, `bg-${newColor}-600`)
      .replace(/bg-blue-700/g, `bg-${newColor}-700`)
      .replace(/bg-blue-50/g, `bg-${newColor}-50`)
      .replace(/bg-blue-100/g, `bg-${newColor}-100`)
      .replace(/text-blue-600/g, `text-${newColor}-600`)
      .replace(/text-blue-100/g, `text-${newColor}-100`);
    
    assistantMessage = `I've updated the color scheme to use ${newColor}! The landing page now has a ${newColor} theme throughout.`;
  
  } else if (lowerMessage.includes('button') || lowerMessage.includes('cta')) {
    // Modify buttons
    updatedFiles['src/App.jsx'] = currentFiles['src/App.jsx'].replace(
      'Get Started',
      'Sign Up Now'
    ).replace(
      'Learn More',
      'Watch Demo'
    ).replace(
      'Start Your Free Trial',
      'Get 50% Off Today'
    );
    
    assistantMessage = "I've updated the call-to-action buttons to be more compelling! Changed 'Get Started' to 'Sign Up Now', 'Learn More' to 'Watch Demo', and 'Start Your Free Trial' to 'Get 50% Off Today' to create more urgency.";
  
  } else {
    // Generic response
    assistantMessage = "I understand you want to modify your landing page. I can help you with colors, content, layout, buttons, and more. What specific changes would you like to make?";
  }

  return {
    assistant_message: assistantMessage,
    updated_files: updatedFiles
  };
}

// Serve static files for React app
async function serveStaticFiles(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // For API routes, let them be handled by the main router
  if (path.startsWith('/api/')) {
    return new Response('Not Found', { status: 404 });
  }

  // Handle React Router - serve index.html for all routes that don't have file extensions
  if (!path.includes('.') || path.endsWith('/')) {
    return new Response(await getIndexHTML(), {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // For static assets with file extensions, we need to serve them
  // Let's check if it's a known asset and serve it
  const assetPath = path.substring(1); // Remove leading slash
  
  // Map common asset extensions to MIME types
  const mimeTypes = {
    'js': 'application/javascript',
    'css': 'text/css',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
  };

  const extension = assetPath.split('.').pop().toLowerCase();
  const contentType = mimeTypes[extension] || 'text/plain';

  // For now, let's serve a simple response for assets
  // In a real setup, you'd serve the actual file content
  if (extension === 'js') {
    return new Response('// JavaScript file would be served here', {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } else if (extension === 'css') {
    return new Response('/* CSS file would be served here */', {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  return new Response('Asset not found', { status: 404 });
}

// Get the main HTML content for the React app
async function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jetsy - Validate Startup Ideas Fast with AI</title>
    <meta name="description" content="Jetsy auto-generates landing pages and ad tests to measure real interest — before you write a single line of code.">
    <meta name="keywords" content="startup validation, landing page generator, AI, market research, product validation">
    <meta name="author" content="Jetsy">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://jetsy.com/">
    <meta property="og:title" content="Jetsy - Validate Startup Ideas Fast with AI">
    <meta property="og:description" content="Jetsy auto-generates landing pages and ad tests to measure real interest — before you write a single line of code.">
    <meta property="og:image" content="https://jetsy.com/public/jetsy_logo3.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://jetsy.com/">
    <meta property="twitter:title" content="Jetsy - Validate Startup Ideas Fast with AI">
    <meta property="twitter:description" content="Jetsy auto-generates landing pages and ad tests to measure real interest — before you write a single line of code.">
    <meta property="twitter:image" content="https://jetsy.com/public/jetsy_logo3.png">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/public/jetsy_logo3.png">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
    <!-- End Google Tag Manager -->
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <div id="root"></div>
    <script type="module" src="/assets/index-58626b0f.js"></script>
    <link rel="stylesheet" href="/assets/index-990da001.css">
</body>
</html>`;
}

// --- Image Generation and Management Functions ---

// Handle image generation using Google Gemini Imagen 3 Generate
async function handleImageGeneration(request, env, corsHeaders) {
  try {
    const { project_id, prompt, aspect_ratio = '1:1', number_of_images = 1 } = await request.json();
    
    if (!project_id || !prompt) {
      return new Response(JSON.stringify({ error: 'project_id and prompt are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (!env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is required but not found. Please configure GEMINI_API_KEY as a Wrangler secret.');
    }

    console.log('🎨 Generating image:', prompt);

    const generatedImages = [];
    
    for (let i = 0; i < number_of_images; i++) {
      const imageResult = await generateImageWithGemini(prompt, aspect_ratio, env);
      
      if (imageResult.success) {
        // Upload to R2
        const uploadResult = await uploadImageToR2(imageResult.imageData, env, request, 'image/jpeg');
        
        if (uploadResult.success) {
          // Save to database (skip if project doesn't exist)
          let dbResult = { success: false };
          try {
            dbResult = await saveImageToDatabase({
              project_id,
              prompt,
              aspect_ratio,
              filename: uploadResult.filename,
              r2_url: uploadResult.url,
              file_size: imageResult.fileSize,
              width: imageResult.width,
              height: imageResult.height,
              mime_type: 'image/jpeg',
              imageId: uploadResult.imageId
            }, env);
          } catch (dbError) {
            console.log('⚠️ Database save failed, continuing without database storage:', dbError.message);
          }

          // Always add to generated images even if database save fails
          generatedImages.push({
            image_id: dbResult.success ? dbResult.image_id : uploadResult.imageId,
            url: uploadResult.url,
            prompt: prompt,
            aspect_ratio: aspect_ratio,
            width: imageResult.width,
            height: imageResult.height
          });
        }
      }
    }

    console.log(`✅ Generated ${generatedImages.length} image(s)`);

    return new Response(JSON.stringify({
      success: true,
      images: generatedImages,
      message: `Successfully generated ${generatedImages.length} image(s)`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate image',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Generate image using Google Gemini Imagen 3 Generate
async function generateImageWithGemini(prompt, aspectRatio, env) {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    
    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    console.log('🤖 Calling Gemini Imagen 3 Generate API...');
    console.log('   - Prompt:', prompt);
    console.log('   - Aspect Ratio:', aspectRatio);
    console.log('   - Gemini API Key present:', !!env.GEMINI_API_KEY);
    
    const response = await ai.models.generateImages({
      model: 'models/imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    console.log('   - Gemini response received');
    console.log('   - Response has generatedImages:', !!response?.generatedImages);
    console.log('   - Number of generated images:', response?.generatedImages?.length || 0);

    if (!response?.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images generated by Gemini API');
    }

    const imageData = response.generatedImages[0]?.image?.imageBytes;
    
    if (!imageData) {
      throw new Error('No image data received from Gemini API');
    }

    // Convert base64 to Uint8Array (Web API compatible)
    const binaryString = atob(imageData);
    
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Calculate dimensions based on aspect ratio
    const dimensions = getDimensionsFromAspectRatio(aspectRatio);
    
    return {
      success: true,
      imageData: bytes,
      fileSize: bytes.length,
      width: dimensions.width,
      height: dimensions.height
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Upload image to Cloudflare R2
async function uploadImageToR2(imageBytes, env, request, mimeType = 'image/jpeg') {
  try {
    const imageId = generateImageId();
    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    const filename = `${imageId}.${extension}`;
    
    console.log('☁️ Uploading to R2...');

    if (!env.IMAGES_BUCKET) {
      throw new Error('R2 bucket binding not available');
    }

    // Convert to ArrayBuffer if needed
    let uploadData = imageBytes;
    if (imageBytes instanceof Uint8Array) {
      uploadData = imageBytes.buffer;
    }

    // Upload to R2
    const uploadResult = await env.IMAGES_BUCKET.put(filename, uploadData, {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    // Verify the upload by trying to get the object
    try {
      const verifyResult = await env.IMAGES_BUCKET.get(filename);
    } catch (verifyError) {
      console.log('   - Verification failed:', verifyError.message);
    }

    // Use worker's image serving endpoint
    const url = `${new URL(request.url).origin}/api/serve-image/${filename}`;
    console.log('   - Generated URL:', url);
    
    return {
      success: true,
      imageId: imageId,
      filename: filename,
      url: url
    };

  } catch (error) {
    console.error('R2 upload error:', error);
    console.error('Error details:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Save image metadata to database
async function saveImageToDatabase(imageData, env) {
  try {
    const imageId = imageData.imageId; // Use the imageId from upload result
    const currentTime = new Date().toISOString();
    
    console.log('💾 Saving to database...');

    // Check if project exists, if not create it (for test scenarios)
    // For test projects, we'll use a hash of the project_id to get a consistent integer
    const projectIdString = String(imageData.project_id);
    const projectIdHash = Math.abs(projectIdString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
    
    const projectExists = await env.DB.prepare('SELECT id FROM projects WHERE id = ?').bind(projectIdHash).first();
    
    if (!projectExists) {
      console.log('📁 Creating test project for image storage...');
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO projects (id, user_id, project_name, files, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(projectIdHash, 1, `test-project-${imageData.project_id}`, '{}', now, now).run();
    }
    
    // Use the hash for the image record
    const finalProjectId = projectIdHash;

    const stmt = env.DB.prepare(`
      INSERT INTO images (
        image_id, project_id, filename, original_prompt, aspect_ratio, 
        width, height, file_size, mime_type, r2_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      imageId,
      finalProjectId,
      imageData.filename,
      imageData.prompt,
      imageData.aspect_ratio,
      imageData.width,
      imageData.height,
      imageData.file_size,
      imageData.mime_type,
      imageData.r2_url,
      currentTime
    ).run();

    return {
      success: true,
      image_id: imageId
    };

  } catch (error) {
    console.error('Database save error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get images for a project
async function handleGetImages(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id');
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'project_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const stmt = env.DB.prepare(`
      SELECT i.*, ip.placement_type, ip.file_path, ip.component_name, ip.css_class, ip.alt_text
      FROM images i
      LEFT JOIN image_placements ip ON i.image_id = ip.image_id
      WHERE i.project_id = ? AND i.status = 'active'
      ORDER BY i.created_at DESC
    `);

    const result = await stmt.bind(projectId).all();
    
    return new Response(JSON.stringify({
      success: true,
      images: result.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Get images error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get images',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Get specific image
async function handleGetImage(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const imageId = url.pathname.split('/').pop();
    
    const stmt = env.DB.prepare(`
      SELECT * FROM images WHERE image_id = ? AND status = 'active'
    `);

    const result = await stmt.bind(imageId).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      image: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Get image error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get image',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Delete image
async function handleDeleteImage(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const imageId = url.pathname.split('/').pop();
    
    // Mark as deleted in database
    const stmt = env.DB.prepare(`
      UPDATE images SET status = 'deleted', updated_at = ? WHERE image_id = ?
    `);

    await stmt.bind(new Date().toISOString(), imageId).run();
    
    // Note: We don't delete from R2 immediately to avoid breaking existing references
    // A cleanup job can be implemented later to remove orphaned files

    return new Response(JSON.stringify({
      success: true,
      message: 'Image deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Delete image error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete image',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Utility functions
function generateImageId() {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDimensionsFromAspectRatio(aspectRatio) {
  const baseSize = 1024; // Base size for calculations
  
  switch (aspectRatio) {
    case '1:1':
      return { width: baseSize, height: baseSize };
    case '16:9':
      return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
    case '4:3':
      return { width: baseSize, height: Math.round(baseSize * 3 / 4) };
    case '3:2':
      return { width: baseSize, height: Math.round(baseSize * 2 / 3) };
    case '2:1':
      return { width: baseSize, height: Math.round(baseSize / 2) };
    default:
      return { width: baseSize, height: baseSize };
  }
}

// Test R2 bucket access
async function handleTestR2Access(request, env, corsHeaders) {
  try {
    console.log('🔍 Testing R2 bucket access...');
    
    // List objects in the bucket
    const objects = await env.IMAGES_BUCKET.list();
    console.log('📋 R2 bucket objects:', objects);
    
    // Get bucket info
    const bucketInfo = {
      name: 'jetsy-images-prod',
      objectCount: objects.objects.length,
      objects: objects.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
      }))
    };
    
    return new Response(JSON.stringify({
      success: true,
      bucket: bucketInfo
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('R2 access test error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Handle multi-task parsing for complex requests
async function handleParseMultiTask(request, env, corsHeaders) {
  try {
    const { user_message } = await request.json();
    
    if (!user_message) {
      return new Response(JSON.stringify({ error: 'user_message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Define task patterns for parsing
    const taskPatterns = {
      // Section modifications
      'add_section': /(?:add|create|new)\s+(?:a\s+)?(?:new\s+)?(?:section\s+)?(?:called\s+)?([a-zA-Z]+)/gi,
      'delete_section': /(?:delete|remove)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      'modify_section': /(?:modify|change|update)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      
      // Image operations
      'add_image': /(?:add|generate|create)\s+(?:a\s+)?(?:new\s+)?(?:image|photo|picture)\s+(?:to|in)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      'change_image': /(?:change|replace|update)\s+(?:the\s+)?(?:image|photo|picture)\s+(?:in|of)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      'delete_image': /(?:delete|remove)\s+(?:the\s+)?(?:image|photo|picture)\s+(?:from|in)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      
      // Content modifications
      'change_text': /(?:change|update|modify)\s+(?:the\s+)?(?:text|content|description)\s+(?:in|of)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      'change_title': /(?:change|update|modify)\s+(?:the\s+)?(?:title|heading)\s+(?:in|of)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      
      // Styling changes
      'change_style': /(?:change|update|modify)\s+(?:the\s+)?(?:style|color|background)\s+(?:of|in)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi,
      
      // Layout changes
      'change_layout': /(?:change|update|modify)\s+(?:the\s+)?(?:layout|arrangement|structure)\s+(?:of|in)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/gi
    };

    // Parse the user message into individual tasks
    const tasks = [];
    const userMessageLower = user_message.toLowerCase();
    
    // Split by common separators
    const taskSeparators = [
      /,\s*then\s+/gi,
      /\.\s*Then\s+/gi,
      /;\s*/gi,
      /\.\s*Next\s+/gi,
      /\.\s*After\s+that\s+/gi,
      /\.\s*Also\s+/gi
    ];
    
    let taskParts = [user_message];
    
    // Split by separators
    for (const separator of taskSeparators) {
      const newParts = [];
      for (const part of taskParts) {
        newParts.push(...part.split(separator));
      }
      taskParts = newParts;
    }
    
    // Process each task part
    for (let i = 0; i < taskParts.length; i++) {
      const taskText = taskParts[i].trim();
      if (!taskText) continue;
      
      const task = {
        id: i + 1,
        original_text: taskText,
        type: null,
        section: null,
        details: {},
        priority: i + 1 // Order matters
      };
      
      // Determine task type and extract details
      for (const [taskType, pattern] of Object.entries(taskPatterns)) {
        const matches = [...taskText.matchAll(pattern)];
        if (matches.length > 0) {
          task.type = taskType;
          task.section = matches[0][1]?.toLowerCase();
          
          // Extract additional details based on task type
          switch (taskType) {
            case 'add_section':
              task.details.new_section_name = matches[0][1];
              break;
            case 'add_image':
            case 'change_image':
              task.details.image_type = taskText.includes('hero') ? 'hero' : 
                                       taskText.includes('logo') ? 'logo' : 
                                       taskText.includes('background') ? 'background' : 'content';
              break;
            case 'change_text':
              task.details.text_type = taskText.includes('title') ? 'title' : 
                                      taskText.includes('heading') ? 'heading' : 'body';
              break;
            case 'change_style':
              task.details.style_type = taskText.includes('color') ? 'color' : 
                                       taskText.includes('background') ? 'background' : 'general';
              break;
          }
          break;
        }
      }
      
      // If no specific pattern matched, try to infer task type
      if (!task.type) {
        if (taskText.includes('image') || taskText.includes('photo') || taskText.includes('picture')) {
          task.type = 'add_image';
          // Try to extract section name
          const sectionMatch = taskText.match(/(?:in|to|of)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/i);
          if (sectionMatch) {
            task.section = sectionMatch[1].toLowerCase();
          }
        } else if (taskText.includes('delete') || taskText.includes('remove')) {
          task.type = 'delete_section';
          const sectionMatch = taskText.match(/(?:delete|remove)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/i);
          if (sectionMatch) {
            task.section = sectionMatch[1].toLowerCase();
          }
        } else {
          task.type = 'modify_section';
          // Try to extract section name
          const sectionMatch = taskText.match(/(?:in|to|of)\s+(?:the\s+)?(?:section\s+)?([a-zA-Z]+)/i);
          if (sectionMatch) {
            task.section = sectionMatch[1].toLowerCase();
          }
        }
      }
      
      tasks.push(task);
    }

    // Validate and optimize task sequence
    const optimizedTasks = [];
    for (const task of tasks) {
      // Check for dependencies
      if (task.type === 'delete_section') {
        // Remove any tasks that modify the section being deleted
        const tasksToRemove = optimizedTasks.filter(t => 
          t.section === task.section && t.type !== 'delete_section'
        );
        optimizedTasks.splice(optimizedTasks.indexOf(tasksToRemove[0]), tasksToRemove.length);
      }
      
      optimizedTasks.push(task);
    }

    return new Response(JSON.stringify({
      success: true,
      original_message: user_message,
      tasks: optimizedTasks,
      total_tasks: optimizedTasks.length,
      message: `Parsed ${optimizedTasks.length} task(s) from the request`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Multi-task parsing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to parse multi-task request',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Handle code analysis for targeted changes
async function handleAnalyzeCode(request, env, corsHeaders) {
  try {
    const { current_files, target_section } = await request.json();
    
    if (!current_files || !current_files['src/App.jsx']) {
      return new Response(JSON.stringify({ error: 'No App.jsx file found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const appCode = current_files['src/App.jsx'];
    
    // Analyze existing code structure
    const analysis = {
      sections: [],
      existing_images: [],
      image_placeholders: [],
      section_boundaries: {},
      code_structure: {}
    };

    // Find all sections in the code
    const sectionMatches = appCode.match(/<section[^>]*className="[^"]*([^"]*section[^"]*)"[^>]*>/gi);
    if (sectionMatches) {
      sectionMatches.forEach((match, index) => {
        const sectionName = match.match(/className="[^"]*([^"]*section[^"]*)"[^>]*>/i)?.[1] || `section_${index}`;
        analysis.sections.push(sectionName);
      });
    }

    // Find existing image URLs (non-placeholder)
    const imageUrlMatches = appCode.match(/src="([^"]*\.(jpg|jpeg|png|gif|webp))"/gi);
    if (imageUrlMatches) {
      imageUrlMatches.forEach(match => {
        const url = match.match(/src="([^"]*)"/i)?.[1];
        if (url && !url.includes('GENERATED_IMAGE_URL')) {
          analysis.existing_images.push(url);
        }
      });
    }

    // Find image placeholders
    const placeholderMatches = appCode.match(/\{GENERATED_IMAGE_URL_[^}]+\}/g);
    if (placeholderMatches) {
      analysis.image_placeholders = placeholderMatches;
    }

    // Find section boundaries for targeted editing
    const lines = appCode.split('\n');
    let currentSection = null;
    let sectionStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect section start
      if (line.includes('<section') && line.includes('className')) {
        const sectionMatch = line.match(/className="[^"]*([^"]*section[^"]*)"[^>]*>/i);
        if (sectionMatch) {
          if (currentSection) {
            // End previous section
            analysis.section_boundaries[currentSection] = {
              start: sectionStart,
              end: i - 1
            };
          }
          currentSection = sectionMatch[1];
          sectionStart = i;
        }
      }
      
      // Detect section end
      if (line.includes('</section>') && currentSection) {
        analysis.section_boundaries[currentSection] = {
          start: sectionStart,
          end: i
        };
        currentSection = null;
      }
    }

    // Find target section specifically
    if (target_section) {
      const targetSectionLower = target_section.toLowerCase();
      analysis.target_section = {
        name: target_section,
        boundaries: null,
        current_content: null,
        has_image: false,
        image_placeholder: null
      };

      // Find the target section boundaries
      for (const [sectionName, boundaries] of Object.entries(analysis.section_boundaries)) {
        if (sectionName.toLowerCase().includes(targetSectionLower) || 
            targetSectionLower.includes(sectionName.toLowerCase())) {
          analysis.target_section.boundaries = boundaries;
          analysis.target_section.current_content = lines.slice(boundaries.start, boundaries.end + 1).join('\n');
          
          // Check if section already has an image
          const hasImage = analysis.target_section.current_content.includes('<img') || 
                          analysis.target_section.current_content.includes('{GENERATED_IMAGE_URL');
          analysis.target_section.has_image = hasImage;
          
          // Find existing placeholder in this section
          const placeholderMatch = analysis.target_section.current_content.match(/\{GENERATED_IMAGE_URL_[^}]+\}/);
          if (placeholderMatch) {
            analysis.target_section.image_placeholder = placeholderMatch[0];
          }
          
          break;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      message: `Analyzed ${analysis.sections.length} sections, found ${analysis.existing_images.length} existing images, ${analysis.image_placeholders.length} placeholders`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Code analysis error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze code',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Handle smart placeholder generation
async function handleGeneratePlaceholders(request, env, corsHeaders) {
  try {
    const { user_message, current_files } = await request.json();
    
    if (!user_message) {
      return new Response(JSON.stringify({ error: 'user_message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Detect sections from user message
    const sectionKeywords = {
      'hero': ['hero', 'main', 'header', 'banner'],
      'about': ['about', 'about us', 'about section'],
      'features': ['feature', 'features', 'feature section'],
      'contact': ['contact', 'contact us', 'contact section'],
      'gallery': ['gallery', 'photos', 'images'],
      'logo': ['logo', 'brand', 'branding']
    };
    
    let requestedSections = [];
    const userMessageLower = user_message.toLowerCase();
    
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => userMessageLower.includes(keyword))) {
        requestedSections.push(section);
      }
    }
    
    // If no specific section mentioned, try to infer custom sections
    if (requestedSections.length === 0) {
      // Look for custom section names in the user message
      const customSectionMatch = userMessageLower.match(/(?:create|add|new)\s+(?:a\s+)?(?:new\s+)?(?:section\s+)?(?:called\s+)?([a-zA-Z]+)/);
      if (customSectionMatch) {
        requestedSections = [customSectionMatch[1].toLowerCase()];
      }
    }
    
    // Generate placeholders
    const generatePlaceholders = (sections) => {
      const placeholders = [];
      sections.forEach(section => {
        switch(section) {
          case 'hero':
            placeholders.push({
              placeholder: '{GENERATED_IMAGE_URL_HERO}',
              section: 'hero',
              description: 'Hero section background image',
              aspect_ratio: '16:9'
            });
            break;
          case 'logo':
            placeholders.push({
              placeholder: '{GENERATED_IMAGE_URL_LOGO}',
              section: 'logo',
              description: 'Logo image',
              aspect_ratio: '1:1'
            });
            break;
          case 'about':
            placeholders.push({
              placeholder: '{GENERATED_IMAGE_URL_ABOUT}',
              section: 'about',
              description: 'About section image',
              aspect_ratio: '4:3'
            });
            break;
          case 'contact':
            placeholders.push({
              placeholder: '{GENERATED_IMAGE_URL_CONTACT}',
              section: 'contact',
              description: 'Contact section image',
              aspect_ratio: '4:3'
            });
            break;
          case 'gallery':
            placeholders.push({
              placeholder: '{GENERATED_IMAGE_URL_GALLERY}',
              section: 'gallery',
              description: 'Gallery section image',
              aspect_ratio: '4:3'
            });
            break;
          case 'features':
            placeholders.push(
              {
                placeholder: '{GENERATED_IMAGE_URL_FEATURE_1}',
                section: 'feature_1',
                description: 'First feature image',
                aspect_ratio: '4:3'
              },
              {
                placeholder: '{GENERATED_IMAGE_URL_FEATURE_2}',
                section: 'feature_2',
                description: 'Second feature image',
                aspect_ratio: '4:3'
              },
              {
                placeholder: '{GENERATED_IMAGE_URL_FEATURE_3}',
                section: 'feature_3',
                description: 'Third feature image',
                aspect_ratio: '4:3'
              }
            );
            break;
          default:
            // For custom sections, create a custom placeholder
            const customPlaceholder = `{GENERATED_IMAGE_URL_${section.toUpperCase()}}`;
            placeholders.push({
              placeholder: customPlaceholder,
              section: section,
              description: `${section.charAt(0).toUpperCase() + section.slice(1)} section image`,
              aspect_ratio: '4:3',
              is_custom: true
            });
        }
      });
      return placeholders;
    };
    
    const placeholders = generatePlaceholders(requestedSections);
    
    return new Response(JSON.stringify({
      success: true,
      user_message: user_message,
      requested_sections: requestedSections,
      placeholders: placeholders,
      message: `Generated ${placeholders.length} placeholder(s) for section(s): ${requestedSections.join(', ')}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Placeholder generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate placeholders',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Serve image directly from R2
async function handleServeImage(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();
    
    console.log('🖼️ Serving image:', filename);
    
    // Get the image from R2
    const object = await env.IMAGES_BUCKET.get(filename);
    
    if (!object) {
      return new Response('Image not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain', ...corsHeaders }
      });
    }
    
    // Set appropriate headers
    const headers = new Headers(corsHeaders);
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000');
    
    return new Response(object.body, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Serve image error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain', ...corsHeaders }
    });
  }
} 

// === FILE HISTORY SYSTEM FUNCTIONS ===

// Generate unique backup ID
function generateBackupId() {
  return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// === USER IMAGE UPLOAD HANDLER ===
// Accepts multipart/form-data or base64 JSON body and uploads to R2, returns a public serving URL
async function handleUploadImage(request, env, corsHeaders) {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    let project_id = null;
    let fileBytes = null;
    let mimeType = 'image/jpeg';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      project_id = form.get('project_id');
      const file = form.get('file');
      if (!file || typeof file.arrayBuffer !== 'function') {
        return new Response(JSON.stringify({ error: 'file is required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      mimeType = file.type || 'image/jpeg';
      fileBytes = new Uint8Array(await file.arrayBuffer());
    } else {
      // JSON body: { project_id, data_url }
      const body = await request.json();
      project_id = body.project_id;
      const dataUrl = body.data_url;
      if (!dataUrl) {
        return new Response(JSON.stringify({ error: 'data_url is required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      // dataUrl format: data:<mime>;base64,<payload>
      const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid data_url format' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      mimeType = match[1] || 'image/jpeg';
      const base64 = match[2];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      fileBytes = bytes;
    }

    if (!project_id) {
      return new Response(JSON.stringify({ error: 'project_id is required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const uploadResult = await uploadImageToR2(fileBytes, env, request, mimeType);
    if (!uploadResult.success) {
      return new Response(JSON.stringify({ error: 'Upload failed', details: uploadResult.error }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Optionally store metadata in DB
    try {
      await saveImageToDatabase({
        project_id,
        prompt: 'user-upload',
        aspect_ratio: 'custom',
        filename: uploadResult.filename,
        r2_url: uploadResult.url,
        file_size: fileBytes.length,
        width: 0,
        height: 0,
        mime_type: mimeType,
        imageId: uploadResult.imageId
      }, env);
    } catch (_) {}

    return new Response(JSON.stringify({ success: true, url: uploadResult.url, image_id: uploadResult.imageId }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (error) {
    console.error('Upload image error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

// Store file backup in database
async function storeFileBackup(projectId, backupId, files, timestamp, userMessage, env) {
  try {
    const stmt = env.DB.prepare(`
      INSERT INTO file_backups (project_id, backup_id, files, timestamp, user_message)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(projectId, backupId, JSON.stringify(files), timestamp, userMessage).run();
    console.log('💾 File backup stored:', backupId);
  } catch (error) {
    console.error('Failed to store file backup:', error);
  }
}

// Business type detection with keywords
const BUSINESS_TYPE_KEYWORDS = {
  ecommerce_fashion: ["store", "shop", "fashion", "clothing", "retail", "products", "shopping", "ecommerce", "e-commerce"],
  mobile_app: ["app", "mobile", "application", "smartphone", "ios", "android", "download", "install"],
  consulting_service: ["consulting", "strategy", "business", "advisory", "expert", "professional", "consultant"],
  online_education: ["course", "learning", "education", "training", "skill", "online course", "learn", "study"],
  real_estate: ["real estate", "property", "house", "home", "realty", "agent", "buy", "sell", "rent"],
  healthcare_wellness: ["health", "wellness", "medical", "care", "doctor", "clinic", "therapy", "treatment"],
  creative_agency: ["design", "creative", "agency", "branding", "marketing", "portfolio", "art", "designer"],
  subscription_box: ["subscription", "box", "monthly", "curated", "delivery", "subscription box"],
  local_service: ["service", "local", "professional", "plumbing", "cleaning", "repair", "maintenance", "bar", "restaurant", "cafe", "food", "drink", "alcohol", "cocktail", "dining"],
  saas_b2b: ["software", "saas", "enterprise", "business", "platform", "tool", "solution", "b2b"]
};

// Color schemes for each business type
const COLOR_SCHEMES = {
  ecommerce_fashion: {
    primary: "#FF6B9D", // Rose pink
    secondary: "#4A90E2", // Sky blue  
    accent: "#F8B500", // Golden yellow
    gradient: "linear-gradient(135deg, #FF6B9D 0%, #4A90E2 100%)"
  },
  mobile_app: {
    primary: "#6366F1", // Indigo
    secondary: "#EC4899", // Pink
    accent: "#10B981", // Emerald
    gradient: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)"
  },
  consulting_service: {
    primary: "#1E40AF", // Blue-800
    secondary: "#7C3AED", // Violet-600
    accent: "#F59E0B", // Amber-500
    gradient: "linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)"
  },
  online_education: {
    primary: "#059669", // Emerald-600
    secondary: "#7C3AED", // Violet-600
    accent: "#F59E0B", // Amber-500
    gradient: "linear-gradient(135deg, #059669 0%, #7C3AED 100%)"
  },
  real_estate: {
    primary: "#DC2626", // Red-600
    secondary: "#1E40AF", // Blue-800
    accent: "#F59E0B", // Amber-500
    gradient: "linear-gradient(135deg, #DC2626 0%, #1E40AF 100%)"
  },
  healthcare_wellness: {
    primary: "#059669", // Emerald-600
    secondary: "#3B82F6", // Blue-500
    accent: "#F59E0B", // Amber-500
    gradient: "linear-gradient(135deg, #059669 0%, #3B82F6 100%)"
  },
  creative_agency: {
    primary: "#7C3AED", // Violet-600
    secondary: "#EC4899", // Pink-500
    accent: "#F59E0B", // Amber-500
    gradient: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)"
  },
  subscription_box: {
    primary: "#EC4899", // Pink-500
    secondary: "#8B5CF6", // Violet-500
    accent: "#F59E0B", // Amber-500
    gradient: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)"
  },
  local_service: {
    primary: "#1E40AF", // Blue-800
    secondary: "#059669", // Emerald-600
    accent: "#F59E0B", // Amber-500
    gradient: "linear-gradient(135deg, #1E40AF 0%, #059669 100%)"
  },
  bar_restaurant: {
    primary: "#D97706", // Amber-600
    secondary: "#DC2626", // Red-600
    accent: "#059669", // Emerald-600
    gradient: "linear-gradient(135deg, #D97706 0%, #DC2626 100%)"
  },
  saas_b2b: {
    primary: "#1E40AF", // Blue-800
    secondary: "#374151", // Gray-700
    accent: "#10B981", // Emerald-500
    gradient: "linear-gradient(135deg, #1E40AF 0%, #374151 100%)"
  }
};

// Detect business type from user message
// Detect business type from user message using GPT-4o-mini
async function detectBusinessType(userMessage, env) {
  try {
    console.log(`🔍 Using GPT-4o-mini to detect business type for: "${userMessage}"`);
    
    // Use GPT-4o-mini for business type classification
    const response = await callOpenAIBusinessType(userMessage, env);
    
    // Log the full response for debugging
    console.log(`🔍 GPT-4o-mini raw response: "${response.assistant_message}"`);
    console.log(`🔍 Response length: ${response.assistant_message ? response.assistant_message.length : 0} characters`);
    
    if (response.assistant_message) {
      let detectedType = response.assistant_message.trim().toLowerCase();
      
      console.log(`🔍 Trimmed and lowercased response: "${detectedType}"`);
      
      // If the AI returned a long response, try to extract the business type
      if (detectedType.length > 50) {
        console.log(`⚠️ AI returned long response, attempting to extract business type...`);

        // Try to find a business type code in the response
        const businessTypes = [
          'ecommerce_fashion', 'mobile_app', 'consulting_service', 'online_education',
          'real_estate', 'healthcare_wellness', 'creative_agency', 'subscription_box',
          'bar_restaurant', 'local_service', 'saas_b2b'
        ];

        for (const businessType of businessTypes) {
          if (detectedType.includes(businessType)) {
            detectedType = businessType;
            console.log(`🔍 Extracted business type from long response: ${detectedType}`);
            break;
          }
        }

        // If still no match found, try context-based detection
        if (detectedType.length > 50) {
          console.log(`⚠️ No business type code found, attempting context-based detection...`);
          
          const context = userMessage.toLowerCase();
          
          // Check for bar/restaurant indicators
          if (context.includes('bar') || 
              context.includes('restaurant') || 
              context.includes('cafe') || 
              context.includes('pub') ||
              context.includes('alcohol') ||
              context.includes('drink') ||
              context.includes('food') ||
              context.includes('dining') ||
              context.includes('cuisine') ||
              context.includes('serving')) {
            detectedType = 'bar_restaurant';
            console.log(`🔍 Context-based detection: bar_restaurant`);
          }
          // Check for SaaS/B2B software first (higher priority)
          else if (context.includes('software') || 
                   context.includes('api') || 
                   context.includes('saas') || 
                   context.includes('b2b') ||
                   context.includes('enterprise') ||
                   context.includes('platform') ||
                   context.includes('gemini') ||
                   context.includes('react') ||
                   context.includes('python') ||
                   context.includes('library') ||
                   context.includes('generate') ||
                   context.includes('automation') ||
                   context.includes('tool') ||
                   context.includes('service')) {
            detectedType = 'saas_b2b';
            console.log(`🔍 Context-based detection: saas_b2b`);
          }
          // Check for mobile apps (lower priority)
          else if (context.includes('app') || context.includes('mobile') || context.includes('smartphone')) {
            detectedType = 'mobile_app';
            console.log(`🔍 Context-based detection: mobile_app`);
          }
          else if (context.includes('consulting') || context.includes('strategy') || context.includes('business')) {
            detectedType = 'consulting_service';
            console.log(`🔍 Context-based detection: consulting_service`);
          }
          else if (context.includes('education') || context.includes('learning') || context.includes('course')) {
            detectedType = 'online_education';
            console.log(`🔍 Context-based detection: online_education`);
          }
          else if (context.includes('fashion') || context.includes('clothing') || context.includes('style')) {
            detectedType = 'ecommerce_fashion';
            console.log(`🔍 Context-based detection: ecommerce_fashion`);
          }
          else {
            detectedType = 'local_service';
            console.log(`🔍 Context-based detection: local_service (default)`);
          }
        }
      }

      // Validate the response is one of our known types
      const validTypes = [
        'ecommerce_fashion', 'mobile_app', 'consulting_service', 'online_education',
        'real_estate', 'healthcare_wellness', 'creative_agency', 'subscription_box',
        'bar_restaurant', 'local_service', 'saas_b2b'
      ];

      if (validTypes.includes(detectedType)) {
        console.log(`🤖 AI detected business type: ${detectedType}`);
        return detectedType;
      } else {
        console.log(`⚠️ AI returned unknown type: "${detectedType}", using fallback: local_service`);
        return 'local_service'; // Default fallback
      }
    } else {
      console.log(`⚠️ AI response missing assistant_message, using fallback: local_service`);
      return 'local_service'; // Default fallback
    }
  } catch (error) {
    console.log(`⚠️ Error calling AI for business type detection: ${error.message}, using fallback: local_service`);
    return 'local_service'; // Default fallback
  }
}

// Check if a prompt is vague and needs clarification
function isVaguePrompt(messageLower) {
  const vagueKeywords = [
    'landing page', 'website', 'site', 'page', 'create', 'build', 'make', 'generate',
    'bar', 'restaurant', 'cafe', 'shop', 'store', 'business', 'startup', 'company'
  ];
  
  const specificKeywords = [
    'mobile app', 'fashion', 'consulting', 'education', 'real estate', 'healthcare',
    'creative agency', 'subscription', 'saas', 'software', 'ecommerce', 'online store',
    'api', 'gemini', 'react', 'python', 'library', 'generate', 'automation', 'tool',
    'platform', 'enterprise', 'b2b', 'service'
  ];
  
  // If the message is very short (less than 10 words), it's likely vague
  const wordCount = messageLower.split(' ').length;
  console.log(`🔍 isVaguePrompt analysis for: "${messageLower}"`);
  console.log(`   wordCount: ${wordCount}`);
  
  if (wordCount < 3) {
    console.log(`   ✅ Vague: word count < 3`);
    return true;
  }
  
  // If it contains vague keywords but no specific business type indicators
  const hasVagueKeywords = vagueKeywords.some(keyword => messageLower.includes(keyword));
  const hasSpecificKeywords = specificKeywords.some(keyword => messageLower.includes(keyword));
  
  console.log(`   hasVagueKeywords: ${hasVagueKeywords}`);
  console.log(`   hasSpecificKeywords: ${hasSpecificKeywords}`);
  console.log(`   Result: ${hasVagueKeywords && !hasSpecificKeywords}`);
  
  return hasVagueKeywords && !hasSpecificKeywords;
}

// Generate intelligent clarification questions based on the user's initial prompt
function generateIntelligentQuestions(userMessage) {
  const messageLower = userMessage.toLowerCase();
  
  // Analyze the prompt to determine what type of business they're thinking about
  let businessContext = 'general';
  let specificDetails = [];
  
  if (messageLower.includes('bar') || messageLower.includes('restaurant') || messageLower.includes('cafe')) {
    businessContext = 'food_service';
    if (messageLower.includes('space')) specificDetails.push('space_theme');
    if (messageLower.includes('vintage')) specificDetails.push('vintage_theme');
    if (messageLower.includes('modern')) specificDetails.push('modern_theme');
  } else if (messageLower.includes('store') || messageLower.includes('shop')) {
    businessContext = 'retail';
    if (messageLower.includes('fashion') || messageLower.includes('clothing')) specificDetails.push('fashion');
    if (messageLower.includes('tech') || messageLower.includes('electronics')) specificDetails.push('tech');
  } else if (messageLower.includes('app') || messageLower.includes('software')) {
    businessContext = 'tech_product';
    if (messageLower.includes('productivity')) specificDetails.push('productivity');
    if (messageLower.includes('social')) specificDetails.push('social');
  } else if (messageLower.includes('service') || messageLower.includes('consulting')) {
    businessContext = 'service_business';
  }
  
  // Generate context-aware questions
  const questions = [];
  
  // First question: Business type (if not clear from context)
  if (businessContext === 'general') {
    questions.push({
      id: 'business_type',
      question: "What type of business are you starting? (e.g., restaurant, mobile app, online store, consulting service, etc.)",
      context: 'identify_business_type'
    });
  } else {
    // If we have context, ask for business name first
    questions.push({
      id: 'business_name',
      question: "What's your business name? (If you don't have one yet, I can suggest some creative options!)",
      context: 'get_business_name'
    });
  }
  
  // Add context-specific questions
  if (businessContext === 'food_service') {
    if (specificDetails.includes('space_theme')) {
      questions.push({
        id: 'space_concept',
        question: "Tell me more about your space theme! Are you thinking futuristic, retro space, or something else?",
        context: 'space_theme_details'
      });
    }
    questions.push({
      id: 'cuisine_type',
      question: "What type of food or drinks will you serve?",
      context: 'food_service_details'
    });
  } else if (businessContext === 'retail') {
    if (specificDetails.includes('fashion')) {
      questions.push({
        id: 'fashion_style',
        question: "What's your fashion style? (e.g., casual, luxury, sustainable, vintage, etc.)",
        context: 'fashion_details'
      });
    }
    questions.push({
      id: 'target_audience',
      question: "Who is your target audience?",
      context: 'audience_details'
    });
  } else if (businessContext === 'tech_product') {
    questions.push({
      id: 'problem_solved',
      question: "What problem does your app solve?",
      context: 'product_purpose'
    });
  } else if (businessContext === 'service_business') {
    questions.push({
      id: 'services_offered',
      question: "What specific services do you offer?",
      context: 'service_details'
    });
  }
  
  // Add goal question
  questions.push({
    id: 'website_goal',
    question: "What's the main goal of your website? (e.g., sell products, collect leads, showcase services, etc.)",
    context: 'website_purpose'
  });
  
  return questions;
}

// Generate business info based on detected type
function generateBusinessInfo(userMessage, detectedType) {
  const colorScheme = COLOR_SCHEMES[detectedType];
  
  // Extract business name from user message with more creative fallbacks
  const nameMatch = userMessage.match(/(?:called|named|for)\s+['"`]?([A-Za-z0-9\s]+)['"`]?/i);
  let businessName = nameMatch ? nameMatch[1].trim() : null;
  
  // Generate creative business names if not provided
  const creativeNames = {
    ecommerce_fashion: ["StyleVault", "FashionForward", "TrendCraft", "EleganceHub", "ChicBoutique"],
    mobile_app: ["TaskFlow", "SmartSync", "AppCraft", "DigitalHub", "TechFlow"],
    consulting_service: ["StrategyForge", "BusinessCraft", "InsightPartners", "GrowthCatalyst", "VisionWorks"],
    online_education: ["LearnCraft", "SkillForge", "EduHub", "KnowledgeFlow", "AcademyPro"],
    real_estate: ["HomeCraft", "PropertyForge", "RealtyHub", "DreamHomes", "EstateFlow"],
    healthcare_wellness: ["WellnessCraft", "HealthForge", "VitalHub", "CareFlow", "WellnessPro"],
    creative_agency: ["CreativeForge", "DesignCraft", "ArtHub", "InnovationFlow", "CreativePro"],
    subscription_box: ["BoxCraft", "CuratedFlow", "MonthlyHub", "SurpriseForge", "BoxPro"],
    bar_restaurant: ["Cosmic Cantina", "Stellar Bites", "Nebula Lounge", "Galaxy Grill", "Orbit Bar"],
    local_service: ["ServiceCraft", "LocalForge", "CommunityHub", "ServiceFlow", "LocalPro"],
    saas_b2b: ["TechForge", "BusinessCraft", "EnterpriseHub", "SaaSFlow", "BusinessPro"]
  };
  
  if (!businessName) {
    const names = creativeNames[detectedType] || ["BusinessCraft", "InnovationHub", "ProFlow"];
    businessName = names[Math.floor(Math.random() * names.length)];
  }
  
  // Generate creative taglines based on business type
  const taglines = {
    ecommerce_fashion: [
      "Curated fashion for the modern lifestyle",
      "Where style meets sophistication",
      "Elevate your wardrobe with curated elegance",
      "Fashion that speaks your language",
      "Trendsetting styles for the contemporary individual"
    ],
    mobile_app: [
      "Your digital life, simplified",
      "Technology that works for you",
      "Streamline your world with smart solutions",
      "Innovation at your fingertips",
      "Empowering your digital journey"
    ],
    consulting_service: [
      "Transforming businesses through strategic insight",
      "Where expertise meets execution",
      "Catalyzing growth through strategic partnership",
      "Your success is our mission",
      "Strategic solutions for ambitious businesses"
    ],
    online_education: [
      "Master new skills at your own pace",
      "Knowledge is power, learning is freedom",
      "Unlock your potential through expert guidance",
      "Education reimagined for the digital age",
      "Your journey to mastery starts here"
    ],
    real_estate: [
      "Finding your perfect home",
      "Where dreams become addresses",
      "Your trusted partner in real estate",
      "Building communities, one home at a time",
      "Excellence in every transaction"
    ],
    healthcare_wellness: [
      "Your health, our priority",
      "Wellness redefined for modern living",
      "Caring for you, body and mind",
      "Your journey to optimal health",
      "Where care meets innovation"
    ],
    creative_agency: [
      "Where creativity meets strategy",
      "Bringing your vision to life",
      "Creative solutions that drive results",
      "Designing tomorrow's success stories",
      "Innovation through creative excellence"
    ],
    subscription_box: [
      "Curated experiences delivered monthly",
      "Surprise and delight, month after month",
      "Curated collections for every lifestyle",
      "Discover amazing products every month",
      "Your monthly dose of curated excellence"
    ],
    local_service: [
      "Professional service, local expertise",
      "Your trusted local partner",
      "Quality service, community focused",
      "Excellence in every project",
      "Local expertise, professional results"
    ],
    bar_restaurant: [
      "Where culinary excellence meets cosmic atmosphere",
      "Experience dining beyond the ordinary",
      "Crafting memorable moments through exceptional cuisine",
      "A journey of flavors in an extraordinary setting",
      "Where every meal is an adventure"
    ],
    saas_b2b: [
      "Enterprise solutions for modern businesses",
      "Powering business transformation",
      "Scalable solutions for growing companies",
      "Innovation that drives business success",
      "Your partner in digital transformation"
    ]
  };
  
  const taglineOptions = taglines[detectedType] || ["Your business, our expertise"];
  const tagline = taglineOptions[Math.floor(Math.random() * taglineOptions.length)];
  
  return {
    name: businessName,
    tagline: tagline,
    color_scheme: detectedType,
    colors: colorScheme
  };
}

// Analyze user request for section targeting
async function analyzeUserRequest(userMessage, projectFiles, env, projectId = null) {
  const messageLower = userMessage.toLowerCase();
  
  console.log(`🔍 Analyzing request: "${userMessage}"`);
  console.log(`   projectFiles keys: ${Object.keys(projectFiles || {}).length}`);
  console.log(`   projectId: ${projectId}`);
  
  // Check if this is an initial prompt by looking at chat history
  let isInitialPrompt = false;
  let isClarificationResponse = false;
  let clarificationState = null;
  
  if (projectId) {
    try {
      const db = env.DB;
      
      // First, check if there are any existing messages for this project
      const existingMessages = await db.prepare(
        'SELECT COUNT(*) as count FROM chat_messages WHERE project_id = ?'
      ).bind(projectId).first();
      
      const messageCount = existingMessages.count;
      console.log(`   chat history count: ${messageCount}`);
      
      // If this is the first message for this project, it's an initial prompt
      // Since the frontend adds the message before calling this function, 
      // we check for exactly 1 message (the current one being processed)
      if (messageCount === 0 || messageCount === 1) {
        isInitialPrompt = true;
        console.log(`   First message for project - marking as initial prompt (count: ${messageCount})`);
      } else {
        // Check if this is a response to a clarification question
        const lastAssistantMessage = await db.prepare(
          'SELECT clarification_state FROM chat_messages WHERE project_id = ? AND role = ? ORDER BY timestamp DESC LIMIT 1'
        ).bind(projectId, 'assistant').first();
        
        if (lastAssistantMessage && lastAssistantMessage.clarification_state) {
          try {
            clarificationState = JSON.parse(lastAssistantMessage.clarification_state);
            isClarificationResponse = true;
            console.log(`   Found clarification state: question ${clarificationState.currentQuestionIndex + 1} of ${clarificationState.clarificationQuestions.length}`);
          } catch (e) {
            console.log(`   Error parsing clarification state: ${e.message}`);
          }
        }
        
        // If not a clarification response, this is a subsequent message (not initial)
        if (!isClarificationResponse) {
          isInitialPrompt = false;
          console.log(`   Subsequent message detected - not initial prompt`);
        }
      }
      
    } catch (error) {
      console.log(`   Error checking chat history: ${error.message}`);
      // Fallback: if we can't check chat history, assume it's initial if project files are minimal
      isInitialPrompt = !projectFiles || Object.keys(projectFiles).length <= 2;
    }
  } else {
    // No project ID, assume it's initial
    isInitialPrompt = true;
  }
  
  console.log(`   isInitialPrompt: ${isInitialPrompt}`);
  console.log(`   isClarificationResponse: ${isClarificationResponse}`);
  
  // If this is a response to a clarification question, process it
  if (isClarificationResponse && clarificationState) {
    console.log(`✅ Processing clarification response`);
    return await processClarificationResponse(userMessage, clarificationState, env);
  }
  
  // If this is an initial prompt and it's vague, start the clarification process
  if (isInitialPrompt && isVaguePrompt(messageLower)) {
    console.log(`✅ Vague prompt detected - starting clarification process`);
    const questions = generateIntelligentQuestions(userMessage);
    return {
      needsClarification: true,
      clarificationQuestions: questions,
      currentQuestionIndex: 0,
      clarificationAnswers: {},
      targetSections: [],
      operationType: 'clarify',
      imageOperation: false,
      textOperation: false,
      styleOperation: false,
      specificTargets: [],
      businessType: null,
      businessInfo: null
    };
  }
  
  console.log(`❌ Not a vague prompt or not initial - proceeding with business type detection`);
  
  // Only detect business type for initial prompts or if not a targeted edit
  let businessType, businessInfo;
  
  if (isInitialPrompt) {
    console.log(`🔍 Initial prompt detected - detecting business type...`);
    businessType = await detectBusinessType(userMessage, env);
    businessInfo = generateBusinessInfo(userMessage, businessType);
  } else {
    console.log(`🎯 Subsequent prompt detected - skipping business type detection for targeted editing`);
    // For targeted edits, we'll use existing business info or detect from context
    businessType = 'local_service'; // Default fallback
    businessInfo = generateBusinessInfo(userMessage, businessType);
  }
  
  // === ENHANCED TARGETED EDITING ANALYSIS ===
  const analysis = {
    targetSections: [],
    operationType: isInitialPrompt ? 'create' : 'modify', // 'create', 'modify', 'delete'
    imageOperation: false,
    textOperation: false,
    styleOperation: false,
    specificTargets: [],
    businessType: businessType,
    businessInfo: businessInfo,
    needsClarification: false,
    isTargetedEdit: false,
    editScope: 'full', // 'full', 'section', 'element', 'style'
    preserveImages: true,
    preserveStructure: true
  };
  
  // === DETECT TARGETED EDITING PATTERNS ===
  const targetedEditPatterns = {
    // Text/content changes
    'text': ['change text', 'update text', 'modify text', 'edit text', 'replace text', 'change content', 'update content'],
    'title': ['change title', 'update title', 'modify title', 'edit title', 'replace title'],
    'description': ['change description', 'update description', 'modify description', 'edit description'],
    'tagline': ['change tagline', 'update tagline', 'modify tagline', 'edit tagline'],
    
    // Style changes
    'color': ['change color', 'update color', 'modify color', 'edit color', 'different color', 'new color'],
    'style': ['change style', 'update style', 'modify style', 'edit style', 'different style'],
    'font': ['change font', 'update font', 'modify font', 'edit font', 'different font'],
    'layout': ['change layout', 'update layout', 'modify layout', 'edit layout', 'different layout'],
    
    // Image changes
    'image': ['change image', 'update image', 'modify image', 'edit image', 'replace image', 'new image', 'different image'],
    'photo': ['change photo', 'update photo', 'modify photo', 'edit photo', 'replace photo', 'new photo'],
    'picture': ['change picture', 'update picture', 'modify picture', 'edit picture', 'replace picture', 'new picture'],
    
    // Section changes
    'section': ['change section', 'update section', 'modify section', 'edit section', 'replace section'],
    'add section': ['add section', 'new section', 'create section', 'insert section'],
    'remove section': ['remove section', 'delete section', 'remove', 'delete'],
    
    // Business info changes
    'business name': ['change business name', 'update business name', 'modify business name', 'edit business name', 'different business name'],
    'company name': ['change company name', 'update company name', 'modify company name', 'edit company name'],
    'brand name': ['change brand name', 'update brand name', 'modify brand name', 'edit brand name']
  };
  
  // Check for targeted editing patterns
  for (const [operation, patterns] of Object.entries(targetedEditPatterns)) {
    if (patterns.some(pattern => messageLower.includes(pattern))) {
      analysis.isTargetedEdit = true;
      
      if (operation === 'text' || operation === 'title' || operation === 'description' || operation === 'tagline') {
        analysis.textOperation = true;
        analysis.editScope = 'element';
      } else if (operation === 'color' || operation === 'style' || operation === 'font' || operation === 'layout') {
        analysis.styleOperation = true;
        analysis.editScope = 'style';
      } else if (operation === 'image' || operation === 'photo' || operation === 'picture') {
        analysis.imageOperation = true;
        analysis.editScope = 'element';
      } else if (operation === 'section') {
        analysis.editScope = 'section';
      } else if (operation === 'add section') {
        analysis.editScope = 'section';
        analysis.operationType = 'add';
      } else if (operation === 'remove section') {
        analysis.editScope = 'section';
        analysis.operationType = 'delete';
      }
      
      console.log(`🎯 Detected targeted edit: ${operation} (scope: ${analysis.editScope})`);
    }
  }
  
  // === DETECT SPECIFIC SECTIONS ===
  const sectionPatterns = {
    'hero': ['hero', 'main', 'header', 'banner', 'top section'],
    'about': ['about', 'about us', 'about section'],
    'features': ['feature', 'features', 'feature section', 'services'],
    'contact': ['contact', 'contact us', 'contact section'],
    'gallery': ['gallery', 'photos', 'images', 'portfolio'],
    'logo': ['logo', 'brand', 'branding'],
    'navigation': ['nav', 'navigation', 'menu', 'navbar'],
    'footer': ['footer', 'bottom'],
    'testimonials': ['testimonial', 'testimonials', 'reviews'],
    'pricing': ['pricing', 'price', 'cost'],
    'faq': ['faq', 'questions', 'help']
  };
  
  for (const [section, keywords] of Object.entries(sectionPatterns)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      analysis.targetSections.push(section);
      console.log(`🎯 Detected target section: ${section}`);
    }
  }
  
  // === DETECT SPECIFIC ELEMENTS ===
  const elementPatterns = {
    'button': ['button', 'cta', 'call to action'],
    'form': ['form', 'input', 'field'],
    'link': ['link', 'url', 'href'],
    'image': ['image', 'img', 'photo', 'picture'],
    'text': ['text', 'content', 'paragraph', 'p']
  };
  
  for (const [element, keywords] of Object.entries(elementPatterns)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      analysis.specificTargets.push(element);
      console.log(`🎯 Detected target element: ${element}`);
    }
  }
  
  // === DETECT PRESERVATION INTENT ===
  const preservationKeywords = ['keep', 'preserve', 'maintain', 'don\'t change', 'leave', 'existing'];
  if (preservationKeywords.some(keyword => messageLower.includes(keyword))) {
    analysis.preserveImages = true;
    analysis.preserveStructure = true;
    console.log(`🛡️ Detected preservation intent`);
  }
  
  // === DETECT REGENERATION INTENT ===
  const regenerationKeywords = ['regenerate', 'recreate', 'rebuild', 'start over', 'completely new', 'entirely new'];
  if (regenerationKeywords.some(keyword => messageLower.includes(keyword))) {
    analysis.editScope = 'full';
    analysis.isTargetedEdit = false;
    console.log(`🔄 Detected regeneration intent`);
  }
  
  // === FINAL ANALYSIS LOGGING ===
  console.log(`📊 Final Analysis Results:`);
  console.log(`   - Is targeted edit: ${analysis.isTargetedEdit}`);
  console.log(`   - Edit scope: ${analysis.editScope}`);
  console.log(`   - Target sections: ${analysis.targetSections.join(', ') || 'none'}`);
  console.log(`   - Target elements: ${analysis.specificTargets.join(', ') || 'none'}`);
  console.log(`   - Text operation: ${analysis.textOperation}`);
  console.log(`   - Style operation: ${analysis.styleOperation}`);
  console.log(`   - Image operation: ${analysis.imageOperation}`);
  console.log(`   - Preserve images: ${analysis.preserveImages}`);
  console.log(`   - Preserve structure: ${analysis.preserveStructure}`);
  console.log(`   - Operation type: ${analysis.operationType}`);
  console.log(`   - Business type: ${analysis.businessType}`);
  
  return analysis;
}

// Process a response to a clarification question
async function processClarificationResponse(userMessage, clarificationState, env) {
  const { clarificationQuestions, currentQuestionIndex, clarificationAnswers } = clarificationState;
  const currentQuestion = clarificationQuestions[currentQuestionIndex];
  
  console.log(`   Processing response to question ${currentQuestionIndex + 1}: ${currentQuestion.id}`);
  
  // Store the user's answer
  const updatedAnswers = {
    ...clarificationAnswers,
    [currentQuestion.id]: userMessage
  };
  
  // Check if we have more questions
  const nextQuestionIndex = currentQuestionIndex + 1;
  
  if (nextQuestionIndex < clarificationQuestions.length) {
    // Ask the next question
    const nextQuestion = clarificationQuestions[nextQuestionIndex];
    console.log(`   Asking next question: ${nextQuestion.id}`);
    
    return {
      needsClarification: true,
      clarificationQuestions: clarificationQuestions,
      currentQuestionIndex: nextQuestionIndex,
      clarificationAnswers: updatedAnswers,
      targetSections: [],
      operationType: 'clarify',
      imageOperation: false,
      textOperation: false,
      styleOperation: false,
      specificTargets: [],
      businessType: null,
      businessInfo: null
    };
                    } else {
                    // All questions answered, generate the website
                    console.log(`   All questions answered, generating website with:`, updatedAnswers);
                    
                    // Generate a comprehensive prompt from the answers
                    const comprehensivePrompt = generateComprehensivePrompt(updatedAnswers);
                    
                    console.log(`🔍 About to call detectBusinessType with prompt: "${comprehensivePrompt}"`);
                    
                    // Proceed with normal website generation
                    const businessType = await detectBusinessType(comprehensivePrompt, env);
                    console.log(`🔍 detectBusinessType returned: "${businessType}"`);
                    
                    const businessInfo = generateBusinessInfo(comprehensivePrompt, businessType);
    
    return {
      needsClarification: false,
      clarificationQuestions: null,
      currentQuestionIndex: null,
      clarificationAnswers: updatedAnswers,
      targetSections: [],
      operationType: 'create',
      imageOperation: false,
      textOperation: false,
      styleOperation: false,
      specificTargets: [],
      businessType: businessType,
      businessInfo: businessInfo,
      comprehensivePrompt: comprehensivePrompt
    };
  }
}

// Generate a comprehensive prompt from clarification answers
function generateComprehensivePrompt(answers) {
  console.log('🔍 generateComprehensivePrompt - Input answers:', answers);
  
  let prompt = "Generate a professional landing page for ";
  
  // Build a descriptive prompt without trying to detect business type
  // Let GPT-4o-mini handle the business type detection
  if (answers.business_name) {
    prompt += `a business called "${answers.business_name}"`;
  } else {
    prompt += `a business`;
  }
  
  if (answers.space_concept) {
    prompt += ` with a ${answers.space_concept} theme`;
  }
  
  if (answers.cuisine_type) {
    prompt += ` serving ${answers.cuisine_type}`;
  }
  
  if (answers.fashion_style) {
    prompt += ` specializing in ${answers.fashion_style} fashion`;
  }
  
  if (answers.problem_solved) {
    prompt += ` that solves the problem of ${answers.problem_solved}`;
  }
  
  if (answers.services_offered) {
    prompt += ` offering ${answers.services_offered}`;
  }
  
  if (answers.target_audience) {
    prompt += ` targeting ${answers.target_audience}`;
  }
  
  if (answers.website_goal) {
    prompt += `. The main goal of the website is to ${answers.website_goal}`;
  }
  
  console.log('🔍 Generated comprehensive prompt:', prompt);
  
  return prompt;
}

// Build enhanced prompt using ACE method
function buildEnhancedPrompt(userMessage, projectFiles, sectionAnalysis, isInitialPrompt) {
  const { targetSections, imageOperation, textOperation, styleOperation, businessInfo } = sectionAnalysis;
  
  let prompt = `You are an expert React developer specializing in creating stunning, conversion-optimized landing pages. 

CRITICAL REQUIREMENTS FOR INITIAL PROMPTS:
${isInitialPrompt ? `
- ALWAYS create a complete, professional React component with proper imports
- ALWAYS include React hooks (useState, useEffect) for form handling and interactivity
- ALWAYS create functional forms with proper validation and state management
- ALWAYS include responsive design with Tailwind CSS breakpoints
- ALWAYS create a navigation header with smooth scrolling
- ALWAYS include a prominent hero section with business name and tagline
- ALWAYS add multiple sections: Hero, Features, About, Contact
- ALWAYS include proper form components with input fields, validation, and submit handlers
- ALWAYS use the specified color scheme throughout the entire component
- ALWAYS create interactive elements like hover effects and animations
- ALWAYS include proper image placeholders for all sections
- ALWAYS make the design mobile-responsive and professional
` : `
- Make targeted modifications to existing components
- Preserve existing structure and functionality
- Only modify sections explicitly mentioned in the request
`}

USER REQUEST: "${userMessage}"

DETECTED BUSINESS TYPE: ${businessInfo.color_scheme}
BUSINESS NAME: ${businessInfo.name}
BUSINESS TAGLINE: ${businessInfo.tagline}

COLOR SCHEME (APPLY THESE COLORS TO ALL COMPONENTS):
- Primary Color: ${businessInfo.colors.primary}
- Secondary Color: ${businessInfo.colors.secondary}
- Accent Color: ${businessInfo.colors.accent}
- Gradient: ${businessInfo.colors.gradient}

CRITICAL BUSINESS-SPECIFIC REQUIREMENTS (YOU MUST FOLLOW THESE EXACTLY):
${getBusinessSpecificRequirements(businessInfo.color_scheme)}

MANDATORY COMPLIANCE CHECK:
- You MUST implement ALL sections and features listed above
- You MUST include the exact form fields specified
- You MUST use the specified color scheme
- You MUST create a complete, functional React component
- You MUST NOT skip any required sections or features
- **CRITICAL**: You MUST follow the EXACT template structure below - DO NOT create your own version
- **CRITICAL**: You MUST include ALL the image placeholders shown in the template
- **CRITICAL**: You MUST NOT modify the template structure - only replace the business name and content

TARGET SECTIONS: ${targetSections.join(', ') || 'All sections for initial prompt'}
OPERATION TYPES: ${[
  imageOperation && 'Image modification',
  textOperation && 'Text modification', 
  styleOperation && 'Style modification'
].filter(Boolean).join(', ') || 'Complete website generation'}

CURRENT FILES:
${JSON.stringify(projectFiles, null, 2)}

CRITICAL RULES:
1. ${isInitialPrompt ? 'CREATE a complete React component with all necessary sections' : 'ONLY modify the sections mentioned in the user request'}
2. ALWAYS use proper React syntax with function components and hooks
3. ALWAYS include useState and useEffect for form handling and interactivity
4. ALWAYS create functional forms with proper validation and state management
5. ALWAYS apply the detected color scheme to all components
6. ALWAYS use the specified gradient for hero sections and CTAs
7. ALWAYS include responsive design with Tailwind CSS breakpoints
8. ALWAYS create a navigation header with smooth scrolling
9. ALWAYS include proper image placeholders for all sections
10. ALWAYS make the design mobile-responsive and professional
11. ALWAYS include proper form components with input fields and submit handlers
12. ALWAYS create interactive elements like hover effects and animations
13. **MANDATORY**: You MUST include ALL the business-specific features listed above
14. **MANDATORY**: You MUST create the exact forms specified in the business requirements
15. **MANDATORY**: You MUST include all the sections and features mentioned in the user request
16. **MANDATORY**: The generated code MUST be a complete, functional React component
17. **MANDATORY**: For mobile apps, you MUST include app store badges, download CTAs, screenshots, and testimonials
18. **MANDATORY**: You MUST implement ALL 9 sections listed in the business requirements
19. **MANDATORY**: The code MUST be production-ready with proper error handling
20. **MANDATORY**: You have 15,000 tokens available - use them to create a comprehensive, detailed implementation

CRITICAL JSON FORMATTING RULES:
- Use double quotes for all property names and string values
- No trailing commas before closing braces or brackets
- No comments or explanations outside the JSON
- Ensure all strings are properly escaped
- The response must be valid JSON that can be parsed by JSON.parse()
- DO NOT include any text before or after the JSON object
- DO NOT use markdown code blocks around the JSON

CRITICAL: You MUST return ONLY a valid JSON object with this EXACT structure:

{
  "assistant_message": "I've created a complete landing page with all requested features.",
  "updated_files": {
    "src/App.jsx": "import React, { useState, useEffect } from 'react';\\n\\nfunction App() {\\n  const [formData, setFormData] = useState({});\\n  const [email, setEmail] = useState('');\\n  \\n  const handleSubmit = (e) => {\\n    e.preventDefault();\\n    // Handle form submission\\n  };\\n  \\n  return (\\n    <div className=\\"min-h-screen bg-gradient-to-br from-indigo-500 to-pink-500\\">\\n      {/* Navigation */}\\n      <nav className=\\"...\\">\\n        {/* Navigation content */}\\n      </nav>\\n      \\n      {/* Hero Section with app name and tagline */}\\n      <section className=\\"hero-section\\">\\n        <h1>${businessInfo.name}</h1>\\n        <p>${businessInfo.tagline}</p>\\n        {/* App store badges and download buttons */}\\n      </section>\\n      \\n      {/* App Preview/Screenshots Section */}\\n      <section className=\\"app-preview\\">\\n        {/* Mobile mockups and screenshots */}\\n      </section>\\n      \\n      {/* Feature Showcase */}\\n      <section className=\\"features\\">\\n        {/* Feature cards with icons */}\\n      </section>\\n      \\n      {/* Beta Signup Form */}\\n      <section className=\\"beta-signup\\">\\n        <form onSubmit={handleSubmit}>\\n          <input type=\\"email\\" value={email} onChange={(e) => setEmail(e.target.value)} />\\n          <button type=\\"submit\\">Join Beta</button>\\n        </form>\\n      </section>\\n      \\n      {/* User Testimonials */}\\n      <section className=\\"testimonials\\">\\n        {/* Customer reviews */}\\n      </section>\\n      \\n      {/* About Section */}\\n      <section className=\\"about\\">\\n        {/* App benefits and description */}\\n      </section>\\n      \\n      {/* Contact Section */}\\n      <section className=\\"contact\\">\\n        {/* Contact form */}\\n      </section>\\n    </div>\\n  );\\n}"
  },
  "image_requests": [
    {
      "prompt": "A professional hero image for ${businessInfo.name}",
      "aspect_ratio": "16:9",
      "placement": "hero"
    }
  ],
  "business_info": {
    "name": "${businessInfo.name}",
    "tagline": "${businessInfo.tagline}",
    "color_scheme": "${businessInfo.color_scheme}"
  }
}`;

  return prompt;
}

// Get business-specific requirements based on business type
function getBusinessSpecificRequirements(businessType) {
  const requirements = {
    ecommerce_fashion: `
- Include a product showcase/grid section
- Add a style quiz form with multiple questions
- Include newsletter signup form
- Add shopping CTA buttons
- Create fashion-focused design elements
- Include product categories or filters
`,
    mobile_app: `
CRITICAL: You MUST create a mobile app landing page with these EXACT sections and features.

REQUIRED SECTIONS (ALL MUST BE INCLUDED):
1. Hero - with app name, tagline, and app store badges
2. App Preview/Screenshots - mobile mockups and app screenshots
3. Features - feature showcase with icons and descriptions
4. Beta Signup - email signup form with "Join Beta" button
5. Testimonials - user reviews and ratings
6. About - app benefits and description
7. Contact - contact form and information
8. Navigation - smooth scrolling header

REQUIRED FORM FIELDS:
- Email (required) for beta signup
- Name, Email, Message for contact form
- Submit button: "Join Beta" for signup, "Send" for contact

REQUIRED FEATURES:
- App store badges (Apple App Store and Google Play Store)
- Mobile mockup/screenshot section
- Feature cards with icons
- User testimonials with star ratings
- Beta signup form with validation
- Contact form
- Responsive navigation

REQUIRED STYLING:
- Use mobile_app color scheme (indigo-600, pink-500, emerald-500)
- Mobile responsive design
- Professional app store aesthetic

DO NOT SKIP ANY SECTION OR FEATURE!
`,
    consulting_service: `
CRITICAL: You MUST create a consulting service landing page with these EXACT sections and features.

REQUIRED SECTIONS (ALL MUST BE INCLUDED):
1. Hero - with company name and consultation CTA
2. Services - business optimization, profitability, strategic consulting
3. Consultation Form - with date, time, service type, company fields
4. Case Studies - success stories and client results
5. Expert Profiles - team member bios and credentials
6. Testimonials - client reviews and ratings
7. About - company mission and expertise
8. Contact - contact form and information

REQUIRED FORM FIELDS:
- Name (required)
- Email (required) 
- Phone (required)
- Company Name (required)
- Service Type (dropdown: Business Optimization, Profitability Improvement, Strategic Consulting)
- Preferred Date (date picker)
- Preferred Time (time picker)
- Message (textarea)
- Submit button: "Book Consultation"

REQUIRED STYLING:
- Use blue-800, violet-600, amber-500 colors
- Professional corporate design
- Mobile responsive

DO NOT SKIP ANY SECTION OR FEATURE!
`,
    online_education: `
CRITICAL: You MUST create an online education platform landing page with these EXACT sections and features.

REQUIRED SECTIONS (ALL MUST BE INCLUDED):
1. Hero - with platform name and learning CTA
2. Courses - course previews with programming, design, business categories
3. Features - learning modules, progress tracking, certification
4. Testimonials - student reviews and success stories
5. About - platform mission and learning philosophy
6. Contact - contact form and information

REQUIRED FEATURES:
- Course previews with images, descriptions, and "Enroll Now" buttons
- Student testimonials with photos and star ratings
- Enrollment forms with name, email, course selection
- Course categories (programming, design, business skills)
- Learning modules and curriculum structure
- Certification badges and completion certificates
- Professional educational design

REQUIRED FORM FIELDS:
- Name (required)
- Email (required)
- Course Selection (dropdown: Programming, Design, Business Skills)
- Message (textarea)
- Submit button: "Enroll Now"

REQUIRED STYLING:
- Use online_education color scheme (green-600, blue-500, orange-500)
- Modern, educational design
- Mobile responsive
- Professional course imagery

DO NOT SKIP ANY SECTION OR FEATURE!
`,
    bar_restaurant: `
CRITICAL: You MUST create a bar/restaurant landing page with these EXACT sections and features.

REQUIRED SECTIONS (ALL MUST BE INCLUDED):
1. Hero - with restaurant name, tagline, and reservation CTA
2. Menu Preview - featured dishes and drinks with descriptions
3. Atmosphere - ambiance photos and venue description
4. Special Events - private parties, events, happy hour
5. Testimonials - customer reviews and ratings
6. About - restaurant story and chef background
7. Contact - contact form, location, and hours
8. Navigation - smooth scrolling header

REQUIRED FEATURES:
- Menu preview with food/drink images and descriptions
- Reservation/booking form with date, time, party size
- Customer testimonials with photos and star ratings
- Special events and private party information
- Location map and operating hours
- Social media integration
- Professional restaurant aesthetic

REQUIRED FORM FIELDS:
- Name (required)
- Email (required)
- Phone (required)
- Date (date picker, required)
- Time (time picker, required)
- Party Size (dropdown: 1-2, 3-4, 5-6, 7-8, 9+)
- Special Requests (textarea)
- Submit button: "Make Reservation"

REQUIRED STYLING:
- Use bar_restaurant color scheme (amber-600, red-600, emerald-600)
- Warm, inviting restaurant atmosphere
- Mobile responsive design
- Professional hospitality aesthetic

DO NOT SKIP ANY SECTION OR FEATURE!
`,
    real_estate: `
- Include property search form
- Add property gallery section
- Include market insights
- Add agent profiles
- Create location services section
- Include property listings
`,
    healthcare_wellness: `
- Include appointment booking form
- Add service overview section
- Include doctor profiles
- Create health programs section
- Add telemedicine features
- Include trust indicators
`,
    creative_agency: `
- Include portfolio showcase section
- Add project quote form
- Include service offerings
- Create creative team profiles
- Add project timeline
- Include client testimonials
`,
    subscription_box: `
- Include subscription signup form
- Add past box previews section
- Include monthly themes
- Create unboxing experience section
- Add subscription tiers
- Include delivery information
`,
    local_service: `
- Include service booking form
- Add service areas map
- Include service offerings
- Create professional profiles
- Add pricing information
- Include local focus elements
`,
    saas_b2b: `
- Include demo request form
- Add integration showcase
- Include dashboard preview
- Create enterprise features section
- Add pricing tiers
- Include customer logos
`
  };
  
  return requirements[businessType] || '';
}

// === TARGETED CODE EDITING SYSTEM ===

// Apply targeted updates to preserve existing code
async function applyTargetedUpdates(updatedFiles, originalFiles, sectionAnalysis, env) {
  console.log(`🎯 Applying targeted updates...`);
  console.log(`   - Target sections: ${sectionAnalysis.targetSections.join(', ') || 'none'}`);
  console.log(`   - Edit scope: ${sectionAnalysis.editScope}`);
  console.log(`   - Is targeted edit: ${sectionAnalysis.isTargetedEdit}`);
  
  // If this is a full regeneration or initial prompt, return the new files as-is
  if (sectionAnalysis.editScope === 'full' || !sectionAnalysis.isTargetedEdit) {
    console.log(`🔄 Full regeneration detected - using new files as-is`);
    return updatedFiles;
  }
  
  // If no specific sections targeted, return original files with minimal changes
  if (sectionAnalysis.targetSections.length === 0) {
    console.log(`⚠️ No target sections - preserving original files`);
    return originalFiles;
  }
  
  const result = {};
  
  for (const [filename, newContent] of Object.entries(updatedFiles)) {
    if (originalFiles[filename]) {
      // Merge changes intelligently
      result[filename] = await mergeTargetedChanges(filename, originalFiles[filename], newContent, sectionAnalysis);
    } else {
      // New file, use as is
      result[filename] = newContent;
    }
  }
  
  console.log(`✅ Targeted updates applied successfully`);
  return result;
}

// Merge targeted changes while preserving existing code
async function mergeTargetedChanges(filename, originalContent, newContent, sectionAnalysis) {
  console.log(`🔧 Merging changes for ${filename}`);
  
  if (filename.includes('App.jsx') || filename.includes('main.jsx')) {
    return await mergeJSXChanges(originalContent, newContent, sectionAnalysis);
  }
  
  // For other files, preserve original content
  return originalContent;
}

// Merge JSX changes intelligently
async function mergeJSXChanges(originalContent, newContent, sectionAnalysis) {
  console.log(`🎨 Merging JSX changes with scope: ${sectionAnalysis.editScope}`);
  
  let mergedContent = originalContent;
  
  if (sectionAnalysis.editScope === 'style') {
    // Only update style-related changes
    mergedContent = await mergeStyleChanges(originalContent, newContent, sectionAnalysis);
  } else if (sectionAnalysis.editScope === 'element') {
    // Only update specific elements
    mergedContent = await mergeElementChanges(originalContent, newContent, sectionAnalysis);
  } else if (sectionAnalysis.editScope === 'section') {
    // Update entire sections
    mergedContent = await mergeSectionChanges(originalContent, newContent, sectionAnalysis);
  }
  
  return mergedContent;
}

// Merge style changes only
async function mergeStyleChanges(originalContent, newContent, sectionAnalysis) {
  console.log(`🎨 Merging style changes...`);
  
  // Extract color schemes and style patterns from new content
  const colorPatterns = [
    /bg-\w+-\d+/g,
    /text-\w+-\d+/g,
    /border-\w+-\d+/g,
    /from-\w+-\d+/g,
    /to-\w+-\d+/g
  ];
  
  let mergedContent = originalContent;
  
  // Apply color changes to target sections
  for (const section of sectionAnalysis.targetSections) {
    const sectionRegex = new RegExp(`(<div[^>]*className="[^"]*${section}[^"]*"[^>]*>.*?</div>)`, 'gs');
    const sectionMatches = originalContent.match(sectionRegex);
    
    if (sectionMatches) {
      for (const match of sectionMatches) {
        // Find corresponding section in new content
        const newSectionMatch = newContent.match(sectionRegex);
        if (newSectionMatch) {
          // Extract style classes from new section
          const styleClasses = newSectionMatch[0].match(/className="([^"]*)"/);
          if (styleClasses) {
            // Apply new styles to original section
            const updatedSection = match.replace(/className="([^"]*)"/, `className="${styleClasses[1]}"`);
            mergedContent = mergedContent.replace(match, updatedSection);
          }
        }
      }
    }
  }
  
  return mergedContent;
}

// Merge element changes only
async function mergeElementChanges(originalContent, newContent, sectionAnalysis) {
  console.log(`🔧 Merging element changes...`);
  
  let mergedContent = originalContent;
  
  // Handle text changes
  if (sectionAnalysis.textOperation) {
    // Extract text content from new content and apply to original
    const textPatterns = [
      /<h1[^>]*>(.*?)<\/h1>/g,
      /<h2[^>]*>(.*?)<\/h2>/g,
      /<h3[^>]*>(.*?)<\/h3>/g,
      /<p[^>]*>(.*?)<\/p>/g,
      /<span[^>]*>(.*?)<\/span>/g
    ];
    
    for (const pattern of textPatterns) {
      const newMatches = newContent.match(pattern);
      if (newMatches) {
        const originalMatches = originalContent.match(pattern);
        if (originalMatches && newMatches.length === originalMatches.length) {
          for (let i = 0; i < newMatches.length; i++) {
            mergedContent = mergedContent.replace(originalMatches[i], newMatches[i]);
          }
        }
      }
    }
  }
  
  // Handle image changes
  if (sectionAnalysis.imageOperation) {
    // Extract image URLs from new content and apply to original
    const imagePattern = /<img[^>]*src="([^"]*)"[^>]*>/g;
    const newImages = newContent.match(imagePattern);
    const originalImages = originalContent.match(imagePattern);
    
    if (newImages && originalImages && newImages.length === originalImages.length) {
      for (let i = 0; i < newImages.length; i++) {
        mergedContent = mergedContent.replace(originalImages[i], newImages[i]);
      }
    }
  }
  
  return mergedContent;
}

// Merge section changes
async function mergeSectionChanges(originalContent, newContent, sectionAnalysis) {
  console.log(`📄 Merging section changes...`);
  
  let mergedContent = originalContent;
  
  // For each target section, find and replace the corresponding section in original content
  for (const section of sectionAnalysis.targetSections) {
    console.log(`   - Processing section: ${section}`);
    
    // Try different section patterns
    const sectionPatterns = [
      new RegExp(`(<section[^>]*id="${section}"[^>]*>.*?</section>)`, 'gs'),
      new RegExp(`(<div[^>]*className="[^"]*${section}[^"]*"[^>]*>.*?</div>)`, 'gs'),
      new RegExp(`(<div[^>]*id="${section}"[^>]*>.*?</div>)`, 'gs')
    ];
    
    for (const pattern of sectionPatterns) {
      const newSectionMatch = newContent.match(pattern);
      const originalSectionMatch = originalContent.match(pattern);
      
      if (newSectionMatch && originalSectionMatch) {
        console.log(`   ✅ Found and replacing section: ${section}`);
        mergedContent = mergedContent.replace(originalSectionMatch[0], newSectionMatch[0]);
        break;
      }
    }
  }
  
  return mergedContent;
}

// Replace image in specific section
async function replaceImageInSection(updatedFiles, placement, imageUrl, originalFiles) {
  console.log(`🖼️ Replacing image for placement: ${placement} with URL: ${imageUrl}`);
  
  for (const [filename, content] of Object.entries(updatedFiles)) {
    if (filename.includes('App.jsx') || filename.includes('main.jsx')) {
      let updatedContent = content;
      let replacementsMade = 0;
      
      // Handle different placement formats
      const placementVariations = [
        placement.toUpperCase(), // e.g., "HERO"
        placement.toLowerCase(), // e.g., "hero"
        placement.charAt(0).toUpperCase() + placement.slice(1).toLowerCase() // e.g., "Hero"
      ];
      
      // Try to replace specific placeholders first
      for (const placementVar of placementVariations) {
        const specificPlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL_${placementVar}\\}`, 'g');
        if (specificPlaceholder.test(updatedContent)) {
          updatedContent = updatedContent.replace(specificPlaceholder, imageUrl);
          replacementsMade++;
          console.log(`✅ Replaced {GENERATED_IMAGE_URL_${placementVar}} with image URL`);
        }
      }
      
      // Handle special cases for feature images
      if (placement.startsWith('feature_')) {
        const featureNumber = placement.split('_')[1];
        const featurePlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL_FEATURE_${featureNumber}\\}`, 'g');
        if (featurePlaceholder.test(updatedContent)) {
          updatedContent = updatedContent.replace(featurePlaceholder, imageUrl);
          replacementsMade++;
          console.log(`✅ Replaced {GENERATED_IMAGE_URL_FEATURE_${featureNumber}} with image URL`);
        }
      }
      
      // Handle special cases for screenshot images
      if (placement.startsWith('screenshot_')) {
        const screenshotNumber = placement.split('_')[1];
        const screenshotPlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL_SCREENSHOT_${screenshotNumber}\\}`, 'g');
        if (screenshotPlaceholder.test(updatedContent)) {
          updatedContent = updatedContent.replace(screenshotPlaceholder, imageUrl);
          replacementsMade++;
          console.log(`✅ Replaced {GENERATED_IMAGE_URL_SCREENSHOT_${screenshotNumber}} with image URL`);
        }
      }
      
      // Handle special cases for testimonial images
      if (placement.startsWith('testimonial_')) {
        const testimonialNumber = placement.split('_')[1];
        const testimonialPlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL_TESTIMONIAL_${testimonialNumber}\\}`, 'g');
        if (testimonialPlaceholder.test(updatedContent)) {
          updatedContent = updatedContent.replace(testimonialPlaceholder, imageUrl);
          replacementsMade++;
          console.log(`✅ Replaced {GENERATED_IMAGE_URL_TESTIMONIAL_${testimonialNumber}} with image URL`);
        }
      }
      
      // Handle app store badges
      if (placement === 'app_store') {
        const appStorePlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL_APP_STORE\\}`, 'g');
        if (appStorePlaceholder.test(updatedContent)) {
          updatedContent = updatedContent.replace(appStorePlaceholder, imageUrl);
          replacementsMade++;
          console.log(`✅ Replaced {GENERATED_IMAGE_URL_APP_STORE} with image URL`);
        }
      }
      
      if (placement === 'google_play') {
        const googlePlayPlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL_GOOGLE_PLAY\\}`, 'g');
        if (googlePlayPlaceholder.test(updatedContent)) {
          updatedContent = updatedContent.replace(googlePlayPlaceholder, imageUrl);
          replacementsMade++;
          console.log(`✅ Replaced {GENERATED_IMAGE_URL_GOOGLE_PLAY} with image URL`);
        }
      }
      
      // If no specific placeholders found, try generic placeholder
      if (replacementsMade === 0) {
        const genericPlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL\\}`, 'g');
        if (genericPlaceholder.test(updatedContent)) {
          updatedContent = updatedContent.replace(genericPlaceholder, imageUrl);
          replacementsMade++;
          console.log(`✅ Replaced generic {GENERATED_IMAGE_URL} with image URL`);
        }
      }
      
      if (replacementsMade > 0) {
        updatedFiles[filename] = updatedContent;
        console.log(`✅ Updated ${filename} with ${replacementsMade} image replacement(s)`);
      } else {
        console.log(`⚠️ No placeholders found for placement: ${placement} in ${filename}`);
        // Log the content to debug
        console.log(`📄 Content preview:`, updatedContent.substring(0, 500));
      }
    }
  }
}

// === RESTORE WEB FUNCTIONALITY ===

// Add restore web endpoint
async function handleRestoreWeb(request, env, corsHeaders) {
  try {
    const { project_id, backup_id } = await request.json();
    
    if (!project_id || !backup_id) {
      return new Response(JSON.stringify({ error: 'project_id and backup_id are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Fetch backup from database
    const stmt = env.DB.prepare('SELECT files FROM file_backups WHERE project_id = ? AND backup_id = ?');
    const result = await stmt.bind(project_id, backup_id).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Backup not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const backupFiles = JSON.parse(result.files);
    
    // Update project with backup files
    const updateStmt = env.DB.prepare('UPDATE projects SET files = ? WHERE id = ?');
    await updateStmt.bind(JSON.stringify(backupFiles), project_id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Website restored successfully',
      files: backupFiles
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to restore website',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Get backup history for a project
async function handleGetBackups(request, env, corsHeaders) {
  try {
    const { project_id } = await request.json();
    
    if (!project_id) {
      return new Response(JSON.stringify({ error: 'project_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const stmt = env.DB.prepare(`
      SELECT backup_id, timestamp, user_message 
      FROM file_backups 
      WHERE project_id = ? 
      ORDER BY timestamp DESC
    `);
    
    const backups = await stmt.bind(project_id).all();
    
    return new Response(JSON.stringify({
      success: true,
      backups: backups.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to get backups',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Simple function for business type detection only
async function callOpenAIBusinessType(userMessage, env) {
  const openaiUrl = 'https://api.openai.com/v1/chat/completions';
  
  const systemPrompt = `You are a business classifier. Analyze the business description and return ONLY the business type code that best matches.

Available business types:
- saas_b2b (software as a service, business software, APIs, platforms)
- mobile_app (mobile applications, smartphone apps)
- consulting_service (business consulting, advisory services)
- online_education (online learning, courses, educational platforms)
- real_estate (property sales, real estate agencies)
- healthcare_wellness (medical services, health clinics)
- creative_agency (design agencies, creative services)
- subscription_box (monthly subscription services)
- bar_restaurant (bars, restaurants, cafes, food establishments)
- ecommerce_fashion (online fashion stores, clothing retailers)
- local_service (local professional services, repairs, maintenance)

Return ONLY the business type code (e.g., "saas_b2b") with no other text.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const assistantMessage = data.choices[0].message.content.trim();
      
      // Log cost - fix the parameter access
      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      const cost = calculateCost(inputTokens, outputTokens, 'mini');
      console.log(`💰 GPT-4o-mini cost: { input_tokens: ${inputTokens}, output_tokens: ${outputTokens}, cost: '$${cost.toFixed(6)}' }`);
      
      return { assistant_message: assistantMessage };
    } else {
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.log(`⚠️ Error calling OpenAI for business type detection: ${error.message}`);
    throw error;
  }
}

// Detect business type from user message using GPT-4o-mini

// Always use OpenAI web search to craft background image prompts (no internal fallback)
async function generateWebSearchedBackgroundPrompts(businessIdeaText, businessType, businessName, env) {
  const responsesUrl = 'https://api.openai.com/v1/responses';
  const noTextSuffix = ', no text, no words, no lettering, no logos, no watermarks';
  try {
    if (!env || !env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY');
    }
    const instruction = `You are an expert prompt engineer for background image generation.
Conduct a brief web search to understand visual themes relevant to the business idea and type.
Then return STRICT JSON with two fields only: hero_background_prompt and about_background_prompt.

Constraints for both prompts:
- Ultra-relevant to the business idea and audience
- 16:9 cinematic background, photographic or high-quality illustration
- Darker tones or strong contrast to support overlay text readability
- No text of any kind: no words, no lettering, no logos, no watermarks
- Avoid brand names and copyrighted content

Context:
- Business type: ${businessType}
- Business name: ${businessName}
- Business idea: ${businessIdeaText}

Output JSON example:
{"hero_background_prompt": "...", "about_background_prompt": "..."}`;

    const payload = {
      model: 'o4-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: instruction }
          ]
        }
      ],
      text: { format: { type: 'text' } },
      reasoning: { effort: 'medium', summary: 'auto' },
      tools: [
        {
          type: 'web_search_preview',
          user_location: { type: 'approximate' },
          search_context_size: 'low'
        }
      ],
      store: false
    };
    
    console.log('🔍 Sending payload to OpenAI Responses API:', JSON.stringify(payload, null, 2));

    const response = await fetch(responsesUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'responses=v1'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Responses API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 OpenAI Responses API response structure:', JSON.stringify(data, null, 2));

    let textOut;
    // Prefer Responses API "output" array: find assistant message content (output_text)
    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item && item.type === 'message' && Array.isArray(item.content)) {
          const outputTextPart = item.content.find((c) => c && (c.type === 'output_text' || c.type === 'text') && typeof c.text === 'string');
          if (outputTextPart) {
            textOut = outputTextPart.text;
            break;
          }
        }
        if (item && item.type === 'output_text' && typeof item.text === 'string') {
          textOut = item.text;
          break;
        }
      }
    }
    // Additional fallbacks for other possible shapes
    if (!textOut && data.output && data.output.length > 0 && data.output[0].content && data.output[0].content.length > 0 && data.output[0].content[0].text) {
      textOut = data.output[0].content[0].text;
    } else if (!textOut && data.output && data.output.length > 0 && data.output[0].text) {
      textOut = data.output[0].text;
    } else if (!textOut && data.text && typeof data.text === 'string') {
      textOut = data.text;
    } else if (!textOut && data.content && data.content.length > 0 && data.content[0].text) {
      textOut = data.content[0].text;
    } else if (!textOut && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      textOut = data.choices[0].message.content;
    }

    if (!textOut) {
      console.error('❌ Unrecognized API response structure:', data);
      throw new Error(`Unexpected Responses API structure. Response: ${JSON.stringify(data)}`);
    }

    console.log('🔍 Extracted text from API:', textOut);

    // Clean potential markdown code fences and extract JSON block
    let jsonText = textOut;
    if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
    }
    const firstBraceIndex = jsonText.indexOf('{');
    const lastBraceIndex = jsonText.lastIndexOf('}');
    if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
      jsonText = jsonText.slice(firstBraceIndex, lastBraceIndex + 1);
    }

    // Expect strict JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Raw text that failed to parse:', jsonText);
      throw new Error(`Failed to parse JSON response: ${parseError.message}. Raw text: ${jsonText}`);
    }

    console.log('🔍 Parsed JSON:', parsed);
    
    const hero = (parsed.hero_background_prompt || '').toString();
    const about = (parsed.about_background_prompt || '').toString();
    
    if (!hero || !about) {
      console.error('❌ Missing prompts in parsed response:', { hero, about, parsed });
      throw new Error(`Missing hero/about prompts from web search result. Got: hero="${hero}", about="${about}"`);
    }

    // Ensure no-text constraints are appended if caller prompt omitted it
    const ensureNoText = (p) => p.match(/no\s+text/i) ? p : `${p}${noTextSuffix}`;

    return {
      hero_background_prompt: ensureNoText(hero),
      about_background_prompt: ensureNoText(about)
    };
  } catch (err) {
    // Propagate; callers must handle
    throw err;
  }
}

// Remove legacy context-aware prompt fallback. All prompts come from web-searched generator now.

// Handle template generation for the new template-based system
async function handleTemplateGeneration(request, env, corsHeaders) {
  try {
    console.log('🎨 Template generation function called');
    const { project_id, user_message, current_template_data } = await request.json();
    
    // Generate template content directly from user message
    const updatedTemplateData = await generateTemplateContent(user_message, current_template_data, env);
    
    // Generate background images for hero and about sections, and an initial logo
    const generatedImages = [];
    
    try {
      console.log('🎨 Starting background image generation for template...');
      
      // Detect business type for context-aware image generation
      const businessType = await detectBusinessType(user_message, env);
      console.log('🏢 Detected business type:', businessType);
      
      const businessInfo = generateBusinessInfo(user_message, businessType);
      console.log('🏢 Business info:', businessInfo);
      
      // Prefer the LLM-generated businessName for brand consistency across assets
      const businessNameForAssets = (updatedTemplateData && updatedTemplateData.businessName) ? updatedTemplateData.businessName : businessInfo.name;
      console.log('🏷️ Using business name for assets:', businessNameForAssets);

      // Generate both hero and about background prompts in a single web-searched call
      const backgroundPrompts = await generateWebSearchedBackgroundPrompts(user_message, businessType, businessNameForAssets, env);
      const heroBackgroundPrompt = backgroundPrompts.hero_background_prompt;
      const aboutBackgroundPrompt = backgroundPrompts.about_background_prompt;
      console.log('🎨 Hero background prompt:', heroBackgroundPrompt);
      
      // Create a mock request for the image generation function with proper URL
      const heroImageRequest = new Request(`${getWorkerUrl(request)}/api/generate-image`, {
        method: 'POST',
        body: JSON.stringify({
          project_id: project_id,
          prompt: heroBackgroundPrompt,
          aspect_ratio: '16:9',
          number_of_images: 1
        })
      });
      const heroBackgroundResponse = await handleImageGeneration(heroImageRequest, env, corsHeaders);
      
      console.log('🎨 Hero background response status:', heroBackgroundResponse.status);
      
      if (heroBackgroundResponse.ok) {
        const heroBackgroundResult = await heroBackgroundResponse.json();
        console.log('🎨 Hero background result:', heroBackgroundResult);
        
        if (heroBackgroundResult.success && heroBackgroundResult.images.length > 0) {
          generatedImages.push({
            ...heroBackgroundResult.images[0],
            placement: 'hero_background'
          });
          console.log('✅ Hero background image added to generated images');
        }
      }
      
      // Generate logo (square) - abstract, text-free, brandable mark
      const logoPrompt = `Abstract, text-free logo mark for ${businessNameForAssets}. Unique and memorable symbol only (no letters, no words, no typography, no text, no watermarks). Minimal modern vector emblem, clean geometric forms, balanced composition, flat scalable design, strong silhouette, 1:1 aspect ratio`;
      console.log('🎨 Logo prompt:', logoPrompt);
      // Create a mock request for the logo generation with proper URL
      const logoImageRequest = new Request(`${getWorkerUrl(request)}/api/generate-image`, {
        method: 'POST',
        body: JSON.stringify({
          project_id: project_id,
          prompt: logoPrompt,
          aspect_ratio: '1:1',
          number_of_images: 1
        })
      });
      const logoResponse = await handleImageGeneration(logoImageRequest, env, corsHeaders);
      console.log('🎨 Logo response status:', logoResponse.status);
      if (logoResponse.ok) {
        const logoResult = await logoResponse.json();
        if (logoResult.success && logoResult.images.length > 0) {
          generatedImages.push({
            ...logoResult.images[0],
            placement: 'logo'
          });
        }
      }
      console.log('🎨 About background prompt:', aboutBackgroundPrompt);
      
      // Create a mock request for the about background generation with proper URL
      const aboutImageRequest = new Request(`${getWorkerUrl(request)}/api/generate-image`, {
        method: 'POST',
        body: JSON.stringify({
          project_id: project_id,
          prompt: aboutBackgroundPrompt,
          aspect_ratio: '16:9',
          number_of_images: 1
        })
      });
      const aboutBackgroundResponse = await handleImageGeneration(aboutImageRequest, env, corsHeaders);
      
      console.log('🎨 About background response status:', aboutBackgroundResponse.status);
      
      if (aboutBackgroundResponse.ok) {
        const aboutBackgroundResult = await aboutBackgroundResponse.json();
        console.log('🎨 About background result:', aboutBackgroundResult);
        
        if (aboutBackgroundResult.success && aboutBackgroundResult.images.length > 0) {
          generatedImages.push({
            ...aboutBackgroundResult.images[0],
            placement: 'about_background'
          });
          console.log('✅ About background image added to generated images');
        }
      }
      
      console.log('🎨 Total generated images:', generatedImages.length);
    } catch (imageError) {
      console.error('Background image generation error:', imageError);
      console.error('Error stack:', imageError.stack);
      // Continue without background images if generation fails
    }
    
    console.log('🎨 Final generated images count:', generatedImages.length);
    
    // Attach generated asset URLs to template_data for persistence
    let templateWithAssets = { ...updatedTemplateData };
    const heroBg = generatedImages.find(i => i.placement === 'hero_background')?.url;
    const aboutBg = generatedImages.find(i => i.placement === 'about_background')?.url;
    const logoUrl = generatedImages.find(i => i.placement === 'logo')?.url;
    if (heroBg) templateWithAssets.heroBackgroundImage = heroBg;
    if (aboutBg) templateWithAssets.aboutBackgroundImage = aboutBg;
    if (logoUrl) templateWithAssets.businessLogoUrl = logoUrl;

    return new Response(JSON.stringify({
      success: true,
      template_data: templateWithAssets,
      generated_images: generatedImages,
      assistant_message: 'I\'ve generated a responsive landing page tailored to your business idea with custom background images! The template automatically adapts to all screen sizes.'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Template generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate template content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Generate template content based on user message

async function generateTemplateContent(userMessage, currentTemplateData, env) {
  const systemPrompt = `You are an expert landing page content generator. Based on the user's business description, generate compelling content for their landing page template.

RESPONSIVE DESIGN REQUIREMENTS:
- All content must be responsive and work well on all screen sizes (desktop and mobile)
- Navigation should adapt: desktop shows horizontal menu, mobile shows hamburger menu
- Grid layouts should stack vertically on mobile (grid-cols-1 md:grid-cols-3)
- Text sizes should scale appropriately (text-sm md:text-base lg:text-lg)
- Spacing should adjust for different screen sizes (p-4 md:p-6 lg:p-8)
- Buttons and CTAs should be touch-friendly on mobile
- Images should be responsive and maintain aspect ratios

User Message: ${userMessage}

Generate content for the following sections:
1. businessName - Generate ONE distinctive, brandable business name if not clearly provided. Rules: 1-2 words, easy to pronounce and remember, avoid hyphens or numbers, avoid generic terms and trademarks, evoke the idea's core feeling/benefit. Return just the name string.
2. tagline - A powerful tagline that captures the value proposition
3. heroDescription - A brief description for the hero section
4. ctaButtonText - Generate an appropriate call-to-action button text based on the business:
   - For restaurants/bars: "Book Table Now", "Order Online", "Reserve Your Spot", "Visit Us Today"
   - For SaaS/tech: "Start Free Trial", "Get Started Free", "Try It Free", "Join Beta"
   - For e-commerce: "Shop Now", "Browse Collection", "Start Shopping", "Explore Products"
   - For services: "Get Started", "Book Consultation", "Contact Us", "Learn More"
   - For other businesses: "Get Started", "Learn More", "Contact Us", "Explore"
5. sectionType - Determine the appropriate section type based on the business:
   - Use "services" for restaurants, bars, cafes, food businesses
   - Use "features" for SaaS, software, apps, tech companies
   - Use "highlights" for other businesses
6. sectionTitle - Generate an appropriate title for the section type
7. sectionSubtitle - Generate an appropriate subtitle for the section type
8. features - Generate 6 items that are appropriate for the business:
   - For restaurants/bars: focus on menu items, services, atmosphere, dining experience
   - For SaaS/tech: focus on features, capabilities, benefits, technology
   - For other businesses: focus on highlights, services, unique offerings, value propositions
   Keep the same structure with icon, title, description
9. aboutContent - About section content tailored to the business
10. pricing - 3 pricing tiers appropriate for the business (adjust names and content accordingly)
11. contactInfo - Contact information appropriate for the business
12. trustIndicator1 - A trust indicator appropriate for the business
13. trustIndicator2 - A rating or review indicator appropriate for the business
14. heroBadge - Generate a badge text for the hero section (e.g., "Now Available - AI-Powered Landing Pages", "New Launch", "Limited Time Offer", "Grand Opening", etc.)
15. aboutSectionTitle - Generate the "Built by creators, for creators" section title appropriate for the business (e.g., "Built by experts, for businesses", "Created by professionals, for customers", etc.)
16. aboutSectionSubtitle - Generate the subtitle for the about section
17. aboutBenefits - Generate 3 benefit points for the about section (replace the static ones like "No coding knowledge required", "AI-powered design optimization", "Built-in analytics and tracking")
18. pricingSectionTitle - Generate the pricing section title (e.g., "Simple, transparent pricing", "Choose your plan", "Flexible pricing options")
19. pricingSectionSubtitle - Generate the pricing section subtitle (e.g., "Choose the plan that's right for you. All plans include our core features and 24/7 support.")
20. contactSectionTitle - Generate the contact section title (e.g., "Ready to get started?", "Get in touch", "Contact us today")
21. contactSectionSubtitle - Generate the contact section subtitle (e.g., "Let's discuss how we can help you create the perfect landing page for your business. Our team is here to support you every step of the way.")
22. contactFormPlaceholders - Generate appropriate placeholders for the contact form (name, email, company, message)
23. footerDescription - Generate the footer description text (e.g., "Build beautiful, conversion-optimized landing pages with AI. Transform your ideas into reality in minutes.")
24. footerProductLinks - Generate appropriate product link texts (e.g., ["Features", "Pricing", "Templates", "API"])
25. footerCompanyLinks - Generate appropriate company link texts (e.g., ["About", "Blog", "Careers", "Contact"])
26. landingPagesCreated - Generate a number and text for "Landing Pages Created" (e.g., "10,000+ Landing Pages Created", "5,000+ Projects Built", etc.)

RESPONSIVE DESIGN GUIDELINES:
- Navigation: Use mobile-first responsive navigation with hamburger menu for mobile
- Typography: Use responsive text classes (text-sm md:text-base lg:text-lg)
- Layouts: Use responsive grid classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Spacing: Use responsive padding/margin (p-4 md:p-6 lg:p-8)
- Images: Use responsive image classes with proper aspect ratios
- Buttons: Ensure touch-friendly sizing on mobile (min-h-12 for mobile)
- Forms: Use responsive form layouts with proper mobile spacing

MOBILE OPTIMIZATION:
- Stack all sections vertically on mobile
- Use larger touch targets (buttons, links)
- Optimize text for mobile reading
- Ensure proper contrast and readability
- Use mobile-friendly navigation patterns

DESKTOP OPTIMIZATION:
- Use multi-column layouts where appropriate
- Larger text and spacing for desktop viewing
- Horizontal navigation menus
- Hover effects and desktop interactions

IMPORTANT: This template will also generate background images for the hero and about sections using our Gemini API. The background images will be automatically generated and integrated into the template.

LOGO REQUIREMENT: The logo asset will be an abstract, text-free symbol. Do not include any text or letters in the logo within any content fields.

Return ONLY a JSON object with these fields. Keep the structure exactly the same as the current template data, but add these new fields.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Current template data: ${JSON.stringify(currentTemplateData)}` }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const assistantMessage = data.choices[0].message.content.trim();
      
      // Log the AI response for debugging
      console.log('🤖 AI Response:', assistantMessage);
      console.log('📏 Response length:', assistantMessage.length);
      console.log('🔍 Response type:', typeof assistantMessage);
      
      // Extract JSON from markdown code blocks if present
      let jsonContent = assistantMessage;
      if (assistantMessage.includes('```json')) {
        const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
          console.log('🔧 Extracted JSON from markdown:', jsonContent);
        }
      }
      
      // Try to parse the JSON response
      try {
        const generatedData = JSON.parse(jsonContent);
        console.log('✅ Successfully parsed JSON:', generatedData);
        return {
          ...currentTemplateData,
          ...generatedData
        };
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', parseError);
        console.error('🔍 Raw response that failed to parse:', jsonContent);
        // Return current template data if parsing fails
        return currentTemplateData;
      }
    } else {
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error generating template content:', error);
    // Return current template data as fallback
    return currentTemplateData;
  }
}