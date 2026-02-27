import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useEffect, useRef, useState } from "react";
import { extractCategories } from "../../../utils/categoryExtractor";
import { useFilter } from "../../../context/FilterContext";

/**
 * Normalizes category names for URL routing
 */
export const normalizeCategory = (categoryName) => {
    if (!categoryName) return "";

    const lower = categoryName.toLowerCase().trim();

    const mappings = {
        "sarees": "saree",
        "saree": "saree",
        "lehengas": "lehenga",
        "lehenga": "lehenga",
        "kurta sets": "kurta-sets",
        "kurta-sets": "kurta-sets",
        "kurta set": "kurta-sets",
        "kurta-set": "kurta-sets",
        "kurtas": "kurta-sets",
        "kurta": "kurta-sets",
        "anarkalis": "anarkalis",
        "anarkali": "anarkali",
        "shararas": "shararas",
        "pret": "pret",
        "fusion": "fusion",
        "wedding": "wedding",
        "sale": "sale",
        "virtual tryon": "virtual-tryon",
        "boutique": "boutique",
        "salwar suit": "salwar-suit",
        "salwar-suit": "salwar-suit",
        "salwar suits": "salwar-suit",
        "salwar-suits": "salwar-suit",
        "indo-western": "indo-western",
        "indo western": "indo-western",
        "bridal": "bridal"
    };

    return mappings[lower] || lower.replace(/\s+/g, "-");
};

