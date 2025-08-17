import React from 'react';

/**
 * Ad Controls Component for live-editing ad content and settings
 * @param {Object} props
 * @param {Object} props.copy - Ad copy content
 * @param {Object} props.visual - Visual elements
 * @param {string} props.linkedInAspectRatio - LinkedIn image aspect ratio
 * @param {string} props.metaAspectRatio - Meta image aspect ratio
 * @param {Function} props.onCopyChange - Callback for copy changes
 * @param {Function} props.onVisualChange - Callback for visual changes
 * @param {Function} props.onLinkedInAspectRatioChange - Callback for LinkedIn aspect ratio changes
 * @param {Function} props.onMetaAspectRatioChange - Callback for Meta aspect ratio changes
 */
const AdControls = ({
  copy,
  visual,
  linkedInAspectRatio,
  metaAspectRatio,
  onCopyChange,
  onVisualChange,
  onLinkedInAspectRatioChange,
  onMetaAspectRatioChange
}) => {
  const ctaOptions = [
    'LEARN_MORE',
    'SIGN_UP',
    'GET_OFFER',
    'SUBSCRIBE',
    'CONTACT_US',
    'DOWNLOAD',
    'APPLY_NOW',
    'BOOK_NOW'
  ];

  const handleCopyChange = (field, value) => {
    onCopyChange({
      ...copy,
      [field]: value
    });
  };

  const handleVisualChange = (field, value) => {
    onVisualChange({
      ...visual,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Ad Controls</h2>
      
      <div className="space-y-6">
        {/* Copy Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Ad Copy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Text *
                <span className="text-xs text-gray-500 ml-2">
                  {copy.primaryText.length}/125 chars (Meta) • {copy.primaryText.length}/150 chars (LinkedIn)
                </span>
              </label>
              <textarea
                value={copy.primaryText}
                onChange={(e) => handleCopyChange('primaryText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter your primary ad text..."
                maxLength={150}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headline (Optional)
                <span className="text-xs text-gray-500 ml-2">
                  {copy.headline?.length || 0}/40 chars (Meta) • {copy.headline?.length || 0}/70 chars (LinkedIn)
                </span>
              </label>
              <input
                type="text"
                value={copy.headline || ''}
                onChange={(e) => handleCopyChange('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter headline..."
                maxLength={70}
              />
            </div>

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
                placeholder="Enter description..."
                maxLength={25}
              />
            </div>

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
          </div>
        </div>

        {/* Aspect Ratio Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Aspect Ratios</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="linkedin-ratio"
                    value="1:1"
                    checked={linkedInAspectRatio === '1:1'}
                    onChange={(e) => onLinkedInAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1:1 (Square)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="linkedin-ratio"
                    value="1200×628"
                    checked={linkedInAspectRatio === '1200×628'}
                    onChange={(e) => onLinkedInAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1200×628 (Landscape)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta (Facebook/Instagram)
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="meta-ratio"
                    value="1080×1350"
                    checked={metaAspectRatio === '1080×1350'}
                    onChange={(e) => onMetaAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1080×1350 (Portrait)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="meta-ratio"
                    value="1080×1080"
                    checked={metaAspectRatio === '1080×1080'}
                    onChange={(e) => onMetaAspectRatioChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">1080×1080 (Square)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdControls;
