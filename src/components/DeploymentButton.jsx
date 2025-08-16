import React, { useState, useEffect } from 'react';
import { getVercelApiBaseUrl } from '../config/environment';

const DeploymentButton = ({ projectId, showAsModal = false }) => {
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [domainStatus, setDomainStatus] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState(null);
  const [templateData, setTemplateData] = useState(null);

  // Function to open modal and clear any previous input
  const openDomainModal = () => {
    setCustomDomain(''); // Clear any previous domain input
    setError(null); // Clear any previous errors
    setShowDomainModal(true);
  };

  // Function to close modal and clear input
  const closeDomainModal = () => {
    setCustomDomain(''); // Clear domain input
    setError(null); // Clear errors
    setShowDomainModal(false);
  };

  // Load deployment and domain status on component mount
  useEffect(() => {
    if (projectId) {
      loadDeploymentStatus();
      loadDomainStatus();
      loadTemplateData();
    }
  }, [projectId]);

  const loadTemplateData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();
      
      if (result.success && result.project.template_data) {
        const parsedTemplateData = typeof result.project.template_data === 'string'
          ? JSON.parse(result.project.template_data)
          : result.project.template_data;
        setTemplateData(parsedTemplateData);
      }
    } catch (error) {
      console.error('Error loading template data:', error);
    }
  };

  const loadDeploymentStatus = async () => {
    try {
      const response = await fetch(`${getVercelApiBaseUrl()}/api/vercel/status/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setDeploymentStatus(result.deployment);
      } else {
        setDeploymentStatus(null);
      }
    } catch (error) {
      console.error('Error loading deployment status:', error);
    }
  };

  const loadDomainStatus = async () => {
    try {
      const response = await fetch(`${getVercelApiBaseUrl()}/api/vercel/domain/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setDomainStatus(result.domain);
        // Don't prefill the input - let user enter their own domain
      } else {
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

    try {
      const response = await fetch(`${getVercelApiBaseUrl()}/api/vercel/deploy/${projectId}`, {
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
        
        // Keep isDeploying true until we get a final status
        // The polling will update the status and we'll handle isDeploying there
        pollDeploymentStatus();
      } else {
        setError(`Deployment failed: ${result.error}`);
        setIsDeploying(false);
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setError(`Deployment failed: ${error.message}`);
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

    try {
      const response = await fetch(`${getVercelApiBaseUrl()}/api/vercel/domain/${projectId}`, {
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
        // Keep modal open to show DNS instructions
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
        const response = await fetch(`${getVercelApiBaseUrl()}/api/vercel/status/${projectId}`);
        const result = await response.json();
        
        if (result.success) {
          setDeploymentStatus(result.deployment);
          
          // Stop polling if deployment is ready or failed
          if (result.deployment.status === 'READY' || result.deployment.status === 'ERROR') {
            clearInterval(interval);
            // Set isDeploying to false when deployment reaches final state
            setIsDeploying(false);
          }
        }
      } catch (error) {
        console.error('Error polling deployment status:', error);
        clearInterval(interval);
        setIsDeploying(false);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setIsDeploying(false);
    }, 300000);
  };

  const handleViewWebsite = () => {
    if (domainStatus && domainStatus.verificationStatus === 'verified') {
      // Open custom domain
      window.open(`https://${domainStatus.name}`, '_blank');
    } else if (deploymentStatus && deploymentStatus.url) {
      // Open Vercel deployment URL
      window.open(deploymentStatus.url, '_blank');
    }
  };

  const getButtonContent = () => {
    // If deployment is in progress (either isDeploying or status is BUILDING)
    if (isDeploying || (deploymentStatus && deploymentStatus.status === 'BUILDING')) {
      return {
        text: (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deploying<span className="animate-pulse">...</span>
          </>
        ),
        onClick: () => {},
        disabled: true,
        className: 'bg-black text-white cursor-not-allowed'
      };
    }

    // If no deployment exists yet
    if (!deploymentStatus) {
      return {
        text: 'Deploy website to Internet 🚀',
        onClick: deployToVercel,
        disabled: isDeploying || !templateData,
        className: 'bg-black hover:bg-gray-800 text-white'
      };
    }

    // If deployment is ready
    if (deploymentStatus.status === 'READY') {
      return {
        text: 'View your live website 🌐',
        onClick: handleViewWebsite,
        disabled: false,
        className: 'bg-black hover:bg-gray-800 text-white'
      };
    }

    // If deployment failed
    if (deploymentStatus.status === 'ERROR') {
      return {
        text: 'Deploy failed - Try again 🚀',
        onClick: deployToVercel,
        disabled: isDeploying,
        className: 'bg-black hover:bg-gray-800 text-white'
      };
    }

    // Default case - any other status (like 'CANCELED', etc.)
    return {
      text: 'Deploy website to Internet 🚀',
      onClick: deployToVercel,
      disabled: isDeploying || !templateData,
      className: 'bg-black hover:bg-gray-800 text-white'
    };
  };

  const shouldShowDomainButton = () => {
    return deploymentStatus && 
           deploymentStatus.status === 'READY' && 
           (!domainStatus || domainStatus.verificationStatus !== 'verified');
  };

  const shouldShowRedeployButton = () => {
    return deploymentStatus && 
           deploymentStatus.status === 'READY' && 
           !isDeploying;
  };

  const getDomainButtonContent = () => {
    if (!domainStatus) {
              return {
          text: 'Connect custom domain to your website 🔗',
          onClick: openDomainModal,
          disabled: false,
          className: 'bg-black hover:bg-gray-800 text-white'
        };
    }

    if (domainStatus.verificationStatus === 'pending') {
              return {
          text: (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting custom domain<span className="animate-pulse">...</span>
            </>
          ),
          onClick: openDomainModal,
          disabled: false,
          className: 'bg-purple-500 hover:bg-purple-600 text-white'
        };
    }

    return null;
  };

  const buttonConfig = getButtonContent();
  const domainButtonConfig = shouldShowDomainButton() ? getDomainButtonContent() : null;
  const showRedeployButton = shouldShowRedeployButton();

  return (
    <>
      {/* Main deployment button */}
      {buttonConfig.text === 'View your live website 🌐' ? (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            buttonConfig.onClick();
          }}
          className={`w-full px-3 py-2 rounded-md font-medium text-sm transition-colors inline-block text-center ${buttonConfig.className}`}
        >
          {buttonConfig.text}
        </a>
      ) : (
        <button
          onClick={buttonConfig.onClick}
          disabled={buttonConfig.disabled}
          className={`w-full px-3 py-2 rounded-md font-medium text-sm transition-colors ${
            buttonConfig.disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          } ${buttonConfig.className}`}
        >
          {buttonConfig.text}
        </button>
      )}

      {/* Domain connection button */}
      {domainButtonConfig && (
        <button
          onClick={domainButtonConfig.onClick}
          disabled={domainButtonConfig.disabled}
          className={`w-full mt-2 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
            domainButtonConfig.disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          } ${domainButtonConfig.className}`}
        >
          {domainButtonConfig.text}
        </button>
      )}

      {/* Redeploy button */}
      {showRedeployButton && (
        <button
          onClick={deployToVercel}
          disabled={isDeploying}
          className={`w-full mt-2 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
            isDeploying 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          } bg-blue-600 hover:bg-blue-700 text-white`}
        >
          {isDeploying ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deploying<span className="animate-pulse">...</span>
            </>
          ) : (
            'Update changes to your live website 🚀'
          )}
        </button>
      )}

      {/* Custom Domain Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  🌐 Connect Custom Domain
                </h3>
                <button
                  onClick={closeDomainModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!domainStatus ? (
                <>
                  {/* Domain Input */}
                  <div className="mb-6">
                    <label htmlFor="domain-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Domain Name
                    </label>
                    <input
                      type="text"
                      id="domain-input"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter your domain without 'www' or 'https://'
                    </p>
                  </div>

                  {/* Add Domain Button */}
                  <button
                    onClick={addCustomDomain}
                    disabled={isAddingDomain || !customDomain.trim()}
                    className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                      isAddingDomain || !customDomain.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
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
                      'Connect Domain'
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Domain Status */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Domain:</span>
                      <span className="text-sm text-gray-900 font-medium">{domainStatus.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        domainStatus.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : domainStatus.verificationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {domainStatus.verificationStatus === 'verified' ? '✅ Verified' :
                         domainStatus.verificationStatus === 'pending' ? '⏳ Pending' : '❌ Failed'}
                      </span>
                    </div>
                  </div>

                  {/* DNS Instructions */}
                  {domainStatus.verificationStatus === 'pending' && domainStatus.dnsInstructions && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h4 className="text-sm font-medium text-yellow-800 mb-3">DNS Configuration Required</h4>
                      <p className="text-sm text-yellow-700 mb-4">
                        Please add the following DNS record to your domain provider:
                      </p>
                      
                      <div className="bg-white p-4 rounded border mb-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <div className="font-mono text-gray-900">{domainStatus.dnsInstructions.type}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Name:</span>
                            <div className="font-mono text-gray-900 break-all">{domainStatus.dnsInstructions.name}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Value:</span>
                            <div className="font-mono text-gray-900 break-all">{domainStatus.dnsInstructions.value}</div>
                          </div>
                        </div>
                      </div>
                      
                      {domainStatus.dnsInstructions.note && (
                        <p className="text-sm text-yellow-600 mb-3">
                          💡 {domainStatus.dnsInstructions.note}
                        </p>
                      )}
                      
                      {domainStatus.dnsInstructions.alternative && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800 font-medium mb-2">Alternative Option:</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Type:</span>
                              <div className="font-mono text-gray-900">{domainStatus.dnsInstructions.alternative.type}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Name:</span>
                              <div className="font-mono text-gray-900 break-all">{domainStatus.dnsInstructions.alternative.name}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Value:</span>
                              <div className="font-mono text-gray-900 break-all">{domainStatus.dnsInstructions.alternative.value}</div>
                            </div>
                          </div>
                          <p className="text-sm text-blue-600 mt-2">
                            {domainStatus.dnsInstructions.alternative.note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success Message */}
                  {domainStatus.verificationStatus === 'verified' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 mb-2">
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

                  {/* Refresh Status Button */}
                  {domainStatus.verificationStatus === 'pending' && (
                    <button
                      onClick={loadDomainStatus}
                      className="w-full py-2 px-4 rounded-md font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      🔄 Check Domain Status
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeploymentButton;
