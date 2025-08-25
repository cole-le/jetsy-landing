import React, { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../config/environment';
import { SiLinkedin, SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import InstagramSingleImageAdPreview from './ads-template/InstagramSingleImageAdPreview';
import AdControls from './ads-template/AdControls';
import { useAuth } from './auth/AuthProvider';
import PricingModal from './PricingModal';

const AdCreativesPage = ({ projectId, onNavigateToChat, onNavigateToLaunch, onNavigateToDataAnalytics }) => {
  const { session, loading: authLoading, signOut } = useAuth();
  const [project, setProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Credits badge state
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);

  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('ads-copy'); // 'ads-copy' or 'preview'
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Redirect unauthenticated users once auth has finished loading
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      try { window.location.href = '/'; } catch (_) {}
    }
  }, [authLoading, session]);

  // Workflow status state for navbar progress bar
  const [websiteDeployed, setWebsiteDeployed] = useState(false);
  const [adsExist, setAdsExist] = useState(false);

  // Placeholder ads template data for projects with blank ads data
  const placeholderAdsData = {
    linkedIn: {
      copy: {
        primaryText: "Introductory text - Describe your product or service here",
        headline: "Headline text - Your main message",
        description: "Description text - Additional details about your offering",
        cta: "LEARN_MORE",
        linkUrl: "https://example.com",
      },
      visual: {
        imageUrl: null, // Will be replaced with placeholder image component
        logoUrl: null, // Will be replaced with placeholder logo
        brandName: "Your Business Name",
        verified: false,
      },
    },
    meta: {
      copy: {
        primaryText: "Introductory text - Describe your product or service here",
        headline: "Headline text - Your main message",
        description: "Description text - Additional details about your offering",
        cta: "SIGN_UP",
        linkUrl: "https://example.com",
      },
      visual: {
        imageUrl: null, // Will be replaced with placeholder image component
        logoUrl: null, // Will be replaced with placeholder logo
        brandName: "Your Business Name",
      },
    },
    instagram: {
      copy: {
        primaryText: "Introductory text - Describe your product or service here",
        headline: "Headline text - Your main message",
        description: "Description text - Additional details about your offering",
        cta: "GET_STARTED",
        linkUrl: "https://example.com",
      },
      visual: {
        imageUrl: null, // Will be replaced with placeholder image component
        logoUrl: null, // Will be replaced with placeholder logo
        brandName: "Your Business Name",
      },
    },
  };

  // State management for ads
  const [activePlatform, setActivePlatform] = useState('linkedin');
  const [linkedInCopy, setLinkedInCopy] = useState(placeholderAdsData.linkedIn.copy);
  const [linkedInVisual, setLinkedInVisual] = useState(placeholderAdsData.linkedIn.visual);
  const [metaCopy, setMetaCopy] = useState(placeholderAdsData.meta.copy);
  const [metaVisual, setMetaVisual] = useState(placeholderAdsData.meta.visual);
  const [instagramCopy, setInstagramCopy] = useState(placeholderAdsData.instagram.copy);
  const [instagramVisual, setInstagramVisual] = useState(placeholderAdsData.instagram.visual);
  const [linkedInAspectRatio, setLinkedInAspectRatio] = useState('1200×628');
  const [metaAspectRatio, setMetaAspectRatio] = useState('1:1');
  const [instagramAspectRatio, setInstagramAspectRatio] = useState('1080×1080');

  // Fallback image URLs for demo purposes - only used if project has existing ads data
  const fallbackImages = {
    linkedIn: '/ferrari.jpg',
    meta: '/ferrari.jpg',
    instagram: '/ferrari.jpg',
    logo: '/ferrari_logo.jpg'
  };

  // Effect to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setMobileView('ads-copy'); // default to Ads Copy on mobile
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to handle mobile view transitions smoothly
  useEffect(() => {
    if (isMobile && mobileView === 'preview') {
      // Add a small delay to prevent layout shifts during view transitions
      const timer = setTimeout(() => {
        // Ensure smooth transition
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobile, mobileView]);

  // Close workflow panel when clicking outside on mobile
  useEffect(() => {
    if (!showWorkflowPanel || !isMobile) return;
    
    const handleClickOutside = (event) => {
      if (showWorkflowPanel && !event.target.closest('.workflow-panel-container')) {
        setShowWorkflowPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWorkflowPanel, isMobile]);

  // Close account menu when clicking outside
  useEffect(() => {
    if (!showAccountMenu) return;
    const handleClickOutside = (event) => {
      if (showAccountMenu && !event.target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountMenu]);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // Load user credits for badge
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setCreditsLoading(true);
        const headers = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(`${getApiBaseUrl()}/api/user-credits`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUserCredits(data.credits ?? 0);
        }
      } catch (_) {
        // ignore
      } finally {
        setCreditsLoading(false);
      }
    };
    fetchCredits();
  }, [session]);

  const refreshCredits = useCallback(async () => {
    try {
      setCreditsLoading(true);
      const headers = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch(`${getApiBaseUrl()}/api/user-credits`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUserCredits(data.credits ?? 0);
      }
    } catch (_) {
      // ignore
    } finally {
      setCreditsLoading(false);
    }
  }, [session]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to load project data');
      }

      const result = await response.json();
      const projectData = result.project;
      
      setProject(projectData);
      
      // Check website deployment status
      let isWebsiteDeployed = false;
      if (projectData.template_data) {
        try {
          const templateData = JSON.parse(projectData.template_data);
          // Check if template data exists and has content
          isWebsiteDeployed = !!(templateData && Object.keys(templateData).length > 0);
        } catch (error) {
          console.error('Error parsing template data:', error);
        }
      }
      
      // Also check deployment status from deployment API if available
      try {
        const deploymentResponse = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}/deployment`, {
          headers
        });
        if (deploymentResponse.ok) {
          const deploymentData = await deploymentResponse.json();
          if (deploymentData.status === 'deployed' && (deploymentData.customDomain || deploymentData.vercelDomain)) {
            isWebsiteDeployed = true;
          }
        }
      } catch (error) {
        // Ignore deployment check errors, fall back to template data check
        console.log('Deployment status check failed, using template data:', error);
      }
      
      // Check ads existence
      let hasAds = false;
      if (projectData.ads_data) {
        try {
          const adsData = JSON.parse(projectData.ads_data);
          hasAds = !!(adsData && (adsData.linkedIn || adsData.meta || adsData.instagram));
        } catch (error) {
          console.error('Error parsing ads data:', error);
        }
      }
      
      // Update workflow status state
      setWebsiteDeployed(isWebsiteDeployed);
      setAdsExist(hasAds);
      
      // Dispatch custom event to update navbar workflow progress bar
      try {
        window.dispatchEvent(new CustomEvent('ad-creatives:workflow-status', {
          detail: {
            websiteDeployed: isWebsiteDeployed,
            adsExist: hasAds
          }
        }));
      } catch (error) {
        console.error('Error dispatching workflow status event:', error);
      }
      
      // Load existing ads data if available
      if (projectData.ads_data) {
        try {
          const adsData = JSON.parse(projectData.ads_data);
          if (adsData.linkedIn) {
            setLinkedInCopy(adsData.linkedIn.copy || placeholderAdsData.linkedIn.copy);
            setLinkedInVisual(adsData.linkedIn.visual || placeholderAdsData.linkedIn.visual);
          }
          if (adsData.meta) {
            setMetaCopy(adsData.meta.copy || placeholderAdsData.meta.copy);
            setMetaVisual(adsData.meta.visual || placeholderAdsData.meta.visual);
          }
          if (adsData.instagram) {
            setInstagramCopy(adsData.instagram.copy || placeholderAdsData.instagram.copy);
            setInstagramVisual(adsData.instagram.visual || placeholderAdsData.instagram.visual);
          }
        } catch (error) {
          console.error('Error parsing ads data:', error);
        }
      }

      // Load business logo and name from template data if available
      if (projectData.template_data) {
        try {
          const templateData = JSON.parse(projectData.template_data);
          
          // Prefer businessName from template_data for display
          if (templateData.businessName) {
            setProjectName(templateData.businessName);
          } else if (projectData.project_name) {
            setProjectName(projectData.project_name);
          }
          
          // Update business logo for all platforms
          if (templateData.businessLogoUrl) {
            const logoUrl = templateData.businessLogoUrl;
            setLinkedInVisual(prev => ({ ...prev, logoUrl }));
            setMetaVisual(prev => ({ ...prev, logoUrl }));
            setInstagramVisual(prev => ({ ...prev, logoUrl }));
          }
          
          // Update business name for all platforms
          if (templateData.businessName) {
            const businessName = templateData.businessName;
            setLinkedInVisual(prev => ({ ...prev, brandName: businessName }));
            setMetaVisual(prev => ({ ...prev, brandName: businessName }));
            setInstagramVisual(prev => ({ ...prev, brandName: businessName }));
          }
        } catch (error) {
          console.error('Error parsing template data:', error);
        }
      } else {
        // No template_data: fall back to project_name
        if (projectData?.project_name) setProjectName(projectData.project_name);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAdsData = useCallback(async (adsData, imageUrl, imageId) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ads_data: JSON.stringify(adsData),
          ads_generated_at: new Date().toISOString(),
          ads_image_url: imageUrl,
          ads_image_id: imageId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save ads data');
      }

      console.log('Ads data saved successfully');
    } catch (error) {
      console.error('Error saving ads data:', error);
    }
  }, [projectId, session]);

  const generateAdsWithAI = useCallback(async () => {
    if (!project) return;

    try {
      setIsGenerating(true);
      try { window.dispatchEvent(new CustomEvent('ad-creatives:loading', { detail: { isGenerating: true } })); } catch {}
      
      // Call AI to generate ads content and image
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/generate-ads-with-ai`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId: projectId,
          projectData: {
            // The AI will fetch business name from database using projectId
            templateData: project.template_data ? JSON.parse(project.template_data) : {},
            files: project.files ? JSON.parse(project.files) : {}
          }
        })
      });
      if (response.status === 402) {
        setShowUpgradeModal(true);
        return;
      }
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.adsData) {
          // Update ads data with AI-generated content
          const { linkedIn, meta, instagram, imageUrl, imageId } = result.adsData;
          
          if (linkedIn) {
            setLinkedInCopy(linkedIn.copy);
            setLinkedInVisual(prev => ({ ...prev, ...linkedIn.visual, imageUrl }));
          }
          if (meta) {
            setMetaCopy(meta.copy);
            setMetaVisual(prev => ({ ...prev, ...meta.visual, imageUrl }));
          }
          if (instagram) {
            setInstagramCopy(instagram.copy);
            setInstagramVisual(prev => ({ ...prev, ...instagram.visual, imageUrl }));
          }

          // Save ads data to database with the newly generated content
          await saveAdsData({
            linkedIn: { copy: linkedIn.copy, visual: linkedIn.visual },
            meta: { copy: meta.copy, visual: meta.visual },
            instagram: { copy: instagram.copy, visual: instagram.visual }
          }, imageUrl, imageId);

          // Update workflow status after successful ads generation
          setAdsExist(true);
          try {
            window.dispatchEvent(new CustomEvent('ad-creatives:workflow-status', {
              detail: {
                websiteDeployed: websiteDeployed,
                adsExist: true
              }
            }));
          } catch (error) {
            console.error('Error dispatching workflow status event:', error);
          }

          alert('Ads generated successfully with AI!');
          // Refresh credits after successful generation (costs 3 credits)
          try { await refreshCredits(); } catch (_) {}
          
          // Auto-switch to Preview page on mobile after successful generation
          if (isMobile) {
            setMobileView('preview');
          }
        } else {
          throw new Error(result.error || 'Failed to generate ads');
        }
      } else {
        throw new Error('Failed to generate ads');
      }
    } catch (error) {
      console.error('Error generating ads:', error);
      alert('Failed to generate ads. Please try again.');
    } finally {
      setIsGenerating(false);
      try { window.dispatchEvent(new CustomEvent('ad-creatives:loading', { detail: { isGenerating: false } })); } catch {}
    }
  }, [project, projectId, saveAdsData]);

  // Function to save user edits to ads copy
  const saveAdsEdits = useCallback(async () => {
    try {
      const currentAdsData = {
        linkedIn: { copy: linkedInCopy, visual: linkedInVisual },
        meta: { copy: metaCopy, visual: metaVisual },
        instagram: { copy: instagramCopy, visual: instagramVisual }
      };

      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ads_data: JSON.stringify(currentAdsData),
          ads_generated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save ads edits');
      }

      // Update workflow status after successful ads save
      setAdsExist(true);
      try {
        window.dispatchEvent(new CustomEvent('ad-creatives:workflow-status', {
          detail: {
            websiteDeployed: websiteDeployed,
            adsExist: true
          }
        }));
      } catch (error) {
        console.error('Error dispatching workflow status event:', error);
      }

      alert('Ads edits saved successfully!');
      console.log('Ads edits saved successfully');
    } catch (error) {
      console.error('Error saving ads edits:', error);
      alert('Failed to save ads edits. Please try again.');
    }
  }, [linkedInCopy, linkedInVisual, metaCopy, metaVisual, instagramCopy, instagramVisual, projectId, session]);

  // Prevent page scroll when hovering controls: only scroll the inner controls container
  const handleControlsWheel = useCallback((e) => {
    const el = e.currentTarget;
    const delta = e.deltaY;
    const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight;
    const canScrollUp = el.scrollTop > 0;
    // If the inner container can scroll in the wheel direction, prevent default page scroll
    if ((delta > 0 && canScrollDown) || (delta < 0 && canScrollUp)) {
      e.preventDefault();
      e.stopPropagation();
      el.scrollTop += delta;
    }
  }, []);

  const handleNavigateToWebsiteCreation = () => {
    setShowWorkflowPanel(false);
    onNavigateToChat(projectId);
  };

  // Wire up global navbar actions for generate/save
  useEffect(() => {
    const onGenerate = () => generateAdsWithAI();
    const onSave = () => saveAdsEdits();
    window.addEventListener('ad-creatives:generate', onGenerate);
    window.addEventListener('ad-creatives:save', onSave);
    return () => {
      window.removeEventListener('ad-creatives:generate', onGenerate);
      window.removeEventListener('ad-creatives:save', onSave);
    };
  }, [generateAdsWithAI, saveAdsEdits]);

  // Update image URLs with fallbacks - only use fallbacks if project has existing ads data
  const linkedInVisualWithFallback = {
    ...linkedInVisual,
    imageUrl: linkedInVisual.imageUrl || (project?.ads_data ? fallbackImages.linkedIn : null),
    logoUrl: linkedInVisual.logoUrl || (project?.ads_data ? fallbackImages.logo : null)
  };

  const metaVisualWithFallback = {
    ...metaVisual,
    imageUrl: metaVisual.imageUrl || (project?.ads_data ? fallbackImages.meta : null),
    logoUrl: metaVisual.logoUrl || (project?.ads_data ? fallbackImages.logo : null)
  };

  const instagramVisualWithFallback = {
    ...instagramVisual,
    imageUrl: instagramVisual.imageUrl || (project?.ads_data ? fallbackImages.instagram : null),
    logoUrl: instagramVisual.logoUrl || (project?.ads_data ? fallbackImages.logo : null)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Project</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showUpgradeModal && (
        <PricingModal
          onPlanSelect={() => { /* no-op for now */ }}
          onClose={() => setShowUpgradeModal(false)}
          showUpgradeMessage={true}
          currentPlanType="free"
          upgradeTitle="You're out of credits"
          upgradeDescription="Free plan includes 15 credits. Upgrade to a paid plan to get a higher monthly credit allowance and continue generating."
        />
      )}
      {/* Mobile Header - Only show on mobile screens */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center h-16 px-4 w-full max-w-full overflow-visible">
            {/* Logo - positioned at far left */}
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/jetsy_colorful_transparent_horizontal.png" 
                alt="Jetsy" 
                className="h-8 w-auto max-w-[80px]"
              />
            </div>

            {/* Centered Project Name Button */}
            <div className="flex-1 flex justify-center min-w-0 px-2">
              <button
                onClick={() => setShowWorkflowPanel(true)}
                className="flex items-center space-x-2 text-center hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors min-w-0 relative max-w-full"
              >
                <span className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[160px]">
                  {projectName || project?.project_name || 'Loading...'}
                </span>
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button 
                onClick={saveAdsEdits}
                className="px-2 sm:px-3 py-2 text-xs font-medium bg-black hover:bg-gray-800 text-white rounded-lg transition-colors whitespace-nowrap">
                Save
              </button>
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
                      onClick={() => { setShowAccountMenu(false); try { window.location.href = '/profile'; } catch (_) {} }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </button>
                    <button
                      onClick={async () => {
                        setShowAccountMenu(false);
                        try { await signOut?.(); } catch (_) {}
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-6 py-6 ${isMobile ? 'pt-24' : ''} ${isMobile ? 'w-full overflow-x-hidden' : ''}`}>
        
        {/* Generate Button - Only show on mobile in Ads Copy mode */}
        {isMobile && mobileView === 'ads-copy' && (
          <div className="mb-4">
            <button
              onClick={generateAdsWithAI}
              disabled={isGenerating}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isGenerating 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Generating...</span>
                </span>
              ) : (
                '✨ Generate Ad with AI'
              )}
            </button>
          </div>
        )}

        {/* Project Headline with Credits Badge */
        }
        {(!isMobile || mobileView === 'ads-copy') && (
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {(projectName || project?.project_name || 'Project')} - Ads Creative
            </h1>
            <div className="flex items-center space-x-2">
              {/* Upgrade button to open Pricing modal */}
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm inline-flex items-center gap-1.5"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                  <path d="M17.665 10C17.665 10.6877 17.1785 11.2454 16.5488 11.3945L16.4219 11.4189C14.7098 11.6665 13.6129 12.1305 12.877 12.8623C12.1414 13.5938 11.6742 14.6843 11.4238 16.3887C11.3197 17.0973 10.7182 17.665 9.96484 17.665C9.27085 17.665 8.68836 17.1772 8.53613 16.5215C8.12392 14.7459 7.6623 13.619 6.95703 12.8652C6.31314 12.1772 5.39414 11.7268 3.88672 11.4688L3.57715 11.4199C2.88869 11.319 2.33496 10.734 2.33496 10C2.33496 9.26603 2.88869 8.681 3.57715 8.58008L3.88672 8.53125C5.39414 8.27321 6.31314 7.82277 6.95703 7.13477C7.6623 6.38104 8.12392 5.25413 8.53613 3.47852L8.56934 3.35742C8.76133 2.76356 9.31424 2.33496 9.96484 2.33496C10.7182 2.33497 11.3197 2.9027 11.4238 3.61133L11.5283 4.22266C11.7954 5.58295 12.2334 6.49773 12.877 7.1377C13.6129 7.86952 14.7098 8.33351 16.4219 8.58105C17.1119 8.68101 17.665 9.26667 17.665 10Z"></path>
                </svg>
                Upgrade your plan
              </button>
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 12.5l7-4.5-7-4.5v9z" />
                  </svg>
                  <span>
                    {creditsLoading ? (
                      <span className="inline-flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      `${userCredits || 0} Credits`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Copywriting Note (Sabri Suby) - Hidden on mobile when in Preview mode */}
        {(!isMobile || mobileView === 'ads-copy') && (
          <div className="mb-3 flex items-center text-sm text-gray-600">
            <img
              src="/sabri_suby.jpg"
              alt="Sabri Suby"
              className="w-5 h-5 rounded-full mr-2 border border-gray-200 object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span>
              {isMobile ? (
                <>Our AI uses <a href="https://www.youtube.com/@SabriSubyOfficial" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center"><SiYoutube className="w-3 h-3 mr-1 text-red-600" />Sabri Suby</a>'s $100M+ direct‑response strategies to craft ads that convert.</>
              ) : (
                <>Our AI follows <a href="https://www.youtube.com/@SabriSubyOfficial" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center"><SiYoutube className="w-3 h-3 mr-1 text-red-600" />Sabri Suby</a>'s direct‑response principles ("irresistible offers"). He's a $100M+ entrepreneur and marketing strategist (author of "Sell Like Crazy") known for engineering high‑converting, offer‑driven campaigns—so your ads are crafted to win attention and drive action.</>
              )}
            </span>
          </div>
        )}

        {/* Platform Toggle - Only show in Ads Copy view */}
        {(!isMobile || mobileView === 'ads-copy') && (
          <div className="mb-0 w-full overflow-x-hidden">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit max-w-full">
              <button
                onClick={() => setActivePlatform('linkedin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activePlatform === 'linkedin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SiLinkedin className="w-4 h-4 text-blue-600" />
                <span>LinkedIn Ads</span>
              </button>
              <button
                onClick={() => setActivePlatform('meta')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activePlatform === 'meta'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SiFacebook className="w-4 h-4 text-blue-600" />
                <span>Meta Ads</span>
              </button>
              <button
                onClick={() => setActivePlatform('instagram')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activePlatform === 'instagram'
                    ? 'bg-white text-pink-500 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SiInstagram className="w-4 h-4 text-pink-500" />
                <span>Instagram Ads</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Responsive Layout */}
        <div className={`${isMobile ? 'block w-full overflow-x-hidden' : 'flex flex-col lg:flex-row'} gap-6`}>
          {/* Left Column - Controls (Ads Copy view) */}
          {(!isMobile || mobileView === 'ads-copy') && (
            <div className={`${isMobile ? 'w-full' : 'lg:w-1/3'}`}>
              <div
                className={`${isMobile ? 'max-h-[calc(100vh-200px)]' : 'max-h-[calc(100vh-112px)]'} overflow-y-auto pr-2`}
                onWheel={handleControlsWheel}
              >
                {activePlatform === 'linkedin' ? (
                  <AdControls
                    copy={linkedInCopy}
                    visual={linkedInVisual}
                    aspectRatio={linkedInAspectRatio}
                    platform="linkedin"
                    onCopyChange={setLinkedInCopy}
                    onVisualChange={setLinkedInVisual}
                    onAspectRatioChange={setLinkedInAspectRatio}
                    projectId={projectId}
                    onCreditsRefresh={refreshCredits}
                  />
                ) : activePlatform === 'meta' ? (
                  <AdControls
                    copy={metaCopy}
                    visual={metaVisual}
                    aspectRatio={metaAspectRatio}
                    platform="meta"
                    onCopyChange={setMetaCopy}
                    onVisualChange={setMetaVisual}
                    onAspectRatioChange={setMetaAspectRatio}
                    projectId={projectId}
                    onCreditsRefresh={refreshCredits}
                  />
                ) : (
                  <AdControls
                    copy={instagramCopy}
                    visual={instagramVisual}
                    aspectRatio={instagramAspectRatio}
                    platform="instagram"
                    onCopyChange={setInstagramCopy}
                    onVisualChange={setInstagramVisual}
                    onAspectRatioChange={setInstagramAspectRatio}
                    projectId={projectId}
                    onCreditsRefresh={refreshCredits}
                  />
                )}
              </div>
            </div>
          )}

          {/* Right Column - Preview */}
          {(!isMobile || mobileView === 'preview') && (
            <div className={`${isMobile ? 'w-full' : 'lg:w-2/3'}`}>
              {/* Platform Toggle for Preview mode - Show on mobile when in preview */}
              {(isMobile && mobileView === 'preview') && (
                <div className="mb-4 w-full overflow-x-hidden">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit max-w-full">
                    <button
                      onClick={() => setActivePlatform('linkedin')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                        activePlatform === 'linkedin'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <SiLinkedin className="w-4 h-4 text-blue-600" />
                      <span>LinkedIn Ads</span>
                    </button>
                    <button
                      onClick={() => setActivePlatform('meta')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                        activePlatform === 'meta'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <SiFacebook className="w-4 h-4 text-blue-600" />
                      <span>Meta Ads</span>
                    </button>
                    <button
                      onClick={() => setActivePlatform('instagram')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                        activePlatform === 'instagram'
                          ? 'bg-white text-pink-500 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <SiInstagram className="w-4 h-4 text-pink-500" />
                      <span>Instagram Ads</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {activePlatform === 'linkedin' ? (
                  <div className="flex justify-center">
                    <LinkedInSingleImageAdPreview
                      copy={linkedInCopy}
                      visual={linkedInVisualWithFallback}
                      aspectRatio={linkedInAspectRatio}
                    />
                  </div>
                ) : activePlatform === 'meta' ? (
                  <div className="flex justify-center">
                    <MetaFeedSingleImageAdPreview
                      copy={metaCopy}
                      visual={metaVisualWithFallback}
                      aspectRatio={metaAspectRatio}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <InstagramSingleImageAdPreview
                      copy={instagramCopy}
                      visual={instagramVisualWithFallback}
                      aspectRatio={instagramAspectRatio}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toggle Bar - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-transparent z-30">
        <div className="flex items-center justify-center px-3 py-2 w-full max-w-full overflow-hidden">
          {/* Centered compact toggle buttons */}
          <div className="flex items-center gap-2 mx-auto flex-shrink-0">
            <button
              onClick={() => setMobileView('ads-copy')}
              className={`w-24 sm:w-28 h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${
                mobileView === 'ads-copy'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs sm:text-sm">Ads Copy</span>
            </button>

            <button
              onClick={() => setMobileView('preview')}
              className={`w-24 sm:w-28 h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${
                mobileView === 'preview'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs sm:text-sm">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Panel */}
      {showWorkflowPanel && (
        <div className={`workflow-panel-container ${isMobile ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : 'border-b border-gray-200 bg-gray-50'}`}>
          <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl max-h-[80vh] overflow-y-auto' : 'p-4'}`}>
            <div className="space-y-4">
              {/* Mobile Header */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                  <button
                    onClick={() => setShowWorkflowPanel(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className={`${isMobile ? 'p-4' : ''}`}>
                {/* Workflow Progress */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{isMobile ? 'Launch your business 🚀' : 'Website Creation Progress'}</h3>
                  <div className="space-y-3">
                    {/* Step 1: Website Creation */}
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        websiteDeployed 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <span className="text-lg">🌐</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Navigate back to website creation
                          handleNavigateToWebsiteCreation();
                        }}
                        className={`text-sm font-medium px-3 py-1 rounded-lg shadow-sm transition-colors border ${
                          websiteDeployed
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                        }`}
                        aria-label="Go to Website creation"
                      >
                        Website creation
                      </button>
                    </div>
                    
                    {/* Step 2: Ads Creation */}
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        adsExist 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-blue-500 text-white shadow-md shadow-blue-300/50'
                      }`}>
                        <span className="text-lg">📢</span>
                      </div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-lg border ${
                        adsExist
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-blue-50 text-gray-700 border-blue-200'
                      }`}>
                        Ads creation
                      </span>
                    </div>
                    
                    {/* Connector line between steps (hidden on mobile to avoid stray blue line) */}
                    <div className="flex justify-center">
                      <div className={`hidden w-0.5 h-6 transition-colors duration-200 ${
                        websiteDeployed && adsExist ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    </div>
                    
                    {/* Step 3: Launch and Monitor */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                        <span className="text-lg">🚀</span>
                      </div>
                      <button
                        onClick={() => {
                          // Navigate to launch and monitor page
                          onNavigateToLaunch(projectId);
                        }}
                        className="text-sm font-medium px-3 py-1 rounded-lg shadow-sm transition-colors border bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      >
                        Launch and monitor
                      </button>
                    </div>
                    
                  </div>
                </div>
                
                {/* Data Analytics Button */}
                <button
                  onClick={() => {
                    // Navigate to data analytics page
                    onNavigateToDataAnalytics(projectId);
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2 justify-center mt-4"
                >
                  <span>Data Analytics</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-500">
                    <path d="M5 3a1 1 0 0 1 1 1v14h12a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1h1Zm4.5 5a1 1 0 0 1 1 1v7h-2v-7a1 1 0 0 1 1-1Zm4 -2a1 1 0 0 1 1 1v9h-2V7a1 1 0 0 1 1-1Zm4 4a1 1 0 0 1 1 1v5h-2v-5a1 1 0 0 1 1-1Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdCreativesPage;
