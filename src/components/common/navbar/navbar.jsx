// components/navbar/Navbar.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import SearchDropdown from "./SearchDropdown";
import NavIcons from "./NavIcons";
import { mainlogo } from "../../../assets";
import navItems from "../../../static/navbar/navItems";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "../../../pages/b2c/login/loginModel";
import { useAuth } from "../../../context/AuthContext";
import { MdOutlineArrowDropDown } from "react-icons/md";
import MobileMenu from "./MobileMenu";
import { useFilter } from "../../../context/FilterContext";
import AuthContainer from "../../../pages/b2b/AuthContainer/AuthContainer";

// --- Your original Virtual Try-On assets ---
import twodpopup from "../../../assets/Navbar/twodpopup.svg";

// --- Search service & hook ---
import { searchService } from "../../../services/searchService";
import useDebounce from "../../../hooks/useDebounce";

export default function Navbar() {
  // ==== Existing states from your old code ====
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Virtual Try-On modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  // Filter context
  const { updateFilter } = useFilter();

  // ==== New search-related states ====
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /**
   * Check user type from route
   * @returns
   */
  const isB2BUserType = () => {
    const currentPath = location.pathname + location.search;
    return currentPath.includes("usertype=b2b");
  };

  // Guard for protected routes
  const guard = (path) => {
    if (!loading && !user) {
      setShowLogin(true);
    } else {
      navigate(path);
    }
  };

  // ==== Active category highlighting (your original logic) ====
  const isActive = (item) => {
    if (item.path === "/virtual-tryon") return false;
    const param = new URLSearchParams(window.location.search).get("category");
    const map = {
      saree: "SAREE",
      "kurta-sets": "KURTA SETS",
      anarkalis: "ANARKALIS",
      shararas: "SHARARAS",
      pret: "PRET",
      fusion: "FUSION",
      wedding: "WEDDING",
      sale: "SALE",
      lehenga: "LEHENGA",
    };
    return map[param] === item.label;
  };

  // ==== Search Logic ====
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

    // Save to recent searches if query is long enough
    if (debouncedSearchQuery?.trim().length >= 2) {
      saveRecentSearch(debouncedSearchQuery.trim());
    }
  }, [debouncedSearchQuery]);

  // Save recent search (max 5)
  const saveRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handlers for dropdown interactions
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

  const wishlistCount = 0;
  const cartCount = 0;

  return (
    <header className="sticky top-0 z-50 bg-white">
      {searchOpen ? (
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
        />
      ) : (
        <>
          {/* Top gray bar */}
          <div className="flex hidden md:flex items-center bg-[#e6e6e6] h-10 px-5 gap-10 font-poppins pl-12">
            <span
              onClick={() => navigate("/womenwear")}
              className="text-[12px] font-medium tracking-wider cursor-pointer hover:underline"
            >
              CATEGORIES
            </span>
            <span
              onClick={() => setShowModal(true)} // Added Virtual Try-On click handler
              className="text-[12px] font-medium tracking-wider cursor-pointer hover:underline"
            >
              VIRTUAL TRY-ON
            </span>
          </div>

          {/* Main bar */}
          <div className="flex items-center justify-between px-2 md:px-3 py-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-1 font-medium text-sm text-gray-800"
            >
              WOMEN <MdOutlineArrowDropDown className="text-xl" />
            </button>

            <div className="flex-1 flex justify-center" onClick={() => navigate("/")}>
              <img
                src={mainlogo}
                alt="Logo"
                className="h-14 sm:ml-1 lg:ml-34 md:h-18 lg:h-20 transition-all duration-200 cursor-pointer"
              />
            </div>

            <NavIcons
              wishlistCount={wishlistCount}
              cartCount={cartCount}
              onSearch={() => setSearchOpen(true)}
              onWishlist={() => navigate("/wishlist")}
              onCart={() => navigate("/cart")}
              onProfile={() => guard("/profile")}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="flex text-[10px] sm:text-sm md:text-[13px] gap-5 sm:gap-8 md:gap-14 px-4 sm:px-8 md:px-12 overflow-x-auto scrollbar-none hide-scrollbar justify-start sm:justify-center pb-0.5 font-medium whitespace-nowrap">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.isTryOn) {
                    setShowModal(true); // Open Virtual Try-On modal
                  } else {
                    navigate(item.path); // Normal navigation
                  }
                }}
                className={`
        relative pb-1 transition-all duration-200
        ${
          isActive(item)
            ? "text-primary font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
            : "text-[#2C2C2C] hover:text-black hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-primary"
        }
        ${item.isHighlight ? "text-primary" : ""}
        cursor-pointer
      `}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Login Modal */}
          {showLogin &&
            (isB2BUserType() ? (
              <AuthContainer isOpen={true} onClose={() => setShowLogin(false)} />
            ) : (
              <LoginModal isOpen={true} onClose={() => setShowLogin(false)} />
            ))}
        </>
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        onNavClick={navigate}
        onProtectedClick={guard}
      />

      {/* ==== Your Original Virtual Try-On Modal (fully preserved) ==== */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-[830px] mx-4 my-4 sm:my-8 relative flex flex-col md:flex-row">
            <div
              className="hidden md:block w-1/2 lg:w-[373px] bg-cover h-[532px] bg-center"
              style={{ backgroundImage: `url(${twodpopup})` }}
            >
              <div className="w-full h-full bg-opacity-20"></div>
            </div>

            <div className="w-full md:w-1/2 p-6 lg:ml-4 sm:p-8 flex flex-col justify-center">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedProduct("");
                }}
                className="absolute top-4 right-4 text-black font-medium hover:text-gray-600 text-2xl sm:text-3xl cursor-pointer leading-none w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5B9BA5] rounded-full"
                aria-label="Close modal"
              >
                ×
              </button>

              <h1 className="text-lg sm:text-xl font-semibold text-black mb-1">
                Select a product to try on
              </h1>
              <p className="text-base sm:text-xl font-semibold text-black mb-4 sm:mb-6">
                Want to give it a go?
              </p>

              <p className="text-sm font-medium text-primary mb-4">SELECT ONE</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                {["Saree", "Salwar Suits", "Lehengas", "Kurti", "Dupattas", "Ethnic Jacket"].map(
                  (product) => (
                    <button
                      key={product}
                      onClick={() => setSelectedProduct(product)}
                      className={`text-center p-1.5 cursor-pointer border-2 transition-all text-sm sm:text-base font-medium ${
                        selectedProduct === product
                          ? "bg-[#F0E0E0] text-primary border-none"
                          : "border-primary bg-white text-primary"
                      } focus:outline-none focus:ring-black`}
                    >
                      {product}
                    </button>
                  )
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (selectedProduct) {
                      setShowModal(false);
                      const formatted = selectedProduct.toLowerCase().replace(" ", "-");
                      updateFilter("categories", selectedProduct.toUpperCase());
                      navigate(`/womenwear?category=${encodeURIComponent(formatted)}`);
                    }
                  }}
                  disabled={!selectedProduct}
                  className={`w-full py-3 font-medium text-white transition-colors uppercase tracking-wide text-sm sm:text-base ${
                    selectedProduct
                      ? "bg-primary hover:bg-hoverBg cursor-pointer"
                      : "bg-[#BF8080] opacity-60 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-[#5B9BA5]`}
                >
                  Continue Try On
                </button>

                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate("/womenwear");
                  }}
                  className="w-full py-1 border-2 border-primary text-primary hover:bg-hoverBg hover:text-white font-medium transition-colors uppercase tracking-wide text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#5B9BA5]"
                >
                  I Like To Browse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
