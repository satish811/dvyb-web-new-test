import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProductFilter } from "../../../hooks/useProductFilter";
import { useFilter } from "../../../context/FilterContext";
import ProductCard from "./ProductCard";
import AdsCarousel from "../../common/AdSection/AdsCarousel";
import Pagination from "../../common/Pagination";

// Category mapping for URL to product dressType
const CATEGORY_MAPPINGS = {
  "saree": "Saree",
  "sarees": "Saree",
  "lehenga": "Lehenga",
  "lehengas": "Lehenga",
  "kurta-sets": "Kurta Sets",
  "kurta-set": "Kurta Set",
  "kurtas": "Kurta Sets",
  "anarkalis": "Anarkalis",
  "anarkali": "Anarkali",
  "shararas": "Shararas",
  "pret": "Pret",
  "fusion": "Fusion",
  "wedding": "Wedding",
  "virtual-tryon": "Virtual Tryon",
  "boutique": "Boutique",
  "blouses": "Blouses",
  "blouse": "Blouses",
  "salwar-suit": "Salwar Suit",
  "salwar-suits": "Salwar Suit",
  "indo-western": "Indo Western",
  "bridal": "Bridal"
};

// Additional dressType aliases to handle Firestore field variations
const DRESS_TYPE_ALIASES = {
  "kurta sets": ["kurta sets", "kurtas", "kurta", "kurta set"],
  "kurta set": ["kurta set", "kurta sets", "kurtas", "kurta"],
  "saree": ["saree", "sarees"],
  "lehenga": ["lehenga", "lehengas", "lehenga choli"],
  "anarkalis": ["anarkalis", "anarkali"],
  "shararas": ["shararas", "sharara"],
};

