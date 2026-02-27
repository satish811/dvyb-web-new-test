// src/components/b2c/TryOn/hooks/useLoadingAnimation.js

import { useState, useEffect } from "react";
import { LOADING_IMAGES } from "../utils/tryOnConstants";
import { FRAME_INTERVAL } from "../assets/lazyloading2";

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
    }, FRAME_INTERVAL);

    return () => clearTimeout(imgTimer);
  }, [currentIndex, isProcessing]);

  return {
    currentLoadingImage: LOADING_IMAGES[currentIndex],
    currentIndex,
  };
};