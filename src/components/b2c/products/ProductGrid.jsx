import { useMemo, useState } from "react";
import { useProductFilter } from "../../../hooks/useProductFilter";
import { useFilter } from "../../../context/FilterContext";
import ProductCard from "./ProductCard";
import AdsCarousel from "../../common/AdSection/AdsCarousel";

const ProductGrid = ({ products, category }) => {
  const { selectedFilters, clearAllFilters } = useFilter();
  
  // Filter once
  const filteredProducts = useProductFilter(products || []);

  // Sort once (you said you have sortBy somewhere, we'll use a simple state)
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
    return <div className="text-center py-20 text-gray-500">Loading products...</div>;
  }

  return (
    <div className="flex flex-col">
      {/* Ads */}
      <div className="mb-5">
        <AdsCarousel />
      </div>

      {/* Title + Sort */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold capitalize">
          {category || "All Products"} ({sortedAndFilteredProducts.length})
        </h1>

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

      {/* Show ALL products — no slicing, no loading, no bugs */}
      {sortedAndFilteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">
            No products match your filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="text-[#9C0000] hover:underline font-medium"
          >
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

      {/* Optional: nice message at the end */}
      {sortedAndFilteredProducts.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          Showing all {sortedAndFilteredProducts.length} products
        </div>
      )}
    </div>
  );
};

export default ProductGrid;