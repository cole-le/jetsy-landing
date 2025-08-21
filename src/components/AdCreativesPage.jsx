import React, { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../config/environment';
import { SiLinkedin, SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import InstagramSingleImageAdPreview from './ads-template/InstagramSingleImageAdPreview';
import AdControls from './ads-template/AdControls';

const AdCreativesPage = ({ projectId, onNavigateToChat }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('ads-copy'); // 'ads-copy' or 'preview'
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);

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

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`);
      
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
        const deploymentResponse = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}/deployment`);
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
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAdsData = useCallback(async (adsData, imageUrl, imageId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
  }, [projectId]);

  const generateAdsWithAI = useCallback(async () => {
    if (!project) return;

    try {
      setIsGenerating(true);
      try { window.dispatchEvent(new CustomEvent('ad-creatives:loading', { detail: { isGenerating: true } })); } catch {}
      
      // Call AI to generate ads content and image
      const response = await fetch(`${getApiBaseUrl()}/api/generate-ads-with-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          projectData: {
            // The AI will fetch business name from database using projectId
            templateData: project.template_data ? JSON.parse(project.template_data) : {},
            files: project.files ? JSON.parse(project.files) : {}
          }
        })
      });

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

      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
  }, [linkedInCopy, linkedInVisual, metaCopy, metaVisual, instagramCopy, instagramVisual, projectId]);

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
      {/* Mobile Header - Only show on mobile screens */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center h-16 px-4 w-full max-w-full overflow-hidden">
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
                  {project?.project_name || 'Loading...'}
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

        {/* Project Headline */}
        {(!isMobile || mobileView === 'ads-copy') && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {project?.project_name || 'Project'} - Ads Creative
            </h1>
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
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Website Creation Progress</h3>
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
                    
                    {/* Connector line between steps */}
                    <div className="flex justify-center">
                      <div className={`w-0.5 h-6 transition-colors duration-200 ${
                        websiteDeployed && adsExist ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    </div>
                    
                    {/* Step 3: Launch and Monitor */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                        <span className="text-lg">🚀</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Launch and monitor</span>
                    </div>
                    
                  </div>
                </div>
                
                {/* Data Analytics Button */}
                <button
                  onClick={() => {
                    // Navigate to data analytics page
                    window.location.href = `/data_analytics/project_${projectId}`;
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
