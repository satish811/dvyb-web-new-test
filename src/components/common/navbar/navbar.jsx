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
import navbarLogo from "../../../assets/b2c/landing/Landing-villy/navbar-logo.png";

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
      boutique: "DESIGNER",
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
    <div className="sticky top-0 z-50 font-sans shadow-md">
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
          {/* Top Bar */}
          <div className="bg-gray-100 text-center py-2 text-lg text-gray-600 relative z-50">
            Get early access for <span className="font-semibold text-purple-900 uppercase">Virtual Try On</span>{" "}
            <a href="#" className="underline text-gray-500 hover:text-gray-800 ml-1">
              Sign Up
            </a>
          </div>

          {/* Main Navbar */}
          <header className="bg-[#B794B9] text-white w-full relative z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

              {/* Mobile Menu Toggle (Left on Mobile) */}
              <div className="lg:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition"
                >
                  <MdOutlineArrowDropDown className="text-2xl transform rotate-90" />
                </button>
              </div>

              {/* Left: Desktop Nav Links */}
              <div className="hidden lg:flex items-center space-x-8 pl-6">
                <button
                  onClick={() => navigate("/womenwear")}
                  className="text-lg font-medium tracking-wide hover:text-gray-100 transition uppercase border-b-2 border-transparent hover:border-white pb-1"
                >
                  Women
                </button>
                <button
                  onClick={() => navigate("/menwear")}
                  className="text-lg font-medium tracking-wide hover:text-gray-100 transition uppercase border-b-2 border-transparent hover:border-white pb-1"
                >
                  Men
                </button>
              </div>

              {/* Center: Logo */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    if (setShowLoader) setShowLoader(true);
                    setTimeout(() => {
                      navigate("/");
                      setShowLoader(false);
                    }, 1200);
                  }}
                >
                  <img
                    src={navbarLogo}
                    alt="Villy Logo"
                    className="h-12 md:h-14 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Right: Icons */}
              <div className="flex items-center">
                <NavIcons
                  className="text-white"
                  wishlistCount={wishlistCount}
                  cartCount={cartCount}
                  onSearch={() => setSearchOpen(true)}
                  onWishlist={() => navigate("/wishlist")}
                  onCart={() => navigate("/cart")}
                  onProfile={() => guard("/profile")}
                />
              </div>

            </div>
          </header>

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

      {/* Virtual Try-On Modal */}
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
                    className={`text-center p-1.5 cursor-pointer border-2 transition-all text-sm sm:text-base font-medium ${selectedProduct === product
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
                  className={`w-full py-3 font-medium text-white transition-colors uppercase tracking-wide text-sm sm:text-base ${selectedProduct
                    ? "bg-primary hover:bg-hoverBg cursor-pointer"
                    : "bg-[#BF8080] opacity-60 cursor-not-allowed"
                    } focus:outline-none focus:ring-2 focus:ring-[#5B9BA5]`}
                >
                  Browse {selectedProduct || "Products"}
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
    </div>
  );
}
