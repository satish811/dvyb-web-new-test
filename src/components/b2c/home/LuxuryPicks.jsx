import { useRef } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
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
  const handleClose = () => { };

  return (
    <section className="bg-lighted-bg mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
   

      {/* PRODUCTS SECTION WITH ARROWS */}
      <div className="relative">
        {/* LEFT ARROW - Desktop only */}
        <button
          onClick={slideLeft}
          className="absolute left-0 top-42 -translate-y-1/2 -translate-x-12
                     hidden md:flex items-center justify-center
                     w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 
                     transition-all duration-300 hover:shadow-xl z-10 mx-2 ml-10"
        >
          <IoArrowBack size={24} className="text-gray-700" />
        </button>

        {/* PRODUCT SCROLL CONTAINER */}
        <div className="relative px-4">
          {/* Desktop Scroll Container */}
          <div className="hidden md:flex overflow-x-auto scrollbar-none hide-scrollbar scroll-smooth py-2 px-1">
            {products.map((product, index) => (
              <div key={index} className="cursor-pointer flex-shrink-0 w-70 lg:w-75">
                <ProductCard product={product} onClose={handleClose} />
              </div>
            ))}
          </div>

          {/* Mobile Scroll Container */}
          <div className="flex md:hidden overflow-x-auto scrollbar-none hide-scrollbar scroll-smooth py-2 px-1">
            {products.map((product, index) => (
              <div key={index} className="cursor-pointer flex-shrink-0 w-73 px-1">
                <ProductCard product={product} onClose={handleClose} />
              </div>
            ))}
          </div>
        </div>


        {/* RIGHT ARROW - Desktop only */}
        <button
          onClick={slideRight}
          className="absolute right-0 top-42 -translate-y-1/2 translate-x-12
                     hidden md:flex items-center justify-center
                     w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 
                     transition-all duration-300 hover:shadow-xl z-10 mx-2 mr-10"
        >
          <IoArrowForward size={24} className="text-gray-700" />
        </button>
      </div>
    </section>
  );
}
