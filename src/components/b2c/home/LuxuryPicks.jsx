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

  // NEW: Scroll Handlers using the ref
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
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* LEFT BLOCK */}
        <div className="w-full lg:w-1/4 text-center lg:text-left">
          <div className="flex flex-col items-center max-w-sm mx-auto lg:mx-0">
            <img src={luxIcon} alt="Luxury Icon" className="w-20 md:w-24 lg:w-25 mb-4" />
            <h2 className="text-sm tracking-wide text-gray-600 uppercase mb-2">
              Luxurious Pick of the
            </h2>
            <h2 className="text-sm tracking-wide text-gray-600 uppercase mb-2">DVYB Essence</h2>

            <button
              onClick={() => navigate("/womenwear")}
              className="bg-[#400000] text-xs lg:text-sm mt-2 text-white px-8 py-4 transition-colors duration-300 w-full sm:w-auto"
            >
              Explore All
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT WITH ARROWS */}
        <div className="w-full lg:w-3/4 flex items-center gap-2 md:gap-4">
          {/* LEFT ARROW */}
          <button
            onClick={slideLeft}
            className="hidden md:flex items-center justify-center flex-shrink-0
            w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 
            transition-all duration-300 hover:shadow-xl"
          >
            <IoIosArrowBack size={20} className="text-gray-700" />
          </button>

          {/* PRODUCT SCROLL ROW */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-none hide-scrollbar scroll-smooth py-4 whitespace-nowrap"
          >
            {products.map((product, index) => (
              <div key={index} className=" cursor-pointer">
                <ProductCard
                  product={product}
                  onClose={handleClose} // Add this line
                />
              </div>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={slideRight}
            className="hidden md:flex items-center justify-center flex-shrink-0
            w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 
            transition-all duration-300 hover:shadow-xl"
          >
            <IoIosArrowForward size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
