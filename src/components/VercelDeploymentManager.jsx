import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../config/environment';

const VercelDeploymentManager = ({ projectId, templateData }) => {
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [domainStatus, setDomainStatus] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load deployment status on component mount
  useEffect(() => {
    if (projectId) {
      loadDeploymentStatus();
      loadDomainStatus();
    }
  }, [projectId]);

  const loadDeploymentStatus = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/vercel/status/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setDeploymentStatus(result.deployment);
      } else {
        // No deployment found - this is normal for new projects
        setDeploymentStatus(null);
      }
    } catch (error) {
      console.error('Error loading deployment status:', error);
    }
  };

  const loadDomainStatus = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/vercel/domain/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setDomainStatus(result.domain);
        setCustomDomain(result.domain.name);
      } else {
        // No domain found - this is normal
        setDomainStatus(null);
      }
    } catch (error) {
      console.error('Error loading domain status:', error);
    }
  };

  const deployToVercel = async () => {
    if (!templateData) {
      setError('No template data available for deployment');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/vercel/deploy/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateData: templateData
        })
      });

      const result = await response.json();

      if (result.success) {
        setDeploymentStatus(result.deployment);
        setSuccess('✅ Successfully deployed to Vercel!');
        
        // Poll for status updates
        pollDeploymentStatus();
      } else {
        setError(`Deployment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setError(`Deployment failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const addCustomDomain = async () => {
    if (!customDomain.trim()) {
      setError('Please enter a valid domain name');
      return;
    }

    if (!deploymentStatus) {
      setError('Please deploy to Vercel first before adding a custom domain');
      return;
    }

    setIsAddingDomain(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/vercel/domain/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: customDomain.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        setDomainStatus(result.domain);
        setSuccess('✅ Custom domain added! Please configure your DNS as shown below.');
      } else {
        setError(`Failed to add domain: ${result.error}`);
      }
    } catch (error) {
      console.error('Domain addition error:', error);
      setError(`Failed to add domain: ${error.message}`);
    } finally {
      setIsAddingDomain(false);
    }
  };

  const pollDeploymentStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/vercel/status/${projectId}`);
        const result = await response.json();
        
        if (result.success) {
          setDeploymentStatus(result.deployment);
          
          // Stop polling if deployment is ready or failed
          if (result.deployment.status === 'READY' || result.deployment.status === 'ERROR') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error polling deployment status:', error);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'BUILDING': { color: 'bg-yellow-100 text-yellow-800', text: '🔄 Building' },
      'READY': { color: 'bg-green-100 text-green-800', text: '✅ Ready' },
      'ERROR': { color: 'bg-red-100 text-red-800', text: '❌ Failed' },
      'CANCELED': { color: 'bg-gray-100 text-gray-800', text: '⏹️ Canceled' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: '⏳ Pending' },
      'verified': { color: 'bg-green-100 text-green-800', text: '✅ Verified' },
      'failed': { color: 'bg-red-100 text-red-800', text: '❌ Failed' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🚀 Vercel Deployment
        </h3>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Deployment Status */}
        {deploymentStatus ? (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {getStatusBadge(deploymentStatus.status)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">URL:</span>
              <a
                href={deploymentStatus.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {deploymentStatus.url}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Project:</span>
              <span className="text-sm text-gray-600">{deploymentStatus.vercelProjectName}</span>
            </div>

            {deploymentStatus.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Deployed:</span>
                <span className="text-sm text-gray-600">
                  {new Date(deploymentStatus.createdAt).toLocaleString()}
                </span>
              </div>
            )}

            {deploymentStatus.errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{deploymentStatus.errorMessage}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600">
              No Vercel deployment found. Deploy your project to get a live website with custom domain support.
            </p>
          </div>
        )}

        {/* Deploy Button */}
        <button
          onClick={deployToVercel}
          disabled={isDeploying || !templateData}
          className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            isDeploying || !templateData
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isDeploying ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-400 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deploying...
            </>
          ) : deploymentStatus ? (
            'Redeploy to Vercel'
          ) : (
            'Deploy to Vercel'
          )}
        </button>
      </div>

      {/* Custom Domain Section */}
      {deploymentStatus && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🌐 Custom Domain
          </h3>

          {/* Domain Status */}
          {domainStatus ? (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Domain:</span>
                <span className="text-sm text-gray-900 font-medium">{domainStatus.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                {getStatusBadge(domainStatus.verificationStatus)}
              </div>

              {domainStatus.verificationStatus === 'pending' && domainStatus.dnsInstructions && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">DNS Configuration Required</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Please add the following DNS record to your domain:
                  </p>
                  <div className="bg-white p-3 rounded border mb-3">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Type:</span>
                        <div className="font-mono">{domainStatus.dnsInstructions.type}</div>
                      </div>
                      <div>
                        <span className="font-medium">Name:</span>
                        <div className="font-mono break-all">{domainStatus.dnsInstructions.name}</div>
                      </div>
                      <div>
                        <span className="font-medium">Value:</span>
                        <div className="font-mono break-all">{domainStatus.dnsInstructions.value}</div>
                      </div>
                    </div>
                  </div>
                  
                  {domainStatus.dnsInstructions.note && (
                    <p className="text-xs text-yellow-600 mb-2">
                      💡 {domainStatus.dnsInstructions.note}
                    </p>
                  )}
                  
                  {domainStatus.dnsInstructions.alternative && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-800 font-medium mb-2">Alternative Option:</p>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Type:</span>
                          <div className="font-mono">{domainStatus.dnsInstructions.alternative.type}</div>
                        </div>
                        <div>
                          <span className="font-medium">Name:</span>
                          <div className="font-mono break-all">{domainStatus.dnsInstructions.alternative.name}</div>
                        </div>
                        <div>
                          <span className="font-medium">Value:</span>
                          <div className="font-mono break-all">{domainStatus.dnsInstructions.alternative.value}</div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {domainStatus.dnsInstructions.alternative.note}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {domainStatus.verificationStatus === 'verified' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ Your custom domain is verified and active! Your website is now available at:
                  </p>
                  <a
                    href={`https://${domainStatus.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-800 underline font-medium"
                  >
                    https://{domainStatus.name}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="custom-domain" className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                id="custom-domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your domain without 'www' or 'https://'
              </p>
            </div>
          )}

          {/* Add Domain Button */}
          {!domainStatus && (
            <button
              onClick={addCustomDomain}
              disabled={isAddingDomain || !customDomain.trim()}
              className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                isAddingDomain || !customDomain.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isAddingDomain ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-400 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Domain...
                </>
              ) : (
                'Add Custom Domain'
              )}
            </button>
          )}

          {/* Refresh Domain Status Button */}
          {domainStatus && domainStatus.verificationStatus === 'pending' && (
            <button
              onClick={loadDomainStatus}
              className="w-full mt-2 py-2 px-4 rounded-md font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              🔄 Check Domain Status
            </button>
          )}
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About Vercel Deployment
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Deploys your website as a fast, static site on Vercel's global CDN</li>
                <li>Provides automatic HTTPS and excellent performance</li>
                <li>Supports custom domains with easy DNS configuration</li>
                <li>Form submissions will still be processed by Jetsy's servers</li>
                <li>Deployments are free and unlimited for static sites</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VercelDeploymentManager;
