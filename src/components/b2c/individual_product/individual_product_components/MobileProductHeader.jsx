import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import { useWishlist } from "../../../../context/WishlistContext";
import SearchDropdown from "../../../common/navbar/SearchDropdown";
import { searchService } from "../../../../services/searchService";
import useDebounce from "../../../../hooks/useDebounce";
import { mainlogo } from "../../../../assets";

const MobileProductHeader = () => {
  const navigate = useNavigate();
  const { cartCount, loading: cartLoading } = useCart();
  const { wishlistCount, loading: wishlistLoading } = useWishlist();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Fetch popular searches
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const popular = await searchService.getPopularSearches();
        setPopularSearches(popular);
      } catch (err) {
        console.error("Failed to load popular searches", err);
      }
    };
    fetchPopular();
  }, []);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
        setSearchResults([]);
        setSearchSuggestions([]);
        setNoResults(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const [results, suggestions] = await Promise.all([
          searchService.searchProducts(debouncedSearchQuery, { limit: 10 }),
          searchService.getSearchSuggestions(debouncedSearchQuery, 5),
        ]);

        setSearchResults(results);
        setSearchSuggestions(suggestions);
        setNoResults(results.length === 0 && suggestions.length === 0);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
        setSearchSuggestions([]);
        setNoResults(true);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const saveRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((term) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      saveRecentSearch(suggestion);
      setSearchQuery(suggestion);
      navigate(`/womenwear?query=${encodeURIComponent(suggestion)}`);
      setSearchOpen(false);
      setSearchQuery("");
    },
    [navigate, saveRecentSearch]
  );

  const handleResultClick = useCallback(
    (product) => {
      navigate(`/products/${product.id}`);
      setSearchOpen(false);
      setSearchQuery("");
    },
    [navigate]
  );

  // When search mode → full search UI
  if (searchOpen) {
    return (
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
        onSuggestionClick={handleSuggestionClick}
        onResultClick={handleResultClick}
        onSaveRecent={saveRecentSearch}
        onRemoveRecent={removeRecentSearch}
      />
    );
  }

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50">

      <div className="grid grid-cols-3 items-center px-4 h-[60px]">

        {/* Left */}
        <div className="flex justify-start">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Center LOGO */}
        <div className="flex mr-5 justify-center">
          <img
            src={mainlogo}
            alt="Logo"
            className="h-12 object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Right Icons */}
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => setSearchOpen(true)}>
            <Search size={20} className="text-gray-900" />
          </button>

          <button onClick={() => navigate("/profile")}>
            <svg
              className="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>


    </div>
  );
};

export default MobileProductHeader;
