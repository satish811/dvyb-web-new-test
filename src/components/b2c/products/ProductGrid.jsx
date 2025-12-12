import { useMemo, useState } from "react";
import { useProductFilter } from "../../../hooks/useProductFilter";
import { useFilter } from "../../../context/FilterContext";
import ProductCard from "./ProductCard";
import AdsCarousel from "../../common/AdSection/AdsCarousel";

const ProductGrid = ({ products, category }) => {
  const { selectedFilters, clearAllFilters } = useFilter();

  const filteredProducts = useProductFilter(products || []);

  console.log("The products we are getting", products);

  const [sortBy, setSortBy] = useState("");

  const sortedAndFilteredProducts = useMemo(() => {
    let items = [...filteredProducts];

    if (sortBy === "low-to-high") {
      items.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === "high-to-low") {
      items.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    }

    return items;
  }, [filteredProducts, sortBy]);

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any products in this category. Please check back later or browse other categories.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[#9C0000] text-white font-medium rounded-md hover:bg-[#8a0000] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Ads */}
      <div className="mb-5">
        <AdsCarousel />
      </div>

      {/* Title + Sort - hidden on mobile */}
      <div className="hidden sm:flex justify-between items-center mb-3">

        <div className="flex items-baseline gap-2">
          <h1 className="text-[1.3rem] font-semibold uppercase">
            {category || "All Products"}
          </h1>
          <span className="text-[0.85rem] font-normal text-gray-600">
            ({sortedAndFilteredProducts.length} products)
          </span>
        </div>


        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-[#9C0000] focus:outline-none"
        >
          <option value="">Recommended</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>
      </div>

      {/* Black straight line after Title + Sort section */}
      <div className="hidden sm:block border-t border-black mb-6"></div>


      {/* Show ALL products — no slicing, no loading, no bugs */}
      {sortedAndFilteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">No products match your filters.</p>
          <button onClick={clearAllFilters} className="text-[#9C0000] hover:underline font-medium">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedAndFilteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default ProductGrid;
