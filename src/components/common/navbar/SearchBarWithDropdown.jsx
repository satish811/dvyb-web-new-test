import { useState, useEffect, useRef } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import subCategories from "../../../static/navbar/subCategories";

const SearchBarWithDropdown = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Flatten all categories into a single searchable list
    const allCategories = Object.entries(subCategories).flatMap(([parent, items]) =>
        items.map(item => ({
            name: item,
            parent: parent,
            slug: item.toLowerCase().replace(/\s+/g, '-')
        }))
    );

    // Filter categories based on search query
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            const filtered = allCategories.filter(cat =>
                cat.name.toLowerCase().includes(query)
            );
            setFilteredCategories(filtered);
            setIsDropdownOpen(filtered.length > 0);
        } else {
            setFilteredCategories([]);
            setIsDropdownOpen(false);
        }
    }, [searchQuery]);

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
        // Navigate using query parameter with the exact category name
        // This allows ProductLayout to filter by specific subcategories like "Printed Saree"
        if (onNavigate) {
            onNavigate(`/womenwear?query=${encodeURIComponent(category.name)}`);
        }
        setSearchQuery("");
        setIsDropdownOpen(false);
    };

    const handleInputFocus = () => {
        if (searchQuery.trim().length > 0 && filteredCategories.length > 0) {
            setIsDropdownOpen(true);
        }
    };

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
                    placeholder="Search for a product"
                    className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-500 outline-none"
                />
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isDropdownOpen && filteredCategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            duration: 0.15,
                            ease: [0.25, 0.1, 0.25, 1] // Smooth 144hz-style easing
                        }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-sm overflow-hidden z-50"
                        style={{
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        {/* Header */}
                        <div
                            className="px-6 py-3"
                            style={{
                                backgroundColor: '#E5E5E5'
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
                                All Others
                            </h3>
                        </div>

                        {/* Category List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {filteredCategories.map((category, index) => (
                                <motion.div
                                    key={`${category.parent}-${category.name}-${index}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: index * 0.02,
                                        duration: 0.2
                                    }}
                                    onClick={() => handleCategoryClick(category)}
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                    style={{
                                        borderBottom: index < filteredCategories.length - 1 ? '1px solid #f0f0f0' : 'none'
                                    }}
                                >
                                    <p
                                        className="font-normal"
                                        style={{
                                            color: '#555',
                                            fontSize: '20px',
                                            lineHeight: '1.4',
                                            fontFamily: '"Outfit", sans-serif'
                                        }}
                                    >
                                        {category.name}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBarWithDropdown;
