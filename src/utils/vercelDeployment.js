/**
 * Vercel Deployment Utilities for Jetsy
 * Handles deployment of static sites to Vercel via API
 */

import { createCompleteStaticSite } from './staticSiteGenerator.js';

// Vercel API base URL
const VERCEL_API_BASE = 'https://api.vercel.com';

/**
 * Deploy a static site to Vercel
 * @param {Object} templateData - The template data for the site
 * @param {string} projectId - The Jetsy project ID
 * @param {string} vercelToken - Vercel API token
 * @param {Object} options - Deployment options
 * @returns {Promise<Object>} Deployment result
 */
export async function deployToVercel(templateData, projectId, vercelToken, options = {}) {
  try {
    const {
      projectName = `jetsy-${projectId}`,
      target = 'production',
      teamId = null
    } = options;

    // Generate the static site content
    const staticHTML = createCompleteStaticSite(templateData, projectId);
    
    // Create deployment files array
    const files = [
      {
        file: 'index.html',
        data: staticHTML
      },
      {
        file: 'favicon.png',
        data: await getFaviconData()
      },
      {
        file: 'vercel.json',
        data: JSON.stringify({
          "version": 2,
          "public": true,
          "github": {
            "silent": true
          },
          "headers": [
            {
              "source": "/(.*)",
              "headers": [
                {
                  "key": "X-Frame-Options",
                  "value": "SAMEORIGIN"
                },
                {
                  "key": "X-Content-Type-Options",
                  "value": "nosniff"
                },
                {
                  "key": "Referrer-Policy",
                  "value": "strict-origin-when-cross-origin"
                }
              ]
            }
          ],
          "redirects": [
            {
              "source": "/favicon.ico",
              "destination": "/favicon.png"
            }
          ]
        }, null, 2)
      }
    ];

    // Prepare API URL with optional team parameter
    let apiUrl = `${VERCEL_API_BASE}/v13/deployments`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    // Create deployment payload
    const deploymentPayload = {
      name: projectName,
      files: files,
      target: target,
      projectSettings: {
        framework: null,
        buildCommand: null,
        outputDirectory: null,
        installCommand: null
      }
    };

    console.log('Deploying to Vercel...', { projectName, filesCount: files.length });

    // Make deployment request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Vercel deployment failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const deploymentResult = await response.json();
    
    console.log('Vercel deployment created:', {
      id: deploymentResult.id,
      url: deploymentResult.url,
      status: deploymentResult.readyState
    });

    return {
      success: true,
      deploymentId: deploymentResult.id,
      deploymentUrl: `https://${deploymentResult.url}`,
      status: deploymentResult.readyState,
      inspectorUrl: deploymentResult.inspectorUrl,
      vercelProjectName: projectName,
      createdAt: deploymentResult.createdAt
    };

  } catch (error) {
    console.error('Vercel deployment error:', error);
    return {
      success: false,
      error: error.message,
      deploymentId: null,
      deploymentUrl: null
    };
  }
}

/**
 * Check deployment status
 * @param {string} deploymentId - Vercel deployment ID
 * @param {string} vercelToken - Vercel API token
 * @param {string} teamId - Optional team ID
 * @returns {Promise<Object>} Deployment status
 */
