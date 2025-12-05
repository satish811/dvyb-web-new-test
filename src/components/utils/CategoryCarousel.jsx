// CategoryCarousel.jsx
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import categories from "../../static/landing/catCarousel";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { scrollLeft, scrollRight } from "../utils/scroll";

export default function CategoryCarousel() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Auto-rotate slides for mobile
  useEffect(() => {
    // Only auto-rotate for mobile
    const isMobile = window.innerWidth < 768;
    
    if (isMobile && categories.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === categories.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [categories.length]);

  return (
    <section className="relative">
      {/* MOBILE CAROUSEL (1 by 1 sliding) - Hidden on desktop */}
      <div className="md:hidden relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {categories.map((c) => (
            <div key={c.slug} className="w-full flex-shrink-0 px-3">
              <div className="relative text-center group">
                {/* SIGNIFICANTLY increased height */}
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-[500px] object-cover transition cursor-pointer"
                  onClick={() => navigate(c.slug)}
                />
                {/* Text overlay - moved higher up with more padding */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-12 pb-6 px-4 rounded-t-lg">
                    <p className="text-lg font-semibold tracking-wide uppercase text-white cursor-default">
                      {c.name}
                    </p>
                    <p 
                      className="text-sm mt-3 text-white font-medium cursor-pointer hover:underline" 
                      onClick={() => navigate(c.slug)}
                    >
                      SHOP NOW
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator for mobile */}
        {categories.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {categories.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-black scale-125' 
                    : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP CAROUSEL - Hidden on mobile */}
      <div className="hidden md:flex items-center px-6 sm:px-4">
        <button
          onClick={() => scrollLeft("luxuryScroll")}
          className="hidden md:flex cursor-pointer"
        >
          <IoIosArrowBack size={22} />
        </button>

        <div
          id="luxuryScroll"
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-none hide-scrollbar scroll-smooth "
        >
          {categories.map((c) => (
            <div key={c.slug} className="flex-shrink-0 w-47 relative text-center group">
              {/* Also increased desktop height for consistency */}
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-64 object-cover transition cursor-pointer"
                onClick={() => navigate(c.slug)}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-10 pb-4 px-4 rounded-t-lg">
                  <p className="text-base font-semibold tracking-wide uppercase text-white cursor-default">
                    {c.name}
                  </p>
                  <p className="text-xs mt-2 text-white cursor-pointer hover:underline" onClick={() => navigate(c.slug)}>
                    SHOP NOW
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollRight("luxuryScroll")}
          className="rounded-full hidden md:flex cursor-pointer"
        >
          <IoIosArrowForward size={22} />
        </button>
      </div>
    </section>
  );
}