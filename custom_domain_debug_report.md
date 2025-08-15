=== JETSY CUSTOM DOMAIN ISSUE ANALYSIS ===

## PROJECT OVERVIEW
- **Project**: Jetsy - AI-powered landing page generator
- **Architecture**: React frontend served by Cloudflare Worker
- **Custom Domain Goal**: Allow users to connect custom domains to their generated websites

## CURRENT ISSUE
**Error 522: Connection timed out** when visiting custom domain `www.galahadterminal.com`

## INFRASTRUCTURE SETUP
- **Worker**: `jetsy-landing-prod.jetsydev.workers.dev`
- **Custom Domain**: `api.jetsy.dev` (points to worker via Worker Custom Domains)
- **DNS Zone**: `jetsy.dev` (Cloudflare-managed)
- **Database**: Cloudflare D1 (`jetsy-leads`)

## WHAT WE'VE TRIED

### 1. Initial Setup Issues
- **Problem**: Custom domain creation failed with "Access to setting custom origin SNI not granted"
- **Solution**: Removed `custom_origin_sni` parameter from Cloudflare API calls
- **Result**: Custom hostname creation succeeded

### 2. DNS Configuration Issues
- **Problem**: CNAME pointing to `sites.jetsy.dev` caused routing failures
- **Solution**: Changed to `jetsy-landing-prod.jetsydev.workers.dev`
- **Result**: Still got 403 Forbidden errors

### 3. Worker Custom Domain Approach
- **Problem**: Manual CNAME caused SSL warnings and routing issues
- **Solution**: Used Cloudflare Worker Custom Domains feature for `api.jetsy.dev`
- **Result**: `api.jetsy.dev` works, but custom domains still fail

### 4. Infinite Loop Detection
- **Problem**: Worker logs showed React app calling `/api/domain/resolve` to itself
- **Root Cause**: App.jsx always called domain resolve API, creating infinite loop
- **Solution**: Modified App.jsx to only call API for actual custom domains
- **Result**: Deployed but still getting Error 522

## CURRENT CONFIGURATION

### Worker Code Changes Made
- **File**: `src/worker.js`
  - Removed `custom_origin_sni` parameter
  - Changed `custom_origin_server` to `api.jetsy.dev`
  - Updated domain resolution logic

- **File**: `src/App.jsx`
  - Added hostname check to avoid infinite loops
  - Only calls `/api/domain/resolve` for non-jetsy.dev domains

### Database State
- **Custom Domain Record**: `www.galahadterminal.com` → project 56, status: 'active'
- **Project**: Exists and has template data

### Cloudflare Configuration
- **Custom Hostname**: `www.galahadterminal.com` → `api.jetsy.dev`
- **Worker Custom Domain**: `api.jetsy.dev` → `jetsy-landing-prod.jetsydev.workers.dev`
- **SSL Certificate**: Issued and deployed successfully

## DEBUGGING EVIDENCE

### Worker Logs (Latest)
When visiting `www.galahadterminal.com`:
```
2025-08-14 22:49:00:285 UTC
GET /
1ms
1ms

"url": "http://api.jetsy.dev/"
"host": "api.jetsy.dev"
```

### Key Observations
1. **Requests ARE reaching the worker** (logs show successful GET requests)
2. **Host header is rewritten** from `www.galahadterminal.com` to `api.jetsy.dev`
3. **Worker serves content** (status 200) but browser shows Error 522
4. **No infinite loop** in latest logs (our fix worked)

### Error Patterns
- **Direct worker access**: `jetsy-landing-prod.jetsydev.workers.dev` ✅ Works
- **Worker custom domain**: `api.jetsy.dev` ✅ Works  
- **User custom domain**: `www.galahadterminal.com` ❌ Error 522

## TECHNICAL ANALYSIS

### The Flow
1. User visits `www.galahadterminal.com`
2. Cloudflare Custom Hostname routes to `api.jetsy.dev`
3. Worker receives request with `Host: api.jetsy.dev`
4. Worker serves React app
5. React app detects custom domain and calls `/api/domain/resolve`
6. **Something fails here** → Error 522

### Potential Issues
1. **Host header mismatch**: Worker gets `api.jetsy.dev` instead of `www.galahadterminal.com`
2. **Domain resolution failing**: API call succeeds but returns wrong data
3. **React app routing**: Custom domain detection logic may be flawed
4. **Asset loading**: CSS/JS files may be failing to load

## FILES TO EXAMINE

### Core Files
- `src/worker.js` - Worker logic and API endpoints
- `src/App.jsx` - React app routing and custom domain detection
- `src/components/PublicRouteView.jsx` - Custom website rendering
- `src/config/environment.js` - API base URL configuration

### Key Functions
- `serveStaticFiles()` - Serves React app
- `/api/domain/resolve` - Domain resolution endpoint
- Custom domain detection logic in App.jsx

## QUESTIONS FOR ANALYSIS

