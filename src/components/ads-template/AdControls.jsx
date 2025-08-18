import React from 'react';

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
 */
const AdControls = ({
  copy,
  visual,
  aspectRatio,
  platform,
  onCopyChange,
  onVisualChange,
  onAspectRatioChange
}) => {
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

  const isLinkedIn = platform === 'linkedin';
  const isMeta = platform === 'meta';
  const isInstagram = platform === 'instagram';

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={visual.logoUrl}
                  onChange={(e) => handleVisualChange('logoUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter logo URL..."
                />
                {visual.logoUrl && (
                  <div className="flex items-center space-x-2">
                    <img 
                      src={visual.logoUrl} 
                      alt="Business Logo" 
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.log('Logo image failed to load');
                      }}
                    />
                    <span className="text-xs text-gray-500">Logo Preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ad Image is automatically generated and managed by AI - not editable by user */}
            {visual.imageUrl && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <img 
                    src={visual.imageUrl} 
                    alt="Generated Ad Image" 
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.log('Ad image failed to load');
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">AI-Generated Ad Image</p>
                    <p className="text-xs text-gray-500">Automatically generated and managed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button for this platform */}
            <div className="pt-4">
              <button
                onClick={() => {
                  // This will be handled by the parent component's saveAdsEdits function
                  alert('Use the "Save All Changes" button at the top to save your edits');
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                💾 Save {platform === 'linkedin' ? 'LinkedIn' : platform === 'meta' ? 'Meta' : 'Instagram'} Changes
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Changes are saved automatically when you use the main "Save All Changes" button
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdControls;
