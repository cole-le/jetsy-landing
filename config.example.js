// Jetsy Configuration Example
// Copy this file to config.js and fill in your actual values

export const config = {
  // Cloudflare D1 Database
  database: {
    id: 'your-database-id-here',
    name: 'jetsy-leads'
  },

  // Google Tag Manager
  analytics: {
    gtmId: 'GTM-XXXXXXX'
  },

  // Cloudflare Account
  cloudflare: {
    accountId: 'your-account-id',
    apiToken: 'your-api-token'
  },

  // Environment
  environment: 'development',

  // API endpoints
  api: {
    baseUrl: 'https://your-worker.your-subdomain.workers.dev',
    endpoints: {
      leads: '/api/leads',
      track: '/api/track'
    }
  }
} 