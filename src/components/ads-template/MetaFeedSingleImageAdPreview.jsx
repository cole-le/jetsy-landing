import React, { useState } from 'react';
import PlaceholderImage from './PlaceholderImage';
import PlaceholderLogo from './PlaceholderLogo';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isSquare = aspectRatio === '1:1';
  const isVertical = aspectRatio === '4:5';
  const cardWidth = 'w-80';
  
  // Set image height based on aspect ratio
  let imageHeight;
  if (isSquare) {
    imageHeight = 'h-80'; // Square image
  } else if (isVertical) {
    imageHeight = 'h-96'; // Vertical image (taller)
  } else {
    imageHeight = 'h-80'; // Default fallback
  }

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
            {visual.logoUrl ? (
              <img 
                src={visual.logoUrl} 
                alt={`${visual.brandName} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/ferrari_logo.jpg';
                }}
              />
            ) : (
              <PlaceholderLogo />
            )}
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
        <p className="text-gray-900 text-sm leading-relaxed">
          {formatTextWithLinks(copy.primaryText)}
        </p>
      </div>

      {/* Image */}
      <div className={`${imageHeight} w-full bg-gray-100 overflow-hidden`}>
        {visual.imageUrl ? (
          <img 
            src={visual.imageUrl} 
            alt={`${visual.brandName} ad image`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/ferrari.jpg';
            }}
          />
        ) : (
          <PlaceholderImage aspectRatio={aspectRatio} />
        )}
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
          {copy.linkUrl ? (
            <a
              href={copy.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded font-bold hover:bg-gray-300 transition-colors text-sm cursor-pointer inline-block"
            >
              {getCTALabel(copy.cta)}
            </a>
          ) : (
            <button 
              disabled
              className="bg-gray-200 text-gray-400 px-4 py-1.5 rounded font-bold cursor-not-allowed text-sm"
            >
              {getCTALabel(copy.cta)}
            </button>
          )}
        </div>
      </div>

      {/* Actions Row - Meta Style */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="space-y-3">
          {/* Reaction Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Overlapping reaction icons */}
              <div className="flex items-center -space-x-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center">
                  <img 
                    className="w-5 h-5" 
                    height="18" 
                    role="presentation" 
                    width="18" 
                    src="data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint0_linear_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint1_radial_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint2_radial_15251_63610)' fill-opacity='.5'/%3E%3Cpath d='M7.3014 3.8662a.6974.6974 0 0 1 .6974-.6977c.6742 0 1.2207.5465 1.2207 1.2206v1.7464a.101.101 0 0 0 .101.101h1.7953c.992 0 1.7232.9273 1.4917 1.892l-.4572 1.9047a2.301 2.301 0 0 1-2.2374 1.764H6.9185a.5752.5752 0 0 1-.5752-.5752V7.7384c0-.4168.097-.8278.2834-1.2005l.2856-.5712a3.6878 3.6878 0 0 0 .3893-1.6509l-.0002-.4496ZM4.367 7a.767.767 0 0 0-.7669.767v3.2598a.767.767 0 0 0 .767.767h.767a.3835.3835 0 0 0 .3835-.3835V7.3835A.3835.3835 0 0 0 5.134 7h-.767Z' fill='%23fff'/%3E%3Cdefs%3E%3CradialGradient id='paint1_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(90 .0005 8) scale(7.99958)'%3E%3Cstop offset='.5618' stop-color='%230866FF' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%230866FF' stop-opacity='.1'/%3E%3C/radialGradient%3E%3CradialGradient id='paint2_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(45 -4.5257 10.9237) scale(10.1818)'%3E%3Cstop offset='.3143' stop-color='%2302ADFC'/%3E%3Cstop offset='1' stop-color='%2302ADFC' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint0_linear_15251_63610' x1='2.3989' y1='2.3999' x2='13.5983' y2='13.5993' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2302ADFC'/%3E%3Cstop offset='.5' stop-color='%230866FF'/%3E%3Cstop offset='1' stop-color='%232B7EFF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E"
                    alt="like"
                  />
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center">
                  <img 
                    className="w-5 h-5" 
                    height="18" 
                    role="presentation" 
                    width="18" 
                    src="data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg clip-path='url(%23clip0_15251_63610)'%3E%3Cpath d='M15.9963 8c0 4.4179-3.5811 7.9993-7.9986 7.9993-4.4176 0-7.9987-3.5814-7.9987-7.9992 0-4.4179 3.5811-7.9992 7.9987-7.9992 4.4175 0 7.9986 3.5813 7.9986 7.9992Z' fill='url(%23paint0_linear_15251_63610)'/%3E%3Cpath d='M15.9973 7.9992c0 4.4178-3.5811 7.9992-7.9987 7.9992C3.5811 15.9984 0 12.417 0 7.9992S3.5811 0 7.9986 0c4.4176 0 7.9987 3.5814 7.9987 7.9992Z' fill='url(%23paint1_radial_15251_63610)'/%3E%3Cpath d='M7.9996 5.9081c-.3528-.8845-1.1936-1.507-2.1748-1.507-1.4323 0-2.4254 1.328-2.4254 2.6797 0 2.2718 2.3938 4.0094 4.0816 5.1589.3168.2157.7205.2157 1.0373 0 1.6878-1.1495 4.0815-2.8871 4.0815-5.159 0-1.3517-.993-2.6796-2.4254-2.6796-.9811 0-1.822.6225-2.1748 1.507Z' fill='%23fff'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint1_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='matrix(0 7.9992 -7.99863 0 7.9986 7.9992)'%3E%3Cstop offset='.5637' stop-color='%23E11731' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23E11731' stop-opacity='.1'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint0_linear_15251_63610' x1='2.3986' y1='2.4007' x2='13.5975' y2='13.5993' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF74AE'/%3E%3Cstop offset='.5001' stop-color='%23FA2E3E'/%3E%3Cstop offset='1' stop-color='%23FF5758'/%3E%3C/linearGradient%3E%3CclipPath id='clip0_15251_63610'%3E%3Cpath fill='%23fff' d='M-.001.0009h15.9992v15.9984H-.001z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E"
                    alt="love"
                  />
                </div>
              </div>
              {/* Reaction count */}
              <span className="text-sm text-gray-600 font-medium">2.4K</span>
            </div>
            {/* Comments count */}
            <div className="text-sm text-gray-600">
              <span>227 comments</span>
            </div>
          </div>

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Like Button */}
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <i 
                  data-visualcompletion="css-img" 
                  className="x1b0d499 x1d69dk1" 
                  style={{
                    backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/y5/r/j6jhbwiFQIj.png")',
                    backgroundPosition: '0px -863px',
                    backgroundSize: '33px 1177px',
                    width: '20px',
                    height: '20px',
                    backgroundRepeat: 'no-repeat',
                    display: 'inline-block'
                  }}
                ></i>
                <span className="text-sm font-medium">Like</span>
              </button>

              {/* Comment Button */}
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <i 
                  data-visualcompletion="css-img" 
                  className="x1b0d499 x1d69dk1" 
                  style={{
                    backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/y5/r/j6jhbwiFQIj.png")',
                    backgroundPosition: '0px -821px',
                    backgroundSize: '33px 1177px',
                    width: '20px',
                    height: '20px',
                    backgroundRepeat: 'no-repeat',
                    display: 'inline-block'
                  }}
                ></i>
                <span className="text-sm font-medium">Comment</span>
              </button>

              {/* Share Button */}
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <i 
                  data-visualcompletion="css-img" 
                  className="x1b0d499 x1d69dk1" 
                  style={{
                    backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/y5/r/j6jhbwiFQIj.png")',
                    backgroundPosition: '0px -884px',
                    backgroundSize: '33px 1177px',
                    width: '20px',
                    height: '20px',
                    backgroundRepeat: 'no-repeat',
                    display: 'inline-block'
                  }}
                ></i>
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaFeedSingleImageAdPreview;
