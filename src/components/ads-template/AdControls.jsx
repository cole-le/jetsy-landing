import React, { useState } from 'react';
import { getApiBaseUrl } from '../../config/environment';

/**
 * Ad Controls Component for live-editing ad content and settings
 * @param {Object} props
 * @param {Object} props.copy - Ad copy content
 * @param {Object} props.visual - Visual elements
 * @param {string} props.aspectRatio - Image aspect ratio
 * @param {string} props.platform - Platform type ('linkedin', 'meta', or 'instagram')
 * @param {Function} props.onCopyChange - Callback for copy changes
 * @param {Function} props.onVisualChange - Callback for visual changes
 * @param {Function} props.onAspectRatioChange - Callback for aspect ratio changes
 * @param {string|number} props.projectId - Current project id for image uploads
 */
const AdControls = ({
  copy,
  visual,
  aspectRatio,
  platform,
  onCopyChange,
  onVisualChange,
  onAspectRatioChange,
  projectId
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const ctaOptions = [
    'LEARN_MORE',
    'SIGN_UP',
    'GET_OFFER',
    'SUBSCRIBE',
    'CONTACT_US',
    'DOWNLOAD',
    'APPLY',
    'APPLY_NOW',
    'BOOK_NOW',
    'GET_STARTED',
    'VIEW_QUOTE',
    'REGISTER',
    'JOIN',
    'ATTEND',
    'REQUEST_DEMO',
    'BUY_NOW',
    'SHOP_NOW'
  ];

  const handleCopyChange = (field, value) => {
    onCopyChange({
      ...copy,
      [field]: value
    });
    console.log('Copy changed:', field, value);
  };

  const handleVisualChange = (field, value) => {
    onVisualChange({
      ...visual,
      [field]: value
    });
    console.log('Visual changed:', field, value);
  };

  const handleUpload = async (file, targetField) => {
    if (!file || !projectId) return;
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('file', file);
      const res = await fetch(`${getApiBaseUrl()}/api/upload-image`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          handleVisualChange(targetField, data.url);
        }
      }
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  const isLinkedIn = platform === 'linkedin';
  const isMeta = platform === 'meta';
  const isInstagram = platform === 'instagram';

  const handleRegenerateCopy = async () => {
    try {
      setIsRegenerating(true);
      const resp = await fetch(`${getApiBaseUrl()}/api/generate-platform-ad-copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, platform })
      });
      if (!resp.ok) throw new Error('Failed to regenerate copy');
      const data = await resp.json();
      if (data.success && data.copy) {
        // Normalize payload to current copy shape
        if (platform === 'instagram') {
          onCopyChange({
            ...copy,
            description: data.copy.description || copy.description,
            headline: data.copy.headline || copy.headline,
            cta: data.copy.cta || copy.cta
          });
        } else {
          onCopyChange({
            ...copy,
            primaryText: data.copy.primaryText || copy.primaryText,
            headline: data.copy.headline || copy.headline,
            description: data.copy.description || copy.description,
            cta: data.copy.cta || copy.cta
          });
        }
      }
    } catch (e) {
      console.error('Regenerate copy failed:', e);
      alert('Failed to regenerate copy. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const [isImageRegenerating, setIsImageRegenerating] = useState(false);
  const handleGenerateImage = async () => {
    try {
      setIsImageRegenerating(true);
      const resp = await fetch(`${getApiBaseUrl()}/api/generate-ads-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (!resp.ok) throw new Error('Failed to generate image');
      const data = await resp.json();
      if (data.success && data.imageUrl) {
        onVisualChange({
          ...visual,
          imageUrl: data.imageUrl
        });
        // Note: not saved to DB; user must click Save Changes in header
      }
    } catch (e) {
      console.error('Generate image failed:', e);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsImageRegenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      
      <div className="space-y-6">
        {/* Aspect Ratio Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Image Aspect Ratio</h3>
          <div className="space-y-3">
            {isLinkedIn ? (
              <>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="linkedin-ratio"
                    value="1:1"
                    checked={aspectRatio === '1:1'}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1:1 (Square)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="linkedin-ratio"
                    value="1200×628"
                    checked={aspectRatio === '1200×628'}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1200×628 (Landscape)</span>
                </label>
              </>
            ) : isMeta ? (
              <>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="meta-ratio"
                    value="1:1"
                    checked={aspectRatio === '1:1'}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1:1 (Square)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="meta-ratio"
                    value="4:5"
                    checked={aspectRatio === '4:5'}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">4:5 (Vertical)</span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="instagram-ratio"
                    value="1080×1080"
                    checked={aspectRatio === '1080×1080'}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1080×1080 (Square) - Instagram Standard</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="instagram-ratio"
                    value="1080×1350"
                    checked={aspectRatio === '1080×1350'}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1080×1350 (Portrait) - Instagram Stories</span>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Copy Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Ad Copy</h3>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRegenerateCopy}
                className={`px-3 py-1.5 text-xs rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={isRegenerating}
                title="Regenerate this platform's copy with AI (not saved)"
              >
                {isRegenerating ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                    <span>Regenerating ...</span>
                  </span>
                ) : '✨ Regenerate Copy with AI'}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isLinkedIn ? 'Introductory Text' : isMeta ? 'Primary Text' : 'Description'} *
                <span className="text-xs text-gray-500 ml-2">
                  {isLinkedIn 
                    ? `${copy.primaryText.length}/3000 chars (LinkedIn)`
                    : isMeta
                    ? `${copy.primaryText.length}/125 chars (Meta)`
                    : `${copy.description?.length || 0}/2200 chars (Instagram) - Recommend 125 chars or less`
                  }
                </span>
              </label>
              <textarea
                value={isInstagram ? (copy.description || '') : copy.primaryText}
                onChange={(e) => handleCopyChange(isInstagram ? 'description' : 'primaryText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={`Enter your ${isLinkedIn ? 'introductory' : isMeta ? 'primary' : 'description'} ad text...`}
                maxLength={isLinkedIn ? 3000 : isMeta ? 125 : 2200}
              />
            </div>

            {/* Headline field - only for LinkedIn and Meta */}
            {!isInstagram && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isLinkedIn ? 'Headline *' : 'Headline (Optional)'}
                  <span className="text-xs text-gray-500 ml-2">
                    {isLinkedIn 
                      ? `${copy.headline?.length || 0}/200 chars (LinkedIn)`
                      : `${copy.headline?.length || 0}/40 chars (Meta)`
                    }
                  </span>
                </label>
                <input
                  type="text"
                  value={copy.headline || ''}
                  onChange={(e) => handleCopyChange('headline', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLinkedIn && !copy.headline ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={isLinkedIn ? "Enter your headline (required)..." : "Enter your headline (optional)..."}
                  maxLength={isLinkedIn ? 200 : 40}
                  required={isLinkedIn}
                />
              </div>
            )}

            {/* Description field - only for Meta */}
            {isMeta && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                  <span className="text-xs text-gray-500 ml-2">
                    {copy.description?.length || 0}/25 chars (Meta)
                  </span>
                </label>
                <input
                  type="text"
                  value={copy.description || ''}
                  onChange={(e) => handleCopyChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your description (optional)..."
                  maxLength={25}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call to Action
              </label>
              <select
                value={copy.cta || ''}
                onChange={(e) => handleCopyChange('cta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select CTA</option>
                {ctaOptions.map((cta) => (
                  <option key={cta} value={cta}>
                    {cta.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL *
              </label>
              <input
                type="url"
                value={copy.linkUrl || ''}
                onChange={(e) => handleCopyChange('linkUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter link URL (e.g., https://example.com)..."
                required
              />
            </div>
          </div>
        </div>

        {/* Visual Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Visual Elements</h3>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isImageRegenerating}
                className={`px-3 py-1.5 text-xs rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed`}
                title="Regenerate a new ad image with AI (not saved)"
              >
                {isImageRegenerating ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                    <span>Regnerating...</span>
                  </span>
                ) : '✨ Regenerate Ad Image with AI'}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={visual.brandName}
                onChange={(e) => handleVisualChange('brandName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter brand name..."
              />
            </div>

            {/* Business Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
              {visual.logoUrl ? (
                <div className="flex items-center space-x-3 mb-2">
                  <img src={visual.logoUrl} alt="Business Logo" className="w-12 h-12 object-cover rounded border" />
                  <span className="text-xs text-gray-500">Read-only</span>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No logo available</p>
              )}
            </div>

            {/* Ad Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Image</label>
              {visual.imageUrl ? (
                <div className="flex items-center space-x-3 mb-2">
                  <img src={visual.imageUrl} alt="Ad Image" className="w-24 h-24 object-cover rounded border" />
                  <span className="text-xs text-gray-500">Current ad image</span>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files?.[0], 'imageUrl')}
                className="w-full"
              />
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default AdControls;