1. **Why does the worker receive `api.jetsy.dev` instead of the original hostname?**
2. **Is the domain resolution working correctly despite the hostname mismatch?**
3. **Why does the browser show Error 522 when the worker logs show success?**
4. **Are there any remaining self-fetching issues we missed?**
5. **What's the correct way to handle custom domains in this architecture?**

## NEXT STEPS NEEDED

1. **Analyze the complete request flow** from custom domain to final response
2. **Identify where the 522 error is actually occurring** (Cloudflare vs Worker vs Browser)
3. **Fix the hostname handling** to preserve original domain information
4. **Ensure proper routing** to the generated website content
5. **Test the complete flow** end-to-end

## ENVIRONMENT DETAILS
- **Cloudflare Plan**: Free tier
- **Worker Runtime**: Latest
- **D1 Database**: Production (`jetsy-leads`)
- **Custom Hostnames**: Enabled via Cloudflare API
- **Worker Custom Domains**: Enabled for `api.jetsy.dev`

This issue requires deep analysis of the Cloudflare Worker architecture, custom domain handling, and the interaction between the worker and React app routing.

## CURRENT CODE ANALYSIS

### Key Code Snippets

#### 1. Domain Resolution in Worker (src/worker.js:136-142)
```javascript
if (path === '/api/domain/resolve' && request.method === 'GET') {
  const hostHeader = new URL(request.url).hostname;
  try {
    await ensureCustomDomainsTable(env);
    const row = await env.DB.prepare('SELECT project_id, status FROM custom_domains WHERE domain = ?').bind(hostHeader).first();
    const projectId = row && row.status === 'active' ? row.project_id : null;
    return new Response(JSON.stringify({ project_id: projectId }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    return new Response(JSON.stringify({ project_id: null }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}
```

#### 2. Custom Domain Detection in App.jsx (src/App.jsx:107-128)
```javascript
} else if (path === '/') {
  // Check if this is a custom domain (not jetsy.dev or localhost)
  // Expose API base for templates that might post with window-scoped config
  try { window.JETSY_API_BASE = getApiBaseUrl(); } catch {}
  
  const hostname = window.location.hostname;
  if (!hostname.includes('jetsy.dev') && !hostname.includes('localhost')) {
    // This IS a custom domain - call API to get project info
    (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/domain/resolve`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.project_id) {
            setRouteProjectId(data.project_id);
            setCurrentStep('public-route'); // Show the custom website
          }
        }
      } catch {}
      setCurrentStep('hero');
      setIsInitialLoad(false);
    })();
  } else {
    // This is jetsy.dev - show the normal Jetsy interface
    setCurrentStep('hero');
    setIsInitialLoad(false);
  }
  return; // avoid marking initial load twice below
}
```

#### 3. Custom Hostname Creation (src/worker.js:193-197)
```javascript
const cfReqBody = {
  hostname: domain,
  ssl: { type: 'dv', method: 'http' },
  custom_origin_server: 'api.jetsy.dev'
};
```

## CRITICAL INSIGHTS

### 1. Hostname Mismatch Problem
- **Worker receives**: `api.jetsy.dev` (from Custom Hostname routing)
- **Worker needs**: `www.galahadterminal.com` (original domain for database lookup)
- **Result**: Domain resolution fails because it looks for `api.jetsy.dev` in database

### 2. The Real Issue
The problem isn't the infinite loop (we fixed that). The real issue is:
1. **Custom Hostname routes** `www.galahadterminal.com` → `api.jetsy.dev`
2. **Worker gets request** with `Host: api.jetsy.dev`
3. **Worker tries to resolve** `api.jetsy.dev` (which doesn't exist in database)
4. **Returns project_id: null**
5. **React app shows default Jetsy interface** instead of custom website
6. **Browser shows Error 522** (likely from asset loading failures)

### 3. Missing Piece
We need to preserve the **original hostname** (`www.galahadterminal.com`) when the request reaches the worker, not the rewritten hostname (`api.jetsy.dev`).

## RECOMMENDED SOLUTION APPROACH

### Option 1: Use Cloudflare Headers
Cloudflare may provide the original hostname in headers like:
- `CF-Connecting-IP`
- `X-Forwarded-Host`
- `X-Original-Host`

### Option 2: Modify Custom Hostname Configuration
Change the Custom Hostname setup to preserve original hostname information.

### Option 3: Use Worker Routes Instead
Set up Worker Routes for custom domains instead of Custom Hostnames.

## FINAL ASSESSMENT

**Current Status**: We've fixed the infinite loop, but the core issue remains - the worker can't identify the original custom domain because Cloudflare rewrites the hostname.

**Root Cause**: Hostname rewriting in the Custom Hostname → Worker Custom Domain chain.

**Required Fix**: Preserve original hostname information so the worker can properly resolve custom domains and serve the correct generated website content.

This is a complex Cloudflare Workers + Custom Hostnames integration issue that requires understanding how to maintain original request context through the routing chain.
