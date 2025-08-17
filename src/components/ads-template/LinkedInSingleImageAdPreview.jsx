import React from 'react';

/**
 * LinkedIn Single Image Ad Preview Component
 * @param {Object} props
 * @param {Object} props.copy - Ad copy content
 * @param {Object} props.visual - Visual elements
 * @param {string} props.aspectRatio - Image aspect ratio
 */
const LinkedInSingleImageAdPreview = ({
  copy,
  visual,
  aspectRatio
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isSquare = aspectRatio === '1:1';
  const cardWidth = isSquare ? 'w-96' : 'w-[480px]';
  const imageHeight = isSquare ? 'h-96' : 'h-64';

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatTextWithLinks = (text) => {
    // Regular expression to find URLs (including www URLs)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    
    // Split text by line breaks first to preserve paragraphs
    const paragraphs = text.split('\n');
    
    return paragraphs.map((paragraph, pIndex) => {
      if (paragraph.trim() === '') {
        // Empty paragraph - add spacing
        return <div key={pIndex} className="h-3"></div>;
      }
      
      // Process URLs within each paragraph
      const parts = paragraph.split(urlRegex);
      const formattedParts = parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <span key={index} className="text-blue-600 hover:underline cursor-pointer">
              {part}
            </span>
          );
        }
        return part;
      });
      
      return (
        <div key={pIndex} className="mb-2 last:mb-0">
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
      {/* Top Bar - LinkedIn style */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
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
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900 text-sm">{visual.brandName}</span>
            </div>
                               <span className="text-xs text-gray-500">1.2k+ followers</span>
            <span className="text-xs text-gray-500">Promoted</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Intro Text - LinkedIn displays this above the image */}
      <div className="px-3 py-2">
        <p className="text-sm text-gray-900 leading-relaxed">
          {isExpanded 
            ? formatTextWithLinks(copy.primaryText)
            : formatTextWithLinks(truncateText(copy.primaryText, 211))
          }
          {copy.primaryText.length > 211 && (
            <span 
              className="text-gray-500 font-medium cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? ' See less' : ' ...see more'}
            </span>
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

      {/* Headline, Domain, and CTA Section - LinkedIn style with light blue background */}
      <div className="bg-blue-50 px-3 py-2">
        {/* Headline - LinkedIn displays this BELOW the image in smaller, bold font */}
        {copy.headline && (
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              {copy.headline}
            </h3>
          </div>
        )}

        {/* CTA Button and Domain - LinkedIn style */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            jetsy.dev
          </div>
          <button className="border-2 border-blue-600 text-blue-600 bg-transparent px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors">
            {getCTALabel(copy.cta)}
          </button>
        </div>
      </div>

      {/* Social Bar - LinkedIn style */}
      <div className="px-3 py-2 border-t border-gray-100">
        {/* Reaction counts and comments */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-1">
            <div className="flex items-center -space-x-1">
              <img 
                className="w-5 h-5"
                src="https://static.licdn.com/aero-v1/sc/h/8ekq8gho1ruaf8i7f86vd1ftt" 
                alt="like"
              />
              <img 
                className="w-5 h-5"
                src="https://static.licdn.com/aero-v1/sc/h/b1dl5jk88euc7e9ri50xy5qo8" 
                alt="celebrate"
              />
              <img 
                className="w-5 h-5"
                src="https://static.licdn.com/aero-v1/sc/h/cpho5fghnpme8epox8rdcds22" 
                alt="love"
              />
            </div>
            <span className="ml-2">534</span>
          </div>
          <span>52 comments</span>
        </div>

        {/* Interaction buttons - LinkedIn style */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.85L8.89 9H4.12A2.12 2.12 0 002 11.12a2.16 2.16 0 00.92 1.76A2.11 2.11 0 002 14.62a2.14 2.14 0 001.28 2 2 2 0 00-.28 1 2.12 2.12 0 002 2.12v.14A2.12 2.12 0 007.12 22h7.49a8.08 8.08 0 003.58-.84l.31-.16H21V11zM19 19h-1l-.73.37a6.14 6.14 0 01-2.69.63H7.72a1 1 0 01-1-.72l-.25-.87-.85-.41A1 1 0 015 17l.17-1-.76-.74A1 1 0 014.27 14l.66-1.09-.73-1.1a.49.49 0 01.08-.7.48.48 0 01.34-.11h7.05l-1.31-3.92A7 7 0 0110 4.86V3.75a.77.77 0 01.75-.75.75.75 0 01.71.51L12 5a9 9 0 002.13 3.5l4.5 4.5H19z"></path>
                </svg>
                <span className="text-gray-600 font-medium">Like</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 9h10v1H7V9zm0 4h7v-1H7v1zm16-2c0 2.2-1 4.3-2.8 5.6L12 22v-4H8c-3.9 0-7-3.1-7-7s3.1-7 7-7h8c3.9 0 7 3.1 7 7zm-2 0c0-2.8-2.2-5-5-5H8c-2.8 0-5 2.2-5 5s2.2 5 5 5h6v2.3l5-3.3c1.3-.9 2-2.4 2-4z" fill="currentColor"></path>
                </svg>
                <span className="text-gray-600 font-medium">Comment</span>
              </button>
              
              <button className="flex items-center space-x-1 px-4 py-2 hover:bg-gray-100 rounded transition-colors">
                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 15 14" fill="currentColor">
                  <path d="M14.375 0L0.375 4.67L5.375 7.31L11.045 3.33L7.075 9L9.705 14L14.375 0Z" fill="currentColor" fillOpacity="0.75"></path>
                </svg>
                <span className="text-gray-600 font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInSingleImageAdPreview;