export async function checkDeploymentStatus(deploymentId, vercelToken, teamId = null) {
  try {
    let apiUrl = `${VERCEL_API_BASE}/v13/deployments/${deploymentId}`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check deployment status: ${response.status} ${response.statusText}`);
    }

    const deployment = await response.json();
    
    return {
      success: true,
      deploymentId: deployment.id,
      status: deployment.readyState,
      url: deployment.url ? `https://${deployment.url}` : null,
      error: deployment.error,
      createdAt: deployment.createdAt,
      buildingAt: deployment.buildingAt,
      readyAt: deployment.readyAt
    };

  } catch (error) {
    console.error('Error checking deployment status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Add custom domain to Vercel project
 * @param {string} domain - Custom domain name
 * @param {string} projectId - Vercel project ID
 * @param {string} vercelToken - Vercel API token
 * @param {string} teamId - Optional team ID
 * @returns {Promise<Object>} Domain addition result
 */
export async function addCustomDomain(domain, projectId, vercelToken, teamId = null) {
  try {
    let apiUrl = `${VERCEL_API_BASE}/v9/projects/${projectId}/domains`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: domain
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to add custom domain: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const domainResult = await response.json();
    
    return {
      success: true,
      domain: domainResult.name,
      verificationRecord: domainResult.verification,
      configuredBy: domainResult.configuredBy,
      nameservers: domainResult.nameservers,
      intendedNameservers: domainResult.intendedNameservers,
      customNameservers: domainResult.customNameservers
    };

  } catch (error) {
    console.error('Error adding custom domain:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check custom domain status
 * @param {string} domain - Custom domain name
 * @param {string} projectId - Vercel project ID  
 * @param {string} vercelToken - Vercel API token
 * @param {string} teamId - Optional team ID
 * @returns {Promise<Object>} Domain status
 */
export async function checkDomainStatus(domain, projectId, vercelToken, teamId = null) {
  try {
    let apiUrl = `${VERCEL_API_BASE}/v9/projects/${projectId}/domains/${domain}`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to check domain status: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const domainStatus = await response.json();
    
    return {
      success: true,
      domain: domainStatus.name,
      verified: domainStatus.verified,
      verification: domainStatus.verification,
      configuredBy: domainStatus.configuredBy,
      nameservers: domainStatus.nameservers,
      serviceType: domainStatus.serviceType
    };

  } catch (error) {
    console.error('Error checking domain status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Vercel project info
 * @param {string} projectId - Vercel project ID
 * @param {string} vercelToken - Vercel API token
 * @param {string} teamId - Optional team ID
 * @returns {Promise<Object>} Project info
 */
export async function getVercelProject(projectId, vercelToken, teamId = null) {
  try {
    let apiUrl = `${VERCEL_API_BASE}/v9/projects/${projectId}`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get project info: ${response.status} ${response.statusText}`);
    }

    const project = await response.json();
    
    return {
      success: true,
      project: project
    };

  } catch (error) {
    console.error('Error getting project info:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List deployments for a project
 * @param {string} projectId - Vercel project ID
 * @param {string} vercelToken - Vercel API token
 * @param {string} teamId - Optional team ID
 * @param {number} limit - Number of deployments to retrieve
 * @returns {Promise<Object>} Deployments list
 */
export async function listDeployments(projectId, vercelToken, teamId = null, limit = 10) {
  try {
    let apiUrl = `${VERCEL_API_BASE}/v6/deployments?projectId=${projectId}&limit=${limit}`;
    if (teamId) {
      apiUrl += `&teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list deployments: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      deployments: result.deployments
    };

  } catch (error) {
    console.error('Error listing deployments:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete a deployment
 * @param {string} deploymentId - Vercel deployment ID
 * @param {string} vercelToken - Vercel API token
 * @param {string} teamId - Optional team ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteDeployment(deploymentId, vercelToken, teamId = null) {
  try {
    let apiUrl = `${VERCEL_API_BASE}/v13/deployments/${deploymentId}`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete deployment: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      deploymentId: deploymentId
    };

  } catch (error) {
    console.error('Error deleting deployment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get favicon data (base64 encoded)
 * Returns a simple Jetsy favicon
 */
async function getFaviconData() {
  // Simple SVG favicon as base64
  const svgFavicon = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#667eea"/>
    <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">J</text>
  </svg>`;
  
  // Convert SVG to base64 (in a real implementation, you'd want to convert this to PNG)
  return Buffer.from(svgFavicon).toString('base64');
}

/**
 * Generate a unique project name for Vercel
 * @param {string} projectId - Jetsy project ID
 * @param {string} businessName - Business name from template data
 * @returns {string} Vercel project name
 */
export function generateVercelProjectName(projectId, businessName = '') {
  // Clean business name for use in project name
  const cleanBusinessName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20);
  
  const projectSuffix = projectId.toString().substring(-6);
  
  if (cleanBusinessName) {
    return `jetsy-${cleanBusinessName}-${projectSuffix}`;
  } else {
    return `jetsy-project-${projectSuffix}`;
  }
}

/**
 * Validate Vercel token
 * @param {string} vercelToken - Vercel API token
 * @returns {Promise<Object>} Validation result
 */
export async function validateVercelToken(vercelToken) {
  try {
    const response = await fetch(`${VERCEL_API_BASE}/v2/user`, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Invalid token: ${response.status} ${response.statusText}`);
    }

    const user = await response.json();
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username
      }
    };

  } catch (error) {
    console.error('Token validation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
