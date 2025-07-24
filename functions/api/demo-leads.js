export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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

export async function onRequestGet(context) {
  const { env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
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