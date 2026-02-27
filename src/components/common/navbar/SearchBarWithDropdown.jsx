import { useState, useEffect, useRef } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineArrowDropDown, MdOutlineSearch } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";


import { searchService } from "../../../services/searchService";
import useDebounce from "../../../hooks/useDebounce";

const SearchBarWithDropdown = ({ onNavigate, searchQuery, onSearchChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    // const [searchQuery, setSearchQuery] = useState(""); // Removed local state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchResults, setSearchResults] = useState({
        products: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [noResults, setNoResults] = useState(false);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Debounce the search query
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Effect to trigger search when debounced query changes
    useEffect(() => {
        const performSearch = async () => {
            // Cancel previous request if exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new AbortController
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 1) {
                setSearchResults({ products: [] });
                setIsDropdownOpen(false);
                setNoResults(false);
                setIsLoading(false);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            setNoResults(false);
            setIsDropdownOpen(true);

            try {
                // Fetch products from service
                const products = await searchService.searchProducts(debouncedSearchQuery, {
                    limit: 8,
                    signal
                });

                // Format products for display
                const formattedProducts = products.map(product => ({
                    ...product,
                    type: 'product',
                    displayName: product.name || product.title,
                    subtitle: `${product.dressType || ''} • ${product.category || ''}`,
                    imageUrl: product.imageUrls?.[0] || product.images?.[0] || null,
                    price: product.price
                }));

                setSearchResults({
                    products: formattedProducts
                });

                if (formattedProducts.length === 0) {
                    setNoResults(true);
                }

            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('Request aborted');
                    return;
                }
                console.error("Search failed:", err);
                setError("Failed to fetch results. Please try again.");
                setSearchResults({ products: [] });
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        performSearch();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [debouncedSearchQuery]);


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
                onSearchChange("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);




    const handleExecuteSearch = () => {
        if (searchQuery.trim().length > 0) {
            if (onNavigate) {
                // Navigate without query param - state is in context
                onNavigate(`/womenwear`);
            } else {
                navigate(`/womenwear`);
            }
            setIsDropdownOpen(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleExecuteSearch();
        }
    };

    const handleProductClick = (product) => {
        const productId = product.id;

        if (onNavigate) {
            onNavigate(`/products/${productId}`);
        } else {
            navigate(`/products/${productId}`);
        }
        // setSearchQuery(""); // Do not clear on navigation as requested
        setIsDropdownOpen(false);
    };

    const handleInputFocus = () => {
        if (searchQuery.trim().length > 0) {
            setIsDropdownOpen(true);
        }
    };

    const hasResults = searchResults.products.length > 0;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Search Input */}
            <div
                className="w-full flex items-center bg-[#EDEDED] rounded-sm px-4 py-2 hover:bg-gray-200 transition-colors"
            >
                <MdOutlineSearch className="text-gray-500 text-xl mr-3 flex-shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    autoComplete="off"
                    placeholder="Search for products or categories..."
                    className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-500 outline-none"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="text-gray-400 hover:text-gray-600 text-xl ml-2"
                    >
                        ×
                    </button>
                )}
            </div>
            {/* Dropdown */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            duration: 0.15,
                            ease: [0.25, 0.1, 0.25, 1]
                        }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-sm overflow-hidden z-50"
                        style={{
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                            maxHeight: '500px',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Loading State */}
                        {isLoading && (
                            <div className="px-6 py-8 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Error State */}
                        {!isLoading && error && (
                            <div className="px-6 py-8 text-center text-red-500">
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Content */}
                        {!isLoading && !error && (
                            <>
                                {/* Products Section */}
                                {searchResults.products.length > 0 && (
                                    <>
                                        <div
                                            className="px-6 py-3 sticky top-0"
                                            style={{
                                                backgroundColor: '#E5E5E5',
                                                zIndex: 1
                                            }}
                                        >
                                            <h3 className="font-bold uppercase tracking-wide text-xs text-gray-500">
                                                Products ({searchResults.products.length})
                                            </h3>
                                        </div>

                                        <div>
                                            {searchResults.products.map((product, index) => (
                                                <motion.div
                                                    key={`prod-${product.id}-${index}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    onClick={() => handleProductClick(product)}
                                                    className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-0"
                                                >
                                                    {product.imageUrl && (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.displayName}
                                                            className="w-12 h-12 object-cover rounded-sm flex-shrink-0 bg-gray-100"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-normal text-base text-gray-800 font-sans line-clamp-1">
                                                            {product.displayName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                            {product.subtitle}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm font-semibold text-[#9C0000]">
                                                                ₹{product.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* No Results Message */}
                                {noResults && (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-gray-500 font-medium">
                                            No results found for "{searchQuery}"
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Try searching with different keywords
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBarWithDropdown;