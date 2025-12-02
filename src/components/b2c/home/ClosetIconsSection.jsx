// ClosetIconsSection.jsx
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ProductCard from "../../product/ProductCard";
import { scrollLeft, scrollRight } from "../../utils/scroll";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useProducts } from "../../../hooks/useProducts";

export default function ClosetIconsSection() {
  const { products, loading, error } = useProducts();

  return (
    <section className="container mx-auto px-2 sm:px-2 md:px-2 lg:px-16">
      <div className="flex items-center gap-2">
        {/* LEFT ARROW */}
        <button
          onClick={() => scrollLeft("closetScroll")}
          className="hidden md:flex items-center justify-center cursor-pointer w-10 h-10 p-2 rounded-full bg-yellowprimary shadow-lg transition-all duration-300"
          aria-label="Scroll left"
        >
          {/* <IoIosArrowBack size={22} /> */}
          <FaArrowLeft size={18} />
        </button>

        {/* SCROLLABLE CONTAINER */}
        <div
          id="closetScroll"
          className="flex gap-2 md:gap-2 lg:gap-4 overflow-x-auto scrollbar-none hide-scrollbar scroll-smooth py-4 whitespace-nowrap"
        >
          {products.map((product) => (
            <div key={product.id} className="  ">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* RIGHT ARROW */}
        <button
          onClick={() => scrollRight("closetScroll")}
          className="hidden md:flex items-center justify-center cursor-pointer w-10 h-10 p-2 rounded-full bg-yellowprimary shadow-lg transition-all duration-300"
          aria-label="Scroll right"
        >
          <FaArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
