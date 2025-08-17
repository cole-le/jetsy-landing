import React, { useState } from 'react';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import AdControls from './ads-template/AdControls';

const AdsTemplatePage = ({ onBackToHome }) => {
  // Demo data as specified in requirements
  const demoLinkedIn = {
    copy: {
      primaryText: "How founders validate demand before building. See the 3-step playbook.",
      headline: "Validate ideas in days",
      cta: "LEARN_MORE",
    },
    visual: {
      imageUrl: "/demo/ads/farm-goat.jpg",
      logoUrl: "/demo/logos/jetsy.png",
      brandName: "Jetsy",
      verified: true,
    },
  };

  const demoMeta = {
    copy: {
      primaryText: "Test if people will pay for your idea with a simple landing page + traffic.",
      headline: "Start validating today",
      cta: "SIGN_UP",
    },
    visual: {
      imageUrl: "/demo/ads/founder-laptop.jpg",
      logoUrl: "/demo/logos/jetsy.png",
      brandName: "Jetsy",
    },
  };

  // State management
  const [linkedInCopy, setLinkedInCopy] = useState(demoLinkedIn.copy);
  const [linkedInVisual, setLinkedInVisual] = useState(demoLinkedIn.visual);
  const [metaCopy, setMetaCopy] = useState(demoMeta.copy);
  const [metaVisual, setMetaVisual] = useState(demoMeta.visual);
  const [linkedInAspectRatio, setLinkedInAspectRatio] = useState('1200×628');
  const [metaAspectRatio, setMetaAspectRatio] = useState('1080×1350');

  // Fallback image URLs for demo purposes
  const fallbackImages = {
    linkedIn: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=628&fit=crop&crop=center',
    meta: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center'
  };

  // Use fallback images if demo URLs don't work
  const getLinkedInImageUrl = () => {
    return linkedInVisual.imageUrl.startsWith('/demo/') ? fallbackImages.linkedIn : linkedInVisual.imageUrl;
  };

  const getMetaImageUrl = () => {
    return metaVisual.imageUrl.startsWith('/demo/') ? fallbackImages.meta : metaVisual.imageUrl;
  };

  const getLogoUrl = () => {
    return linkedInVisual.logoUrl.startsWith('/demo/') ? fallbackImages.logo : linkedInVisual.logoUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <span className="font-medium">Ads Template</span>
            </div>
          </div>
          
          {/* Back Button */}
          <button
            onClick={onBackToHome}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Ads Template</h1>
          <p className="text-gray-600">Create and preview LinkedIn and Meta (Facebook/Instagram) single image ads</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <AdControls
              copy={linkedInCopy}
              visual={linkedInVisual}
              linkedInAspectRatio={linkedInAspectRatio}
              metaAspectRatio={metaAspectRatio}
              onCopyChange={setLinkedInCopy}
              onVisualChange={setLinkedInVisual}
              onLinkedInAspectRatioChange={setLinkedInAspectRatio}
              onMetaAspectRatioChange={setMetaAspectRatio}
            />
          </div>

          {/* Right Column - Ad Previews */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* LinkedIn Preview */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">LinkedIn Single Image Ad</h2>
                <div className="flex justify-center">
                  <LinkedInSingleImageAdPreview
                    copy={linkedInCopy}
                    visual={{
                      ...linkedInVisual,
                      imageUrl: getLinkedInImageUrl(),
                      logoUrl: getLogoUrl()
                    }}
                    aspectRatio={linkedInAspectRatio}
                  />
                </div>
              </div>

              {/* Meta Preview */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Meta Feed Single Image Ad</h2>
                <div className="flex justify-center">
                  <MetaFeedSingleImageAdPreview
                    copy={metaCopy}
                    visual={{
                      ...metaVisual,
                      imageUrl: getMetaImageUrl(),
                      logoUrl: getLogoUrl()
                    }}
                    aspectRatio={metaAspectRatio}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Guidelines */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-blue-600 mr-2">💼</span>
                LinkedIn Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Intro text: Keep under 150 characters to avoid truncation</li>
                <li>• Headline: Maximum 70 characters for optimal display</li>
                <li>• Image ratios: 1:1 (square) or 1200×628 (landscape)</li>
                <li>• Professional tone with minimal text overlay</li>
                <li>• Focus on business value and industry insights</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-pink-600 mr-2">📱</span>
                Meta (Facebook/Instagram) Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Primary text: Keep under 125 characters for feed preview</li>
                <li>• Headline: Maximum 40 characters when shown</li>
                <li>• Image ratios: 1080×1350 (portrait) or 1080×1080 (square)</li>
                <li>• Engaging visuals with balanced text overlay</li>
                <li>• Use hashtags and conversational tone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsTemplatePage;
