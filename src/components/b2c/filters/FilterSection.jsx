import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useFilter } from "../../../context/FilterContext";
import { useNavigate, useLocation } from "react-router-dom";

// Import subcategories
import subCategories from "../../../static/navbar/subCategories";

// Define mapping directly in the file
const categoryPathMap = {
  LEHENGA: "/womenwear?category=lehenga",
  SAREE: "/womenwear?category=saree",
  "KURTA SETS": "/womenwear?category=kurta-sets",
  ANARKALIS: "/womenwear?category=anarkalis",
  SHARARAS: "/womenwear?category=shararas",
  PRÊT: "/womenwear?category=pret",
  FUSION: "/womenwear?category=fusion",
  WEDDING: "/womenwear?category=wedding",
  SALE: "/womenwear?category=sale",
  "VIRTUAL TRYON": "/virtual-tryon",
};

// Map URL category params to subcategory keys
const urlToSubcategoryKey = {
  lehenga: "lehenga",
  saree: "saree",
  "kurta-sets": "kurta-sets",
  anarkalis: "anarkalis",
  shararas: "shararas",
  pret: "pret",
  fusion: "fusion",
  wedding: "wedding",
  sale: "sale",
};

const FilterSection = ({ title, items, searchable = false, defaultOpen = false, filterType }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [displayItems, setDisplayItems] = useState(items);
  const { selectedFilters, updateFilter } = useFilter();
  const navigate = useNavigate(); // Fixed: useNavigate for navigation
  const location = useLocation(); // useLocation for reading current location

  // Get current category from URL
  const getCurrentCategory = () => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    return urlToSubcategoryKey[categoryParam] || null;
  };

  // Effect to switch between main categories and subcategories
  useEffect(() => {
    const currentCategory = getCurrentCategory();

    if (filterType === "categories" && currentCategory) {
      // Show subcategories for the current main category
      const subCategoryList = subCategories[currentCategory] || [];
      const subCategoryItems = subCategoryList.map((subCat) => ({
        name: subCat,
        count: 0,
      }));
      setDisplayItems(subCategoryItems);
    } else {
      // Show main categories or other filter items
      setDisplayItems(items);
    }
  }, [location.search, items, filterType]);

  // Handle filter selection based on filter type
  const handleFilterClick = (itemName) => {
    if (filterType === "categories") {
      handleCategoryClick(itemName);
    } else {
      // For sizes, colors, discounts - use the standard filter update
      updateFilter(filterType, itemName);
    }
  };

  // Category-specific logic
  const handleCategoryClick = (categoryName) => {
    const normalizedName = categoryName.toUpperCase().trim();
    const currentCategory = getCurrentCategory();

    // If we're in subcategory mode (current category exists)
    if (currentCategory) {
      // Handle subcategory selection/deselection
      updateFilter("categories", categoryName.toLowerCase());
    } else {
      // Handle main category selection/deselection
      const isCurrentlySelected = selectedFilters.categories[0] === categoryName;

      if (isCurrentlySelected) {
        updateFilter("categories", categoryName);
        navigate("/womenwear");
        return;
      }

      // Navigate to mapped path for main category
      const path = categoryPathMap[normalizedName];
      if (path) {
        updateFilter("categories", categoryName);
        navigate(path);
      }
    }
  };

  const filtered = displayItems
    .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.count - a.count);

  const isChecked = (itemName) => {
    if (filterType === "categories") {
      const currentCategory = getCurrentCategory();

      if (currentCategory) {
        // For subcategories - check if this subcategory is selected
        return selectedFilters.subcategories.includes(itemName.toLowerCase());
      } else {
        // For main categories - check if this main category is selected
        return selectedFilters.categories.includes(itemName);
      }
    } else {
      // For sizes, colors, discounts
      return selectedFilters[filterType].includes(itemName);
    }
  };

  const getCurrentCategoryDisplayName = () => {
    const currentCategory = getCurrentCategory();
    if (!currentCategory) return null;

    const displayMap = {
      lehenga: "LEHENGA",
      saree: "SAREE",
      "kurta-sets": "KURTA SETS",
      anarkali: "ANARKALIS",
      shararas: "SHARARAS",
      pret: "PRÊT",
      fusion: "FUSION",
      wedding: "WEDDING",
      sale: "SALE",
    };
    return displayMap[currentCategory] || currentCategory;
  };

  return (
    <div className="pb-3 sm:pb-4 hide-scrollbar scrollbar-none">
      {/* Header with toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-1.5 sm:mb-2"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h3 className="font-medium text-gray-900 text-xs sm:text-sm">{title}</h3>
          {filterType === "categories" && getCurrentCategory() && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              ({getCurrentCategoryDisplayName()})
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={14} className="sm:size-4" /> : <ChevronDown size={14} className="sm:size-4" />}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div>
          {/* Search Section */}
          {searchable && (
            <div className="relative mb-1.5 sm:mb-2">
              <div className="flex items-center border-b border-gray-300 pb-1 sm:pb-1.5">
                <Search
                  size={12}
                  className="sm:size-3.5 text-gray-400 mr-1.5 sm:mr-2"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full text-[10px] sm:text-xs bg-transparent border-none outline-none placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-0.5 sm:space-y-1 max-h-32 sm:max-h-40 overflow-y-auto hide-scrollbar text-[10px] sm:text-xs">
            {filtered.length === 0 && (
              <div className="text-gray-500 text-center py-2 sm:py-3 text-[10px] sm:text-xs">
                No {filterType} available.
              </div>
            )}

            {filtered.length > 0 &&
              filtered.map((item, i) => (
                <label
                  key={i}
                  className="flex items-center justify-between cursor-pointer p-0.5 sm:p-1 rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked(item.name)}
                      onChange={() => handleFilterClick(item.name)}
                      className="border-2  border-black text-black focus:ring-0 focus:ring-offset-0 focus:outline-none w-3.5 h-2.5 sm:w-3 sm:h-3 rounded-none"
                    />
                    <span className="text-black text-[10px] sm:text-xs">{item.name}</span>
                  </div>
                  {item.count > 0 && <span className="text-gray-500 text-[10px] sm:text-xs">({item.count})</span>}
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
