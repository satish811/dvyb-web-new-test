import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/b2c/sidebar/Sidebar";
import { ArrowLeft, Funnel, X, Search, Heart, ShoppingBag, User } from "lucide-react";
import { mainlogo } from "../assets";
import { useState, useEffect, useCallback, useMemo } from "react";
import SearchDropdown from "../components/common/navbar/SearchDropdown";
import { searchService } from "../services/searchService";
import useDebounce from "../hooks/useDebounce";
import ProductGrid from "../components/b2c/products/ProductGrid";

export default function ProductLayout({ children, products }) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /**
   * Get category from URL query params
   */
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const category = queryParams.get("category");

  /**
   * Filter products based on category
   */
  const filteredProducts = useMemo(() => {
    return category
      ? products.filter((p) => p.dressType?.trim().toLowerCase() === category?.trim().toLowerCase())
      : products;
  }, [category, products]);

  /**
   * Load recent & popular searches from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

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

  return (
    <>
      {/* Full Screen Search Dropdown */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white z-[60] md:hidden">
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
      {/* 🔥 Mobile Header (Back + Logo + Icons) */}
      {/* -------------------------------------------------------------- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-50 h-[60px] px-4 grid grid-cols-3 items-center">

        {/* Left column */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
        </div>

        {/* Center column (LOGO) */}
        <div className="flex justify-center mr-5">
          <img
            src={mainlogo}
            alt="Logo"
            onClick={() => navigate("/")}
            className="h-12 cursor-pointer"
          />
        </div>

        {/* Right column */}
        <div className="flex justify-end">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <Search size={20} className="text-gray-700" />
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <User size={20} className="text-gray-700" />
          </button>
        </div>
      </div>


      {/* -------------------------------------------------------------- */}
      {/* 🔥 Funnel + Sort Bar (Reduced Height) */}
      {/* -------------------------------------------------------------- */}
      <div className="lg:hidden fixed top-[60px] left-0 right-0 bg-white z-40 px-3 py-2 flex items-center justify-between">
        {/* Funnel Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded-md active:scale-95 transition"
        >
          <Funnel size={16} className="text-gray-700" />
          <span className="text-xs font-medium text-gray-700">Filters</span>
        </button>

        {/* SortBy Dropdown */}
        <select
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-xs font-medium text-gray-700 bg-white"
        >
          <option value="recommended">Recommended</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Mobile Sidebar Overlay */}
      {/* -------------------------------------------------------------- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* -------------------------------------------------------------- */}
      {/* Mobile Sidebar (ONLY for mobile) */}
      {/* -------------------------------------------------------------- */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header with Logo in Center and Close on Right */}
        <div className="flex items-center justify-between p-4 sticky top-0 bg-white z-10 shadow-sm">

          {/* Empty div to balance the layout - keeps logo centered */}
          <div className="w-10"></div>

          {/* Logo - Centered */}
          <img
            src={mainlogo}
            alt="Logo"
            className="h-10 cursor-pointer"
            onClick={() => {
              navigate("/");
              setIsSidebarOpen(false);
            }}
          />

          {/* Close Button - Right */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <X size={24} />
          </button>
        </div>

        <Sidebar products={products} />
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Main Layout */}
      {/* -------------------------------------------------------------- */}
      <div className="lg:mt-10 mx-[5px] lg:mx-[60px] my-[10px] lg:my-[20px] min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">

          {/* -------------------------------------------------------------- */}
          {/* Desktop Sidebar (ONLY for desktop) - This is the only desktop sidebar */}
          {/* -------------------------------------------------------------- */}
          <aside className="hidden lg:block lg:w-80 xl:w-72 lg:sticky lg:top-15 lg:self-start lg:h-full">
            <div className="h-full">
              <Sidebar products={products} />
            </div>
          </aside>

          <section className="flex-1 w-full pb-20 lg:pb-0 lg:h-full">
            {/* -------------------------------------------------------------- */}
            {/* Desktop Sort Section (if needed) */}
            {/* -------------------------------------------------------------- */}
            <div className="hidden lg:hidden lg:flex items-center justify-end mb-6">
              <select
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="recommended">Recommended</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Render ProductGrid directly here */}
            <div className="mt-4 lg:mt-0 lg:px-6 lg:py-8 h-full">
              <ProductGrid products={filteredProducts} category={category} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
