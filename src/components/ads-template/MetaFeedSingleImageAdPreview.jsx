import React from 'react';

/**
 * Meta Feed Single Image Ad Preview Component
 * @param {Object} props
 * @param {Object} props.copy - Ad copy content
 * @param {Object} props.visual - Visual elements
 * @param {string} props.aspectRatio - Image aspect ratio
 */
const MetaFeedSingleImageAdPreview = ({
  copy,
  visual,
  aspectRatio
}) => {
  const isPortrait = aspectRatio === '1080×1350';
  const cardWidth = 'w-80';
  const imageHeight = isPortrait ? 'h-96' : 'h-80';

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCTALabel = (cta) => {
    if (!cta) return 'Learn more';
    
    switch (cta) {
      case 'LEARN_MORE': return 'Learn more';
      case 'SIGN_UP': return 'Sign up';
      case 'GET_OFFER': return 'Get offer';
      case 'SUBSCRIBE': return 'Subscribe';
      case 'CONTACT_US': return 'Contact us';
      case 'DOWNLOAD': return 'Download';
      case 'APPLY': return 'Apply';
      case 'APPLY_NOW': return 'Apply now';
      case 'BOOK_NOW': return 'Book now';
      case 'GET_STARTED': return 'Get started';
      case 'VIEW_QUOTE': return 'View Quote';
      case 'REGISTER': return 'Register';
      case 'JOIN': return 'Join';
      case 'ATTEND': return 'Attend';
      case 'REQUEST_DEMO': return 'Request Demo';
      case 'BUY_NOW': return 'Buy Now';
      case 'SHOP_NOW': return 'Shop Now';
      default: return cta.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Extract domain from linkUrl for display
  const getDomain = (url) => {
    if (!url) return 'example.com';
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'example.com';
    }
  };

  return (
    <div className={`${cardWidth} bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img 
              src={visual.logoUrl} 
              alt={`${visual.brandName} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/ferrari_logo.jpg';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-sm">{visual.brandName}</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Sponsored</span>
              {/* Globe icon next to Sponsored text */}
              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Primary Text */}
      <div className="px-3 pb-2">
        <p className="text-sm text-gray-900 leading-relaxed">
          {truncateText(copy.primaryText, 125)}
          {copy.primaryText.length > 125 && (
            <span className="text-blue-600 font-medium cursor-pointer"> See more...</span>
          )}
        </p>
      </div>

      {/* Image */}
      <div className={`${imageHeight} w-full bg-gray-100 overflow-hidden`}>
        <img 
          src={visual.imageUrl} 
          alt={`${visual.brandName} ad image`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/ferrari.jpg';
          }}
        />
      </div>

      {/* Link Preview Section - Light Grey Background */}
      <div className="bg-gray-50 px-3 py-3">
        {/* Website URL */}
        <div className="text-xs text-gray-500 mb-1">
          {getDomain(copy.linkUrl)}
        </div>
        
        {/* Headline */}
        {copy.headline && (
          <div className="mb-1">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {copy.headline}
            </h3>
          </div>
        )}

        {/* Description */}
        {copy.description && (
          <div className="mb-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              {copy.description}
            </p>
          </div>
        )}

        {/* CTA Button - Meta Style */}
        <div className="flex justify-end">
          <button className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded font-medium hover:bg-gray-300 transition-colors text-sm">
            {getCTALabel(copy.cta)}
          </button>
        </div>
      </div>

      {/* Actions Row */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm6 0h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaFeedSingleImageAdPreview;
