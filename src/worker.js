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

    // === FILE HISTORY SYSTEM ===
    // Create a backup of current files before making changes
    const backupFiles = JSON.parse(JSON.stringify(projectFiles));
    const backupTimestamp = new Date().toISOString();
    const backupId = generateBackupId();
    
    // Store backup in database
    await storeFileBackup(project_id, backupId, backupFiles, backupTimestamp, user_message, env);
    
    // === INTELLIGENT SECTION DETECTION ===
    const sectionAnalysis = analyzeUserRequest(user_message, projectFiles);
    
    // Smart image generation logic - treat as initial prompt if only basic files exist
    const isInitialPrompt = !projectFiles || 
                           Object.keys(projectFiles).length === 0 || 
                           (Object.keys(projectFiles).length === 1 && projectFiles['src/index.css']) ||
                           (Object.keys(projectFiles).length === 2 && 
                            projectFiles['src/index.css'] && 
                            (projectFiles['src/App.jsx'] || projectFiles['src/main.jsx'] || projectFiles['src/index.jsx']));
    
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

    // === ENHANCED PROMPT ENGINEERING USING ACE METHOD ===
    // Approach: Visualize targeted changes only
    // Instructions: Clear, specific section targeting
    // Requirements: Non-negotiable preservation rules
    
    const enhancedPrompt = buildEnhancedPrompt(user_message, projectFiles, sectionAnalysis, isInitialPrompt);
    
    // Call OpenAI with enhanced prompt
    const response = await callOpenAI(user_message, projectFiles, { ...env, OPENAI_API_KEY: apiKey }, null, null, null, enhancedPrompt);
    
    // === TARGETED CODE UPDATES ===
    if (response.updated_files) {
      response.updated_files = await applyTargetedUpdates(response.updated_files, projectFiles, sectionAnalysis, env);
    }
    
    // === INTELLIGENT IMAGE GENERATION ===
    if (response.image_requests && response.image_requests.length > 0) {
      if (isInitialPrompt) {
        console.log('🎨 Generating images for initial prompt:', response.image_requests.length, 'images');
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
          filteredImageRequests = [{
            prompt: `A professional image for the ${firstSection} section of a beach bar website`,
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
    
    // Log business info if available
    if (response.business_info) {
      console.log('🏢 Business info updated:', response.business_info);
    }
    
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
        47. SECTION CREATION: When user asks to create a new section, generate complete section code with proper structure, styling, and image placeholders
        48. TARGETED CODE EDITING: When modifying existing sections, ONLY change the specific section requested, preserve all other sections and images
        49. IMAGE PRESERVATION: Never regenerate or remove existing images when making targeted changes
        50. SECTION-SPECIFIC MODIFICATIONS: Use the code analysis to understand current structure and make minimal changes
        51. MULTI-STEP TASK HANDLING: When user requests multiple changes, execute them in sequence while preserving all existing content
        52. TASK DEPENDENCY MANAGEMENT: Handle task dependencies (e.g., don't modify sections that will be deleted)
        53. SEQUENTIAL EXECUTION: Complete each task before moving to the next, ensuring all changes are applied correctly
        54. COMPREHENSIVE UPDATES: Return the final code with ALL requested changes applied in the correct order

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
- Footer with social links

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
      max_tokens: 6000
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

// Analyze user request for section targeting
function analyzeUserRequest(userMessage, projectFiles) {
  const analysis = {
    targetSections: [],
    operationType: 'modify', // 'create', 'modify', 'delete'
    imageOperation: false,
    textOperation: false,
    styleOperation: false,
    specificTargets: []
  };
  
  const messageLower = userMessage.toLowerCase();
  
  // Detect target sections
  const sectionPatterns = {
    'hero': ['hero', 'main', 'header', 'banner'],
    'about': ['about', 'about us'],
    'features': ['feature', 'features'],
    'contact': ['contact', 'contact us'],
    'gallery': ['gallery', 'photos', 'images'],
    'logo': ['logo', 'brand']
  };
  
  for (const [section, keywords] of Object.entries(sectionPatterns)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      analysis.targetSections.push(section);
    }
  }
  
  // Detect operation types
  if (messageLower.includes('image') || messageLower.includes('photo') || messageLower.includes('picture')) {
    analysis.imageOperation = true;
  }
  
  if (messageLower.includes('text') || messageLower.includes('content') || messageLower.includes('title') || messageLower.includes('description')) {
    analysis.textOperation = true;
  }
  
  if (messageLower.includes('color') || messageLower.includes('style') || messageLower.includes('font') || messageLower.includes('layout')) {
    analysis.styleOperation = true;
  }
  
  // Detect specific targets
  const specificMatches = messageLower.match(/(?:in|for|to|the)\s+([a-zA-Z\s]+)\s+(?:section|area|part)/g);
  if (specificMatches) {
    analysis.specificTargets = specificMatches.map(match => match.replace(/(?:in|for|to|the)\s+/, '').replace(/\s+(?:section|area|part)/, '').trim());
  }
  
  return analysis;
}

// Build enhanced prompt using ACE method
function buildEnhancedPrompt(userMessage, projectFiles, sectionAnalysis, isInitialPrompt) {
  const { targetSections, imageOperation, textOperation, styleOperation } = sectionAnalysis;
  
  let prompt = `You are an expert React developer specializing in targeted website modifications. 

APPROACH (A):
- Visualize ONLY the specific changes requested
- Preserve ALL existing code not related to the target sections
- Maintain exact structure and styling of untouched sections

INSTRUCTIONS (C):
- Make ONLY the requested changes to the specified sections
- Do NOT modify business names, hero text, or other content unless explicitly requested
- Do NOT regenerate entire components unless specifically asked
- Preserve all existing images and placeholders in non-target sections

REQUIREMENTS (E):
- NON-NEGOTIABLE: Keep all existing code structure intact
- NON-NEGOTIABLE: Only modify the sections explicitly mentioned in the user request
- NON-NEGOTIABLE: Preserve all existing images and their URLs in non-target sections
- NON-NEGOTIABLE: Maintain exact component structure and props

USER REQUEST: "${userMessage}"

TARGET SECTIONS: ${targetSections.join(', ') || 'None specified'}
OPERATION TYPES: ${[
  imageOperation && 'Image modification',
  textOperation && 'Text modification', 
  styleOperation && 'Style modification'
].filter(Boolean).join(', ') || 'General modification'}

CURRENT FILES:
${JSON.stringify(projectFiles, null, 2)}

CRITICAL RULES:
1. ONLY modify the sections mentioned in the user request
2. Preserve ALL existing code in non-target sections
3. Keep all existing image URLs and placeholders intact
4. Do NOT change business names or hero content unless explicitly requested
5. Maintain exact component structure and styling
6. If adding images, only add them to the specified sections
7. Use existing image placeholders when available

Return ONLY the JSON response with updated_files containing ONLY the modified files.

CRITICAL JSON FORMATTING RULES:
- Use double quotes for all property names and string values
- No trailing commas before closing braces or brackets
- No comments or explanations outside the JSON
- Ensure all strings are properly escaped
- The response must be valid JSON that can be parsed by JSON.parse()

Example valid response format:
{
  "assistant_message": "I've updated the contact section with a new image.",
  "updated_files": {
    "src/App.jsx": "// Updated JSX code here"
  },
  "image_requests": [
    {
      "prompt": "A professional contact section image",
      "aspect_ratio": "4:3",
      "placement": "contact"
    }
  ],
  "business_info": {
    "name": "Business Name",
    "tagline": "Business Tagline"
  }
}`;

  return prompt;
}

// Apply targeted updates to preserve existing code
async function applyTargetedUpdates(updatedFiles, originalFiles, sectionAnalysis, env) {
  const { targetSections } = sectionAnalysis;
  
  // If no specific sections targeted, return original files with minimal changes
  if (targetSections.length === 0) {
    return updatedFiles;
  }
  
  const result = {};
  
  for (const [filename, newContent] of Object.entries(updatedFiles)) {
    if (originalFiles[filename]) {
      // Merge changes intelligently
      result[filename] = await mergeTargetedChanges(filename, originalFiles[filename], newContent, targetSections);
    } else {
      // New file, use as is
      result[filename] = newContent;
    }
  }
  
  return result;
}

// Merge targeted changes while preserving existing code
async function mergeTargetedChanges(filename, originalContent, newContent, targetSections) {
  // For now, use a simple approach - preserve original content and only apply specific section changes
  // This can be enhanced with more sophisticated diffing algorithms
  
  if (filename.includes('App.jsx') || filename.includes('main.jsx')) {
    return await mergeJSXChanges(originalContent, newContent, targetSections);
  }
  
  // For other files, preserve original content
  return originalContent;
}

// Merge JSX changes intelligently
async function mergeJSXChanges(originalContent, newContent, targetSections) {
  // Simple approach: extract target sections from new content and merge with original
  // This is a basic implementation that can be enhanced
  
  let mergedContent = originalContent;
  
  // For each target section, find and replace the corresponding section in original content
  for (const section of targetSections) {
    const sectionRegex = new RegExp(`<div[^>]*className="[^"]*${section}[^"]*"[^>]*>.*?</div>`, 'gs');
    const newSectionMatch = newContent.match(sectionRegex);
    
    if (newSectionMatch) {
      mergedContent = mergedContent.replace(sectionRegex, newSectionMatch[0]);
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