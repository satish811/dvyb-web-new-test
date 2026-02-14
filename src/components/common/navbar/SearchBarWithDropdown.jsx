import { useState, useEffect, useRef } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import subCategories from "../../../static/navbar/subCategories";

// Sample product data - in a real app, this would come from props or a context/API
const SAMPLE_PRODUCTS = [
  {
    id: "NWtIfjt8c2CjrRJFu1Uz",
    name: "tyuiop",
    dressType: "Saree",
    category: "WOMEN",
    craft: "Mirror Work",
    fabric: "modal",
    occasion: ["wedding"],
    price: 56,
    boutique: true,
    imageUrls: [
      "https://res.cloudinary.com/doiezptnn/image/upload/v1770976804/generated-sarees/front-view/saree-front-view-1770976804518.jpg"
    ],
    slug: "tyuiop",
    selectedColors: ["pink_#FF69B4"],
    selectedSizes: ["XS"]
  }
  // Add more products as needed
];

const SearchBarWithDropdown = ({ onNavigate, products = SAMPLE_PRODUCTS }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchResults, setSearchResults] = useState({
        categories: [],
        products: []
    });
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Flatten all categories into a single searchable list
    const allCategories = Object.entries(subCategories).flatMap(([parent, items]) =>
        items.map(item => ({
            name: item,
            parent: parent,
            slug: item.toLowerCase().replace(/\s+/g, '-'),
            type: 'category'
        }))
    );

    // Function to search through products
    const searchProducts = (query) => {
        if (!query.trim() || !products.length) return [];
        
        const lowercaseQuery = query.toLowerCase();
        
        return products.filter(product => {
            // Search in multiple fields
            const searchableFields = [
                product.name,
                product.dressType,
                product.category,
                product.craft,
                product.fabric,
                product.description,
                ...(product.occasion || []),
                ...(product.selectedColors || []).map(color => color.split('_')[0]), // Get color names without hex
                ...(product.selectedSizes || [])
            ].filter(Boolean); // Remove null/undefined values
            
            return searchableFields.some(field => 
                field.toString().toLowerCase().includes(lowercaseQuery)
            );
        }).map(product => ({
            ...product,
            type: 'product',
            displayName: product.name,
            subtitle: `${product.dressType} • ${product.category}`,
            imageUrl: product.imageUrls?.[0] || null,
            price: product.price
        }));
    };

    // Filter both categories and products based on search query
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            
            // Filter categories
            const filtered = allCategories.filter(cat =>
                cat.name.toLowerCase().includes(query)
            );
            
            // Filter products
            const matchedProducts = searchProducts(query);
            
            setSearchResults({
                categories: filtered,
                products: matchedProducts
            });
            
            setIsDropdownOpen(filtered.length > 0 || matchedProducts.length > 0);
        } else {
            setSearchResults({
                categories: [],
                products: []
            });
            setIsDropdownOpen(false);
        }
    }, [searchQuery, products]);

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
                setSearchQuery("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleCategoryClick = (category) => {
        if (onNavigate) {
            onNavigate(`/womenwear?query=${encodeURIComponent(category.name)}`);
        } else {
            navigate(`/womenwear?query=${encodeURIComponent(category.name)}`);
        }
        setSearchQuery("");
        setIsDropdownOpen(false);
    };

    const handleProductClick = (product) => {
        // Navigate to product detail page using the product ID (not slug)
        // Your IndividualProductDetailsPage uses :id from useParams()
        const productId = product.id; // Use the ID directly
        
        console.log("Navigating to product:", productId); // For debugging
        
        if (onNavigate) {
            onNavigate(`/products/${productId}`);
        } else {
            navigate(`/products/${productId}`);
        }
        setSearchQuery("");
        setIsDropdownOpen(false);
    };

    const handleInputFocus = () => {
        if (searchQuery.trim().length > 0 && 
            (searchResults.categories.length > 0 || searchResults.products.length > 0)) {
            setIsDropdownOpen(true);
        }
    };

    const hasResults = searchResults.categories.length > 0 || searchResults.products.length > 0;

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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Search for products or categories..."
                    className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-500 outline-none"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="text-gray-400 hover:text-gray-600 text-xl ml-2"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isDropdownOpen && hasResults && (
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
                        {/* Categories Section */}
                        {searchResults.categories.length > 0 && (
                            <>
                                <div
                                    className="px-6 py-3 sticky top-0"
                                    style={{
                                        backgroundColor: '#E5E5E5',
                                        zIndex: 1
                                    }}
                                >
                                    <h3
                                        className="font-bold uppercase tracking-wide"
                                        style={{
                                            color: '#555',
                                            fontSize: '14px',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        Categories ({searchResults.categories.length})
                                    </h3>
                                </div>

                                {/* Category List */}
                                <div className="border-b border-gray-200">
                                    {searchResults.categories.map((category, index) => (
                                        <motion.div
                                            key={`cat-${category.parent}-${category.name}-${index}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.02,
                                                duration: 0.2
                                            }}
                                            onClick={() => handleCategoryClick(category)}
                                            className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                            style={{
                                                borderBottom: index < searchResults.categories.length - 1 ? '1px solid #f0f0f0' : 'none'
                                            }}
                                        >
                                            <p
                                                className="font-normal"
                                                style={{
                                                    color: '#555',
                                                    fontSize: '16px',
                                                    lineHeight: '1.4',
                                                    fontFamily: '"Outfit", sans-serif'
                                                }}
                                            >
                                                {category.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Category • {category.parent}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

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
                                    <h3
                                        className="font-bold uppercase tracking-wide"
                                        style={{
                                            color: '#555',
                                            fontSize: '14px',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        Products ({searchResults.products.length})
                                    </h3>
                                </div>

                                {/* Product List */}
                                <div>
                                    {searchResults.products.map((product, index) => (
                                        <motion.div
                                            key={`prod-${product.id}-${index}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.02,
                                                duration: 0.2
                                            }}
                                            onClick={() => handleProductClick(product)}
                                            className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 flex items-start gap-3"
                                            style={{
                                                borderBottom: index < searchResults.products.length - 1 ? '1px solid #f0f0f0' : 'none'
                                            }}
                                        >
                                            {product.imageUrl && (
                                                <img 
                                                    src={product.imageUrl} 
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded-sm flex-shrink-0"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p
                                                    className="font-normal"
                                                    style={{
                                                        color: '#333',
                                                        fontSize: '16px',
                                                        lineHeight: '1.4',
                                                        fontFamily: '"Outfit", sans-serif'
                                                    }}
                                                >
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {product.subtitle}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-semibold text-[#9C0000]">
                                                        ₹{product.price}
                                                    </span>
                                                    {product.craft && (
                                                        <span className="text-xs text-gray-400">
                                                            {product.craft}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* No Results Message */}
                        {!hasResults && searchQuery.trim().length > 0 && (
                            <div className="px-6 py-8 text-center">
                                <p className="text-gray-500">
                                    No results found for "{searchQuery}"
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Try searching with different keywords
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBarWithDropdown;