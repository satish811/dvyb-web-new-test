// src/components/b2c/TryOn/hooks/useLoadingAnimation.js

import { useState, useEffect } from "react";
import { LOADING_IMAGES, TIMINGS } from "../utils/tryOnConstants";

/**
 * Loading Animation Hook
 * Rotates through loading images during processing
 */
export const useLoadingAnimation = (isProcessing) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    const imgTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % LOADING_IMAGES.length);
    }, TIMINGS.IMAGE_ROTATION);

    return () => clearTimeout(imgTimer);
  }, [currentIndex, isProcessing]);

  return {
    currentLoadingImage: LOADING_IMAGES[currentIndex],
    currentIndex,
  };
};