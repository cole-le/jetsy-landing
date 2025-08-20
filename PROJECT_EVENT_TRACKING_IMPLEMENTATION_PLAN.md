# Project Event Tracking Implementation Plan

## 🎯 Objective
Add event tracking capabilities to Jetsy-generated websites (both live preview and Vercel deployments) and display the tracked data in the project-specific analytics dashboard (`ProjectDataAnalytics.jsx`).

## 📋 Current State Analysis

### What We Have
- **Main Jetsy Site**: Uses `trackEvent()` from `src/utils/analytics.js` to POST events to `/api/track`
- **Database**: `tracking_events` table with rich schema including `website_id`, `user_id`, `jetsy_generated` fields
- **Analytics Dashboard**: Separate app (`analytics-dashboard/`) that shows global analytics
- **Project Analytics**: `ProjectDataAnalytics.jsx` currently only shows leads and contact submissions

### What We Need
- **Generated Website Tracking**: Inject tracking scripts into user-generated websites
- **Project-Specific Analytics**: Filter and display events by `project_id`
- **Unified Data Flow**: Consistent event format across all sources

## 🏗️ Implementation Plan

### Phase 1: Update Generated Website Tracking

#### 1.1 Fix Static Site Generator Tracking
**File**: `src/utils/staticSiteGenerator.js`

**Current Issue**: Inline tracking uses different payload format than main site
**Current Code** (around line 204):
```javascript
function trackEvent(eventName, eventData = {}) {
    fetch(`${JETSY_API_BASE}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event_name: eventName,           // ❌ Wrong key
            event_category: 'user_interaction',
            event_data: JSON.stringify({     // ❌ Wrong key
                ...eventData,
                project_id: PROJECT_ID,
                source: 'vercel_deployment',
                timestamp: new Date().toISOString()
            }),
            timestamp: Date.now(),
            url: window.location.href,
            user_agent: navigator.userAgent,  // ❌ Wrong key
            jetsy_generated: true,
            website_id: PROJECT_ID
        })
    }).catch(error => {
        console.error('Analytics tracking error:', error);
    });
}
```

**Required Changes**:
```javascript
function trackEvent(eventName, eventData = {}) {
    fetch(`${JETSY_API_BASE}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: eventName,                    // ✅ Correct key
            data: { project_id: PROJECT_ID, ...eventData }, // ✅ Correct key
            timestamp: Date.now(),
            userAgent: navigator.userAgent,      // ✅ Correct key
            url: window.location.href,
            category: 'user_interaction',
            sessionId: getSessionId(),
            pageTitle: document.title,
            referrer: document.referrer,
            websiteId: PROJECT_ID,
            userId: PROJECT_ID,
            jetsyGenerated: true
        })
    }).catch(error => {
        console.error('Analytics tracking error:', error);
    });
}

// Add session management
function getSessionId() {
    let sessionId = sessionStorage.getItem('jetsy_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('jetsy_session_id', sessionId);
    }
    return sessionId;
}
```

**Tracked Events**:
- `page_view` - On DOMContentLoaded
- `pricing_plan_select` - On pricing plan button clicks
- `lead_form_submit` - On lead form submissions
- `contact_form_submit` - On contact form submissions

#### 1.2 Update Live Preview Tracking
**File**: `src/components/ExceptionalTemplate.jsx`

**Add tracking to live preview routes**:
```javascript
// Add at the top of the component
const sendEvent = (eventName, eventData = {}) => {
    fetch(`${getApiBaseUrl()}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: eventName,
            data: { project_id: projectId, ...eventData },
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            category: 'user_interaction',
            sessionId: getSessionId(),
            pageTitle: document.title,
            referrer: document.referrer,
            websiteId: projectId,
            userId: projectId,
            jetsyGenerated: true
        })
    }).catch(() => {});
};

// Add session management
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('jetsy_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('jetsy_session_id', sessionId);
    }
    return sessionId;
};

// Add tracking calls
useEffect(() => {
    // Track page view
    sendEvent('page_view', {
        page_title: document.title,
        referrer: document.referrer
    });
}, []);

// Update form submission handlers
const handleFormSubmit = async (e) => {
    // ... existing form logic ...
    
    // Track form submission
    sendEvent('contact_form_submit', {
        form_type: 'contact',
        has_name: !!formData.name,
        has_company: !!formData.company
    });
};

// Update lead modal submission
const handleLeadSubmit = async (e) => {
    // ... existing lead logic ...
    
    // Track lead submission
    sendEvent('lead_form_submit', {
        form_type: 'lead',
        has_phone: !!leadPhone
    });
};

