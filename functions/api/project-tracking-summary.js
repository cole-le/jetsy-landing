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

    // Get leads count from leads table for this project
    const leadsResult = await db.prepare(`
      SELECT COUNT(*) as count
      FROM leads
      WHERE project_id = ?
    `).bind(parseInt(projectId, 10)).first();

    // Get event counts by type from tracking_events
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
      leads: leadsResult?.count || 0, // Use leads count from leads table
      pricing_clicks: 0,
      total_events: 0
    };

    eventCounts.results?.forEach(row => {
      if (row.event_name === 'page_view') totals.page_views = row.count;
      if (row.event_name === 'lead_form_submit') totals.leads = row.count; // Use event count instead of leads table
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
