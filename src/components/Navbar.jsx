import React, { useState, useEffect } from 'react';
import DeploymentButton from './DeploymentButton';
import WorkflowProgressBar from './WorkflowProgressBar';
import { getApiBaseUrl } from '../config/environment';

const Navbar = ({ onPricingClick, onFAQClick, onLogoClick, onGetStartedClick, onChatClick, onSaveChanges, isChatMode = false, isAdCreativesMode = false, isLaunchMonitorMode = false, previewMode = 'desktop', onPreviewModeChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isAdGenerating, setIsAdGenerating] = useState(false);
  const [adsExist, setAdsExist] = useState(false);
  const [hasTemplateData, setHasTemplateData] = useState(false);
  const [websiteDeployed, setWebsiteDeployed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState('');
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);

  // Effect to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to listen for navbar visibility events from TemplateBasedChat
  useEffect(() => {
    const handleNavbarVisibility = (event) => {
      if (event.detail && typeof event.detail.hide === 'boolean') {
        // Only hide navbar if we're in chat mode and on mobile
        if (isChatMode && isMobile && event.detail.hide) {
          setHideNavbar(true);
        } else {
          setHideNavbar(false);
        }
      }
    };

    window.addEventListener('mobile-navbar-visibility', handleNavbarVisibility);
    return () => window.removeEventListener('mobile-navbar-visibility', handleNavbarVisibility);
  }, [isChatMode, isMobile]);

  // Get current project ID from localStorage
  React.useEffect(() => {
    const storedProjectId = localStorage.getItem('jetsy_current_project_id');
    if (storedProjectId) {
      setCurrentProjectId(storedProjectId);
    }
    
    // Listen for changes to localStorage
    const handleStorageChange = () => {
      const newProjectId = localStorage.getItem('jetsy_current_project_id');
      setCurrentProjectId(newProjectId);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(() => {
      const newProjectId = localStorage.getItem('jetsy_current_project_id');
      if (newProjectId !== currentProjectId) {
        setCurrentProjectId(newProjectId);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentProjectId]);

  // Check if ads data exists for current project
  React.useEffect(() => {
    if (currentProjectId) {
      loadAdsState();
    }
  }, [currentProjectId]);

  // Close publish modal when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPublishModal && !event.target.closest('.publish-modal-container')) {
        setShowPublishModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPublishModal]);

  // Sync ad-creatives loading state from page
  React.useEffect(() => {
    const onLoading = (e) => {
      try {
        setIsAdGenerating(!!e.detail?.isGenerating);
      } catch {
        setIsAdGenerating(false);
      }
    };
    window.addEventListener('ad-creatives:loading', onLoading);
    return () => window.removeEventListener('ad-creatives:loading', onLoading);
  }, []);

  // Listen for refresh events from Launch & Monitor page
  React.useEffect(() => {
    const onRefresh = async () => {
      if (currentProjectId) {
        await loadAdsState();
      }
    };
    
    window.addEventListener('launch-monitor:refresh', onRefresh);
    return () => window.removeEventListener('launch-monitor:refresh', onRefresh);
  }, [currentProjectId]);

  // Function to load ads state (extracted for reuse)
  const loadAdsState = async () => {
    try {
      if (!currentProjectId) {
        setAdsExist(false);
        setHasTemplateData(false);
        setWebsiteDeployed(false);
        setCurrentProjectName('');
        return;
      }
      
      // Load project data
      const res = await fetch(`${getApiBaseUrl()}/api/projects/${currentProjectId}`);
      if (!res.ok) return;
      const json = await res.json();
      const project = json.project;
      
      // Treat non-empty ads_data as existence
      setAdsExist(!!project?.ads_data);
      setHasTemplateData(!!project?.template_data);
      setCurrentProjectName(project?.project_name || 'Project');
      
      // Check website deployment status
      try {
        const deploymentRes = await fetch(`${getApiBaseUrl()}/api/projects/${currentProjectId}/deployment`);
        if (deploymentRes.ok) {
          const deploymentData = await deploymentRes.json();
          setWebsiteDeployed(deploymentData.status === 'deployed' && (deploymentData.customDomain || deploymentData.vercelDomain));
        }
      } catch (_) {
        // ignore deployment check errors
      }
    } catch (_) {
      // ignore
    }
  };


  const handlePricingClick = (e) => {
    e.preventDefault();
    onPricingClick();
  };

  const handleFAQClick = (e) => {
    e.preventDefault();
    onFAQClick();
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    onLogoClick();
  };

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    onGetStartedClick();
  };

  // Preview mode cycle: desktop -> phone -> desktop
  const handlePreviewModeToggle = () => {
    const modes = ['desktop', 'phone'];
    const currentIndex = modes.indexOf(previewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onPreviewModeChange(modes[nextIndex]);
  };

  // Get preview mode icon and tooltip
  const getPreviewModeInfo = () => {
    switch (previewMode) {
      case 'phone':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" className="shrink-0 h-5 w-5" fill="currentColor">
              <path d="M125-160q-18.75 0-31.87-13.18Q80-186.35 80-205.18 80-224 93.13-237q13.12-13 31.87-13h35v-490q0-24.75 17.63-42.38Q195.25-800 220-800h590q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H220v490h195q18.75 0 31.88 13.18 13.12 13.17 13.12 32Q460-186 446.88-173q-13.13 13-31.88 13zm425 0q-12.75 0-21.37-8.63Q520-177.25 520-190v-460q0-12.75 8.63-21.38Q537.25-680 550-680h300q12.75 0 21.38 8.62Q880-662.75 880-650v460q0 12.75-8.62 21.37Q862.75-160 850-160zm30-90h240v-370H580zm0 0h240z"></path>
            </svg>
          ),
          tooltip: 'Show desktop preview'
        };
      default: // desktop
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" className="shrink-0 h-5 w-5" fill="currentColor">
              <path d="M125-160q-18.75 0-31.87-13.18Q80-186.35 80-205.18 80-224 93.13-237q13.12-13 31.87-13h35v-490q0-24.75 17.63-42.38Q195.25-800 220-800h590q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H220v490h195q18.75 0 31.88 13.18 13.12 13.17 13.12 32Q460-186 446.88-173q-13.13 13-31.88 13zm425 0q-12.75 0-21.37-8.63Q520-177.25 520-190v-460q0-12.75 8.63-21.38Q537.25-680 550-680h300q12.75 0 21.38 8.62Q880-662.75 880-650v460q0 12.75-8.62 21.37Q862.75-160 850-160zm30-90h240v-370H580zm0 0h240z"></path>
            </svg>
          ),
          tooltip: 'Show phone preview'
        };
    }
  };

  const previewInfo = getPreviewModeInfo();
  
  // Mobile chat-mode pulse around project name when Ads creation is the next step
  const shouldPulseProjectName = isChatMode && isMobile && hasTemplateData && !adsExist;

  return (
    <nav className={`${hideNavbar ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-all duration-300 ${hideNavbar ? 'transform -translate-y-full' : 'transform translate-y-0'}`}>
      <div className="flex items-center h-16">
        {/* Logo - positioned at far left with some padding */}
        <div className="flex items-center pl-8">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/jetsy_colorful_transparent_horizontal.png" 
              alt="Jetsy" 
              className="h-8 sm:h-10 md:h-12 w-auto"
            />
          </button>
        </div>

        {/* Centered container for other navbar elements */}
        <div className="flex-1 flex justify-center">
          <div className="max-w-7xl w-full px-2 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Spacer to balance the layout */}
              <div className="flex items-center">
                {/* This div is intentionally empty to balance the layout */}
              </div>

              {/* Desktop Navigation and Account Actions */}
              {!isChatMode && !isAdCreativesMode && !isLaunchMonitorMode && (
                <div className="hidden md:flex items-center space-x-8">
                  <button
                    onClick={onFAQClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    FAQ
                  </button>
                  <button
                    onClick={onPricingClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={onChatClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Chat
                  </button>
                  <button 
                    onClick={handleGetStartedClick}
                    className="px-4 py-2 bg-accent hover:bg-buttonHover text-white rounded-lg transition-colors duration-200 font-semibold">
                    Get started
                  </button>
                </div>
              )}

              {/* Chat mode header content */}
              {isChatMode ? (
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 overflow-hidden min-w-0">
                  {/* Workflow Progress Bar - Hidden on mobile to save space */}
                  {!isMobile && (
                                      <WorkflowProgressBar 
                    currentStage={adsExist ? 2 : 1} 
                    pulseStageId={adsExist ? 2 : (hasTemplateData ? 2 : undefined)}
                    projectId={currentProjectId}
                    websiteDeployed={websiteDeployed}
                    adsExist={adsExist}
                    onStageClick={(stageId) => {
                      if (stageId === 2 && currentProjectId) {
                        // Navigate to ads creation
                        window.location.href = `/ad-creatives/${currentProjectId}`;
                      } else if (stageId === 1) {
                        // Already on website creation, do nothing
                        return;
                      } else if (stageId === 3) {
                        // Launch and monitor - placeholder for now
                        alert('Launch and monitor feature coming soon!');
                      }
                    }}
                  />
                  )}

                  {/* Data Analytics button - Hidden on mobile to save space */}
                  {!isMobile && (
                    <button
                      onClick={() => {
                        try {
                          const pid = localStorage.getItem('jetsy_current_project_id') || '1';
                          window.location.href = `/data_analytics/project_${pid}`;
                        } catch (_) {
                          window.location.href = `/data_analytics/project_1`;
                        }
                      }}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2"
                    >
                      <span>Data Analytics</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-500">
                        <path d="M5 3a1 1 0 0 1 1 1v14h12a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1h1Zm4.5 5a1 1 0 0 1 1 1v7h-2v-7a1 1 0 0 1 1-1Zm4 -2a1 1 0 0 1 1 1v9h-2V7a1 1 0 0 1 1-1Zm4 4a1 1 0 0 1 1 1v5h-2v-5a1 1 0 0 1 1-1Z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Mobile: Project Name Dropdown in Center */}
                  {isMobile && (
                    <div className="flex-1 flex justify-center">
                      <button
                        onClick={() => {
                          // Dispatch event to show workflow panel in TemplateBasedChat
                          window.dispatchEvent(new CustomEvent('toggle-workflow-panel'));
                        }}
                        className="flex items-center space-x-2 text-center hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors min-w-0 relative"
                      >
                        {shouldPulseProjectName && (
                          <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-inset animate-pulse"></span>
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {currentProjectName || 'Loading...'}
                        </span>
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Preview Mode Toggle Button - Hidden on mobile in chat mode */}
                  {(!isMobile || !isChatMode) && (
                    <div className="relative group">
                      <button 
                        onClick={handlePreviewModeToggle}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        title={previewInfo.tooltip}
                      >
                        {previewInfo.icon}
                      </button>
                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                        {previewInfo.tooltip}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Projects Button - Show on mobile in chat mode, hidden on desktop */}
                  {isMobile && (
                    <button
                      onClick={() => {
                        // This will trigger the project panel in TemplateBasedChat
                        window.dispatchEvent(new CustomEvent('toggle-project-panel'));
                      }}
                      className="px-2 sm:px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Projects
                    </button>
                  )}
                  
                  <button 
                    onClick={onSaveChanges}
                    className="px-2 sm:px-3 lg:px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 font-semibold text-xs sm:text-sm lg:text-base">
                    {isChatMode && isMobile ? 'Save' : isAdCreativesMode ? 'Saves' : 'Save Changes'}
                  </button>
                  
                  {/* Publish Button - Hidden on mobile in chat mode */}
                  {currentProjectId && (!isMobile || !isChatMode) && (
                    <div className="relative group publish-modal-container">
                      <button
                        onClick={() => setShowPublishModal(!showPublishModal)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold"
                      >
                        <span>Publish 🚀</span>
                      </button>
                      
                      {/* Publish Modal */}
                      {showPublishModal && (
                        <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">Publish</h3>
                              <button
                                onClick={() => setShowPublishModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Deployment Status Section */}
                            <div className="mb-4">
                              <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
                              <DeploymentButton 
                                projectId={currentProjectId}
                                showAsModal={true}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : isLaunchMonitorMode ? (
                // Launch & Monitor mode header content
                <div className="flex-1 flex justify-start">
                  {/* Workflow Progress Bar */}
                  <div className="ml-24">
                    <WorkflowProgressBar 
                      currentStage={3} 
                      projectId={currentProjectId || undefined}
                      websiteDeployed={websiteDeployed}
                      adsExist={adsExist}
                      onStageClick={(stageId) => {
                        if (stageId === 1 && currentProjectId) {
                          // Navigate to website creation
                          window.location.href = `/chat/${currentProjectId}`;
                        } else if (stageId === 2 && currentProjectId) {
                          // Navigate to ads creation
                          window.location.href = `/ads/${currentProjectId}`;
                        } else if (stageId === 3) {
                          // Already on launch and monitor, do nothing
                          return;
                        }
                      }}
                    />
                  </div>
                </div>
              ) : isAdCreativesMode ? (
                // Ad Creatives mode header content
                <div className="flex items-center space-x-3">
                  {/* Workflow Progress Bar - Hidden on mobile to prevent duplicate navbar */}
                  {!isMobile && (
                    <div className="mr-4 md:mr-6 lg:mr-8">
                      <WorkflowProgressBar 
                        currentStage={2} 
                        projectId={currentProjectId || undefined}
                      />
                    </div>
                  )}

                  {/* Generate + Save */}
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('ad-creatives:generate'))}
                    disabled={isAdGenerating}
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isAdGenerating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        <span>Generating Ads...</span>
                      </span>
                    ) : '✨ Generate Ad with AI'}
                  </button>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('ad-creatives:save'))}
                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 font-semibold">
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && !isAdCreativesMode && !isChatMode && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button 
              onClick={handlePricingClick}
              className="block w-full text-left px-3 py-2 text-text hover:text-accent transition-colors duration-200 font-medium"
            >
              Pricing
            </button>
            <button 
              onClick={handleFAQClick}
              className="block w-full text-left px-3 py-2 text-text hover:text-accent transition-colors duration-200 font-medium"
            >
              FAQ
            </button>
            <button 
              onClick={onChatClick}
              className="block w-full text-left px-3 py-2 text-text hover:text-accent transition-colors duration-200 font-medium"
            >
              Chat
            </button>
            <button 
              onClick={handleGetStartedClick}
              className="block w-full text-left px-3 py-2 bg-accent hover:bg-buttonHover text-white rounded-lg transition-colors duration-200 font-semibold">
              Get started
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 