const CategoryTags = ({ products = [], currentCategory, availableSubcategories = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateFilter, selectedFilters } = useFilter();
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [buttonWidth, setButtonWidth] = useState(100); // Default width

    // Check if we're on the "All Products" page
    const isAllActive = location.pathname === "/womenwear";

    // Determine what to show
    const showMainCategoriesOnly = !currentCategory || isAllActive;

    // Extract main categories
    const mainCategories = useMemo(() => {
        return extractCategories(products);
    }, [products]);

    // Check if we should show arrows based on subcategory count
    const shouldShowArrows = availableSubcategories.length > 6;

    // Calculate dynamic button width and container width
    useEffect(() => {
        if (!showMainCategoriesOnly && scrollContainerRef.current) {
            const buttons = scrollContainerRef.current.querySelectorAll('button');
            if (buttons.length > 0) {
                // Get the maximum button width
                let maxWidth = 0;
                buttons.forEach(button => {
                    const width = button.offsetWidth;
                    if (width > maxWidth) maxWidth = width;
                });
                setButtonWidth(maxWidth || 100);
            }
        }
    }, [availableSubcategories, showMainCategoriesOnly]);

    // Container width based on actual button sizes
    const containerWidth = useMemo(() => {
        if (!shouldShowArrows) return '100%';
        const gapSize = 8; // gap-2 = 8px
        const visibleButtons = 6;
        const totalWidth = (buttonWidth * visibleButtons) + (gapSize * (visibleButtons - 1));
        return `${totalWidth}px`;
    }, [buttonWidth, shouldShowArrows]);

    // Prevent scroll restoration on navigation
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    // Check scroll position to show/hide arrows for subcategories
    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (container && shouldShowArrows) {
            setShowLeftArrow(container.scrollLeft > 10);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 10
            );
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container && !showMainCategoriesOnly && shouldShowArrows) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);

            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [availableSubcategories, showMainCategoriesOnly, shouldShowArrows]);

    // Scroll one button at a time for subcategories
    const scrollOneStep = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const button = container.querySelector('button');
            if (button) {
                const buttonWidth = button.offsetWidth;
                const gap = 8;
                const scrollAmount = (buttonWidth + gap) * (direction === 'left' ? -1 : 1);

                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleCategoryClick = (catName, isSubcategory = false) => {
        if (catName === "ALL") {
            navigate("/womenwear");
            return;
        }

        if (isSubcategory) {
            updateFilter("subcategories", catName);
        } else {
            const scrollY = window.pageYOffset;
            const normalizedValue = normalizeCategory(catName);
            navigate(`/women/${normalizedValue}`);
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
            });
        }
    };

    // If we're on the "All Products" page or no category selected
    if (showMainCategoriesOnly) {
        return (
            <div className="flex items-center w-full bg-white gap-4">
                {/* ALL Button - Far Left */}
                <div className="flex-shrink-0">
                    <button
                        onClick={() => handleCategoryClick("ALL")}
                        className={`
                            px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200
                            ${isAllActive
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            }
                        `}
                    >
                        ALL
                    </button>
                </div>

                {/* Main Categories - Left Side */}
                <div className="flex flex-1 gap-2 overflow-x-auto"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    <style>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {mainCategories.map((category) => {
                        const normalizedLabel = normalizeCategory(category.name);
                        const isActive = currentCategory === normalizedLabel;

                        return (
                            <button
                                key={category.name}
                                onClick={() => handleCategoryClick(category.name)}
                                className={`
                                    flex-shrink-0 px-4 py-1.5 text-sm font-medium border transition-all duration-200 whitespace-nowrap
                                    ${isActive
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                    }
                                `}
                            >
                                {category.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // When a category is selected - Main Category on Left, Subcategories on Right
    return (
        <div className="flex justify-between items-center w-full bg-white">
            {/* Left Side - Main Category Button */}
            <div className="flex-shrink-0">
                <button
                    onClick={() => navigate("/womenwear")}
                    className="px-4 py-1.5 transition-all duration-200 whitespace-nowrap"
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#33022F',
                        fontFamily: 'Outfit',
                        fontWeight: 700,
                        fontSize: '16px',
                        lineHeight: '14.77px',
                        letterSpacing: '1px',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                    }}
                >
                    {currentCategory?.toUpperCase().replace("-", " ") || "WOMEN"}
                </button>
            </div>

            <div className="flex-1 flex justify-end items-center min-w-0 ml-4">
                <div
                    className="relative bg-white rounded-lg shadow-sm overflow-hidden"
                    style={{
                        width: containerWidth,
                        maxWidth: '100%'
                    }}
                >
                    {/* Left Arrow Overlay - Only show if more than 6 subcategories */}
                    {shouldShowArrows && showLeftArrow && (
                        <div className="absolute left-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-r from-white via-white to-transparent pl-1">
                            <button
                                onClick={() => scrollOneStep('left')}
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 shadow-md hover:bg-gray-50 transition-colors rounded-full"
                                aria-label="Scroll left"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Scrollable subcategories container */}
                    <div
                        ref={scrollContainerRef}
                        className={`flex items-center gap-2 py-2 px-2 ${shouldShowArrows
                                ? 'overflow-x-auto scroll-smooth'
                                : 'overflow-x-hidden'
                            }`}
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                            width: '100%',
                            justifyContent: shouldShowArrows ? 'flex-start' : 'flex-end'
                        }}
                    >
                        <style>{`
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        {/* Subcategory buttons */}
                        {availableSubcategories.map((subCatName, index) => {
                            const isActive = selectedFilters.subcategories?.some(
                                (s) => s.toLowerCase() === subCatName.toLowerCase()
                            ) || false;

                            // Calculate dynamic font size based on text length
                            const getFontSize = (text) => {
                                const length = text.length;
                                if (length > 20) return '10px';
                                if (length > 15) return '11px';
                                if (length > 10) return '12px';
                                return '13px';
                            };

                            return (
                                <button
                                    key={subCatName}
                                    onClick={() => handleCategoryClick(subCatName, true)}
                                    className={`
                flex-shrink-0 px-4 py-1.5 font-medium border transition-all duration-200 whitespace-nowrap
                ${isActive
                                            ? "bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800"
                                            : "bg-white border-[#9B8B9A66] hover:bg-[#815279] hover:text-white hover:border-[#815279]"
                                        }
                ${index === 0 ? 'ml-0' : ''}
            `}
                                    style={{
                                        fontFamily: 'Outfit',
                                        fontWeight: 300,
                                        fontSize: getFontSize(subCatName),
                                        lineHeight: '1.2',
                                        letterSpacing: '0.5px',
                                        textAlign: 'center',
                                        textTransform: 'uppercase',
                                        color: isActive ? 'white' : '#815279',
                                        borderWidth: '0.92px',
                                        minWidth: 'fit-content',
                                        maxWidth: '180px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        paddingLeft: '16px',
                                        paddingRight: '16px',
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                    title={subCatName} // Show full text on hover
                                >
                                    {subCatName}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Arrow Overlay - Only show if more than 6 subcategories */}
                    {shouldShowArrows && showRightArrow && (
                        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-l from-white via-white to-transparent pr-1">
                            <button
                                onClick={() => scrollOneStep('right')}
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 shadow-md hover:bg-gray-50 transition-colors rounded-full"
                                aria-label="Scroll right"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryTags;