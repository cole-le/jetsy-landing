import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';
import DeploymentButton from './DeploymentButton';
import WorkflowProgressBar from './WorkflowProgressBar';
import { getApiBaseUrl } from '../config/environment';

const Navbar = ({ 
  onPricingClick, 
  onFAQClick, 
  onLogoClick, 
  onGetStartedClick, 
  onChatClick, 
  onLoginClick,
  onSaveChanges, 
  isChatMode = false, 
  isAdCreativesMode = false, 
  isLaunchMonitorMode = false, 
  previewMode = 'desktop', 
  onPreviewModeChange, 
  isMainPage = false,
  hideWorkflowAndAnalytics = false,
  // Add navigation callbacks for workflow stages
  onNavigateToWebsiteCreation,
  onNavigateToAdCreatives,
  onNavigateToLaunchMonitor,
  onProfileClick
}) => {
  const { session, loading: authLoading, signOut } = useAuth();
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
  const [showAccountMenu, setShowAccountMenu] = useState(false);

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

  // Get current project ID and name from storage or URL (for hard refresh)
  React.useEffect(() => {
    try {
      let storedProjectId = localStorage.getItem('jetsy_current_project_id');
      // Try to infer from URL if not present in localStorage
      if (!storedProjectId && typeof window !== 'undefined') {
        const path = window.location.pathname || '';
        // Supported routes: /chat/:id, /ad-creatives/:id, /launch/:id
        const match = path.match(/\/(chat|ad-creatives|launch)\/(\w[\w-]*)/);
        if (match && match[2]) {
          storedProjectId = match[2];
          // persist for consistency across pages
          try { localStorage.setItem('jetsy_current_project_id', storedProjectId); } catch (_) {}
        }
      }

      if (storedProjectId) {
        setCurrentProjectId(storedProjectId);
      }

      // Optimistically show last known project name (cached) to avoid "Loading..."
      let cachedName = localStorage.getItem('jetsy_current_project_name');
      // Prefer per-project cached name when ID is known
      try {
        const pidForName = storedProjectId || (localStorage.getItem('jetsy_current_project_id'));
        if (pidForName) {
          const scoped = localStorage.getItem(`jetsy_project_name_${pidForName}`);
          if (scoped) cachedName = scoped;
        }
      } catch (_) {}
      if (cachedName) {
        setCurrentProjectName(cachedName);
      }

      // Listen for changes to localStorage
      const handleStorageChange = () => {
        const newProjectId = localStorage.getItem('jetsy_current_project_id');
        setCurrentProjectId(newProjectId);
        // Try scoped name first
        let newName = null;
        try {
          if (newProjectId) {
            newName = localStorage.getItem(`jetsy_project_name_${newProjectId}`);
          }
        } catch (_) {}
        if (!newName) newName = localStorage.getItem('jetsy_current_project_name');
        if (newName) setCurrentProjectName(newName);
      };

      window.addEventListener('storage', handleStorageChange);

      // Also check periodically for changes (since storage event doesn't fire in same tab)
      const interval = setInterval(() => {
        const newProjectId = localStorage.getItem('jetsy_current_project_id');
        if (newProjectId !== currentProjectId) {
          setCurrentProjectId(newProjectId);
        }
        let newName = null;
        try {
          if (newProjectId) newName = localStorage.getItem(`jetsy_project_name_${newProjectId}`);
        } catch (_) {}
        if (!newName) newName = localStorage.getItem('jetsy_current_project_name');
        if (newName && newName !== currentProjectName) {
          setCurrentProjectName(newName);
        }
      }, 1000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    } catch (_) {
      // ignore
    }
  }, [currentProjectId, currentProjectName]);

  // Listen for project name updates from TemplateBasedChat
  useEffect(() => {
    const handleProjectNameUpdate = (event) => {
      if (event.detail && event.detail.projectName) {
        setCurrentProjectName(event.detail.projectName);
      }
    };

    window.addEventListener('project-name-update', handleProjectNameUpdate);
    return () => window.removeEventListener('project-name-update', handleProjectNameUpdate);
  }, []);

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
      if (showAccountMenu && !event.target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPublishModal, showAccountMenu]);

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

  // Listen for workflow status updates from AdCreativesPage
  React.useEffect(() => {
    const handleWorkflowStatus = (event) => {
      const { websiteDeployed: newWebsiteDeployed, adsExist: newAdsExist } = event.detail;
      setWebsiteDeployed(newWebsiteDeployed);
      setAdsExist(newAdsExist);
    };
    
    window.addEventListener('ad-creatives:workflow-status', handleWorkflowStatus);
    return () => window.removeEventListener('ad-creatives:workflow-status', handleWorkflowStatus);
  }, []);

  // Listen for workflow status updates from LaunchMonitorPage
  React.useEffect(() => {
    const handleWorkflowStatus = (event) => {
      const { websiteDeployed: newWebsiteDeployed, adsExist: newAdsExist } = event.detail;
      setWebsiteDeployed(newWebsiteDeployed);
      setAdsExist(newAdsExist);
    };
    
    window.addEventListener('launch-monitor:workflow-status', handleWorkflowStatus);
    return () => window.removeEventListener('launch-monitor:workflow-status', handleWorkflowStatus);
  }, []);

  // Function to load ads state (extracted for reuse)
  const loadAdsState = async () => {
    try {
      if (!currentProjectId) {
        setAdsExist(false);
        setHasTemplateData(false);
        setWebsiteDeployed(false);
        setCurrentProjectName(prev => prev || '');
        return;
      }
      
      // Load project data
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/api/projects/${currentProjectId}`, { headers });
      if (!res.ok) return;
      const json = await res.json();
      const project = json.project;
      
      // Treat non-empty ads_data as existence
      setAdsExist(!!project?.ads_data);
      setHasTemplateData(!!project?.template_data);
      const projName = project?.project_name || 'Project';
      setCurrentProjectName(projName);
      // cache latest known project name for refreshes
      try { localStorage.setItem('jetsy_current_project_name', projName); } catch (_) {}
      
      // Check website deployment status
      try {
        const deploymentRes = await fetch(`${getApiBaseUrl()}/api/projects/${currentProjectId}/deployment`, { headers });
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

  // Hide entire navbar on mobile for Launch & Monitor page (it has its own mobile header)
  if (isLaunchMonitorMode && isMobile) {
    return null;
  }

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
              {/* Left side - Empty for balance when workflow bar is centered */}
              <div className="flex items-center">
                {/* This div is intentionally empty to balance the layout */}
              </div>

              {/* Center - Workflow Progress Bar for project modes */}
              <div className="flex items-center justify-center flex-1">
                {/* Workflow Progress Bar - only in project modes (chat/ad-creatives/launch-monitor), not on main page, and not hidden */}
                {!isMobile && currentProjectId && (isChatMode || isAdCreativesMode || isLaunchMonitorMode) && !isMainPage && !hideWorkflowAndAnalytics && (
                  <div className="flex items-center space-x-4 flex-nowrap">
                    <WorkflowProgressBar 
                      currentStage={
                        isChatMode ? (adsExist ? 2 : 1) :
                        isAdCreativesMode ? 2 :
                        isLaunchMonitorMode ? 3 : 3
                      } 
                      pulseStageId={
                        isChatMode ? (adsExist ? 2 : (hasTemplateData ? 2 : undefined)) : undefined
                      }
                      projectId={currentProjectId}
                      websiteDeployed={websiteDeployed}
                      adsExist={adsExist}
                      onStageClick={(stageId) => {
                        if (stageId === 1 && currentProjectId) {
                          // Navigate to website creation using callback if available
                          if (onNavigateToWebsiteCreation) {
                            onNavigateToWebsiteCreation(currentProjectId);
                          } else {
                            // Fallback to window.location.href
                            window.location.href = `/chat/${currentProjectId}`;
                          }
                        } else if (stageId === 2 && currentProjectId) {
                          // Navigate to ads creation using callback if available
                          if (onNavigateToAdCreatives) {
                            onNavigateToAdCreatives(currentProjectId);
                          } else {
                            // Fallback to window.location.href
                            window.location.href = `/ad-creatives/${currentProjectId}`;
                          }
                        } else if (stageId === 3 && currentProjectId) {
                          // Navigate to launch and monitor page using callback if available
                          if (onNavigateToLaunchMonitor) {
                            onNavigateToLaunchMonitor(currentProjectId);
                          } else {
                            // Fallback to window.location.href
                            window.location.href = `/launch/${currentProjectId}`;
                          }
                        }
                      }}
                    />
                    
                    {/* Data Analytics button - Show on all project pages (unless hidden) */}
                    <button
                      onClick={() => {
                        try {
                          const pid = localStorage.getItem('jetsy_current_project_id') || '1';
                          window.location.href = `/data_analytics/project_${pid}`;
                        } catch (_) {
                          window.location.href = `/data_analytics/project_1`;
                        }
                      }}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                    >
                      <span>Data Analytics</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-500">
                        <path d="M5 3a1 1 0 0 1 1 1v14h12a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1h1Zm4.5 5a1 1 0 0 1 1 1v7h-2v-7a1 1 0 0 1 1-1Zm4 -2a1 1 0 0 1 1 1v9h-2V7a1 1 0 0 1 1-1Zm4 4a1 1 0 0 1 1 1v5h-2v-5a1 1 0 0 1 1-1Z" />
                      </svg>
                    </button>
                  </div>
                )}
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
                    onClick={onLoginClick}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Log in
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
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 overflow-visible min-w-0">
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

                  {/* Account avatar */}
                  <div className="relative account-menu-container">
                    <button
                      onClick={() => setShowAccountMenu((v) => !v)}
                      className="ml-1 sm:ml-2 p-2 rounded-full hover:bg-gray-100 border border-gray-200"
                      title={session?.user?.email || 'Account'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                        <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 17a7 7 0 1114 0v1H5v-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {showAccountMenu && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[10000]">
                        <button
                          onClick={() => { setShowAccountMenu(false); onProfileClick && onProfileClick(); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile
                        </button>
                        <button
                          onClick={async () => {
                            setShowAccountMenu(false);
                            try { await signOut(); } catch (_) {}
                            window.location.href = '/';
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : isLaunchMonitorMode ? (
                // Launch & Monitor mode header content
                <div className="flex-1 flex justify-end items-center gap-2">
                  {/* Right side content for Launch Monitor mode */}
                  {/* Account avatar */}
                  <div className="relative account-menu-container">
                    <button
                      onClick={() => setShowAccountMenu((v) => !v)}
                      className="p-2 rounded-full hover:bg-gray-100 border border-gray-200"
                      title={session?.user?.email || 'Account'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                        <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 17a7 7 0 1114 0v1H5v-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {showAccountMenu && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[10000]">
                        <button
                          onClick={() => { setShowAccountMenu(false); onProfileClick && onProfileClick(); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile
                        </button>
                        <button
                          onClick={async () => {
                            setShowAccountMenu(false);
                            try { await signOut(); } catch (_) {}
                            window.location.href = '/';
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : isAdCreativesMode ? (
                // Ad Creatives mode header content
                <div className="flex items-center space-x-3">
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
                  {/* Account avatar */}
                  <div className="relative account-menu-container">
                    <button
                      onClick={() => setShowAccountMenu((v) => !v)}
                      className="p-2 rounded-full hover:bg-gray-100 border border-gray-200"
                      title={session?.user?.email || 'Account'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                        <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 17a7 7 0 1114 0v1H5v-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {showAccountMenu && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[10000]">
                        <button
                          onClick={() => { setShowAccountMenu(false); onProfileClick && onProfileClick(); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile
                        </button>
                        <button
                          onClick={async () => {
                            setShowAccountMenu(false);
                            try { await signOut(); } catch (_) {}
                            window.location.href = '/';
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
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
              onClick={onLoginClick}
              className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
            >
              Log in
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