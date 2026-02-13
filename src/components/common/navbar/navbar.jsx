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
import { HiOutlineUser, HiOutlineHeart, HiOutlineShoppingBag } from "react-icons/hi2";
import MobileMenu from "./MobileMenu";
import { useFilter } from "../../../context/FilterContext";
import AuthContainer from "../../../pages/b2b/AuthContainer/AuthContainer";
import { useUI } from "../../../context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, tapScale } from "../../../utils/animations";

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
    const [searchQuery, setSearchQuery] = useState("");
    const { user, loading, signOutUser } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { isTryOnModalOpen, setTryOnModalOpen } = useUI();
    const showModal = isTryOnModalOpen;
    const setShowModal = setTryOnModalOpen;
    const [selectedProduct, setSelectedProduct] = useState("");

    const { updateFilter } = useFilter();
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
        const currentPath = location.pathname + location.search;
        return currentPath.includes("usertype=b2b");
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

    // Scroll lock effect for Try-On Modal
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
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
                <header className="bg-white text-black w-full relative z-40 h-[72px] flex items-center border-b border-gray-100">
                    <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 flex items-center justify-between h-full">

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden flex items-center">
                            <motion.button
                                whileTap={tapScale}
                                onClick={() => setMobileMenuOpen(true)}
                                className="p-2 text-black hover:bg-gray-100 rounded-full transition"
                            >
                                <MdOutlineArrowDropDown className="text-2xl transform rotate-90" />
                            </motion.button>
                        </div>

                        {/* LEFT: Logo */}
                        <div
                            className="flex-shrink-0 cursor-pointer mr-8"
                            onClick={() => {
                                if (setShowLoader) setShowLoader(true);
                                setTimeout(() => {
                                    navigate("/");
                                    setShowLoader(false);
                                }, 1200);
                            }}
                        >
                            <img
                                src={villyLogo}
                                alt="Villy"
                                className="h-14 md:h-14 w-auto object-contain"
                            />
                        </div>

                        {/* CENTER-LEFT: Nav Links */}
                        <div className="hidden lg:flex items-center space-x-8 mr-auto">
                            <button
                                onClick={() => navigate("/womenwear")}
                                className="text-sm font-semibold tracking-wide hover:text-gray-600 transition uppercase"
                            >
                                WOMEN
                            </button>
                            <button
                                onClick={() => navigate("/menwear")}
                                className="text-sm font-semibold tracking-wide hover:text-gray-600 transition uppercase"
                            >
                                MEN
                            </button>
                        </div>

                        {/* CENTER-RIGHT: Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-4">
                            <SearchBarWithDropdown onNavigate={navigate} />
                        </div>

                        {/* RIGHT: Icons */}
                        <div className="flex items-center space-x-6">
                            <div className="relative group h-full flex items-center">
                                <button
                                    onClick={() => guard("/profile")}
                                    className="text-black hover:text-gray-600 transition py-4"
                                >
                                    <HiOutlineUser className="text-2xl" />
                                </button>
                                <UserDropdown user={user} onLogout={signOutUser} />
                            </div>

                            <button onClick={() => navigate("/wishlist")} className="text-black hover:text-gray-600 transition relative">
                                <HiOutlineHeart className="text-2xl" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                        {wishlistCount}
                                    </span>
                                )}
                            </button>

                            <button onClick={() => navigate("/cart")} className="text-black hover:text-gray-600 transition relative">
                                <HiOutlineShoppingBag className="text-2xl" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
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
                                    {["Saree", "Salwar Suits", "Lehengas", "Kurti", "Ethnic Jacket"].map((product) => (
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
                                                const formatted = selectedProduct.toLowerCase().replace(" ", "-");
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
