import React, { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../config/environment';
import WorkflowProgressBar from './WorkflowProgressBar';
import { FaFacebook, FaLinkedin, FaInstagram, FaFacebookF } from 'react-icons/fa';
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

          alert('Ads generated successfully with AI!');
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
      {/* Header removed; actions now in main Navbar via isAdCreativesMode */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* AI Copywriting Note (Sabri Suby) */}
        <div className="mb-3 flex items-center text-sm text-gray-600">
          <img
            src="/sabri_suby.jpg"
            alt="Sabri Suby"
            className="w-5 h-5 rounded-full mr-2 border border-gray-200 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span>
            Our AI follows <a href="https://www.youtube.com/@SabriSubyOfficial" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center"><SiYoutube className="w-3 h-3 mr-1 text-red-600" />Sabri Suby</a>’s direct‑response principles ("irresistible offers"). He’s a $100M+ entrepreneur and marketing strategist (author of “Sell Like Crazy”) known for engineering high‑converting, offer‑driven campaigns—so your ads are crafted to win attention and drive action.
          </span>
        </div>

        {/* Platform Toggle */}
        <div className="mb-0">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
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

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Controls (independent scroll) */}
          <div className="lg:w-1/3">
            <div
              className="max-h-[calc(100vh-112px)] overflow-y-auto pr-2"
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

          {/* Right Column - Preview */}
          <div className="lg:w-2/3">
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
        </div>
      </div>
    </div>
  );
};

export default AdCreativesPage;
