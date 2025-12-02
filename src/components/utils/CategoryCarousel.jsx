// CategoryCarousel.jsx - Alternative approach
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import categories from "../../static/landing/catCarousel";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { scrollLeft, scrollRight } from "../utils/scroll";

export default function CategoryCarousel() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  return (
    <section className="relative">
      {/* MOBILE GRID (2 columns) - Hidden on desktop */}
      <div className="grid grid-cols-3 gap-2 md:hidden px-3">
        {categories.slice(0, 6).map((c) => (
          <div key={c.slug} className="relative text-center group">
            <img
              src={c.image}
              alt={c.name}
              className="w-full h-48 object-cover transition cursor-pointer"
              onClick={() => navigate(c.slug)}
            />
            <div className="absolute bottom-10 w-full text-center text-white px-4">
              <p className="text-base  tracking-wide uppercase cursor-default">{c.name}</p>
              <p className="text-xs cursor-pointer" onClick={() => navigate(c.slug)}>
                SHOP NOW
              </p>
            </div>
          </div>
        ))}
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
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-48 object-cover transition cursor-pointer"
                onClick={() => navigate(c.slug)}
              />
              <div className="absolute bottom-10 w-full text-center text-white px-4">
                <p className="text-base font-semibold tracking-wide uppercase cursor-default">
                  {c.name}
                </p>
                <p className="text-xs cursor-pointer" onClick={() => navigate(c.slug)}>
                  SHOP NOW
                </p>
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
