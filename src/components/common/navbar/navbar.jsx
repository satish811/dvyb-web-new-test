// components/navbar/Navbar.jsx
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import SearchDropdown from "./SearchDropdown";
import SearchBarWithDropdown from "./SearchBarWithDropdown";
import navItems from "../../../static/navbar/navItems";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "../../../pages/b2c/login/loginModel";
import { useAuth } from "../../../context/AuthContext";
import UserDropdown from "./UserDropdown";
import { MdOutlineArrowDropDown, MdOutlineSearch } from "react-icons/md";
import { HiOutlineUser, HiOutlineHeart, HiOutlineShoppingBag, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { HiOutlineMenu } from "react-icons/hi";
import MobileMenu from "./MobileMenu";
import { useFilter } from "../../../context/FilterContext";
import AuthContainer from "../../../pages/b2b/AuthContainer/AuthContainer";
import { useUI } from "../../../context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, tapScale, hoverScale } from "../../../utils/animations";

import twodpopup from "../../../assets/Navbar/twodpopup.svg";
// Correct logo import based on asset search
import villyLogo from "../../../assets/b2c/landing/Landing-villy/VillyLogo11.png";

import { searchService } from "../../../services/searchService";
import useDebounce from "../../../hooks/useDebounce";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

export default function Navbar({ setShowLoader }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // const [searchQuery, setSearchQuery] = useState(""); // Removed local state
    const { user, loading, signOutUser, userRole, userProfile } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { isTryOnModalOpen, setTryOnModalOpen } = useUI();
    const showModal = isTryOnModalOpen;
    const setShowModal = setTryOnModalOpen;
    const [selectedProduct, setSelectedProduct] = useState("");

    const { updateFilter, searchQuery, setSearchQuery } = useFilter();
    const { cartCount, loading: cartLoading } = useCart();
    const { wishlistCount, loading: wishlistLoading } = useWishlist();

    const [searchResults, setSearchResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const isB2BUserType = () => {
        const urlParams = new URLSearchParams(location.search);
        const userType = urlParams.get("usertype");
        const path = location.pathname.toLowerCase();

        const isB2BPath = path.includes("b2b") || urlParams.get("b2b") === "true";
        const isB2BRole = userRole?.toUpperCase() === "B2B" || userProfile?.role?.toUpperCase() === "B2B" || userProfile?.userType?.toUpperCase() === "B2B";
        const isB2BSession = sessionStorage.getItem("villy_b2b_mode") === "true";

        const currentlyB2B = userType?.toLowerCase() === "b2b" || isB2BPath || isB2BRole;

        // If we explicitly see B2C, reset session storage
        if (userType?.toLowerCase() === "b2c" || path.includes("b2c")) {
            if (isB2BSession) sessionStorage.removeItem("villy_b2b_mode");
            return false;
        }

        // If we detect B2B now, persist it
        if (currentlyB2B && !isB2BSession) {
            sessionStorage.setItem("villy_b2b_mode", "true");
        }

        return currentlyB2B || isB2BSession;
    };

    const guard = (path) => {
        if (!loading && !user) {
            setShowLogin(true);
        } else {
            navigate(path);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem("recentSearches");
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

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
                    searchService.searchProducts(debouncedSearchQuery, { limit: 10, strictMatch: true }),
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
                navigate(`/womenwear`);
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

    // Scroll lock effect for Try-On Modal
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showModal]);

    return (
        <>
            <motion.div
                initial="hidden"
                animate="visible"
                className="font-sans shadow-sm bg-white"
            >
                {/* Main Navbar */}
                <header
                    className={`w-full relative z-40 h-[72px] 2xl:h-[88px] flex items-center border-b border-gray-100 transition-colors duration-300
                    ${location.pathname === "/" ? "bg-[#B59DB0] text-white md:bg-white md:text-black" : "bg-white text-black"}
                    `}
                >
                    <div className="w-full max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 flex items-center justify-between h-full">

                        {/* Mobile Menu Toggle - LEFT SIDE */}
                        <div className="lg:hidden flex items-center flex-1 md:flex-none">
                            <motion.button
                                whileTap={tapScale}
                                onClick={() => setMobileMenuOpen(true)}
                                className={`p-2 -ml-2 rounded-full transition ${location.pathname === "/" ? "text-white hover:bg-white/10" : "text-black hover:bg-gray-100"}`}
                            >
                                <HiOutlineMenu className="text-3xl" />
                            </motion.button>
                        </div>

                        {/* CENTER: Logo (Absolutely positioned in center on mobile to keep exact center alignment, normal flow on tablet+) */}
                        <div
                            className={`absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none md:flex md:justify-center cursor-pointer z-10 md:mr-10 xl:mr-16 2xl:mr-24`}
                            onClick={() => {
                                // Force scroll to top immediately even if on same route
                                window.scrollTo({ top: 0, behavior: "instant" });
                                document.documentElement.scrollTop = 0;
                                document.body.scrollTop = 0;

                                if (setShowLoader) setShowLoader(true);
                                setTimeout(() => {
                                    navigate("/");
                                    window.scrollTo(0, 0); // Second attempt after navigation
                                    setShowLoader(false);
                                }, 1200);
                            }}
                        >
                            <img
                                src={villyLogo}
                                alt="Villy"
                                className="h-14 sm:h-16 md:h-12 2xl:h-14 w-auto object-contain"
                            />
                        </div>

                        {/* Spacer specifically for Mobile to enforce 40px gap visually between logo and right icons.
                            Because the logo is absolute centered, we push the right flexbox inwards if needed.
                        */}
                        <div className="hidden lg:flex items-center space-x-8 xl:space-x-12 2xl:space-x-16 ml-10 xl:ml-16 2xl:ml-24 mr-auto">
                            <div className="relative flex flex-col items-center">
                                <button
                                    onClick={() => {
                                        if (location.pathname === "/") {
                                            const element = document.getElementById("categories-section");
                                            if (element) {
                                                element.scrollIntoView({ behavior: "smooth" });
                                            }
                                        } else {
                                            navigate("/", { state: { scrollTo: "categories-section" } });
                                        }
                                    }}
                                    className={`text-[12px] xl:text-sm 2xl:text-base font-bold tracking-widest transition uppercase ${location.pathname === "/" ? "text-[#884383]" : "hover:text-gray-600"}`}
                                >
                                    WOMEN
                                </button>
                                {location.pathname === "/" && (
                                    <motion.div
                                        layoutId="activeUnderline"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#884383]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                )}
                            </div>
                            <div className="relative flex flex-col items-center">
                                <button
                                    onClick={() => navigate("/menwear")}
                                    className={`text-sm xl:text-base 2xl:text-lg font-bold tracking-widest transition uppercase text-gray-400 hover:text-gray-600`}
                                >
                                    MEN
                                </button>
                                <span className="absolute top-[100%] left-1/2 -translate-x-1/2 text-[10px] xl:text-[11px] font-medium text-gray-400 uppercase tracking-wider pointer-events-none whitespace-nowrap pt-0.5">
                                    Coming Soon
                                </span>
                            </div>
                            {!isB2BUserType() && (
                                <button
                                    onClick={() => setTryOnModalOpen(true)}
                                    className="text-sm xl:text-base 2xl:text-lg font-['Outfit'] font-bold tracking-widest transition uppercase animate-subtle-blink whitespace-nowrap bg-clip-text text-transparent bg-[linear-gradient(to_right,#99068D_0%,#66045E_23%,#4D0347_56%,#33022F_100%)]"
                                >
                                    Virtual Try On
                                </button>
                            )}
                        </div>

                        {/* CENTER-RIGHT: Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md xl:max-w-lg 2xl:max-w-2xl mx-6 xl:mx-10 2xl:mx-16">
                            <SearchBarWithDropdown
                                onNavigate={navigate}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>

                        {/* RIGHT: Icons or Login Button */}
                        {/* We use flex-1 on mobile so it takes up the right half of the navbar, 
                            and we add pl-[40px] (padding left) to guarantee there is ALWAYS a 40px gap 
                            between the absolute-centered logo and the search icon (first element here).
                        */}
                        <div className="flex flex-1 lg:flex-none justify-end items-center space-x-3 xs:space-x-4 md:space-x-6 2xl:space-x-8 pl-[40px]">
                            {/* Mobile Search Icon - Always visible */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                className={`md:hidden transition relative ${location.pathname === "/" ? "text-white" : "text-black"}`}
                            >
                                <HiOutlineMagnifyingGlass className="text-2xl xs:text-3xl" />
                            </button>


                            {/* Show Login/Signup button when NOT logged in */}
                            {!user && !loading && (
                                <motion.button
                                    whileHover={hoverScale}
                                    whileTap={tapScale}
                                    onClick={() => setShowLogin(true)}
                                    className={`px-2 py-1 xs:px-3 xs:py-1.5 md:px-4 md:py-2 font-semibold text-[10px] xs:text-xs md:text-sm transition-colors uppercase tracking-wide whitespace-nowrap min-w-max bg-[#884383] text-white border border-[#884383] hover:bg-white hover:text-black shadow-sm`}
                                >
                                    Login / Signup
                                </motion.button>
                            )}


                            {/* Show icons when logged in */}
                            {user && (
                                <>
                                    {/* Profile Icon with Dropdown - Desktop only */}
                                    <div className="hidden md:flex relative group h-full items-center">
                                        <button
                                            onClick={() => guard("/profile")}
                                            className={`transition py-4 ${location.pathname === "/" ? "text-white md:text-black hover:text-gray-300 md:hover:text-gray-600" : "text-black hover:text-gray-600"}`}
                                        >
                                            <HiOutlineUser className="text-2xl 2xl:text-3xl" />
                                        </button>
                                        <UserDropdown user={user} onLogout={signOutUser} />
                                    </div>

                                    {/* Wishlist Icon */}
                                    <button onClick={() => navigate("/wishlist")} className={`transition relative ${location.pathname === "/" ? "text-white md:text-black hover:text-gray-300 md:hover:text-gray-600" : "text-black hover:text-gray-600"}`}>
                                        <HiOutlineHeart className="text-2xl xs:text-3xl md:text-2xl 2xl:text-3xl" />
                                        {wishlistCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] 2xl:text-xs rounded-full w-4 h-4 2xl:w-5 2xl:h-5 flex items-center justify-center font-bold">
                                                {wishlistCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Cart Icon */}
                                    <button onClick={() => navigate("/cart")} className={`transition relative ${location.pathname === "/" ? "text-white md:text-black hover:text-gray-300 md:hover:text-gray-600" : "text-black hover:text-gray-600"}`}>
                                        <HiOutlineShoppingBag className="text-2xl xs:text-3xl md:text-2xl 2xl:text-3xl" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] 2xl:text-xs rounded-full w-4 h-4 2xl:w-5 2xl:h-5 flex items-center justify-center font-bold">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </header>

                {/* Login Modal */}
                <AnimatePresence>
                    {showLogin &&
                        (isB2BUserType() ? (
                            <AuthContainer isOpen={true} onClose={() => setShowLogin(false)} />
                        ) : (
                            <LoginModal isOpen={true} onClose={() => setShowLogin(false)} />
                        ))}
                </AnimatePresence>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed inset-0 z-50"
                        >
                            <MobileMenu
                                isOpen={mobileMenuOpen}
                                onClose={() => setMobileMenuOpen(false)}
                                navItems={navItems}
                                onNavClick={navigate}
                                onProtectedClick={guard}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Search Overlay */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 z-50 bg-white"
                        >
                            <SearchDropdown
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                suggestions={searchSuggestions}
                                searchResults={searchResults}
                                popularSearches={popularSearches}
                                recentSearches={recentSearches}
                                onSaveRecent={saveRecentSearch}
                                onRemoveRecent={removeRecentSearch}
                                onClose={() => setSearchOpen(false)}
                                onSuggestionClick={handleSuggestionClick}
                                onResultClick={handleResultClick}
                                isLoading={isSearching}
                                noResults={noResults}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>

            {/* Virtual Try-On Modal */}
            {showModal && ReactDOM.createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/40 backdrop-blur-sm"
                        onClick={() => {
                            setShowModal(false);
                            setSelectedProduct("");
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="hidden md:block w-1/2 bg-cover h-[532px] bg-center"
                                style={{ backgroundImage: `url(${twodpopup})` }}
                            >
                                <div className="w-full h-full bg-opacity-20"></div>
                            </div>

                            <div className="w-full md:w-1/2 p-6 lg:ml-4 sm:p-8 flex flex-col justify-center relative">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedProduct("");
                                    }}
                                    className="absolute top-4 right-4 text-black font-medium hover:text-gray-600 text-2xl sm:text-3xl cursor-pointer leading-none w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5B9BA5] rounded-full bg-white/50 backdrop-blur-sm"
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
                                    {["Saree", "Anarkali", "Lehanga", "Kurti", "Shararas", "Salwar Suit"].map((product) => (
                                        <motion.button
                                            whileHover={hoverScale}
                                            whileTap={tapScale}
                                            key={product}
                                            onClick={() => setSelectedProduct(product)}
                                            className={`text-center p-1.5 cursor-pointer border-2 transition-all text-sm sm:text-base font-medium rounded-md ${selectedProduct === product
                                                ? "bg-[#F0E0E0] text-primary border-none"
                                                : "border-primary bg-white text-primary"
                                                } focus:outline-none focus:ring-black`}
                                        >
                                            {product}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={selectedProduct ? hoverScale : {}}
                                        whileTap={selectedProduct ? tapScale : {}}
                                        onClick={() => {
                                            if (selectedProduct) {
                                                setShowModal(false);
                                                const categoryMap = {
                                                    "Saree": "saree",
                                                    "Anarkali": "anarkalis",
                                                    "Lehanga": "lehenga",
                                                    "Kurti": "kurta-sets",
                                                    "Shararas": "shararas",
                                                    "Salwar Suit": "salwar-suit",
                                                };
                                                const formatted = categoryMap[selectedProduct] || selectedProduct.toLowerCase().replace(" ", "-");
                                                updateFilter("categories", selectedProduct.toUpperCase());
                                                navigate(`/womenwear?category=${encodeURIComponent(formatted)}`);
                                            }
                                        }}
                                        disabled={!selectedProduct}
                                        className={`w-full py-3 font-medium text-white transition-colors uppercase tracking-wide text-sm sm:text-base rounded-md ${selectedProduct
                                            ? "bg-primary hover:bg-hoverBg cursor-pointer"
                                            : "bg-[#BF8080] opacity-60 cursor-not-allowed"
                                            } focus:outline-none focus:ring-2 focus:ring-[#5B9BA5]`}
                                    >
                                        Browse {selectedProduct || "Products"}
                                    </motion.button>

                                    <motion.button
                                        whileHover={hoverScale}
                                        whileTap={tapScale}
                                        onClick={() => {
                                            setShowModal(false);
                                            navigate("/womenwear");
                                        }}
                                        className="w-full py-3 border-2 border-primary text-primary hover:bg-hoverBg hover:text-white font-medium transition-colors uppercase tracking-wide text-sm sm:text-base rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B9BA5]"
                                    >
                                        I Like To Browse
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
