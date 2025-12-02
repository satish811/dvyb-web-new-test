import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ads from "./AdsImages";

const SimpleAdsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === ads.length - 1 ? 0 : prevIndex + 1));
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAdClick = (ad) => {
    if (ad.link) {
      navigate(ad.link);
    }
  };

  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden shadow-lg mx-auto cursor-pointer"
      style={{ width: "900px", height: "335px" }}
      onClick={() => handleAdClick(ads[currentIndex])}
    >
      {/* Ads Images with fade transition */}
      {ads.map((ad, index) => (
        <div
          key={ad.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={ad.image} alt={ad.alt} className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {ads.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleAdsCarousel;
