import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ads, { adsMobile } from "./AdsImages";

const AdsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentAds = isMobile ? adsMobile : ads;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === currentAds.length - 1 ? 0 : prevIndex + 1));
  }, [currentAds.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleAdClick = (ad) => {
    if (ad.link) {
      navigate(ad.link);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category")?.toLowerCase();

    if (!category) return;

    const matchedIndex = currentAds.findIndex((ad) => ad.category.toLowerCase() === category);

    if (matchedIndex !== -1) {
      setCurrentIndex(matchedIndex);
    } else {
      const otherIndex = currentAds.findIndex((ad) => ad.category === "other");
      if (otherIndex !== -1) {
        setCurrentIndex(otherIndex);
      }
    }
  }, [location.search, currentAds]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, nextSlide]);

  return (
    <div
      className={`w-full ${
        isMobile ? "h-[28rem] sm:h-[32rem] md:h-[36rem]" : "h-72 sm:h-80 md:h-72 lg:h-80 xl:h-96"
      }`}
    >
      <div
        className="relative w-full h-full max-w-screen-xl mx-auto lg:px-0"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="relative w-full h-full">
          {currentAds.map((ad, index) => (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={ad.image}
                alt={ad.alt}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => handleAdClick(ad)}
              />
            </div>
          ))}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {currentAds.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 bg-white/60 hover:bg-white data-[active=true]:bg-white data-[active=true]:scale-125"
                data-active={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsCarousel;
