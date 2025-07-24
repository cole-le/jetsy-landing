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
    const { event, data, timestamp, userAgent, url } = body;

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

    const db = env.DB;
    const currentTime = new Date().toISOString();
    const ts = timestamp || Date.now();

    // Store tracking data
    const result = await db.prepare(
      "INSERT INTO tracking_events (event_name, event_data, user_agent, url, timestamp, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      event,
      JSON.stringify(data || {}),
      userAgent || '',
      url || '',
      ts,
      currentTime
    ).run();

    if (result.success) {
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
    } else {
      throw new Error('Database insertion failed');
    }

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