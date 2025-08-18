import React, { useState } from 'react';
import { FaFacebook, FaLinkedin, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { SiLinkedin, SiFacebook, SiInstagram } from 'react-icons/si';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import InstagramSingleImageAdPreview from './ads-template/InstagramSingleImageAdPreview';
import AdControls from './ads-template/AdControls';

const AdsTemplatePage = ({ onBackToHome }) => {
  // Placeholder data for ads template
  const placeholderLinkedIn = {
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
  };

  const placeholderMeta = {
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
  };

  const placeholderInstagram = {
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
  };

  // State management
  const [activePlatform, setActivePlatform] = useState('linkedin'); // 'linkedin', 'meta', or 'instagram'
  const [linkedInCopy, setLinkedInCopy] = useState(placeholderLinkedIn.copy);
  const [linkedInVisual, setLinkedInVisual] = useState(placeholderLinkedIn.visual);
  const [metaCopy, setMetaCopy] = useState(placeholderMeta.copy);
  const [metaVisual, setMetaVisual] = useState(placeholderMeta.visual);
  const [instagramCopy, setInstagramCopy] = useState(placeholderInstagram.copy);
  const [instagramVisual, setInstagramVisual] = useState(placeholderInstagram.visual);
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

  // Update image URLs with fallbacks - use null to trigger placeholder components
  const linkedInVisualWithFallback = {
    ...linkedInVisual,
    imageUrl: linkedInVisual.imageUrl || null,
    logoUrl: linkedInVisual.logoUrl || null
  };

  const metaVisualWithFallback = {
    ...metaVisual,
    imageUrl: metaVisual.imageUrl || null,
    logoUrl: metaVisual.logoUrl || null
  };

  const instagramVisualWithFallback = {
    ...instagramVisual,
    imageUrl: instagramVisual.imageUrl || null,
    logoUrl: instagramVisual.logoUrl || null
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
            <h1 className="text-2xl font-bold text-gray-900">Ads Template Preview</h1>
          </div>
        </div>
      </div>

      {/* Platform Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <SiInstagram className="w-4 h-4 text-pink-500" />
            <span>Instagram Ads</span>
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


          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsTemplatePage;
