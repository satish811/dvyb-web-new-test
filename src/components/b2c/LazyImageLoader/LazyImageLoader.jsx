import React, { useEffect, useState } from "react";
import { LOADING_FRAMES, FRAME_INTERVAL } from "../../../assets/lazyloading2";

const LazyImageLoader = ({ isProcessing, size = "default" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LOADING_FRAMES.length);
    }, FRAME_INTERVAL);

    return () => clearInterval(timer);
  }, [isProcessing]);

  if (!isProcessing) return null;

  // Size variants
  const sizeClasses = {
    button: "w-5 h-5",          // Small for buttons
    default: "w-16 h-16",       // Default size
    overlay: "w-16 h-16",       // Medium for image overlays
    large: "w-[200px] h-[200px]", // Large for sections
    page: "w-[300px] h-[300px]",  // Full-page loading
  };

  return (
    <div className="flex items-center justify-center">
      <img
        src={LOADING_FRAMES[currentIndex]}
        alt="Loading..."
        className={`${sizeClasses[size] || sizeClasses.default} object-contain`}
      />
    </div>
  );
};

export default LazyImageLoader;