import React, { useState } from 'react';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import InstagramSingleImageAdPreview from './ads-template/InstagramSingleImageAdPreview';
import AdControls from './ads-template/AdControls';

const AdsTemplatePage = ({ onBackToHome }) => {
  // Demo data as specified in requirements
  const demoLinkedIn = {
    copy: {
      primaryText: "Experience the thrill of luxury performance with our exclusive Ferrari collection.",
      headline: "Luxury Redefined",
      description: "Premium automotive excellence",
      cta: "LEARN_MORE",
    },
    visual: {
      imageUrl: "/ferrari.jpg",
      logoUrl: "/ferrari_logo.jpg",
      brandName: "Ferrari",
      verified: true,
    },
  };

  const demoMeta = {
    copy: {
      primaryText: "Discover the perfect blend of power and elegance in our latest Ferrari models.",
      headline: "Power Meets Elegance",
      description: "Unmatched performance",
      cta: "SIGN_UP",
    },
    visual: {
      imageUrl: "/ferrari.jpg",
      logoUrl: "/ferrari_logo.jpg",
      brandName: "Ferrari",
    },
  };

  const demoInstagram = {
    copy: {
      primaryText: "Feel the adrenaline rush with our stunning Ferrari sports cars.",
      headline: "Adrenaline Rush",
      description: "Pure driving pleasure",
      cta: "GET_STARTED",
    },
    visual: {
      imageUrl: "/ferrari.jpg",
      logoUrl: "/ferrari_logo.jpg",
      brandName: "Ferrari",
    },
  };

  // State management
  const [activePlatform, setActivePlatform] = useState('linkedin'); // 'linkedin', 'meta', or 'instagram'
  const [linkedInCopy, setLinkedInCopy] = useState(demoLinkedIn.copy);
  const [linkedInVisual, setLinkedInVisual] = useState(demoLinkedIn.visual);
  const [metaCopy, setMetaCopy] = useState(demoMeta.copy);
  const [metaVisual, setMetaVisual] = useState(demoMeta.visual);
  const [instagramCopy, setInstagramCopy] = useState(demoInstagram.copy);
  const [instagramVisual, setInstagramVisual] = useState(demoInstagram.visual);
  const [linkedInAspectRatio, setLinkedInAspectRatio] = useState('1200×628');
  const [metaAspectRatio, setMetaAspectRatio] = useState('1200×628'); // Facebook landscape format
  const [instagramAspectRatio, setInstagramAspectRatio] = useState('1080×1080'); // Instagram square format

  // Fallback image URLs for demo purposes - using Ferrari image as backup
  const fallbackImages = {
    linkedIn: '/ferrari.jpg',
    meta: '/ferrari.jpg',
    instagram: '/ferrari.jpg',
    logo: '/ferrari_logo.jpg'
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

  // Debug logging for image URLs
  console.log('LinkedIn image URL:', linkedInVisualWithFallback.imageUrl);
  console.log('Meta image URL:', metaVisualWithFallback.imageUrl);
  console.log('Instagram image URL:', instagramVisualWithFallback.imageUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToHome}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Ads Template Preview</h1>
          </div>
        </div>
      </div>

      {/* Platform Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActivePlatform('linkedin')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activePlatform === 'linkedin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            LinkedIn Ads
          </button>
          <button
            onClick={() => setActivePlatform('meta')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activePlatform === 'meta'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Meta (Facebook) Ads
          </button>
          <button
            onClick={() => setActivePlatform('instagram')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activePlatform === 'instagram'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Instagram Ads
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-6">
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

            {/* Platform Guidelines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Guidelines</h3>
              {activePlatform === 'linkedin' ? (
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>LinkedIn Single Image Ads:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Intro text: ~150 characters (truncates with "See more...")</li>
                    <li>Headline: ~70 characters (optional)</li>
                    <li>Image ratios: 1:1 (square) or 1200×628 (landscape)</li>
                    <li>Professional tone, business-focused content</li>
                    <li>CTA button appears below the image</li>
                  </ul>
                </div>
              ) : activePlatform === 'meta' ? (
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Meta (Facebook) Feed Ads:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Primary text: ~125 characters (truncates with "See more...")</li>
                    <li>Headline: ~40 characters (optional)</li>
                    <li>Description: ~25 characters (optional)</li>
                    <li>Image ratios: 1200×628 (landscape) - Facebook standard</li>
                    <li>Casual tone, engagement-focused content</li>
                    <li>CTA button appears below the image</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Instagram Feed Ads:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Primary text: ~125 characters (truncates with "See more...")</li>
                    <li>Headline: ~40 characters (optional)</li>
                    <li>Description: ~25 characters (optional)</li>
                    <li>Image ratios: 1080×1080 (square) or 1080×1350 (portrait)</li>
                    <li>Visual-first content, minimal text overlay</li>
                    <li>CTA button appears below the image</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsTemplatePage;
