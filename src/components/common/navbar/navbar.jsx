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
import { useUI } from "../../../context/UIContext";

// --- Your original Virtual Try-On assets ---
import twodpopup from "../../../assets/Navbar/twodpopup.svg";

// --- Search service & hook ---
import { searchService } from "../../../services/searchService";
import useDebounce from "../../../hooks/useDebounce";

export default function Navbar({ setShowLoader }) {
  // ==== Existing states from your old code ====
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [logoLoading, setLogoLoading] = useState(false);

  // Virtual Try-On modal states
  const { isTryOnModalOpen, setTryOnModalOpen } = useUI();
  const showModal = isTryOnModalOpen;
  const setShowModal = setTryOnModalOpen;
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

  // Remove recent search
  const removeRecentSearch = useCallback((term) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handlers for dropdown interactions
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

  const wishlistCount = 0;
  const cartCount = 0;

  return (
    <header className="sticky top-0 z-50 bg-white w-full overflow-hidden">
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
          onRemoveRecent={removeRecentSearch}
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
              onClick={() => setShowModal(true)}
              className="text-[12px] font-medium tracking-wider cursor-pointer hover:underline"
            >
              VIRTUAL TRY-ON
            </span>
          </div>

          {/* Main bar */}
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 md:px-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-1 font-medium text-sm text-gray-800 ml-1"
            >
              WOMEN <MdOutlineArrowDropDown className="text-xl" />
            </button>

            {/* Fix: Wrap only the logo in clickable container */}
            <div className="flex-1 flex justify-center">
              {logoLoading ? (
                <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <img
                  src={mainlogo}
                  alt="Logo"
                  className="h-12 xs:h-14 sm:ml-1 md:h-18 lg:h-20 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    if (setShowLoader) setShowLoader(true);
                    setTimeout(() => {
                      navigate("/");
                      setShowLoader(false);
                    }, 1200);
                  }}
                />
              )}
            </div>

            {/* <NavIcons
              wishlistCount={wishlistCount}
              cartCount={cartCount}
              onSearch={() => setSearchOpen(true)}
              onWishlist={() => navigate("/wishlist")}
              onCart={() => navigate("/cart")}
              onProfile={() => guard("/profile")}
            /> */}

            <div className="flex items-center gap-5">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Wishlist - Heart Icon (NEW) */}
              <button onClick={() => navigate("/wishlist")} className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart - Shopping Bag Icon (your original style) */}
              <button onClick={() => navigate("/cart")} className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button onClick={() => guard("/profile")}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="
                flex 
                text-[11px] 
                gap-4 
                px-3 
                overflow-x-auto 
                hide-scrollbar 
                whitespace-nowrap 
                sm:text-sm 
                sm:gap-8 
                sm:px-8 
                md:text-[13px] 
                md:gap-8 
                md:px-10 
                lg:gap-8 
                xl:gap-18 
                2xl:gap-14 
                justify-start 
                sm:justify-center 
                pb-1
            "
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.isTryOn) {
                    setShowModal(true);
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`
        relative pb-1 transition-all duration-200 font-semibold
        ${
          isActive(item)
            ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
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
                {/* {["Saree", "Salwar Suits", "Lehengas", "Kurti", "Dupattas", "Ethnic Jacket"].map( */}
                {["Saree", "Salwar Suits", "Lehengas", "Kurti", "Ethnic Jacket"].map((product) => (
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
                ))}
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
