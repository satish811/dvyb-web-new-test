// src/components/TryOn/LazyImageLoader.jsx
import React, { useEffect, useState } from "react";

// import same assets
import img1 from "../../../assets/lazyloading/logoimg1.svg";
import img2 from "../../../assets/lazyloading/logoimg2.svg";
import img3 from "../../../assets/lazyloading/logoimg3.svg";
import img4 from "../../../assets/lazyloading/logoimg4.svg";
import img5 from "../../../assets/lazyloading/logoimg5.svg";
import img6 from "../../../assets/lazyloading/logoimg6.svg";

const LazyImageLoader = ({ isProcessing }) => {
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

  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src={images[currentIndex]}
        alt="loader"
        className="w-[150px] h-[150px] object-cover transition-opacity"
      />
    
    </div>
  );
};

export default LazyImageLoader;