const ProductGrid = ({
  products,
  category,
  sortBy: externalSortBy,
  hideHeader = false,
  columns = 4,
  responsiveClasses,
  zoomLevel = 100,
  cardSize = "md"
}) => {
  const location = useLocation();
  const { selectedFilters, clearAllFilters } = useFilter();

  // Get all filtered products from hook
  const filteredProducts = useProductFilter(products || []);

  const [internalSortBy, setInternalSortBy] = useState("");
  const sortBy = externalSortBy || internalSortBy;

  // Read current page from URL query params
  const currentPage = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return parseInt(queryParams.get('page') || '1', 10);
  }, [location.search]);

  const productsPerPage = 12;

  /**
   * FILTER PRODUCTS BY CATEGORY FROM URL
   * Uses flexible group matching so 'kurta' dressType matches 'kurta-sets' URL category
   */
  const productsByCategory = useMemo(() => {
    // If no category selected (All Products page), return all filtered products
    if (!category) {
      return filteredProducts;
    }

    // Normalize category to a base keyword for group matching
    const categoryLower = category.toLowerCase();

    // Group definitions: URL pattern → array of matching dressType keywords (all lowercase)
    const CATEGORY_GROUPS = {
      saree: (dt) => dt === "saree" || dt === "sarees",
      sarees: (dt) => dt === "saree" || dt === "sarees",
      lehenga: (dt) => dt.includes("lehenga"),
      lehengas: (dt) => dt.includes("lehenga"),
      "kurta-sets": (dt) => dt.includes("kurta"),
      "kurta-set": (dt) => dt.includes("kurta"),
      kurtas: (dt) => dt.includes("kurta"),
      anarkalis: (dt) => dt === "anarkali" || dt === "anarkalis" || dt.includes("anarkali"),
      anarkali: (dt) => dt === "anarkali" || dt === "anarkalis" || dt.includes("anarkali"),
      shararas: (dt) => dt === "sharara" || dt === "shararas" || dt.includes("sharara"),
      pret: (dt) => dt === "pret",
      fusion: (dt) => dt === "fusion",
      wedding: (dt) => dt === "wedding",
      blouses: (dt) => dt.includes("blous"),
      blouse: (dt) => dt.includes("blous"),
      boutique: (dt) => dt === "boutique",
      "salwar-suit": (dt) => dt.includes("salwar"),
      "salwar-suits": (dt) => dt.includes("salwar"),
      "indo-western": (dt) => dt.includes("indo") || dt.includes("western"),
      bridal: (dt) => dt === "bridal" || dt.includes("bridal") || dt === "wedding" || dt.includes("wedding"),
    };

    const matcher = CATEGORY_GROUPS[categoryLower];

    // DEBUG: log all unique dressTypes + which ones match
    const allDressTypes = [...new Set(filteredProducts.map(p => p.dressType).filter(Boolean))];
    console.log(`[DEBUG] URL category="${categoryLower}" | All dressTypes in products:`, allDressTypes);

    const filtered = filteredProducts.filter(product => {
      const dt = product.dressType?.trim()?.toLowerCase();
      if (!dt) return false;
      if (matcher) return matcher(dt);
      // Fallback: check if dressType contains the first word of the category
      const baseWord = categoryLower.split("-")[0];
      return dt.includes(baseWord);
    });

    console.log(`[DEBUG] Found ${filtered.length} products for category "${categoryLower}"`);
    return filtered;
  }, [filteredProducts, category]);

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

  /**
   * Sort and filter products
   */
  const sortedAndFilteredProducts = useMemo(() => {
    let items = [...productsByCategory];

    if (sortBy === "low-to-high") {
      items.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === "high-to-low") {
      items.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    }

    return items;
  }, [productsByCategory, sortBy]);

  /**
   * Filter to only show published products
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

  console.log("^^^^^^^^^^^^^^^^^^^", paginatedProducts);

  console.log("Products to display:", paginatedProducts.length, "products");
  console.log("First product dressType:", paginatedProducts[0]?.dressType);

  // Ensure current page is valid (if filters reduce product count)
  useEffect(() => {
    if (shouldPaginate && currentPage > totalPages && totalPages > 0) {
      const params = new URLSearchParams(location.search);
      params.set('page', '1');
      window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    }
  }, [currentPage, totalPages, location, shouldPaginate]);

  /**
   * Generate grid classes based on zoom level
   */
  const getGridClasses = useMemo(() => {
    if (responsiveClasses) {
      return responsiveClasses;
    }

    if (zoomLevel <= 90) {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";
    } else if (zoomLevel <= 110) {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";
    } else {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    }
  }, [columns, responsiveClasses, zoomLevel]);

  /**
   * Get card size classes based on zoom level
   */
  const getCardSizeClasses = useMemo(() => {
    switch (cardSize) {
      case "lg":
        return "max-w-[500px] sm:max-w-full";
      case "md":
        return "max-w-[350px] sm:max-w-full";
      case "sm":
        return "max-w-[280px] sm:max-w-full";
      default:
        return "max-w-[350px] sm:max-w-full";
    }
  }, [cardSize]);

  /**
   * Get gap classes based on zoom level
   */
  const getGapClasses = useMemo(() => {
    if (zoomLevel >= 111) {
      return "gap-6 sm:gap-7 md:gap-8";
    }
    if (zoomLevel >= 91) {
      return "gap-4 sm:gap-5 md:gap-6 2xl:gap-8";
    }
    return "gap-3 sm:gap-3 md:gap-4 lg:gap-5";
  }, [zoomLevel]);

  /**
   * Get container padding based on zoom level
   */
  const getContainerClasses = useMemo(() => {
    if (zoomLevel >= 111) {
      return "px-2 sm:px-4";
    }
    if (zoomLevel >= 91) {
      return "px-2 sm:px-3";
    }
    return "px-1 sm:px-2";
  }, [zoomLevel]);

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
          <p className="text-gray-500 text-lg mb-4">
            {category ? `No products found in ${category} category.` : 'No products match your filters.'}
          </p>
          <button onClick={clearAllFilters} className="text-[#9C0000] hover:underline font-medium">
            Clear all filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Ads - Hide if header is hidden */}
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
              {category ? CATEGORY_MAPPINGS[category] || category.replace(/-/g, ' ') : "All Products"}
            </h1>
            <span className="text-[0.85rem] font-normal text-gray-600">
              ({productsToDisplay.length} products)
            </span>
          </div>

          {/* Zoom indicator - optional */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              {zoomLevel <= 90 ? '6 columns' : zoomLevel <= 110 ? '4 columns' : '2 columns'}
            </span>
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
        </div>
      )}

      {/* Black straight line after Title + Sort section */}
      {!hideHeader && <div className="hidden sm:block border-t border-black mb-6"></div>}

      {/* Product Grid */}
      <div
        className={`
          grid 
          ${getGridClasses} 
          ${getGapClasses}
          ${getContainerClasses}
          transition-all duration-300 ease-in-out
        `}
      >
        {paginatedProducts.map((product) => (
          <div
            key={product.id}
            className={`
              ${getCardSizeClasses} 
              w-full mx-auto
              transform transition-all duration-300 ease-in-out
            `}
          >
            <ProductCard
              product={product}
              zoomLevel={zoomLevel}
              cardSize={cardSize}
            />
          </div>
        ))}
      </div>

      {/* Column count indicator for mobile */}
      <div className="sm:hidden text-center mt-4 text-xs text-gray-500">
        {zoomLevel <= 90 ? '6 products per row' : zoomLevel <= 110 ? '4 products per row' : '2 products per row'}
      </div>

      {/* Pagination - Only show on "All Products" page */}
      {shouldPaginate && totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;