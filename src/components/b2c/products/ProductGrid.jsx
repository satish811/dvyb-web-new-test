import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProductFilter } from "../../../hooks/useProductFilter";
import { useFilter } from "../../../context/FilterContext";
import ProductCard from "./ProductCard";
import AdsCarousel from "../../common/AdSection/AdsCarousel";
import Pagination from "../../common/Pagination";

// Helper to generate fallback products
const generateFallbackProducts = (categoryName) => {
  const cleanCat = categoryName ? categoryName.replace(/-/g, " ") : "Fashion";

  return Array.from({ length: 6 }).map((_, i) => {
    // Random price generation
    const price = Math.floor(Math.random() * (12000 - 2500) + 2500);
    const originalPrice = Math.floor(price * (1 + Math.random() * 0.5)); // 0-50% markup

    return {
      id: `generated-${cleanCat.replace(/\s+/g, '-')}-${i}`,
      title: `${cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1)} Collection ${i + 1}`,
      name: `${cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1)} Special Edition ${i + 1}`,
      price: price,
      originalPrice: originalPrice,
      // Using a deterministic random keyword for variation if needed.
      // Use "fashion" as backup keyword to ensure diverse images
      imageUrls: [`https://source.unsplash.com/600x900/?${cleanCat.split(' ')[0]},saree,indian,fashion&sig=${i}`],
      category: cleanCat,
      isNew: i < 2, // First 2 are new
      selectedColors: ["Color_#FF0000", "Color_#00FF00", "Color_#0000FF"], // Mock colors
      description: "Elegant traditional wear crafted with perfection."
    };
  });
};

const ProductGrid = ({ products, category, sortBy: externalSortBy, hideHeader = false, columns }) => {
  const location = useLocation();
  const { selectedFilters, clearAllFilters } = useFilter();

  const filteredProducts = useProductFilter(products || []);

  const [internalSortBy, setInternalSortBy] = useState("");
  const sortBy = externalSortBy || internalSortBy;

  // Read current page from URL query params - wrapped in useMemo to prevent hook order issues
  const currentPage = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return parseInt(queryParams.get('page') || '1', 10);
  }, [location.search]);

  const productsPerPage = 12;

  /**
   * Determines if a product should be shown based on admin publication status and product publication status.
   */
  const shouldShowProduct = (product) => {
    if (!product) return false;

    const adminPublished = product.isAdminPublished ?? product.availability?.isAdminPublished;

    if (adminPublished !== undefined) {

      if (adminPublished === false) return false;
      if (adminPublished === true && !product.isPublished) return false;

    }
    return product.isPublished === true;
  };


  const sortedAndFilteredProducts = useMemo(() => {
    let items = [...filteredProducts];

    if (sortBy === "low-to-high") {
      items.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === "high-to-low") {
      items.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    }

    return items;
  }, [filteredProducts, sortBy]);

  /**
   * Filters the sorted and filtered products to only include those that should be shown.
   */
  const productsToDisplay = useMemo(() => {
    return sortedAndFilteredProducts.filter(shouldShowProduct);
  }, [sortedAndFilteredProducts]);

  // Only use pagination on "All Products" page, not on category-specific pages
  const shouldPaginate = !category;

  // Calculate pagination only if we should paginate
  const totalPages = shouldPaginate ? Math.ceil(productsToDisplay.length / productsPerPage) : 1;
  const startIndex = shouldPaginate ? (currentPage - 1) * productsPerPage : 0;
  const endIndex = shouldPaginate ? startIndex + productsPerPage : productsToDisplay.length;
  const paginatedProducts = productsToDisplay.slice(startIndex, endIndex);

  // Ensure current page is valid (if filters reduce product count)
  useEffect(() => {
    if (shouldPaginate && currentPage > totalPages && totalPages > 0) {
      const params = new URLSearchParams(location.search);
      params.set('page', '1');
      window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    }
  }, [currentPage, totalPages, location, shouldPaginate]);

  // Global Empty State (No Category selected, and No Products)
  if ((!products || products.length === 0) && !category) {
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

  // EARLY RETURN: If no products to display after filtering
  if (productsToDisplay.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">No products match your filters.</p>
          <button onClick={clearAllFilters} className="text-[#9C0000] hover:underline font-medium">
            Clear all filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Ads - Hide if header is hidden (assuming specific layout need) */}
      {!hideHeader && (
        <div className="mb-5">
          <AdsCarousel />
        </div>
      )}

      {/* Title + Sort - hidden if hideHeader is true */}
      {!hideHeader && (
        <div className="hidden sm:flex justify-between items-center mb-3">

          {/* Title + Correct Count */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-[1.3rem] font-semibold uppercase">
              {category || "All Products"}
            </h1>
            <span className="text-[0.85rem] font-normal text-gray-600">
              ({productsToDisplay.length} products)
            </span>
          </div>


          <select
            value={sortBy}
            onChange={(e) => setInternalSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-[#9C0000] focus:outline-none"
          >
            <option value="">Recommended</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>
      )}

      {/* Black straight line after Title + Sort section */}
      {!hideHeader && <div className="hidden sm:block border-t border-black mb-6"></div>
      }


      {/* Show Products (Real or Fallback) */}
      {productsToDisplay.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">No products match your filters.</p>
          <button onClick={clearAllFilters} className="text-[#9C0000] hover:underline font-medium">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div
            className={`
          grid gap-4 sm:gap-6 md:gap-8
          ${columns === 4 ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'}
        `}
          >
            {paginatedProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination - Only show on "All Products" page, not on category pages */}
          {shouldPaginate && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </>
      )}

    </div>
  );
};

export default ProductGrid;
