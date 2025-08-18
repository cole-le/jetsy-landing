import React from 'react';

/**
 * Placeholder Logo Component for ads when no logo is provided
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 */
const PlaceholderLogo = ({ className = '' }) => {
  return (
    <div 
      className={`w-full h-full ${className} bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-full`}
    >
      <div className="text-center">
        <div className="text-blue-500 text-xs font-medium">
          Logo
        </div>
      </div>
    </div>
  );
};

export default PlaceholderLogo;
