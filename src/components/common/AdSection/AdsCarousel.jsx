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
    setCurrentIndex((prev) => (prev === 0 ? 1 : 0));
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
    <div
      className={`w-full ${isMobile
          ? "h-[140vw] sm:h-[100vw] md:h-[120vh] max-w-[100vw]"
          : "h-72 sm:h-80 md:h-72 lg:h-80 xl:h-96 max-w-[100vw] lg:max-w-[95vw] xl:max-w-[90vw]"
        }`}
    >
      <div className="relative w-full h-full lg:mx-auto lg:px-0">
        <img
          src={currentAds[currentIndex]?.image}
          alt={currentAds[currentIndex]?.alt}
          className="w-full h-full object-contain cursor-pointer"
          onClick={() => handleClick(currentAds[currentIndex])}
        />
      </div>
    </div>
  );
};

export default AdsCarousel;
