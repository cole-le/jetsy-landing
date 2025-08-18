import React, { useState } from 'react';

/**
 * Instagram Single Image Ad Preview Component
 * @param {Object} props
 * @param {Object} props.copy - Ad copy content
 * @param {Object} props.visual - Visual elements
 * @param {string} props.aspectRatio - Image aspect ratio
 */
const InstagramSingleImageAdPreview = ({
  copy,
  visual,
  aspectRatio
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isSquare = aspectRatio === '1080×1080';
  const cardWidth = 'w-80';
  const imageHeight = isSquare ? 'h-80' : 'h-96';

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format text with blue links and preserve paragraph spacing
  const formatTextWithLinks = (text) => {
    if (!text) return '';
    
    // Split text by newlines to preserve paragraph spacing
    const paragraphs = text.split('\n');
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.trim() === '') {
        // Empty paragraph - add spacing
        return <div key={index} className="h-3"></div>;
      }
      
      // Replace URLs with blue links
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
      const parts = paragraph.split(urlRegex);
      
      const formattedParts = parts.map((part, partIndex) => {
        if (urlRegex.test(part)) {
          // This is a URL - make it blue and clickable
          const url = part.startsWith('www.') ? `https://${part}` : part;
          return (
            <a
              key={partIndex}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {part}
            </a>
          );
        }
        return part;
      });
      
      return (
        <div key={index} className="mb-2 last:mb-0">
          {formattedParts}
        </div>
      );
    });
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

  return (
    <div className={`${cardWidth} bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden`}>
      {/* Top Bar - Instagram style */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
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
            <span className="font-semibold text-gray-900 text-sm">{visual.brandName}</span>
            <span className="text-xs text-gray-500">Ad</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Image - Instagram is very visual-focused */}
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

      {/* CTA Banner - Instagram style */}
      <div className="px-3 py-3 border-t border-gray-100 border-l border-r border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">{getCTALabel(copy.cta)}</span>
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Action Buttons - Instagram style */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Love icon */}
          <svg aria-label="Like" className="x1lliihq x1n2onr6 xyb1xck w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <title>Like</title>
            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
          </svg>

          {/* Comment icon */}
          <svg aria-label="Comment" className="x1lliihq x1n2onr6 x5n08af w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <title>Comment</title>
            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>

          {/* Share icon */}
          <svg aria-label="Share" className="x1lliihq x1n2onr6 xyb1xck w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <title>Share</title>
            <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
            <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
          </svg>
        </div>

        {/* Save icon - positioned far to the right */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
        </svg>
      </div>

      {/* Like Count - Instagram style */}
      <div className="px-3 pb-2">
        <span className="text-sm font-bold text-black">12,500 likes</span>
      </div>

      {/* Caption Section - Instagram style with only Description */}
      <div className="px-3 pb-3">
        {/* Description only - with expandable functionality */}
        {copy.description && (
          <div className="mb-2">
            <div className="text-sm text-gray-900 leading-relaxed flex flex-wrap">
              {/* Username in bold black on same line */}
              <span className="font-bold text-black mr-1">{visual.brandName.toLowerCase()}</span>
              {isExpanded ? (
                formatTextWithLinks(copy.description)
              ) : (
                <>
                  {formatTextWithLinks(truncateText(copy.description, 132))}
                  {copy.description.length > 132 && (
                    <span 
                      className="text-gray-500 font-medium cursor-pointer hover:text-gray-700"
                      onClick={() => setIsExpanded(true)}
                    >
                      ...more
                    </span>
                  )}
                </>
              )}
              {isExpanded && (
                <span 
                  className="text-gray-500 font-medium cursor-pointer hover:text-gray-700 ml-1"
                  onClick={() => setIsExpanded(false)}
                >
                  less
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramSingleImageAdPreview;
