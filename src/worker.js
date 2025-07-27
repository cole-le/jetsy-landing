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
    
    // Process image requests if any
    if (response.image_requests && response.image_requests.length > 0) {
      console.log('🎨 Processing image requests:', response.image_requests.length);
      
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
                  
                  // Replace only the FIRST occurrence of placeholder with actual R2 URL
                  // This ensures each image gets its own unique replacement
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
      
      // Debug: Log the final updated files
      if (response.updated_files) {
        console.log('📄 Final updated files:');
        Object.keys(response.updated_files).forEach(filename => {
          const content = response.updated_files[filename];
          const imageCount = (content.match(/https:\/\/pub-.*\.r2\.dev/g) || []).length;
          console.log(`   ${filename}: ${imageCount} images found`);
        });
      }
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
  
  // Create a comprehensive prompt for landing page generation with image planning
  const systemPrompt = `You are an expert React developer and UI/UX designer. Your task is to help users create and modify landing pages by generating React code and planning images.

IMPORTANT RULES:
1. Always return valid React JSX code
2. Use Tailwind CSS for styling
3. Include proper imports and exports
4. Make the code production-ready
5. Respond with JSON format: {"assistant_message": "explanation", "updated_files": {"filename": "code"}, "image_requests": [{"prompt": "description", "aspect_ratio": "1:1", "placement": "hero"}]}
6. Only modify files that need changes
7. Keep existing files unchanged unless specifically requested
8. For icons, you may use Font Awesome icons via <i class='fa fa-ICONNAME'></i> (Font Awesome 6 is available via CDN in the preview). Do NOT use react-icons or any other external icon libraries unless specified here. If you need an icon not in Font Awesome, use an inline SVG.
9. When images are needed, include image_requests array with detailed prompts for Google Gemini Imagen 4 Preview
10. Use descriptive image prompts that match the website's theme and purpose
11. Specify appropriate aspect ratios: "1:1" for logos/icons, "16:9" for hero images, "4:3" for feature images
12. For image placeholders, use: <img src="{GENERATED_IMAGE_URL}" alt="description" className="..." />
13. The LLM will replace {GENERATED_IMAGE_URL} with actual R2 URLs after generation

Current files structure:
${currentFiles ? Object.keys(currentFiles).map(file => `- ${file}`).join('\n') : 'No files'}

User request: ${userMessage}`;

  const userPrompt = `Please analyze the user's request and generate appropriate React code and image requests. 

If they want to create a new landing page, generate a complete professional landing page with:
- Hero section with compelling copy and hero image
- Features section with benefits and feature images
- Call-to-action sections
- Modern design with gradients, icons, and relevant images
- Responsive layout

If they want to modify existing code, make the specific changes requested while maintaining the overall structure.

For images, think about:
- What type of images would enhance this landing page?
- What aspect ratios work best for different sections?
- What descriptive prompts would generate appropriate images?
- Where should images be placed in the layout?

Current files content:
${currentFiles ? JSON.stringify(currentFiles, null, 2) : '{}'}

Return only the JSON response with assistant_message, updated_files, and image_requests (if images are needed).`;

        const requestBody = {
      model: 'gpt-4o-mini', // Using gpt-4o-mini which we confirmed works
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
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
      image_requests: parsedResponse.image_requests || []
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

// Handle image generation using Google Gemini Imagen 4 Preview
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

    console.log('🎨 Generating image with Gemini Imagen 4 Preview...');
    console.log('   - Project ID:', project_id);
    console.log('   - Prompt:', prompt);
    console.log('   - Aspect Ratio:', aspect_ratio);
    console.log('   - Number of Images:', number_of_images);
    console.log('   - Environment check:');
    console.log('     * GEMINI_API_KEY present:', !!env.GEMINI_API_KEY);
    console.log('     * IMAGES_BUCKET present:', !!env.IMAGES_BUCKET);
    console.log('     * DB present:', !!env.DB);

    const generatedImages = [];
    
    for (let i = 0; i < number_of_images; i++) {
      console.log(`\n🔄 Processing image ${i + 1}/${number_of_images}...`);
      
      const imageResult = await generateImageWithGemini(prompt, aspect_ratio, env);
      console.log(`   - Gemini generation result:`, imageResult.success ? 'Success' : 'Failed');
      
      if (imageResult.success) {
        console.log(`   - Image data size:`, imageResult.fileSize, 'bytes');
        
        // Upload to R2
        console.log(`   - Starting R2 upload...`);
        const uploadResult = await uploadImageToR2(imageResult.imageData, env, request);
        console.log(`   - R2 upload result:`, uploadResult.success ? 'Success' : 'Failed');
        
        if (uploadResult.success) {
          console.log(`   - Uploaded filename:`, uploadResult.filename);
          console.log(`   - Generated URL:`, uploadResult.url);
          
          // Save to database
          console.log(`   - Starting database save...`);
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
            imageId: uploadResult.imageId // Pass the imageId from upload result
          }, env);

          console.log(`   - Database save result:`, dbResult.success ? 'Success' : 'Failed');
          
          if (dbResult.success) {
            console.log(`   - Saved image ID:`, dbResult.image_id);
            generatedImages.push({
              image_id: dbResult.image_id,
              url: uploadResult.url,
              prompt: prompt,
              aspect_ratio: aspect_ratio,
              width: imageResult.width,
              height: imageResult.height
            });
            console.log(`   - Added to generated images array`);
          } else {
            console.log(`   - Database save failed:`, dbResult.error);
          }
        } else {
          console.log(`   - R2 upload failed:`, uploadResult.error);
        }
      } else {
        console.log(`   - Gemini generation failed:`, imageResult.error);
      }
    }

    console.log(`\n✅ Image generation complete. Generated ${generatedImages.length} images.`);
    console.log('   - Generated images:', generatedImages.map(img => ({ id: img.image_id, url: img.url })));

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

// Generate image using Google Gemini Imagen 4 Preview
async function generateImageWithGemini(prompt, aspectRatio, env) {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    
    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    console.log('🤖 Calling Gemini Imagen 4 Preview API...');
    console.log('   - Prompt:', prompt);
    console.log('   - Aspect Ratio:', aspectRatio);
    console.log('   - Gemini API Key present:', !!env.GEMINI_API_KEY);
    
    const response = await ai.models.generateImages({
      model: 'models/imagen-4.0-generate-preview-06-06',
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
    console.log('   - Image data present:', !!imageData);
    console.log('   - Image data type:', typeof imageData);
    console.log('   - Image data length:', imageData?.length || 0);
    
    if (!imageData) {
      throw new Error('No image data received from Gemini API');
    }

    // Convert base64 to Uint8Array (Web API compatible)
    console.log('   - Converting base64 to Uint8Array...');
    const binaryString = atob(imageData);
    console.log('   - Binary string length:', binaryString.length);
    
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('   - Uint8Array created');
    console.log('   - Uint8Array length:', bytes.length);
    console.log('   - Uint8Array constructor:', bytes.constructor.name);
    
    // Calculate dimensions based on aspect ratio
    const dimensions = getDimensionsFromAspectRatio(aspectRatio);
    console.log('   - Calculated dimensions:', dimensions);
    
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
    
    console.log('☁️ Uploading image to R2...');
    console.log('   - Image ID:', imageId);
    console.log('   - Filename:', filename);
    console.log('   - Size:', imageBytes.length, 'bytes');
    console.log('   - Image bytes type:', typeof imageBytes);
    console.log('   - Image bytes constructor:', imageBytes.constructor.name);
    console.log('   - Image bytes is ArrayBuffer:', imageBytes instanceof ArrayBuffer);
    console.log('   - Image bytes is Uint8Array:', imageBytes instanceof Uint8Array);
    console.log('   - R2 Bucket binding:', env.IMAGES_BUCKET ? 'Available' : 'Missing');
    console.log('   - R2 Bucket binding type:', typeof env.IMAGES_BUCKET);
    console.log('   - R2 Bucket binding constructor:', env.IMAGES_BUCKET?.constructor?.name);

    if (!env.IMAGES_BUCKET) {
      throw new Error('R2 bucket binding not available');
    }

    // Convert to ArrayBuffer if needed
    let uploadData = imageBytes;
    if (imageBytes instanceof Uint8Array) {
      uploadData = imageBytes.buffer;
      console.log('   - Converted Uint8Array to ArrayBuffer');
    }

    console.log('   - Final upload data type:', typeof uploadData);
    console.log('   - Final upload data constructor:', uploadData.constructor.name);
    console.log('   - Final upload data byte length:', uploadData.byteLength);

    // Upload to R2 with detailed logging
    console.log('   - Starting R2 PUT operation...');
    const uploadResult = await env.IMAGES_BUCKET.put(filename, uploadData, {
      httpMetadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    console.log('   - Upload result:', uploadResult);
    console.log('   - Upload result type:', typeof uploadResult);
    console.log('   - Upload result constructor:', uploadResult?.constructor?.name);

    // Verify the upload by trying to get the object
    console.log('   - Verifying upload by attempting to get object...');
    try {
      const verifyResult = await env.IMAGES_BUCKET.get(filename);
      console.log('   - Verification result:', verifyResult ? 'Object found' : 'Object not found');
      if (verifyResult) {
        console.log('   - Verified object size:', verifyResult.size);
        console.log('   - Verified object type:', verifyResult.type);
      }
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
    
    console.log('💾 Saving image metadata to database...');
    console.log('   - Image ID:', imageId);

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