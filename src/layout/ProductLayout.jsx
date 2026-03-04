import { useLocation, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/b2c/sidebar/Sidebar";
import { ArrowLeft, Funnel, X, Search, Heart, ShoppingBag, User, ListFilter, ArrowUpDown, Minus, Plus } from "lucide-react";
import { mainlogo } from "../assets";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import SearchDropdown from "../components/common/navbar/SearchDropdown";
import { searchService } from "../services/searchService";
import useDebounce from "../hooks/useDebounce";
import ProductGrid from "../components/b2c/products/ProductGrid";
import { useFilter } from "../context/FilterContext";
import CategoryTags, { normalizeCategory } from "../components/b2c/products/CategoryTags";
import { extractSubcategories } from "../utils/categoryExtractor";
import Fuse from "fuse.js";

export default function ProductLayout({ children, products, categoryFromRoute, loading = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateFilter, selectedFilters, clearAllFilters, resetAndSetFilters, searchQuery } = useFilter();

  const [sortValue, setSortValue] = useState("recommended");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);

  // Lock body scroll when filter drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFilters.categories?.length) count += selectedFilters.categories.length;
    if (selectedFilters.subcategories?.length) count += selectedFilters.subcategories.length;
    if (selectedFilters.sizes?.length) count += selectedFilters.sizes.length;
    if (selectedFilters.colors?.length) count += selectedFilters.colors.length;
    if (selectedFilters.discounts?.length) count += selectedFilters.discounts.length;
    if (selectedFilters.blouses?.length) count += selectedFilters.blouses.length;
    if (selectedFilters.boutiques?.length) count += selectedFilters.boutiques.length;
    if (selectedFilters.priceMin != null) count++;
    if (selectedFilters.priceMax != null) count++;
    return count;
  }, [selectedFilters]);

  const [searchOpen, setSearchOpen] = useState(false);
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
   * Also get subcategory from query params and search query
   */
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const category = categoryFromRoute || queryParams.get("category");
  const subcategory = queryParams.get("sub");
  const urlPriceMax = queryParams.get("priceMax");
  const urlPriceMin = queryParams.get("priceMin");


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
   * Sync URL params (category + price) to FilterContext when route changes
   * Uses resetAndSetFilters for atomic, race-condition-free state updates
   */
  useEffect(() => {
    console.log(`[ProductLayout] URL sync: category="${category}", priceMin=${urlPriceMin}, priceMax=${urlPriceMax}, search="${searchQuery}"`);

    // If there's a search query, let the search handle filtering
    if (searchQuery) {
      console.log(`[ProductLayout] Search query present, skipping URL sync`);
      return;
    }

    // Build the new filter state from URL params in one go
    const newFilters = {};

    // Parse price from URL
    if (urlPriceMax != null) {
      const maxVal = Number(urlPriceMax);
      if (!isNaN(maxVal) && maxVal > 0) newFilters.priceMax = maxVal;
    }
    if (urlPriceMin != null) {
      const minVal = Number(urlPriceMin);
      if (!isNaN(minVal) && minVal >= 0) newFilters.priceMin = minVal;
    }

    // Parse category from URL
    if (category) {
      const normalized = normalizeCategory(category);
      const MAIN_CATEGORIES = {
        "saree": "SAREE",
        "lehenga": "LEHENGA",
        "kurta-sets": "KURTA SETS",
        "kurta-set": "KURTA SETS",
        "anarkalis": "ANARKALIS",
        "anarkali": "ANARKALIS",
        "shararas": "SHARARAS",
        "pret": "PRÊT",
        "fusion": "FUSION",
        "wedding": "WEDDING",
        "sale": "SALE",
        "salwar-suit": "SALWAR SUIT",
        "salwar-suits": "SALWAR SUIT",
        "indo-western": "INDO WESTERN",
        "bridal": "BRIDAL"
      };
      const filterValue = MAIN_CATEGORIES[normalized] || normalized.toUpperCase();
      newFilters.categories = [filterValue];
      console.log(`[ProductLayout] Setting category filter: "${filterValue}"`);
    }

    console.log(`[ProductLayout] Applying atomic filter reset:`, newFilters);
    // Atomic: clear all old filters and set new ones in a single state update
    resetAndSetFilters(newFilters);

  }, [category, subcategory, searchQuery, urlPriceMax, urlPriceMin]); // REMOVED selectedFilters dependency to prevent infinite loop

  /**
   * Build a Fuse.js instance for the current product list (memoized)
   */
  const productFuse = useMemo(() => {
    if (!products || products.length === 0) return null;
    return new Fuse(products, {
      keys: [
        { name: "title", weight: 0.3 },
        { name: "name", weight: 0.3 },
        { name: "category", weight: 0.2 },
        { name: "subcategory", weight: 0.15 },
        { name: "dressType", weight: 0.15 },
        { name: "description", weight: 0.05 },
        { name: "tags", weight: 0.15 },
        { name: "fabric", weight: 0.1 },
        { name: "craft", weight: 0.1 },
        { name: "shopName", weight: 0.2 },
        { name: "boutiqueName", weight: 0.2 },
        { name: "brand", weight: 0.25 },
      ],
      threshold: 0.35,
      distance: 100,
      minMatchCharLength: 1,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
    });
  }, [products]);

  /**
   * Simple stemmer for common Indian fashion plurals
   */
  const stemQuery = useCallback((query) => {
    const pluralMap = {
      sarees: "saree", lehengas: "lehenga", kurtis: "kurti",
      shararas: "sharara", anarkalis: "anarkali", gowns: "gown",
      dupattas: "dupatta", suits: "suit", blouses: "blouse",
      palazzos: "palazzo", dresses: "dress",
    };
    return query
      .split(/\s+/)
      .map((w) => {
        const lower = w.toLowerCase();
        if (pluralMap[lower]) return pluralMap[lower];
        if (lower.endsWith("ies") && lower.length > 4) return lower.slice(0, -3) + "y";
        if (lower.endsWith("es") && lower.length > 4) return lower.slice(0, -2);
        if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 3) return lower.slice(0, -1);
        return lower;
      })
      .join(" ");
  }, []);

  /**
   * Filter products locally for special cases like "Boutique" and search queries
   * Uses Fuse.js fuzzy matching for search (handles typos, plurals, partial matches)
   */
  const visibleProducts = useMemo(() => {
    let filtered = products;

    // Filter by boutique
    if (category?.toLowerCase() === "boutique") {
      filtered = filtered.filter((p) => p.boutique === true || (p.shopName && p.shopName.trim().length > 0));
    }

    // Filter by search query if present — using Fuse.js fuzzy matching
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const stemmed = stemQuery(query);

      if (productFuse) {
        // Fuzzy search with original + stemmed query
        const fuseResults = productFuse.search(query);
        const stemmedResults = stemmed !== query ? productFuse.search(stemmed) : [];

        // Also do direct substring match as fallback
        const substringResults = (filtered || []).filter((p) => {
          const searchText = [
            p.title, p.name, p.category, p.subcategory, p.dressType,
            p.description, p.fabric, p.craft, p.shopName, p.boutiqueName, p.brand,
            ...(Array.isArray(p.tags) ? p.tags : []),
          ].filter(Boolean).join(" ").toLowerCase();
          return searchText.includes(query) || searchText.includes(stemmed);
        });

        // Merge and deduplicate
        const seenIds = new Set();
        const merged = [];

        for (const p of substringResults) {
          if (!seenIds.has(p.id)) { seenIds.add(p.id); merged.push(p); }
        }
        for (const { item } of stemmedResults) {
          if (!seenIds.has(item.id)) { seenIds.add(item.id); merged.push(item); }
        }
        for (const { item } of fuseResults) {
          if (!seenIds.has(item.id)) { seenIds.add(item.id); merged.push(item); }
        }

        filtered = merged;
      } else {
        // Fallback if Fuse not ready
        filtered = (filtered || []).filter((p) => {
          const searchText = [
            p.title, p.name, p.category, p.subcategory, p.dressType,
            p.description, p.fabric, p.craft, p.shopName, p.boutiqueName, p.brand,
            ...(Array.isArray(p.tags) ? p.tags : []),
          ].filter(Boolean).join(" ").toLowerCase();
          return searchText.includes(query) || searchText.includes(stemmed);
        });
      }
    }

    return filtered;
  }, [category, searchQuery, products, productFuse, stemQuery]);

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
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 1) {
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
    <div className="bg-white">
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
        <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-16 py-4">

          <div className="flex items-center gap-2 mb-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest">
            <button
              onClick={() => navigate(-1)}
              className="mr-2 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              aria-label="Go Back"
            >
              <ArrowLeft size={16} className="text-gray-700" />
            </button>
            <Link to="/" className="text-black hover:text-gray-600 transition-colors">HOME</Link>
            <span className="mx-1 text-black font-medium">{'>'}</span>
            <Link to="/womenwear" className="text-black hover:text-gray-600 transition-colors">WOMEN</Link>
            <span className="mx-1 text-black font-medium">{'>'}</span>
            <span className="text-gray-500 font-medium">
              {category
                ? category.toUpperCase().replace("-", " ")
                : urlPriceMax
                  ? `UNDER ₹${Number(urlPriceMax).toLocaleString("en-IN")}`
                  : "ALL PRODUCTS"}
            </span>
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
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
                  } else {
                    setIsSidebarOpen(true);
                  }
                }}
                className="flex items-center gap-2 group cursor-pointer relative"
              >
                <div className="hidden sm:block">
                  <ListFilter size={18} className="text-gray-800" />
                </div>
                <span className="text-sm font-bold text-gray-800 border-b border-transparent group-hover:border-black uppercase tracking-wider">
                  FILTER
                </span>
                <Funnel size={16} className="text-gray-800 ml-1" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
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
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* -------------------------------------------------------------- */}
      {/* Mobile Sidebar Drawer (Right Side slide-in) */}
      {/* -------------------------------------------------------------- */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-[60] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col lg:hidden ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 -mr-2 text-gray-500 hover:text-black transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Filter Content */}
        <div
          className="flex-1 overflow-y-auto pb-4"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
          <Sidebar products={products} activeRouteCategory={category} />
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => {
              clearAllFilters();
            }}
            className="flex-1 py-3 text-sm font-bold uppercase tracking-wider text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex-1 py-3 text-sm font-bold uppercase tracking-wider text-white rounded-md transition-colors"
            style={{ background: 'var(--villy-primary, #33022F)' }}
          >
            Apply ({activeFilterCount})
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Main Content Area */}
      {/* -------------------------------------------------------------- */}
      <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-16 pb-10 2xl:pb-16 flex items-start gap-6 xl:gap-10">

        {/* Left Side - Product Grid */}
        <div className="flex-1 w-full min-w-0">
          <ProductGrid
            products={visibleProducts}
            category={category}
            sortBy={sortValue}
            hideHeader={true}
            columns={gridColumns}
            zoomLevel={zoomLevel}
            cardSize={cardSizeClass}
            loading={loading}
          />
        </div>

        {/* Right Side - Desktop Sticky Sidebar */}
        {isDesktopSidebarOpen && (
          <div
            className="hidden lg:flex w-[300px] xl:w-[320px] flex-shrink-0 sticky top-[240px] flex-col rounded-md shadow-sm bg-white border border-gray-100"
            style={{
              height: 'calc(100vh - 250px)',
            }}
          >
            {/* Header - Fixed */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsDesktopSidebarOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-black transition cursor-pointer"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto pr-2"
              style={{
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <Sidebar products={products} activeRouteCategory={category} />
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-gray-200 bg-white px-5 py-4 flex items-center gap-3 shrink-0 rounded-b-md">
              <button
                onClick={() => clearAllFilters()}
                className="flex-1 py-3 text-sm font-bold uppercase tracking-wider text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}