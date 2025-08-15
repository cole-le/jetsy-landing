// Environment Configuration for Jetsy
// This file handles environment-aware configuration for development vs production

export const ENV_CONFIG = {
  // Production URLs
  PRODUCTION_URL: 'https://jetsy-landing-prod.jetsydev.workers.dev',
  
  // Separate API Server URL (to avoid infinite loops with custom domains)
  API_SERVER_URL: 'https://jetsy-server-prod.jetsydev.workers.dev',
  
  // Development configuration
  DEVELOPMENT: {
    // Local development server (React/Vite)
    LOCAL_URL: 'http://localhost:3000',
    // Wrangler worker API server
    WORKER_URL: 'http://localhost:8787',
    // Use production for image generation in development
    IMAGE_GENERATION_URL: 'https://jetsy-landing-prod.jetsydev.workers.dev',
    // Use local for everything else (Vite proxies to worker)
    API_BASE_URL: 'http://localhost:3000'
  },
  
  // Production configuration
  PRODUCTION: {
    LOCAL_URL: 'https://jetsy.dev',
    IMAGE_GENERATION_URL: 'https://jetsy-landing-prod.jetsydev.workers.dev',
    API_BASE_URL: 'https://jetsy-landing-prod.jetsydev.workers.dev'
  },
  
  // Custom Domain configuration (to avoid infinite loops)
  CUSTOM_DOMAIN: {
    IMAGE_GENERATION_URL: 'https://jetsy-landing-prod.jetsydev.workers.dev',
    API_BASE_URL: 'https://jetsy-server-prod.jetsydev.workers.dev'
  }
};

// Detect current environment
export const getCurrentEnvironment = () => {
  // Check if we're running in development mode
  if (typeof window !== 'undefined') {
    // Browser environment
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost') {
      return 'development';
    } else if (hostname.includes('jetsy.dev')) {
      return 'production';
    } else {
      // This is a custom domain - use special config to avoid infinite loops
      return 'custom_domain';
    }
  } else {
    // Node.js environment - check for development indicators
    if (process.env.NODE_ENV === 'development') {
      return 'development';
    }
    // Check if we're running locally (common development scenarios)
    if (process.env.LOCAL_DEV === 'true' || process.argv.includes('--dev')) {
      return 'development';
    }
    // Default to production for Node.js
    return 'production';
  }
};

// Get configuration for current environment
export const getConfig = () => {
  const env = getCurrentEnvironment();
  return ENV_CONFIG[env.toUpperCase()] || ENV_CONFIG.DEVELOPMENT;
};

// Get image generation URL (always production for Option 2)
export const getImageGenerationUrl = () => {
  return ENV_CONFIG.PRODUCTION_URL;
};

// Get API base URL
export const getApiBaseUrl = () => {
  // ALWAYS check at runtime, not build time
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If this is a custom domain (not jetsy.dev or localhost), use separate API server
    if (!hostname.includes('jetsy.dev') && !hostname.includes('localhost')) {
      console.log('🔧 Custom domain detected at runtime - using separate API server to avoid infinite loops');
      return 'https://jetsy-server-prod.jetsydev.workers.dev';
    }
  }
  
  const env = getCurrentEnvironment();
  return ENV_CONFIG[env.toUpperCase()].API_BASE_URL;
};

// Check if we should use production for image generation
export const shouldUseProductionForImages = () => {
  const env = getCurrentEnvironment();
  return env === 'development'; // Always use production for images in development
};

// Utility function to get the appropriate URL for different operations
export const getUrlForOperation = (operation) => {
  const env = getCurrentEnvironment();
  
  switch (operation) {
    case 'image-generation':
      // Always use production for image generation (Option 2)
      return ENV_CONFIG.PRODUCTION_URL;
    case 'api':
      // Use local for API calls in development
      return ENV_CONFIG[env.toUpperCase()].API_BASE_URL;
    case 'chat':
      // Use local for chat in development
      return ENV_CONFIG[env.toUpperCase()].API_BASE_URL;
    default:
      return ENV_CONFIG[env.toUpperCase()].API_BASE_URL;
  }
};

// Export default configuration
export default ENV_CONFIG; 