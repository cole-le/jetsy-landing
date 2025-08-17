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
        {/* Copy Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Ad Copy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isLinkedIn ? 'Introductory Text' : 'Primary Text'} *
                <span className="text-xs text-gray-500 ml-2">
                  {isLinkedIn 
                    ? `${copy.primaryText.length}/3000 chars (LinkedIn)`
                    : `${copy.primaryText.length}/125 chars (${isMeta ? 'Meta' : 'Instagram'})`
                  }
                </span>
              </label>
              <textarea
                value={copy.primaryText}
                onChange={(e) => handleCopyChange('primaryText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={`Enter your ${isLinkedIn ? 'introductory' : 'primary'} ad text...`}
                maxLength={isLinkedIn ? 3000 : 125}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isLinkedIn ? 'Headline *' : 'Headline (Optional)'}
                <span className="text-xs text-gray-500 ml-2">
                  {isLinkedIn 
                    ? `${copy.headline?.length || 0}/200 chars (LinkedIn)`
                    : `${copy.headline?.length || 0}/40 chars (${isMeta ? 'Meta' : 'Instagram'})`
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
                placeholder={isLinkedIn ? "Enter headline (required)..." : "Enter headline..."}
                maxLength={isLinkedIn ? 200 : 40}
                required={isLinkedIn}
              />
            </div>

            {/* Description field for Meta and Instagram */}
            {(isMeta || isInstagram) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                  <span className="text-xs text-gray-500 ml-2">
                    {copy.description?.length || 0}/25 chars ({isMeta ? 'Meta' : 'Instagram'})
                  </span>
                </label>
                <input
                  type="text"
                  value={copy.description || ''}
                  onChange={(e) => handleCopyChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description..."
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
              <input
                type="url"
                value={visual.logoUrl}
                onChange={(e) => handleVisualChange('logoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter logo URL..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Image URL *
              </label>
              <input
                type="url"
                value={visual.imageUrl}
                onChange={(e) => handleVisualChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ad image URL..."
              />
            </div>

            {/* Verified badge only for LinkedIn */}
            {isLinkedIn && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={visual.verified || false}
                  onChange={(e) => handleVisualChange('verified', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                  Verified Badge (LinkedIn)
                </label>
              </div>
            )}
          </div>
        </div>

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
                    value="1200×628"
                    checked={aspectRatio === '1200×628'}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1200×628 (Landscape) - Facebook Standard</span>
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
      </div>
    </div>
  );
};

export default AdControls;
