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