// Update pricing plan clicks
const handlePricingClick = (plan) => {
    sendEvent('pricing_plan_select', {
        plan_name: plan.name,
        plan_price: plan.price,
        plan_popular: plan.popular
    });
};
```

### Phase 2: Create Project-Specific Analytics API

#### 2.1 Create New API Endpoint
**File**: `functions/api/project-tracking.js`

```javascript
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('project_id');
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const db = env.DB;

    // Get events for specific project
    const result = await db.prepare(`
      SELECT 
        id,
        event_name,
        event_category,
        event_data,
        timestamp,
        created_at,
        url,
        user_agent
      FROM tracking_events
      WHERE JSON_EXTRACT(event_data, '$.project_id') = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(projectId, limit, offset).all();

    return new Response(JSON.stringify({
      success: true,
      events: result.results || [],
      total: result.results?.length || 0
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Project tracking error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch project events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

#### 2.2 Create Summary API Endpoint
**File**: `functions/api/project-tracking-summary.js`

```javascript
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('project_id');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const db = env.DB;

    // Get event counts by type
    const eventCounts = await db.prepare(`
      SELECT 
        event_name,
        COUNT(*) as count
      FROM tracking_events
      WHERE JSON_EXTRACT(event_data, '$.project_id') = ?
      GROUP BY event_name
    `).bind(projectId).all();

    // Get daily counts for last 7 days
    const dailyCounts = await db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_events,
        COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) as page_views,
        COUNT(CASE WHEN event_name = 'lead_form_submit' THEN 1 END) as leads,
        COUNT(CASE WHEN event_name = 'pricing_plan_select' THEN 1 END) as pricing_clicks
      FROM tracking_events
      WHERE JSON_EXTRACT(event_data, '$.project_id') = ?
        AND created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).bind(projectId).all();

    // Calculate totals
    const totals = {
      page_views: 0,
      leads: 0,
      pricing_clicks: 0,
      total_events: 0
    };

    eventCounts.results?.forEach(row => {
      if (row.event_name === 'page_view') totals.page_views = row.count;
      if (row.event_name === 'lead_form_submit') totals.leads = row.count;
      if (row.event_name === 'pricing_plan_select') totals.pricing_clicks = row.count;
      totals.total_events += row.count;
    });

    return new Response(JSON.stringify({
      success: true,
      totals,
      daily_counts: dailyCounts.results || [],
      event_breakdown: eventCounts.results || []
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Project tracking summary error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch project summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

### Phase 3: Update Project Analytics Dashboard

#### 3.1 Extend ProjectDataAnalytics Component
**File**: `src/components/ProjectDataAnalytics.jsx`

**Add new state and data fetching**:
```javascript
const ProjectDataAnalytics = ({ projectId, onBack }) => {
  // ... existing state ...
  
  // New state for events
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [eventsPage, setEventsPage] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  
  const [eventsSummary, setEventsSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // ... existing useEffect hooks ...

  // New useEffect for events summary
  useEffect(() => {
    const loadEventsSummary = async () => {
      setSummaryLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/project-tracking-summary?project_id=${projectId}`);
        const data = await res.json();
        if (res.ok) {
          setEventsSummary(data);
        } else {
          console.error('Failed to load events summary:', data?.error);
        }
      } catch (err) {
        console.error('Events summary error:', err);
      } finally {
        setSummaryLoading(false);
      }
    };
    loadEventsSummary();
  }, [projectId]);

  // New useEffect for events
  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/project-tracking?project_id=${projectId}&limit=${pageSize}&offset=${eventsPage * pageSize}`);
        const data = await res.json();
        if (res.ok) {
          setEvents(data.events || []);
          setEventsHasMore((data.events || []).length === pageSize);
        } else {
          setEventsError(data?.error || 'Failed to load events');
        }
      } catch (err) {
        setEventsError(err.message || 'Network error');
      } finally {
        setEventsLoading(false);
      }
    };
    loadEvents();
  }, [projectId, eventsPage]);

  // ... existing code ...
```

**Add Events Summary Section** (after the header):
```javascript
{/* Events Summary */}
{!summaryLoading && eventsSummary && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Page Views</p>
          <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.page_views}</p>
        </div>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Leads</p>
          <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.leads}</p>
        </div>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Pricing Clicks</p>
          <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.pricing_clicks}</p>
        </div>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total Events</p>
          <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.total_events}</p>
        </div>
      </div>
    </div>
  </div>
)}
```

**Add Events Table Section** (after Contact submissions):
```javascript
{/* Events Table */}
<h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Events</h2>
{eventsLoading && <div className="text-gray-600">Loading...</div>}
{eventsError && <div className="text-red-600">{eventsError}</div>}

{!eventsLoading && !eventsError && (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
    <div className="grid grid-cols-5 gap-0 bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 border-b border-gray-200">
      <div>Event</div>
      <div>Category</div>
      <div>URL</div>
      <div>Data</div>
      <div>Time</div>
    </div>
    {events.length === 0 ? (
      <div className="p-4 text-gray-500">No events tracked yet.</div>
    ) : (
      events.map((event) => (
        <div key={event.id} className="grid grid-cols-5 gap-0 px-4 py-3 border-b border-gray-100 text-sm">
          <div className="truncate">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              event.event_name === 'page_view' ? 'bg-blue-100 text-blue-800' :
              event.event_name === 'lead_form_submit' ? 'bg-green-100 text-green-800' :
              event.event_name === 'pricing_plan_select' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.event_name}
            </span>
          </div>
          <div className="truncate">{event.event_category || '-'}</div>
          <div className="truncate" title={event.url}>
            {event.url ? (
              <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                {event.url.length > 30 ? event.url.substring(0, 30) + '...' : event.url}
              </a>
            ) : '-'}
          </div>
          <div className="truncate">
            <details className="group">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
                View Data
              </summary>
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(JSON.parse(event.event_data || '{}'), null, 2)}</pre>
              </div>
            </details>
          </div>
          <div>{new Date(event.created_at).toLocaleString()}</div>
        </div>
      ))
    )}
    <div className="flex items-center justify-between px-4 py-2">
      <button disabled={eventsPage === 0} onClick={() => setEventsPage((p) => Math.max(0, p - 1))} className={`px-3 py-1 rounded ${eventsPage === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Prev</button>
      <div className="text-sm text-gray-600">Page {eventsPage + 1}</div>
      <button disabled={!eventsHasMore} onClick={() => setEventsPage((p) => p + 1)} className={`px-3 py-1 rounded ${!eventsHasMore ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Next</button>
    </div>
  </div>
)}
```

## 🧪 Testing Strategy

### 1. Unit Testing
- Test new API endpoints with mock data
- Verify event filtering by `project_id`
- Test payload format consistency

### 2. Integration Testing
- Deploy a test website to Vercel
- Verify events are captured and stored
- Check project analytics dashboard displays data

### 3. User Acceptance Testing
- Create a test project and generate website
- Visit generated site and perform actions
- Verify events appear in project analytics

## 🚀 Deployment Checklist

### Phase 1: Generated Website Tracking
- [ ] Update `src/utils/staticSiteGenerator.js` inline tracking
- [ ] Update `src/components/ExceptionalTemplate.jsx` live preview tracking
- [ ] Test tracking on live preview routes
- [ ] Test tracking on Vercel deployments

### Phase 2: API Endpoints
- [ ] Create `functions/api/project-tracking.js`
- [ ] Create `functions/api/project-tracking-summary.js`
- [ ] Test endpoints with sample data
- [ ] Deploy to production

### Phase 3: Analytics Dashboard
- [ ] Update `src/components/ProjectDataAnalytics.jsx`
- [ ] Add events summary section
- [ ] Add events table section
- [ ] Test data display and pagination

### Phase 4: Final Testing
- [ ] End-to-end testing with real generated websites
- [ ] Performance testing with large event datasets
- [ ] User acceptance testing
- [ ] Documentation updates

## 🔒 Security Considerations

- **CORS**: All new endpoints include proper CORS headers
- **Input Validation**: Validate `project_id` parameter
- **Rate Limiting**: Consider adding rate limiting for event tracking
- **Data Privacy**: Ensure no sensitive data is exposed in event payloads

## 📊 Expected Outcomes

### For Users
- **Real-time Insights**: See how visitors interact with their generated websites
- **Conversion Tracking**: Monitor lead generation and pricing plan interest
- **Performance Metrics**: Track page views and user engagement

### For Jetsy
- **Better User Experience**: Users can optimize their websites based on data
- **Product Validation**: Understand which features drive engagement
- **Data-Driven Decisions**: Make informed product improvements

## 🐛 Troubleshooting Guide

### Common Issues
1. **Events not appearing**: Check `project_id` in event payload
2. **API errors**: Verify endpoint URLs and CORS headers
3. **Performance issues**: Check database indexes on `event_data` JSON
4. **Missing events**: Verify tracking script injection in generated sites

### Debug Commands
```bash
# Check events for a specific project
curl "https://jetsy.dev/api/project-tracking?project_id=123"

# Check project summary
curl "https://jetsy.dev/api/project-tracking-summary?project_id=123"

# View database directly
wrangler d1 execute jetsy-leads --command "SELECT * FROM tracking_events WHERE JSON_EXTRACT(event_data, '$.project_id') = '123' LIMIT 5;"
```

## 📈 Future Enhancements

### Phase 2 Features (Post-Launch)
- **Real-time Updates**: WebSocket connections for live event streaming
- **Advanced Filtering**: Date ranges, event types, user segments
- **Export Functionality**: CSV/JSON export of event data
- **Custom Events**: Allow users to define custom tracking events

### Phase 3 Features
- **A/B Testing**: Track conversion rates for different website versions
- **User Journey Mapping**: Visualize user paths through websites
- **Conversion Funnels**: Identify drop-off points in user flows
- **Integration APIs**: Webhook support for external analytics tools

---

**Implementation Timeline**: 2-3 weeks
**Risk Level**: Low (minimal changes to existing systems)
**Success Metrics**: Event tracking coverage, dashboard usage, user satisfaction
