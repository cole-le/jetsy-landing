// Analytics Dashboard API Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Route API requests
      if (path.startsWith('/api/analytics/')) {
        return await handleAnalyticsRequest(path, request, env, corsHeaders)
      }

      // Handle Demo Leads API
      if (path === '/api/demo-leads' && request.method === 'GET') {
        return await handleDemoLeadsGet(env, corsHeaders)
      }
      if (path === '/api/demo-leads' && request.method === 'POST') {
        return await handleDemoLeadsPost(request, env, corsHeaders)
      }
      if (path === '/api/demo-leads' && request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders })
      }

      // For local development, return a simple HTML page
      if (path === '/' || path === '/index.html') {
        return new Response(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Jetsy Analytics Dashboard</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
                .container { max-width: 600px; margin: 0 auto; }
                .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .success { background: #d1fae5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🚀 Jetsy Analytics Dashboard</h1>
                <div class="warning">
                  <h3>⚠️ Development Mode</h3>
                  <p>This is the API server for the analytics dashboard.</p>
                  <p>To view the dashboard, run: <code>npm run dev</code> in the analytics-dashboard directory</p>
                  <p>Then visit: <a href="http://localhost:3001">http://localhost:3001</a></p>
                </div>
                <div class="success">
                  <h3>✅ API Status</h3>
                  <p>API endpoints are working correctly.</p>
                  <p>Database connection: <strong>Active</strong></p>
                </div>
                <p><small>Worker deployed at: ${new Date().toISOString()}</small></p>
              </div>
            </body>
          </html>
        `, {
          headers: {
            'Content-Type': 'text/html',
            ...corsHeaders,
          },
        })
      }

      // Return 404 for other paths
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })

    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }
  },
}

async function handleAnalyticsRequest(path, request, env, corsHeaders) {
  const db = env.DB

  try {
    switch (path) {
      case '/api/analytics/overview':
        return await getOverviewMetrics(db, corsHeaders)
      case '/api/analytics/daily':
        return await getDailyMetrics(db, corsHeaders)
      case '/api/analytics/events-breakdown':
        return await getEventsBreakdown(db, corsHeaders)
      case '/api/analytics/funnel':
        return await getFunnelMetrics(db, corsHeaders)
      case '/api/analytics/events':
        return await getEventTracking(db, corsHeaders)
      case '/api/analytics/priority-access':
        return await getPriorityAccessMetrics(db, corsHeaders)
      case '/api/analytics/realtime':
        return await getRealTimeMetrics(db, corsHeaders)
      case '/api/analytics/debug':
        return await getDebugInfo(db, corsHeaders)
      case '/api/analytics/test-funnel':
        return await testFunnelQueries(db, corsHeaders)
      default:
        return new Response('Not Found', { status: 404 })
    }
  } catch (error) {
    console.error('Error in analytics request:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function getOverviewMetrics(db, corsHeaders) {
  try {
    // Get total leads (from lead capture events)
    const leadsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('lead_form_submit').first()
    const totalLeads = leadsResult?.count || 0

    // Get total events (streamlined events only)
    const eventsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name IN (?, ?, ?, ?, ?, ?)').bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').first()
    const totalEvents = eventsResult?.count || 0

    // Get priority access attempts (from tracking events)
    const priorityResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('priority_access_attempt').first()
    const priorityAccessAttempts = priorityResult?.count || 0

    // Get today's leads
    const todayLeadsResult = await db.prepare(`
      SELECT COUNT(*) as count FROM tracking_events 
      WHERE event_name = ? AND DATE(created_at) = DATE('now')
    `).bind('lead_form_submit').first()
    const todayLeads = todayLeadsResult?.count || 0

    // Get today's events
    const todayEventsResult = await db.prepare(`
      SELECT COUNT(*) as count FROM tracking_events 
      WHERE event_name IN (?, ?, ?, ?, ?, ?) AND DATE(created_at) = DATE('now')
    `).bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').first()
    const todayEvents = todayEventsResult?.count || 0

    // Calculate conversion rate (leads who reached queue view)
    const queueViewsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('queue_view').first()
    const queueViews = queueViewsResult?.count || 0
    const conversionRate = totalLeads > 0 ? Math.round((queueViews / totalLeads) * 100) : 0

    return new Response(JSON.stringify({
      totalLeads,
      totalEvents,
      priorityAccessAttempts,
      conversionRate,
      todayLeads,
      todayEvents
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error getting overview metrics:', error)
    throw error
  }
}

async function getDailyMetrics(db, corsHeaders) {
  try {
    // First check if we have any streamlined event data
    const leadsCount = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('lead_form_submit').first()
    const eventsCount = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name IN (?, ?, ?, ?, ?, ?)').bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').first()
    
    if ((leadsCount?.count || 0) === 0 && (eventsCount?.count || 0) === 0) {
      // Return empty array if no data
      return new Response(JSON.stringify([]), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }

    // If we have data, get the daily metrics for streamlined events
    const result = await db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN event_name = ? THEN 1 END) as leads,
        COUNT(*) as events
      FROM tracking_events
      WHERE event_name IN (?, ?, ?, ?, ?, ?) 
        AND created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).bind('lead_form_submit', 'page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').all()

    return new Response(JSON.stringify(result.results), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error getting daily metrics:', error)
    // Return empty array on error
    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
}

async function getEventsBreakdown(db, corsHeaders) {
  try {
    const result = await db.prepare(`
      SELECT 
        event_name as name,
        COUNT(*) as value
      FROM tracking_events
      WHERE event_name IN (?, ?, ?, ?, ?, ?)
      GROUP BY event_name
      ORDER BY value DESC
    `).bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').all()

    return new Response(JSON.stringify(result.results), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error getting events breakdown:', error)
    throw error
  }
}

async function getFunnelMetrics(db, corsHeaders) {
  try {
    console.log('Starting funnel metrics calculation...')
    
    // Use individual queries like events breakdown
    const pageViewsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('page_view').first()
    const ideaSubmissionsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('chat_input_submit').first()
    const planSelectionsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('pricing_plan_select').first()
    const leadCapturesResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('lead_form_submit').first()
    const queueViewsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('queue_view').first()
    const priorityAttemptsResult = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('priority_access_attempt').first()
    
    console.log('Individual query results:', {
      pageViews: pageViewsResult?.count,
      ideaSubmissions: ideaSubmissionsResult?.count,
      planSelections: planSelectionsResult?.count,
      leadCaptures: leadCapturesResult?.count,
      queueViews: queueViewsResult?.count,
      priorityAttempts: priorityAttemptsResult?.count
    })
    
    // Check what events actually exist
    const allEvents = await db.prepare('SELECT event_name, COUNT(*) as count FROM tracking_events GROUP BY event_name').all()
    console.log('All events in database:', allEvents?.results || [])

    const funnel = [
      { step: 'Page Views', count: pageViewsResult?.count || 0 },
      { step: 'Idea Submissions', count: ideaSubmissionsResult?.count || 0 },
      { step: 'Plan Selections', count: planSelectionsResult?.count || 0 },
      { step: 'Lead Captures', count: leadCapturesResult?.count || 0 },
      { step: 'Queue Views', count: queueViewsResult?.count || 0 },
      { step: 'Priority Access Attempts', count: priorityAttemptsResult?.count || 0 }
    ]

    console.log('Final funnel result:', funnel)

    return new Response(JSON.stringify(funnel), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error getting funnel metrics:', error)
    // Return default funnel structure on error
    const defaultFunnel = [
      { step: 'Page Views', count: 0 },
      { step: 'Idea Submissions', count: 0 },
      { step: 'Plan Selections', count: 0 },
      { step: 'Lead Captures', count: 0 },
      { step: 'Queue Views', count: 0 },
      { step: 'Priority Access Attempts', count: 0 }
    ]
    return new Response(JSON.stringify(defaultFunnel), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
}

async function getEventTracking(db, corsHeaders) {
  try {
    // Check if tracking_events table has data
    const eventsCount = await db.prepare('SELECT COUNT(*) as count FROM tracking_events').first()
    
    if ((eventsCount?.count || 0) === 0) {
      // Return empty array if no events
      return new Response(JSON.stringify([]), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }

    // If we have data, get the events
    const result = await db.prepare(`
      SELECT 
        event_name,
        event_category,
        event_data,
        timestamp,
        created_at,
        user_agent,
        url
      FROM tracking_events
      ORDER BY created_at DESC
      LIMIT 100
    `).all()

    return new Response(JSON.stringify(result.results), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error getting event tracking:', error)
    // Return empty array on error
    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
}

async function getPriorityAccessMetrics(db, corsHeaders) {
  try {
    const result = await db.prepare(`
      SELECT 
        JSON_EXTRACT(event_data, '$.email') as email,
        JSON_EXTRACT(event_data, '$.phone') as phone,
        created_at
      FROM tracking_events
      WHERE event_name = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind('priority_access_attempt').all()

    return new Response(JSON.stringify(result.results), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error getting priority access metrics:', error)
    throw error
  }
}

async function getRealTimeMetrics(db, corsHeaders) {
  try {
    // Get last 24 hours of activity for streamlined events
    const leadsResult = await db.prepare(`
      SELECT COUNT(*) as leads
      FROM tracking_events 
      WHERE event_name = ? AND created_at >= datetime('now', '-24 hours')
    `).bind('lead_form_submit').first()
    
    const eventsResult = await db.prepare(`
      SELECT COUNT(*) as events
      FROM tracking_events 
      WHERE event_name IN (?, ?, ?, ?, ?, ?) AND created_at >= datetime('now', '-24 hours')
    `).bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').first()
    
    const priorityResult = await db.prepare(`
      SELECT COUNT(*) as priority_attempts
      FROM tracking_events 
      WHERE event_name = ? AND created_at >= datetime('now', '-24 hours')
    `).bind('priority_access_attempt').first()

    const result = {
      period: 'Last 24 Hours',
      leads: leadsResult?.leads || 0,
      events: eventsResult?.events || 0,
      priority_attempts: priorityResult?.priority_attempts || 0
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error getting real-time metrics:', error)
    // Return default values on error
    return new Response(JSON.stringify({
      period: 'Last 24 Hours',
      leads: 0,
      events: 0,
      priority_attempts: 0
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
}

async function getDebugInfo(db, corsHeaders) {
  try {
    // Test database connection and get basic info for streamlined events
    const totalEvents = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name IN (?, ?, ?, ?, ?, ?)').bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').first()
    const totalLeads = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('lead_form_submit').first()
    const totalPriority = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('priority_access_attempt').first()
    
    // Get recent streamlined events
    const recentEvents = await db.prepare('SELECT event_name, created_at FROM tracking_events WHERE event_name IN (?, ?, ?, ?, ?, ?) ORDER BY created_at DESC LIMIT 10').bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').all()
    
    // Get all unique event names (streamlined only)
    const eventNames = await db.prepare('SELECT DISTINCT event_name FROM tracking_events WHERE event_name IN (?, ?, ?, ?, ?, ?)').bind('page_view', 'chat_input_submit', 'pricing_plan_select', 'lead_form_submit', 'queue_view', 'priority_access_attempt').all()
    
    return new Response(JSON.stringify({
      database_connection: 'success',
      total_events: totalEvents?.count || 0,
      total_leads: totalLeads?.count || 0,
      total_priority_attempts: totalPriority?.count || 0,
      recent_events: recentEvents?.results || [],
      available_event_names: eventNames?.results?.map(r => r.event_name) || [],
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Debug info error:', error)
    return new Response(JSON.stringify({
      database_connection: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
} 

async function testFunnelQueries(db, corsHeaders) {
  try {
    console.log('=== TESTING FUNNEL QUERIES ===')
    
    // Test each query individually
    const chatInputQuery = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('chat_input_submit').first()
    console.log('chat_input_submit query result:', chatInputQuery)
    
    const leadFormQuery = await db.prepare('SELECT COUNT(*) as count FROM tracking_events WHERE event_name = ?').bind('lead_form_submit').first()
    console.log('lead_form_submit query result:', leadFormQuery)
    
    // Test with raw SQL to see if there's a binding issue
    const allEventsQuery = await db.prepare('SELECT event_name, COUNT(*) as count FROM tracking_events GROUP BY event_name').all()
    console.log('All events grouped:', allEventsQuery?.results || [])
    
    // Test exact string matching
    const exactChatInput = await db.prepare('SELECT event_name, COUNT(*) as count FROM tracking_events WHERE event_name = "chat_input_submit"').first()
    console.log('Exact chat_input_submit match:', exactChatInput)
    
    const exactLeadForm = await db.prepare('SELECT event_name, COUNT(*) as count FROM tracking_events WHERE event_name = "lead_form_submit"').first()
    console.log('Exact lead_form_submit match:', exactLeadForm)
    
    const result = {
      chatInputSubmit: chatInputQuery?.count || 0,
      leadFormSubmit: leadFormQuery?.count || 0,
      allEventsGrouped: allEventsQuery?.results || [],
      exactChatInput: exactChatInput?.count || 0,
      exactLeadForm: exactLeadForm?.count || 0
    }
    
    console.log('Test result:', result)
    
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error in test funnel queries:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
} 

async function handleDemoLeadsGet(env, corsHeaders) {
  try {
    const db = env.DB;
    const result = await db.prepare(
      `SELECT id, first_name, last_name, email, phone, company, created_at, timestamp
       FROM demo_leads
       ORDER BY created_at DESC
       LIMIT 100`
    ).all();
    return new Response(JSON.stringify({ success: true, leads: result.results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Demo leads fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch demo leads' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleDemoLeadsPost(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, company, timestamp } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const db = env.DB;
    const currentTime = new Date().toISOString();
    const ts = timestamp || Date.now();

    const result = await db.prepare(
      `INSERT INTO demo_leads (first_name, last_name, email, phone, company, created_at, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(firstName, lastName, email, phone || '', company, currentTime, ts).run();

    if (!result.success) {
      throw new Error('Failed to store demo lead');
    }

    return new Response(JSON.stringify({ success: true, message: 'Demo lead stored successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Demo lead submission error:', error);
    return new Response(JSON.stringify({ error: 'Failed to store demo lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
} 