import React, { useEffect, useState } from "react";

import img1 from "../../../assets/lazyloading/logoimg1.svg";
import img2 from "../../../assets/lazyloading/logoimg2.svg";
import img3 from "../../../assets/lazyloading/logoimg3.svg";
import img4 from "../../../assets/lazyloading/logoimg4.svg";
import img5 from "../../../assets/lazyloading/logoimg5.svg";
import img6 from "../../../assets/lazyloading/logoimg6.svg";

const LazyImageLoader = ({ isProcessing, size = "default" }) => {
  const images = [img1, img2, img3, img4, img5, img6];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 200);

    return () => clearInterval(timer);
  }, [isProcessing]);

  if (!isProcessing) return null;

  // Size variants
  const sizeClasses = {
    button: "w-5 h-5",      // Small for buttons
    overlay: "w-16 h-16",   // Medium for image overlays
    large: "w-24 h-24"      // Large if needed
  };

  return (
    <div className="flex items-center justify-center">
      <img
        src={images[currentIndex]}
        alt="loader"
        className={`${sizeClasses[size]} object-contain transition-opacity`}
      />
    </div>
  );
};

export default LazyImageLoader;