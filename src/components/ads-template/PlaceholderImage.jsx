import React from 'react';

/**
 * Placeholder Image Component for ads when no image is provided
 * @param {Object} props
 * @param {string} props.aspectRatio - Image aspect ratio
 * @param {string} props.className - Additional CSS classes
 */
const PlaceholderImage = ({ aspectRatio, className = '' }) => {
  // Set dimensions based on aspect ratio
  let width, height;
  
  if (aspectRatio === '1:1') {
    width = 'w-full';
    height = 'h-full';
  } else if (aspectRatio === '4:5') {
    width = 'w-full';
    height = 'h-full';
  } else if (aspectRatio === '1200×628') {
    width = 'w-full';
    height = 'h-full';
  } else if (aspectRatio === '1080×1080') {
    width = 'w-full';
    height = 'h-full';
  } else {
    // Default to square
    width = 'w-full';
    height = 'h-full';
  }

  return (
    <div 
      className={`${width} ${height} ${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300`}
    >
      <div className="text-center">
        <div className="text-gray-500 text-lg font-medium mb-1">
          Ads image
        </div>
        <div className="text-gray-400 text-sm">
          Upload your image here
        </div>
      </div>
    </div>
  );
};

export default PlaceholderImage;
