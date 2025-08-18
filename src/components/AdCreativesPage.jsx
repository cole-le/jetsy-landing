import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../config/environment';
import WorkflowProgressBar from './WorkflowProgressBar';
import { FaFacebook, FaLinkedin, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { SiLinkedin, SiFacebook, SiInstagram } from 'react-icons/si';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import InstagramSingleImageAdPreview from './ads-template/InstagramSingleImageAdPreview';
import AdControls from './ads-template/AdControls';

const AdCreativesPage = ({ projectId, onNavigateToChat }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default Ferrari ads template data for first load
  const defaultAdsData = {
    linkedIn: {
      copy: {
        primaryText: "Experience the thrill of luxury performance with our exclusive Ferrari collection.",
        headline: "Luxury Redefined",
        description: "Premium automotive excellence",
        cta: "LEARN_MORE",
        linkUrl: "https://www.ferrari.com",
      },
      visual: {
        imageUrl: "/ferrari.jpg",
        logoUrl: "/ferrari_logo.jpg",
        brandName: "Ferrari",
        verified: true,
      },
    },
    meta: {
      copy: {
        primaryText: "Discover the perfect blend of power and elegance in our latest Ferrari models.",
        headline: "Power Meets Elegance",
        description: "Unmatched performance",
        cta: "SIGN_UP",
        linkUrl: "https://www.ferrari.com",
      },
      visual: {
        imageUrl: "/ferrari.jpg",
        logoUrl: "/ferrari_logo.jpg",
        brandName: "Ferrari",
      },
    },
    instagram: {
      copy: {
        primaryText: "Feel the adrenaline rush with our stunning Ferrari sports cars.",
        headline: "Adrenaline Rush",
        description: "Pure driving pleasure",
        cta: "GET_STARTED",
        linkUrl: "https://www.ferrari.com",
      },
      visual: {
        imageUrl: "/ferrari.jpg",
        logoUrl: "/ferrari_logo.jpg",
        brandName: "Ferrari",
      },
    },
  };

  // State management for ads
  const [activePlatform, setActivePlatform] = useState('linkedin');
  const [linkedInCopy, setLinkedInCopy] = useState(defaultAdsData.linkedIn.copy);
  const [linkedInVisual, setLinkedInVisual] = useState(defaultAdsData.linkedIn.visual);
  const [metaCopy, setMetaCopy] = useState(defaultAdsData.meta.copy);
  const [metaVisual, setMetaVisual] = useState(defaultAdsData.meta.visual);
  const [instagramCopy, setInstagramCopy] = useState(defaultAdsData.instagram.copy);
  const [instagramVisual, setInstagramVisual] = useState(defaultAdsData.instagram.visual);
  const [linkedInAspectRatio, setLinkedInAspectRatio] = useState('1200×628');
  const [metaAspectRatio, setMetaAspectRatio] = useState('1:1');
  const [instagramAspectRatio, setInstagramAspectRatio] = useState('1080×1080');

  // Fallback image URLs for demo purposes
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
            setLinkedInCopy(adsData.linkedIn.copy || defaultAdsData.linkedIn.copy);
            setLinkedInVisual(adsData.linkedIn.visual || defaultAdsData.linkedIn.visual);
          }
          if (adsData.meta) {
            setMetaCopy(adsData.meta.copy || defaultAdsData.meta.copy);
            setMetaVisual(adsData.meta.visual || defaultAdsData.meta.visual);
          }
          if (adsData.instagram) {
            setInstagramCopy(adsData.instagram.copy || defaultAdsData.instagram.copy);
            setInstagramVisual(adsData.instagram.visual || defaultAdsData.instagram.visual);
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

  const generateAdsWithAI = async () => {
    if (!project) return;

    try {
      setIsGenerating(true);
      
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

          // Save ads data to database
          await saveAdsData({
            linkedIn: { copy: linkedInCopy, visual: { ...linkedInVisual, imageUrl } },
            meta: { copy: metaCopy, visual: { ...metaVisual, imageUrl } },
            instagram: { copy: instagramCopy, visual: { ...instagramVisual, imageUrl } }
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
    }
  };

  const saveAdsData = async (adsData, imageUrl, imageId) => {
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
  };

  const handleNavigateToWebsiteCreation = () => {
    onNavigateToChat(projectId);
  };

  // Update image URLs with fallbacks
  const linkedInVisualWithFallback = {
    ...linkedInVisual,
    imageUrl: linkedInVisual.imageUrl || fallbackImages.linkedIn,
    logoUrl: linkedInVisual.logoUrl || fallbackImages.logo
  };

  const metaVisualWithFallback = {
    ...metaVisual,
    imageUrl: metaVisual.imageUrl || fallbackImages.meta,
    logoUrl: metaVisual.logoUrl || fallbackImages.logo
  };

  const instagramVisualWithFallback = {
    ...instagramVisual,
    imageUrl: instagramVisual.imageUrl || fallbackImages.instagram,
    logoUrl: instagramVisual.logoUrl || fallbackImages.logo
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
      {/* Header with Jetsy branding and workflow progress */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/jetsy_logo2.png" 
              alt="Jetsy" 
              className="h-8 w-auto"
            />
            <div className="text-sm text-gray-600">
              <span className="font-medium">{project?.project_name}</span>
            </div>
          </div>
          
          {/* Workflow Progress Bar */}
          <WorkflowProgressBar 
            currentStage={2} 
            onStageClick={(stageId) => {
              if (stageId === 1) {
                handleNavigateToWebsiteCreation();
              }
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Ads Creation</h1>
          <p className="text-gray-600">Generate high-converting ad creatives for your business</p>
        </div>

        {/* AI Generation Button */}
        <div className="mb-8">
          <button
            onClick={generateAdsWithAI}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? 'Generating Ads with AI...' : '🎨 Generate Ad with AI'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            AI will analyze your business and generate compelling ad copy and images for all platforms
          </p>
        </div>

        {/* Platform Toggle */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
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
          {/* Left Column - Controls */}
          <div className="lg:w-1/3">
            {activePlatform === 'linkedin' ? (
              <AdControls
                copy={linkedInCopy}
                visual={linkedInVisual}
                aspectRatio={linkedInAspectRatio}
                platform="linkedin"
                onCopyChange={setLinkedInCopy}
                onVisualChange={setLinkedInVisual}
                onAspectRatioChange={setLinkedInAspectRatio}
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
              />
            )}
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
