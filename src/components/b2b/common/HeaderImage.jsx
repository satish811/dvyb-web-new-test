// HeaderImage.jsx
import React from "react";

/**
 * Reusable Header Image Component for Modals
 * - Handles image loading with fallback and error state
 * - Props: imageSrc, fallbackImageUrl, imageError, onImageError, onImageLoad
 */

const HeaderImage = ({ imageSrc, fallbackImageUrl, imageError, onImageError, onImageLoad }) => {
  const handleError = (e) => {
    onImageError();
    e.currentTarget.src = fallbackImageUrl;
  };

  return (
    <div className="w-full h-40 overflow-hidden relative">
      <img
        src={imageSrc}
        alt="Registration Banner"
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={handleError}
        onLoad={onImageLoad}
      />
      {imageError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
          Loading banner...
        </div>
      )}
    </div>
  );
};

export default HeaderImage;
