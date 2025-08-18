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
      <div className="px-3 py-2 flex items-center space-x-4">
        <button className="p-1 hover:text-gray-700">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </button>
        <button className="p-1 hover:text-gray-700">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm6 0h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="p-1 hover:text-gray-700">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </button>
        <button className="p-1 hover:text-gray-700 ml-auto">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </button>
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
