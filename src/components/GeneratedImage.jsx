import React, { useState, useEffect } from 'react';

const GeneratedImage = ({ 
  imageId, 
  alt = "Generated image", 
  className = "", 
  aspectRatio = "1:1",
  onLoad,
  onError,
  placeholder = "Loading image..." 
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch image metadata from our API
        const response = await fetch(`/api/images/${imageId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load image');
        }
        
        const data = await response.json();
        
        if (data.success && data.image) {
          setImageUrl(data.image.r2_url);
          if (onLoad) onLoad(data.image);
        } else {
          throw new Error('Image not found');
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(err.message);
        if (onError) onError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageId) {
      loadImage();
    }
  }, [imageId, onLoad, onError]);

  // Calculate aspect ratio styles
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '16:9':
        return { aspectRatio: '16/9' };
      case '4:3':
        return { aspectRatio: '4/3' };
      case '3:2':
        return { aspectRatio: '3/2' };
      case '2:1':
        return { aspectRatio: '2/1' };
      case '1:1':
      default:
        return { aspectRatio: '1/1' };
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={getAspectRatioStyle()}
      >
        <div className="text-gray-500 text-sm">{placeholder}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`bg-red-50 border border-red-200 flex items-center justify-center ${className}`}
        style={getAspectRatioStyle()}
      >
        <div className="text-red-500 text-sm text-center">
          <div>⚠️ Failed to load image</div>
          <div className="text-xs mt-1">{error}</div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={getAspectRatioStyle()}
      >
        <div className="text-gray-400 text-sm">No image available</div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`object-cover w-full h-full ${className}`}
      style={getAspectRatioStyle()}
      onError={() => {
        setError('Failed to display image');
        if (onError) onError(new Error('Failed to display image'));
      }}
    />
  );
};

export default GeneratedImage; 