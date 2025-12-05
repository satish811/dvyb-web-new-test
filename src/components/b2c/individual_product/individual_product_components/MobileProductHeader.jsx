import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import { useWishlist } from "../../../../context/WishlistContext";
import SearchDropdown from "../../../common/navbar/SearchDropdown";
import { searchService } from "../../../../services/searchService";
import useDebounce from "../../../../hooks/useDebounce";

const MobileProductHeader = ({ productName }) => {
  const navigate = useNavigate();
  const { cartCount, loading: cartLoading } = useCart();
  const { wishlistCount, loading: wishlistLoading } = useWishlist();

  // Search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Fetch popular searches once
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

  // Perform search when debounced query changes
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

    if (debouncedSearchQuery?.trim().length >= 2) {
      saveRecentSearch(debouncedSearchQuery.trim());
    }
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

      const queryLower = suggestion.toLowerCase().trim();
      const categoryMap = {
        saree: "saree",
        sarees: "saree",
        kurti: "kurta-sets",
        kurtis: "kurta-sets",
        lehenga: "lehenga",
        lehengas: "lehenga",
        anarkali: "anarkalis",
        sharara: "shararas",
        gown: "gown",
        fusion: "fusion",
        wedding: "wedding",
      };

      if (categoryMap[queryLower]) {
        navigate(`/womenwear?category=${categoryMap[queryLower]}`);
      } else {
        navigate(`/womenwear?query=${encodeURIComponent(suggestion)}`);
      }

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
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back Arrow */}
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>

        {/* Product Name */}
        <h1 className="text-base font-medium uppercase text-gray-900 tracking-wide">
          {productName || "PRODUCT"}
        </h1>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <button onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={20} className="text-gray-900" />
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => navigate("/wishlist")}
            className="relative"
            aria-label="Wishlist"
            disabled={wishlistLoading}
          >
            <Heart size={20} className="text-gray-900" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {wishlistLoading ? "..." : wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => navigate("/cart")}
            className="relative"
            aria-label="Cart"
            disabled={cartLoading}
          >
            <ShoppingBag size={20} className="text-gray-900" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartLoading ? "..." : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileProductHeader;
