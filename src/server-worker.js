// Jetsy Server Worker - Dedicated API-only worker
// This worker handles all API requests to avoid infinite loops with custom domains

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // ===== API ROUTES ONLY =====
    // This worker ONLY handles API endpoints, no static file serving

    // --- Custom Domains API ---
    if (path === '/api/domain/resolve' && request.method === 'GET') {
      const url = new URL(request.url);
      
      // Get domain from query parameter (most reliable for custom domains)
      const domainParam = url.searchParams.get('domain');
      
      // Fallback to headers if no query parameter
      const originalHost = 
        request.headers.get('CF-Connecting-Host') ||
        request.headers.get('X-Forwarded-Host') ||
        request.headers.get('CF-Original-Host') ||
        request.headers.get('X-Original-Host') ||
        request.cf?.originalHost ||
        url.hostname;
        
      const targetDomain = domainParam || originalHost;
        
      console.log('Server worker domain resolve:', {
        targetDomain,
        domainParam,
        originalHost,
        urlHostname: url.hostname,
        headers: Object.fromEntries(request.headers.entries())
      });
      
      try {
        await ensureCustomDomainsTable(env);
        const row = await env.DB.prepare('SELECT project_id, status FROM custom_domains WHERE domain = ?').bind(targetDomain).first();
        const projectId = row && row.status === 'active' ? row.project_id : null;
        
        console.log('Server worker DB lookup:', { domain: targetDomain, projectId, rowFound: !!row });
        
        return new Response(JSON.stringify({ 
          project_id: projectId,
          resolved_domain: targetDomain,
          server: 'jetsy-server',
          debug: {
            url_hostname: url.hostname,
            resolved_hostname: targetDomain,
            method: domainParam ? 'query_parameter' : 'header_detection'
          }
        }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      } catch (e) {
        console.error('Server worker domain resolve error:', e);
        return new Response(JSON.stringify({ 
          project_id: null, 
          error: e.message,
          resolved_domain: targetDomain,
          server: 'jetsy-server'
        }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
    }

    // --- All other API endpoints ---
    if (path.startsWith('/api/')) {
      // For now, delegate all other API calls to the main worker using fetch
      console.log('Delegating API call to main worker:', path);
      
      // Create a new request to the main worker
      const mainWorkerUrl = new URL(request.url);
      mainWorkerUrl.hostname = 'jetsy-landing-prod.jetsydev.workers.dev';
      
      // Forward the request to the main worker
      const mainWorkerRequest = new Request(mainWorkerUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
      });
      
      try {
        const response = await fetch(mainWorkerRequest);
        
        // Add CORS headers to the response
        const corsResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            ...corsHeaders
          }
        });
        
        return corsResponse;
      } catch (error) {
        console.error('Error delegating to main worker:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to delegate to main worker',
          message: error.message 
        }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
      }
    }

    // This worker does NOT serve static files - only API endpoints
    return new Response('Jetsy Server - API Only Worker\nHandles API requests for custom domains to avoid infinite loops.', { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain', ...corsHeaders } 
    });
  }
};

// Helper function to ensure custom domains table exists
async function ensureCustomDomainsTable(env) {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS custom_domains (
        domain TEXT PRIMARY KEY,
        project_id INTEGER NOT NULL,
        user_id INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (e) {
    console.error('Error creating custom_domains table:', e);
  }
}
