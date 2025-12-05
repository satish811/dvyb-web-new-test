import { useRef } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ProductCard from "../../product/ProductCard";
import { luxIcon } from "../../../assets";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";

export default function LuxuryPicks() {
  const { products } = useProducts();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Scroll Handlers
  const slideLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const slideRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Add empty onClose function
  const handleClose = () => {
    // This can be empty if you don't need to close anything
  };

  return (
    <section className="bg-lighted-bg mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      {/* HEADER SECTION - Top aligned */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        {/* Left - Heading with icon */}
        <div className="flex items-center gap-3">
          <img
            src={luxIcon}
            alt="Luxury Icon"
            className="w-12 h-12 md:w-14 md:h-14"
          />
          <div>
            <h2 className="text-lg md:text-xl font-medium text-gray-800">
              Luxurious Pick of the Day
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              DVYB Essence
            </p>
          </div>
        </div>

        {/* Right - Explore button */}
        <button
          onClick={() => navigate("/womenwear")}
          className="bg-[#400000] text-white px-6 py-3 text-sm md:text-base 
                   hover:bg-[#300000] transition-colors duration-300 
                   whitespace-nowrap"
        >
          Explore All
        </button>
      </div>

      {/* PRODUCTS SECTION WITH ARROWS */}
      <div className="relative">
        {/* LEFT ARROW - Positioned outside on left */}
        <button
          onClick={slideLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12
                   hidden md:flex items-center justify-center
                   w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-50 
                   transition-all duration-300 hover:shadow-xl z-10"
        >
          <IoIosArrowBack size={24} className="text-gray-700" />
        </button>

        {/* PRODUCT SCROLL CONTAINER */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-none 
                   hide-scrollbar scroll-smooth py-2 px-1"
        >
          {products.map((product, index) => (
            <div
              key={index}
              className="cursor-pointer flex-shrink-0 w-64 md:w-72 lg:w-80"
            >
              <ProductCard
                product={product}
                onClose={handleClose}
              />
            </div>
          ))}
        </div>

        {/* RIGHT ARROW - Positioned outside on right */}
        <button
          onClick={slideRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12
                   hidden md:flex items-center justify-center
                   w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-50 
                   transition-all duration-300 hover:shadow-xl z-10"
        >
          <IoIosArrowForward size={24} className="text-gray-700" />
        </button>
      </div>
    </section>
  );
}