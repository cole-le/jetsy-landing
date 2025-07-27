export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
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
      // Remove or comment out the old /api/leads POST route
      // if (path === '/api/leads' && request.method === 'POST') {
      //   return await handleLeadSubmission(request, env, corsHeaders);
      // }

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
    console.error('Lead submission error:', error);
    return new Response(JSON.stringify({ error: 'Failed to store lead' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Add the new handler logic from functions/api/leads.js
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
    const submissionTime = submitted_at || new Date().toISOString();
    const uid = user_id || 1;
    const pid = project_id || 1;

    // Store lead in D1 database
    const leadResult = await db.prepare(
      "INSERT INTO leads (email, phone, user_id, project_id, submitted_at, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(email, phone, uid, pid, submissionTime, submissionTime).run();

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
    console.error('Lead submission error:', error);
    return new Response(JSON.stringify({ error: 'Failed to store lead' }), {
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

    const db = env.DB;
    const result = await db.prepare(`
      SELECT 
        l.id, 
        l.email, 
        l.phone, 
        l.ts, 
        l.created_at,
        i.idea_name,
        i.idea_description,
        ps.plan_type,
        fc.completed_at,
        od.audience,
        od.validation_goal
      FROM leads l
      LEFT JOIN ideas i ON l.id = i.lead_id
      LEFT JOIN plan_selections ps ON l.id = ps.lead_id
      LEFT JOIN funnel_completions fc ON l.id = fc.lead_id
      LEFT JOIN onboarding_data od ON l.id = od.lead_id
      ORDER BY l.created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

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
    const { project_name, files, user_id = 1 } = await request.json();
    if (!project_name || !files) {
      return new Response(JSON.stringify({ error: 'project_name and files are required' }), { status: 400, headers: corsHeaders });
    }
    const now = new Date().toISOString();
    const result = await db.prepare('INSERT INTO projects (user_id, project_name, files, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').bind(user_id, project_name, JSON.stringify(files), now, now).run();
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
    const { files, project_name } = await request.json();
    if (!files && !project_name) {
      return new Response(JSON.stringify({ error: 'files or project_name are required' }), { status: 400, headers: corsHeaders });
    }
    const now = new Date().toISOString();
    
    let query, params;
    if (files && project_name) {
      query = 'UPDATE projects SET files = ?, project_name = ?, updated_at = ? WHERE id = ?';
      params = [JSON.stringify(files), project_name, now, id];
    } else if (files) {
      query = 'UPDATE projects SET files = ?, updated_at = ? WHERE id = ?';
      params = [JSON.stringify(files), now, id];
    } else {
      query = 'UPDATE projects SET project_name = ?, updated_at = ? WHERE id = ?';
      params = [project_name, now, id];
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
    const { project_id, role, message } = await request.json();
    if (!project_id || !role || !message) {
      return new Response(JSON.stringify({ error: 'project_id, role, and message are required' }), { status: 400, headers: corsHeaders });
    }
    const now = new Date().toISOString();
    const result = await db.prepare('INSERT INTO chat_messages (project_id, role, message, timestamp) VALUES (?, ?, ?, ?)').bind(project_id, role, message, now).run();
    if (!result.success) {
      throw new Error('Failed to add chat message');
    }
    return new Response(JSON.stringify({ success: true, message_id: result.meta.last_row_id }), { status: 201, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to add chat message' }), { status: 500, headers: corsHeaders });
  }
}

// --- LLM Orchestration Handler ---
async function handleLLMOrchestration(request, env, corsHeaders) {
  try {
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
    if (!projectFiles) {
      console.log('📁 Fetching project files from database...');
      const stmt = env.DB.prepare('SELECT files FROM projects WHERE id = ?');
      const result = await stmt.bind(project_id).first();
      if (result) {
        projectFiles = JSON.parse(result.files);
      } else {
        projectFiles = {};
      }
    }

    console.log('🔍 LLM Orchestration Debug:');
    console.log('   - API Key present:', !!apiKey);
    console.log('   - API Key length:', apiKey ? apiKey.length : 0);
    console.log('   - User message:', user_message);
    console.log('   - Project files:', Object.keys(projectFiles));
    
    console.log('🚀 Calling OpenAI API with gpt-4o-mini...');
    const response = await callOpenAI(user_message, projectFiles, { ...env, OPENAI_API_KEY: apiKey });
    console.log('✅ OpenAI API call successful');
    
    // Smart image generation logic
    const isInitialPrompt = !projectFiles || Object.keys(projectFiles).length === 0 || 
                           (Object.keys(projectFiles).length === 1 && projectFiles['src/index.css']);
    
    if (response.image_requests && response.image_requests.length > 0) {
      if (isInitialPrompt) {
        console.log('🎨 Generating images for initial prompt:', response.image_requests.length, 'images');
      } else {
        console.log('🎨 Skipping image generation for non-initial prompt (keeping existing images)');
        // Clear image requests to prevent generation
        response.image_requests = [];
      }
      
      const generatedImages = [];
      
      for (const imageRequest of response.image_requests) {
        try {
          const imageResponse = await fetch(`${new URL(request.url).origin}/api/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: project_id,
              prompt: imageRequest.prompt,
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
              
              // Update the code to use the generated image
              if (imageRequest.placement && response.updated_files) {
                const imageId = imageResult.images[0].image_id;
                const imageUrl = imageResult.images[0].url;
                
                console.log(`🔄 Replacing image placeholder for ${imageRequest.placement} with ID: ${imageId}`);
                
                for (const [filename, content] of Object.entries(response.updated_files)) {
                  let updatedContent = content;
                  
                  // Replace specific placeholders based on placement
                  const specificPlaceholder = new RegExp(`\\{GENERATED_IMAGE_URL_${imageRequest.placement.toUpperCase()}\\}`);
                  if (specificPlaceholder.test(updatedContent)) {
                    updatedContent = updatedContent.replace(specificPlaceholder, imageUrl);
                  }
                  
                  // Replace generic placeholders (first occurrence only)
                  const placeholderRegex = new RegExp(`\\{GENERATED_IMAGE_URL\\}`);
                  if (placeholderRegex.test(updatedContent)) {
                    updatedContent = updatedContent.replace(placeholderRegex, imageUrl);
                  }
                  
                  // Also replace any remaining generic placeholders (first occurrence only)
                  const imageIdRegex = new RegExp(`/api/images/\\{IMAGE_ID\\}`);
                  if (imageIdRegex.test(updatedContent)) {
                    updatedContent = updatedContent.replace(imageIdRegex, imageUrl);
                  }
                  
                  // Replace any remaining API endpoints with direct URLs (first occurrence only)
                  const generatedImageIdRegex = new RegExp(`/api/images/\\{GENERATED_IMAGE_ID\\}`);
                  if (generatedImageIdRegex.test(updatedContent)) {
                    updatedContent = updatedContent.replace(generatedImageIdRegex, imageUrl);
                  }
                  
                  response.updated_files[filename] = updatedContent;
                }
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
    
    // Log business info if available
    if (response.business_info) {
      console.log('🏢 Business Info Generated:');
      console.log(`   Name: ${response.business_info.name || 'Not specified'}`);
      console.log(`   Tagline: ${response.business_info.tagline || 'Not specified'}`);
      console.log(`   Color Scheme: ${response.business_info.color_scheme || 'Not specified'}`);
    }
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('LLM orchestration error:', error);
    console.error('Error stack:', error.stack);
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

// Real OpenAI API integration
async function callOpenAI(userMessage, currentFiles, env) {
  const openaiUrl = 'https://api.openai.com/v1/chat/completions';
  
  console.log('🔍 Attempting to call OpenAI API with o4-mini...');
  console.log('📝 User message:', userMessage);
  
  // Enhanced system prompt for beautiful landing page generation
  const systemPrompt = `You are an expert React developer, UI/UX designer, and business strategist. Your task is to create stunning, conversion-optimized landing pages that generate leads and drive business growth.

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
        26. TEXT CONTRAST RULES: Never use white text on white backgrounds, always use contrasting colors
        27. BACKGROUND OVERLAY: Always add dark overlays on background images to ensure text readability
        28. INITIAL PROMPT DETECTION: If currentFiles is empty or only contains basic files (like index.css), treat this as an initial prompt and ALWAYS generate images
        29. IMAGE GENERATION FOR INITIAL PROMPTS: For initial prompts, generate hero image, logo, and feature images regardless of user request
        30. IMAGE PLACEHOLDERS: Always include image placeholders in generated code: {GENERATED_IMAGE_URL_HERO}, {GENERATED_IMAGE_URL_LOGO}, {GENERATED_IMAGE_URL_FEATURE_1}, {GENERATED_IMAGE_URL_FEATURE_2}, {GENERATED_IMAGE_URL_FEATURE_3}
        31. IMAGE INTEGRATION: Use <img> tags with placeholders in hero sections, logos, and feature cards
        32. CRITICAL: For initial prompts, ALWAYS include image placeholders in the React code so images can be integrated
        33. IMAGE PLACEHOLDER FORMAT: Use exact format: <img src="{GENERATED_IMAGE_URL_HERO}" alt="description" className="..." />
        34. IMAGE REQUEST PLACEMENTS: Generate image requests with specific placements: "hero", "logo", "feature_1", "feature_2", "feature_3"
        35. FEATURE IMAGE PLACEMENTS: Each feature card must have a unique placement: feature_1, feature_2, feature_3
        36. SMART IMAGE GENERATION: Only generate image_requests for initial prompts or when user explicitly asks for new images
        37. NON-IMAGE PROMPTS: For styling, content, or feature changes, do NOT generate image_requests, keep existing images

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

TEXT CONTRAST RULES:
- Light backgrounds (white, cream, light gray): Use dark text (text-gray-900, text-gray-800)
- Dark backgrounds (black, dark blue, dark gray): Use light text (text-white, text-gray-100)
- Gradient backgrounds: Use text shadows and dark overlays
- Background images: Always add dark overlay (bg-black bg-opacity-40) before text

Current files structure:
${currentFiles ? Object.keys(currentFiles).map(file => `- ${file}`).join('\n') : 'No files'}

User request: ${userMessage}`;

  const userPrompt = `Please analyze the user's request and generate a complete, professional landing page with the following features:

1. BUSINESS IDENTITY:
- Generate a compelling business name if not provided
- Create a professional tagline
- Design a logo concept
- Choose an appropriate color scheme based on the business type

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
- Background images: <img src="{GENERATED_IMAGE_URL_BACKGROUND}" alt="Background" className="absolute inset-0 w-full h-full object-cover" />

2. LANDING PAGE STRUCTURE:
- NAVIGATION HEADER: Fixed header with smooth scrolling navigation links to all sections
- HERO SECTION (MOST IMPORTANT): Must be the first section with the business name and tagline prominently displayed
- Features/benefits section with relevant images
- About section with business story
- Pricing section (if applicable)
- Contact/location section (if applicable)
- Footer with social links

3. HERO SECTION REQUIREMENTS:
- Must be the first section of the page
- Must prominently display the business name in large, bold text
- Must display the tagline below the business name
- Should include a hero image if applicable
- MUST have a prominent call-to-action button (e.g., "Book Table" for restaurants, "Join Waitlist" for SaaS, "Get Started" for services)
- Use gradient backgrounds or eye-catching colors
- CRITICAL: Ensure proper text contrast - use text shadows or dark overlays on images
- NEVER use white text on light backgrounds or dark text on dark backgrounds
- For light backgrounds: use dark text (text-gray-900, text-gray-800)
- For dark backgrounds: use light text (text-white, text-gray-100)
- For background images: always add dark overlay (bg-black bg-opacity-40) before text
- Use text shadows: text-shadow: 0 2px 4px rgba(0,0,0,0.5)

3. LEAD CAPTURE:
- Include at least one lead capture form
- Options: email input, phone input, or both
- Clear CTA buttons: "Book Now", "Join Waitlist", "Pre-purchase", "Get Started"
- Form validation and error handling

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
- CRITICAL: Only generate image_requests for:
  * Initial prompts (first prompt in a project)
  * When user explicitly asks for "new images", "different images", or "generate images"
- DO NOT generate image_requests for:
  * Styling changes (colors, layout, fonts)
  * Content changes (text, descriptions, features)
  * Navigation or CTA improvements
  * Any non-image-related requests

Current files content:
${currentFiles ? JSON.stringify(currentFiles, null, 2) : '{}'}

IMPORTANT: 
- ALWAYS generate images for the initial prompt in a project (when no existing files or empty project)
- For subsequent prompts, ONLY generate images if the user explicitly asks for "new images", "different images", or "generate images"
- For all other requests (styling, content, features, navigation), do NOT generate image_requests - keep existing images and placeholders

Return only the JSON response with assistant_message, updated_files, image_requests, and business_info.`;

        const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 6000
    };

  console.log('📤 Sending request to OpenAI API...');
  console.log('🤖 Model:', requestBody.model);
  console.log('🔑 API Key present:', !!env.OPENAI_API_KEY);

  const response = await fetch(openaiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  console.log('📥 OpenAI API response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI API error response:', errorText);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
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
    // Fallback: extract code from the response
    return extractCodeFromResponse(content, currentFiles);
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
        const uploadResult = await uploadImageToR2(imageResult.imageData, env, request);
        
        if (uploadResult.success) {
          // Save to database
          const dbResult = await saveImageToDatabase({
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

          if (dbResult.success) {
            generatedImages.push({
              image_id: dbResult.image_id,
              url: uploadResult.url,
              prompt: prompt,
              aspect_ratio: aspect_ratio,
              width: imageResult.width,
              height: imageResult.height
            });
          }
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
async function uploadImageToR2(imageBytes, env, request) {
  try {
    const imageId = generateImageId();
    const filename = `${imageId}.jpg`;
    
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
        contentType: 'image/jpeg',
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

    const stmt = env.DB.prepare(`
      INSERT INTO images (
        image_id, project_id, filename, original_prompt, aspect_ratio, 
        width, height, file_size, mime_type, r2_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      imageId,
      imageData.project_id,
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