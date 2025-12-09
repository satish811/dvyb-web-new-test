// components/layouts/ProductLayout.jsx
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/b2c/sidebar/Sidebar";
import { ArrowLeft, Funnel, X } from "lucide-react";
import { mainlogo } from "../assets";
import { useState, useEffect, useCallback } from "react";
import SearchDropdown from "../components/common/navbar/SearchDropdown";
import { searchService } from "../services/searchService";
import useDebounce from "../hooks/useDebounce";

export default function ProductLayout({ children, products }) {
  const navigate = useNavigate();
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

  // Load recent & popular searches
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Search effect
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
      <div className="items-center justify-between lg:hidden fixed top-0 left-0 right-0 bg-white z-50 h-[60px] px-4 flex ">
        {/* Back Arrow - Left Side */}
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
        >
          <ArrowLeft size={24} className="text-gray-800" />
        </button>

        {/* Logo - Center */}
        <img
          src={mainlogo}
          alt="Logo"
          onClick={() => navigate("/")}
          className="h-12 mt-3 cursor-pointer"
        />

        {/* Icons Container - Right Side */}
        <div className="flex items-end justyify-end">
          {/* Search Icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </button>

          {/* Wishlist Icon - Heart */}
          <button
            onClick={() => navigate("/wishlist")}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Cart Icon - Shopping Bag */}
          <button
            onClick={() => navigate("/cart")}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => navigate("/profile")}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A12.073 12.073 0 0112 15c2.507 0 4.824.776 6.879 2.121M12 12a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
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
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button for Mobile */}
        <div className="flex justify-end p-4 sticky top-0 bg-white z-10">
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
      <div className="container mx-auto px-4 pt-[70px] lg:pt-0 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* -------------------------------------------------------------- */}
          {/* Desktop Sidebar (ONLY for desktop) - This is the only desktop sidebar */}
          {/* -------------------------------------------------------------- */}
          <aside className="hidden lg:block lg:w-80 xl:w-72 lg:sticky lg:top-20 lg:self-start lg:h-fit lg:mt-20">
            <Sidebar products={products} />
          </aside>

          <section className="flex-1 w-full pb-20 lg:pb-0">
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

            <div className="mt-4 lg:mt-0">{children}</div>
          </section>
        </div>
      </div>
    </>
  );
}
