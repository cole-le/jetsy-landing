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
  const isSquare = aspectRatio === '1:1';
  const cardWidth = isSquare ? 'w-96' : 'w-[480px]';
  const imageHeight = isSquare ? 'h-96' : 'h-64';

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCTALabel = (cta) => {
    if (!cta) return 'Learn more';
    return cta.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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
              {visual.verified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500">27 followers</span>
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
          {truncateText(copy.primaryText, 150)}
          {copy.primaryText.length > 150 && (
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

      {/* Headline - LinkedIn displays this BELOW the image in larger, bolder font */}
      {copy.headline && (
        <div className="px-3 py-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {copy.headline}
          </h3>
        </div>
      )}

      {/* CTA Button and Domain - LinkedIn style */}
      <div className="px-3 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          jetsy.dev
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
          {getCTALabel(copy.cta)}
        </button>
      </div>

      {/* Social Bar */}
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
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInSingleImageAdPreview;
