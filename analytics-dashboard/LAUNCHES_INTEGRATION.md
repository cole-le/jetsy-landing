# Launches Page Integration Guide

This document explains how to integrate the Launches page with real Supabase data and replace the mock data with actual user and project information.

## Overview

The Launches page displays:
- Total users (Supabase users minus 9 test accounts)
- Total projects (actual projects minus 21 test projects)
- Total deployments (live websites)
- User growth chart from August 29 onwards
- Detailed user table with projects, deployments, ads, credits, plans, and subscription status

## Current Implementation

The page currently uses mock data for testing purposes. To integrate with real data, you'll need to:

1. **Update the worker.js file** to query your actual database tables
2. **Replace mock data** with real database queries
3. **Configure Supabase connection** if needed

## Database Schema Requirements

The Launches page expects the following data structure:

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  credits INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'Free',
  subscription_status TEXT DEFAULT 'active',
  canceled_at TIMESTAMP NULL
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  name TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Ads Table
```sql
CREATE TABLE ads (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Integration Steps

### Step 1: Update Worker.js

Replace the mock data in `src/worker.js` with real database queries:

```javascript
async function handleLaunchesRequest(env, corsHeaders) {
  try {
    const db = env.DB;
    
    // Get total users from your users table
    const totalUsersResult = await db.prepare(
      `SELECT COUNT(*) as count FROM users WHERE email NOT LIKE '%test%' AND email NOT LIKE '%jetsy%'`
    ).first();
    const totalUsers = (totalUsersResult?.count || 0) - 9; // Subtract 9 test accounts
    
    // Get total projects
    const totalProjectsResult = await db.prepare(
      `SELECT COUNT(*) as count FROM projects WHERE name NOT LIKE '%test%'`
    ).first();
    const totalProjects = (totalProjectsResult?.count || 0) - 21; // Subtract 21 test projects
    
    // Get total deployments
    const deploymentsResult = await db.prepare(
      `SELECT COUNT(*) as count FROM projects WHERE status = 'deployed'`
    ).first();
    const totalDeployments = deploymentsResult?.count || 0;
    
    // Get user growth data from August 29 onwards
    const august29 = '2024-08-29';
    const userGrowthResult = await db.prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as users 
       FROM users 
       WHERE created_at >= ? AND email NOT LIKE '%test%' AND email NOT LIKE '%jetsy%'
       GROUP BY DATE(created_at) 
       ORDER BY date`
    ).bind(august29).all();
    
    // Get detailed user data
    const usersResult = await db.prepare(
      `SELECT 
         u.id,
         u.email,
         u.name,
         u.created_at as signupDate,
         u.credits,
         u.plan,
         u.subscription_status,
         u.canceled_at,
         COUNT(DISTINCT p.id) as projectsCount,
         COUNT(DISTINCT CASE WHEN p.status = 'deployed' THEN p.id END) as deploymentsCount,
         COUNT(DISTINCT a.id) as adsCount
       FROM users u
       LEFT JOIN projects p ON u.id = p.user_id
       LEFT JOIN ads a ON u.id = a.user_id
       WHERE u.email NOT LIKE '%test%' 
         AND u.email NOT LIKE '%jetsy%'
         AND u.email NOT LIKE '%example%'
       GROUP BY u.id, u.email, u.name, u.created_at, u.credits, u.plan, u.subscription_status, u.canceled_at
       ORDER BY u.created_at DESC`
    ).all();
    
    const result = {
      totalUsers,
      totalProjects,
      totalDeployments,
      userGrowth: userGrowthResult?.results || [],
      users: usersResult?.results || []
    };
    
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
    
  } catch (error) {
    console.error('Error in launches request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}
```

### Step 2: Supabase Integration (Optional)

If you're using Supabase instead of Cloudflare D1, you can:

1. **Install Supabase client**:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase client** in your worker:
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     'YOUR_SUPABASE_URL',
     'YOUR_SUPABASE_ANON_KEY'
   )
   ```

3. **Query Supabase directly**:
   ```javascript
   const { data: users, error } = await supabase
     .from('users')
     .select('*')
     .gte('created_at', '2024-08-29')
     .not('email', 'like', '%test%')
   ```

### Step 3: Environment Variables

Add your database credentials to your `wrangler.toml`:

```toml
[vars]
SUPABASE_URL = "your-supabase-url"
SUPABASE_ANON_KEY = "your-supabase-anon-key"
```

## Testing

1. **Deploy the worker**:
   ```bash
   cd analytics-dashboard
   wrangler deploy
   ```

2. **Test the API endpoint**:
   ```bash
   curl https://your-worker.workers.dev/api/analytics/launches
   ```

3. **Check the dashboard** at http://localhost:3001

## Data Validation

Ensure your data meets these requirements:

- **User emails** should be valid and not contain test patterns
- **Dates** should be in ISO format (YYYY-MM-DDTHH:mm:ssZ)
- **Numbers** should be integers (credits, counts)
- **Status values** should be consistent (active, canceled, past_due)

## Troubleshooting

### Common Issues

1. **No data displayed**: Check database connection and table names
2. **Chart not rendering**: Ensure date format is correct
3. **API errors**: Check worker logs with `wrangler tail`
4. **CORS issues**: Verify CORS headers in worker.js

### Debug Mode

Enable debug logging in the worker:

```javascript
console.log('User growth data:', userGrowthResult);
console.log('Users data:', usersResult);
```

## Next Steps

1. **Replace mock data** with real database queries
2. **Test with real data** to ensure accuracy
3. **Optimize queries** for performance
4. **Add real-time updates** if needed
5. **Implement caching** for better performance

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Cloudflare Worker logs
3. Verify database connectivity
4. Test API endpoints directly
