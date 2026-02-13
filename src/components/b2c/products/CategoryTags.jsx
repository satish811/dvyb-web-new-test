import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useEffect } from "react";
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
        "anarkalis": "anarkalis",
        "shararas": "shararas",
        "pret": "pret",
        "fusion": "fusion",
        "wedding": "wedding",
        "sale": "sale",
        "virtual tryon": "virtual-tryon",
        "boutique": "boutique"
    };

    return mappings[lower] || lower.replace(/\s+/g, "-");
};

const CategoryTags = ({ products = [], currentCategory, availableSubcategories = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateFilter, selectedFilters } = useFilter();

    // Extract main categories
    const mainCategories = useMemo(() => {
        return extractCategories(products);
    }, [products]);

    // Prevent scroll restoration on navigation
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    const handleCategoryClick = (catName, isSubcategory = false) => {
        if (catName === "ALL") {
            navigate("/womenwear");
            return;
        }

        if (isSubcategory) {
            // Update filter - no navigation, no scroll
            updateFilter("categories", catName);
        } else {
            // Save scroll position before navigation
            const scrollY = window.pageYOffset;

            // Navigate to main category page
            const normalizedValue = normalizeCategory(catName);
            navigate(`/women/${normalizedValue}`);

            // Immediately restore scroll position
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
            });
        }
    };

    // Check if we're on the "All Products" page
    const isAllActive = location.pathname === "/womenwear";

    // Determine what to show in the bar
    const showMainCategoriesOnly = !currentCategory || isAllActive;

    return (
        <div
            className="flex items-center gap-3 overflow-x-auto h-full"
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
            }}
        >
            <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

            {/* ALL Button - only show on main page */}
            {showMainCategoriesOnly && (
                <button
                    onClick={() => handleCategoryClick("ALL")}
                    className={`
            flex-shrink-0 px-6 py-2.5 text-xs font-bold tracking-wider border transition-colors duration-200 uppercase
            ${isAllActive
                            ? "bg-[#4A002C] text-white border-[#4A002C]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-gray-800"
                        }
          `}
                >
                    ALL
                </button>
            )}

            {/* Show MAIN categories only (initial state) */}
            {showMainCategoriesOnly && mainCategories.map((category) => {
                const normalizedLabel = normalizeCategory(category.name);
                const isActive = currentCategory === normalizedLabel;

                return (
                    <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className={`
              flex-shrink-0 px-5 py-2.5 text-xs font-bold tracking-wider border transition-colors duration-200 uppercase
              ${isActive
                                ? "bg-[#4A002C] text-white border-[#4A002C]"
                                : "bg-white text-gray-600 border-gray-300 hover:border-gray-800"
                            }
            `}
                    >
                        {category.name}
                    </button>
                );
            })}

            {/* Show MAIN CATEGORY + SUBCATEGORIES (when on category page) */}
            {!showMainCategoriesOnly && (
                <>
                    {/* Main category button (highlighted) */}
                    <button
                        onClick={() => navigate("/womenwear")}
                        className="flex-shrink-0 px-6 py-2.5 text-xs font-bold tracking-wider border transition-colors duration-200 uppercase bg-[#4A002C] text-white border-[#4A002C]"
                    >
                        {currentCategory.toUpperCase().replace("-", " ")}
                    </button>

                    {/* Subcategories */}
                    {availableSubcategories.length > 0 && availableSubcategories.map((subCatName) => {
                        // Check if this subcategory is selected in filters
                        const isActive = selectedFilters.categories.includes(subCatName);

                        return (
                            <button
                                key={subCatName}
                                onClick={() => handleCategoryClick(subCatName, true)}
                                className={`
                  flex-shrink-0 px-5 py-2.5 text-xs font-bold tracking-wider border transition-colors duration-200
                  ${isActive
                                        ? "bg-[#4A002C] text-white border-[#4A002C]"
                                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-800"
                                    }
                `}
                            >
                                {subCatName}
                            </button>
                        );
                    })}
                </>
            )}
        </div>
    );
};

export default CategoryTags;
