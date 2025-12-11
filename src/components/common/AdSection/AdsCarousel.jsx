import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newBanner, adsMobile } from "./AdsImages";

const AdsCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  /**
   * Detect mobile/desktop
   */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Select data based on device type
   */
  const currentAds = isMobile ? adsMobile : newBanner;

  /**
   * Toggle between 0 and 1
   */
  const handleToggleImage = () => {
    setCurrentIndex((prev) => (prev + 1) % currentAds.length);
  };

  /**
   * Navigate if link exists
   */
  const handleClick = (ad) => {
    handleToggleImage();
    if (ad.link) {
      navigate(ad.link);
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-full mx-auto">
        <img
          src={currentAds[currentIndex]?.image}
          alt={currentAds[currentIndex]?.alt}
          className={`w-full ${isMobile ? "h-auto" : "h-full"} object-contain cursor-pointer`}
          onClick={() => handleClick(currentAds[currentIndex])}
        />
      </div>
    </div>
  );
};

export default AdsCarousel;