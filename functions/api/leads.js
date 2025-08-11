export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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

    // Validate required fields (phone optional)
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
      "INSERT INTO leads (email, phone, user_id, project_id, submitted_at, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(email, phone || '', uid, pid, submissionTime, submissionTime).run();

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

export async function onRequestGet(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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
    const binds = [];
    if (projectId) {
      query += ` WHERE l.project_id = ?`;
      binds.push(parseInt(projectId, 10));
    }
    query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    binds.push(limit, offset);
    const result = await db.prepare(query).bind(...binds).all();

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

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 