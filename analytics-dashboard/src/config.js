// API Configuration
export const API_BASE_URL = 'https://jetsy-analytics-dashboard.jetsydev.workers.dev'

// Environment-based configuration
export const config = {
  apiBaseUrl: import.meta.env.PROD 
    ? API_BASE_URL 
    : '' // For local development - use relative URLs with proxy
} 