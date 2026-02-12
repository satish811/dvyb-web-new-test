import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/b2c/sidebar/Sidebar";
import { ArrowLeft, Funnel, X, Search, Heart, ShoppingBag, User, ListFilter, ArrowUpDown, Minus, Plus } from "lucide-react";
import { mainlogo } from "../assets";
import { useState, useEffect, useCallback, useMemo } from "react";
import SearchDropdown from "../components/common/navbar/SearchDropdown";
import { searchService } from "../services/searchService";
import useDebounce from "../hooks/useDebounce";
import ProductGrid from "../components/b2c/products/ProductGrid";
import { useFilter } from "../context/FilterContext";
import CategoryTags, { normalizeCategory } from "../components/b2c/products/CategoryTags";
import { extractSubcategories } from "../utils/categoryExtractor";

export default function ProductLayout({ children, products, categoryFromRoute }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateFilter, selectedFilters, clearAllFilters } = useFilter();

  const [sortValue, setSortValue] = useState("recommended");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Zoom slider state - stored in localStorage to persist across sessions
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem("productZoomLevel");
    return savedZoom ? parseInt(savedZoom, 10) : 100;
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /**
   * Get category from route param (priority) or URL query params (fallback)
   * Also get subcategory from query params
   */
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const category = categoryFromRoute || queryParams.get("category");
  const subcategory = queryParams.get("sub");

  /**
   * Get available subcategories dynamically from product data
   */
  const availableSubcategories = useMemo(() => {
    if (!category) return [];

    // Extract subcategories dynamically from actual products
    const categoryUpper = category.toUpperCase();
    return extractSubcategories(products, categoryUpper);
  }, [category, products]);

  /**
   * Sync category to FilterContext when route changes
   * NOTE: Only runs when category/subcategory changes, NOT on filter updates
   */
  useEffect(() => {
    console.log(`[ProductLayout] Category from URL: "${category}"`);
    console.log(`[ProductLayout] Current selectedFilters:`, selectedFilters);

    if (!category) {
      // On "All Products" page - clear filters
      console.log("[ProductLayout] No category, clearing filters");
      clearAllFilters();
      return;
    }

    // Update category in filter context
    const normalized = normalizeCategory(category);
    const MAIN_CATEGORIES = {
      "saree": "SAREE",
      "lehenga": "LEHENGA",
      "kurta-sets": "KURTA SETS",
      "anarkalis": "ANARKALIS",
      "shararas": "SHARARAS",
      "pret": "PRÊT",
      "fusion": "FUSION",
      "wedding": "WEDDING",
      "sale": "SALE"
    };

    const filterValue = MAIN_CATEGORIES[normalized] || normalized.toUpperCase();

    console.log(`[ProductLayout] Normalized: "${normalized}", Filter value: "${filterValue}"`);
    console.log(`[ProductLayout] Calling updateFilter("categories", "${filterValue}")`);

    // Only update category when it changes
    updateFilter("categories", filterValue);

  }, [category, subcategory]);

  /**
   * Filter products locally ONLY for special cases like "Boutique"
   */
  const visibleProducts = useMemo(() => {
    if (category?.toLowerCase() === "boutique") {
      return products.filter((p) => p.boutique === true || (p.shopName && p.shopName.trim().length > 0));
    }
    return products;
  }, [category, products]);

  /**
   * Load recent & popular searches from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  /**
   * Save zoom level to localStorage whenever it changes
   */
  useEffect(() => {
    localStorage.setItem("productZoomLevel", zoomLevel.toString());
  }, [zoomLevel]);

  /**
   * Search effect
   */
  useEffect(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const [results, suggestions] = await Promise.all([
          searchService.searchProducts(debouncedSearchQuery, { limit: 10 }),
          searchService.getSearchSuggestions(debouncedSearchQuery, 5),
        ]);
        setSearchResults(results);
        setSearchSuggestions(suggestions);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedSearchQuery]);

  /**
   * Save recent search term to localStorage
   */
  const saveRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Handle zoom slider change
   */
  const handleZoomChange = (e) => {
    setZoomLevel(parseInt(e.target.value, 10));
  };

  const decreaseZoom = () => {
    setZoomLevel((prev) => Math.max(60, prev - 10));
  };

  const increaseZoom = () => {
    setZoomLevel((prev) => Math.min(140, prev + 10));
  };

  /**
   * Calculate grid columns based on zoom level
   */
  const gridColumns = useMemo(() => {
    if (zoomLevel >= 120) return 3;
    if (zoomLevel >= 90) return 4;
    if (zoomLevel >= 60) return 5;
    return 5;
  }, [zoomLevel]);

  /**
   * Calculate product card size class based on zoom level
   */
  const cardSizeClass = useMemo(() => {
    if (zoomLevel >= 120) return "lg";
    if (zoomLevel >= 90) return "md";
    return "sm"; // Default to sm for zoom out
  }, [zoomLevel]);

  return (
    <div className="bg-white min-h-screen">
      {/* Full Screen Search Dropdown */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white z-[60]">
          <SearchDropdown
            searchResults={searchResults}
            suggestions={searchSuggestions}
            popularSearches={popularSearches}
            recentSearches={recentSearches}
            isLoading={isSearching}
            noResults={noResults}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClose={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            onSuggestionClick={(s) => {
              saveRecentSearch(s);
              navigate(`/womenwear?query=${encodeURIComponent(s)}`);
              setSearchOpen(false);
              setSearchQuery("");
            }}
            onResultClick={(product) => {
              navigate(`/products/${product.id}`);
              setSearchOpen(false);
              setSearchQuery("");
            }}
            onSaveRecent={saveRecentSearch}
            onRemoveRecent={(term) => setRecentSearches((prev) => prev.filter((s) => s !== term))}
          />
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Horizontal Category Bar */}
      {/* -------------------------------------------------------------- */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-4">

          <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">
            HOME / WOMEN / {category ? category.toUpperCase().replace("-", " ") : "ALL PRODUCTS"}
          </div>

          {/* Fixed height container to prevent layout shift */}
          <div className="h-[40px] mb-6">
            <CategoryTags
              products={products}
              currentCategory={category}
              availableSubcategories={availableSubcategories}
            />
          </div>

          <div className="flex items-center justify-between mb-2">
            {/* Left side - Filter & Sort Controls */}
            <div className="flex items-center gap-6">
              {/* Filter Prompt */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 group cursor pointer"
              >
                <div className="hidden sm:block">
                  <ListFilter size={18} className="text-gray-800" />
                </div>
                <span className="text-sm font-bold text-gray-800 border-b border-transparent group-hover:border-black uppercase tracking-wider">
                  FILTER
                </span>
                <Funnel size={16} className="text-gray-800 ml-1" />
              </button>

              {/* Sort Prompt */}
              <div className="relative flex items-center gap-2 group cursor-pointer">
                <span className="text-sm font-bold text-gray-800 border-b border-transparent group-hover:border-black uppercase tracking-wider">
                  SORT
                </span>
                <ArrowUpDown size={16} className="text-gray-800" />
                {/* Native select for logic */}
                <select
                  value={sortValue}
                  onChange={(e) => setSortValue(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Right side - Zoom Slider Control */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:block">
                ZOOM
              </span>

              <div className="flex items-center gap-2">
                {/* Minus button - square no border */}
                <button
                  onClick={decreaseZoom}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={zoomLevel <= 60}
                  aria-label="Decrease product size"
                >
                  <Minus size={14} className="text-gray-700" />
                </button>

                {/* Square slider track */}
                <div className="relative w-24 md:w-32 h-8 bg-gray-100 flex items-center justify-center px-3">
                  <input
                    type="range"
                    min="60"
                    max="140"
                    step="5"
                    value={zoomLevel}
                    onChange={handleZoomChange}
                    className="w-full h-0.5 bg-gray-300 appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-gray-900
                [&::-webkit-slider-thumb]:rounded-none
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:bg-gray-900
                [&::-moz-range-thumb]:rounded-none
                [&::-moz-range-thumb]:cursor-pointer"
                    aria-label="Adjust product card size"
                  />
                </div>

                {/* Plus button - square no border */}
                <button
                  onClick={increaseZoom}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={zoomLevel >= 140}
                  aria-label="Increase product size"
                >
                  <Plus size={14} className="text-gray-700" />
                </button>

                <span className="text-xs font-medium text-gray-700 min-w-[40px] ml-1">
                  {zoomLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Mobile Sidebar Overlay */}
      {/* -------------------------------------------------------------- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* -------------------------------------------------------------- */}
      {/* Sidebar Drawer (Right Side slide-in) */}
      {/* -------------------------------------------------------------- */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-[60] transform transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 -mr-2 text-gray-500 hover:text-black transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="h-full overflow-y-auto pb-20">
          <Sidebar products={products} />
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Main Content Area */}
      {/* -------------------------------------------------------------- */}
      <div className="max-w-[1600px] mx-auto px-4 pb-20">
        <ProductGrid
          products={visibleProducts}
          category={category}
          sortBy={sortValue}
          hideHeader={true}
          columns={gridColumns}
          zoomLevel={zoomLevel}
          cardSize={cardSizeClass}
        />
      </div>
    </div>
  );
}