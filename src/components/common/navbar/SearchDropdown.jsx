// components/navbar/SearchDropdown.jsx
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { searchService } from "../../../services/searchService"; // Adjust path as needed
import CategoryCard from "./CategoryCard";
import ProductCard from "../../b2c/products/ProductCard";
import Fuse from "fuse.js";
import emptySearch from "../../../assets/common/emptysearch.png";
import TrendingProducts from "../TrendingProducts/TrendingProducts";
import { bro01, bro02, bro03, bro04, bro05, bro06, bro07 } from "../../../assets";

const browseCategories = [
  { name: "Sarees", icon: bro01, link: "/womenwear?category=saree" },
  { name: "Salwar Suits", icon: bro02, link: "/womenwear?category=kurta-sets" },
  { name: "Lehengas", icon: bro03, link: "/womenwear?category=lehenga" },
  { name: "Kurtis", icon: bro04, link: "/womenwear?category=kurta-sets" },
  { name: "Fusion", icon: bro05, link: "/womenwear?category=fusion" },
  { name: "Anarkali Suits", icon: bro06, link: "/womenwear?category=anarkalis" },
  { name: "Wedding", icon: bro07, link: "/womenwear?category=wedding" },
  // Add more as needed
];

export default function SearchDropdown({
  searchQuery,
  onSearchChange,
  suggestions = [],
  searchResults = [],
  popularSearches = [],
  isLoading = false,
  onClose,
  onSuggestionClick,
  onResultClick,
  noResults = false,
  recentSearches = [],
  onSaveRecent,
  onRemoveRecent,
}) {
  const navigate = useNavigate();
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    const initFuse = async () => {
      try {
        // Fetch all products for fuzzy search (or pass from props if available)
        const allProducts = await searchService.searchProducts("", { limit: 1000 }); // Empty query for all
        const fuseInstance = new Fuse(allProducts, {
          keys: ["title", "name", "description", "category", "subcategory", "tags"],
          threshold: 0.4, // 0.0 = exact, 1.0 = loose
          includeScore: true,
          sortFn: (a, b) => a.score - b.score, // Lower score = better match
        });
        setFuse(fuseInstance);
      } catch (error) {
        console.error("Error initializing Fuse:", error);
      }
    };
    initFuse();
  }, []);

  // Update fetchSuggestions to use fuzzy if available
  // useEffect(() => {
  //   const fetchSuggestions = async () => {
  //     if (searchQuery?.trim()) {
  //       if (fuse && searchQuery.trim().length >= 2) {
  //         // Fuzzy search for suggestions
  //         const fuzzyResults = fuse.search(searchQuery).slice(0, 8);
  //         const suggestions = fuzzyResults.map(r => r.item.title || r.item.name || r.item.category);
  //         setSuggestions([...new Set(suggestions)]); // Unique
  //       } else {
  //         // Fallback to existing
  //         const results = await searchService.getSearchSuggestions(searchQuery, 8);
  //         setSuggestions(results);
  //       }
  //     } else {
  //       setSuggestions([]);
  //     }
  //   };
  //   fetchSuggestions();
  // }, [searchQuery, fuse]);

  const showRecent = !searchQuery?.trim() && recentSearches.length > 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery?.trim()) {
      onSaveRecent?.(searchQuery);

      const queryLower = searchQuery.toLowerCase().trim();
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
        wedding: "wedding"
      };

      if (categoryMap[queryLower]) {
        navigate(`/womenwear?category=${categoryMap[queryLower]}`);
      } else {
        navigate(`/womenwear?query=${encodeURIComponent(searchQuery)}`);
      }

      onClose(); // Close dropdown after search
    }
  };
  // Handle recent click
  const handleRecentClick = (term) => {
    onClose();
    onSearchChange(term);
    onSuggestionClick?.(term);
    onSaveRecent?.(term); // Refresh to top
  };

  const handlePopularClick = (term) => {
    onSearchChange(term);
    onSuggestionClick(term);
    onClose();
    navigate(`/womenwear?category=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (product) => {
    if (onResultClick) {
      onResultClick(product);
    } else {
      onClose();
      console.log("clicked here");
      // Fallback navigation to product detail
      navigate(`/products/${product.id}`);
    }
  };

  const showSuggestions = suggestions.length > 0 && searchQuery?.trim();
  const showPopular = !searchQuery?.trim() && popularSearches.length > 0;
  const showSearchResults = searchResults.length > 0 && searchQuery?.trim();
  const showNoResults = noResults && searchQuery?.trim() && !isLoading;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="py-5 px-6 sticky top-0 bg-white z-10">
        <form onSubmit={handleSearchSubmit}>
          {/* Centering container: centers horizontally and vertically within parent */}
          <div className="w-full min-h-[120px] flex items-center justify-center">
            {/* Constrain width and keep everything on one row */}
            <div className="flex items-center gap-4 w-full max-w-6xl px-4">
              {/* Search input box: grows to fill available space */}
              <div className="flex items-center flex-1 bg-white border border-gray-300 shadow-sm rounded overflow-hidden">
                <FaSearch className="text-gray-400 text-xl ml-4" />
                <input
                  type="text"
                  placeholder="saree.."
                  value={searchQuery || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 text-base outline-none py-3 px-4 cursor-pointer"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 font-medium transition rounded"
              >
                Search
              </button>

              {/* Close button: type="button" so it doesn't submit form */}
              <button
                type="button"
                onClick={onClose}
                className="text-2xl text-gray-600 hover:text-black cursor-pointer pr-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="max-w-6xl mx-auto px-6 pt-4">
            <p className="text-gray-500 text-center py-4">Searching...</p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold mb-8">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {searchResults.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClose={onClose}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <div className="flex justify-center">
            <img src={emptySearch} alt="emptySearch" className="h-20" />
          </div>

          <h2 className="text-2xl sm:text-sm md:text-xl font-bold mb-3">
            No luck! Even Google couldn’t find this one.
          </h2>
          <p className="text-gray-500">Please try Another Search.....</p>
        </div>
      )}

      {/* // In JSX, after input/suggestions: */}
      {(showSuggestions || showRecent || showPopular) && (
        <div className="max-w-6xl mx-auto px-6 pt-2">
          <div className="divide-y divide-gray-200">
            <h3 className="px-4 py-2 font-semibold text-gray-700">
              {showSuggestions
                ? "Suggestions"
                : showRecent
                  ? "Recent Searches"
                  : "Popular Searches"}
            </h3>
            <ul>
              {showSuggestions ? (
                suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => onSuggestionClick(item)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-lg"
                  >
                    {item}
                  </li>
                ))
              ) : showRecent ? (
                // Recent as chips
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {recentSearches.map((term, index) => (
                    <span
                      key={index}
                      onClick={() => handleRecentClick(term)}
                      className="bg-white border border-gray-300 rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-100"
                    >
                      {term}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveRecent?.(term);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                popularSearches.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handlePopularClick(item)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-lg"
                  >
                    {item}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Browse Categories */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">BROWSE CATEGORIES</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {browseCategories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} onClose={onClose} />
          ))}
        </div>
      </div>

      {/* Trending Products */}
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex justify-between items-center mb-2">
          {/* <button className="text-sm font-semibold hover:underline">VIEW ALL →</button> */}
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold">TRENDING PRODUCTS</h2>
        </div>
        <TrendingProducts onClose={onClose} column={6} heading="" />
      </div>
    </div>
  );
}
