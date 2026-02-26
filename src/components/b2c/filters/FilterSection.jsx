import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useFilter } from "../../../context/FilterContext";
import { useNavigate, useLocation } from "react-router-dom";

// Define mapping directly in the file
const categoryPathMap = {
  LEHENGA: "/womenwear?category=lehenga",
  SAREE: "/womenwear?category=saree",
  "KURTA SETS": "/womenwear?category=kurta-sets",
  "KURTA SET": "/womenwear?category=kurta-sets",
  "KURTA-SET": "/womenwear?category=kurta-sets",
  "KURTA-SETS": "/womenwear?category=kurta-sets",
  "EMBROIDERED KURTA": "/womenwear?category=kurta-sets",
  "EMBROIDERED KURTA SET": "/womenwear?category=kurta-sets",
  ANARKALIS: "/womenwear?category=anarkalis",
  ANARKALI: "/womenwear?category=anarkalis",
  SHARARAS: "/womenwear?category=shararas",
  SHARARA: "/womenwear?category=shararas",
  "PRÊT": "/womenwear?category=pret",
  FUSION: "/womenwear?category=fusion",
  WEDDING: "/womenwear?category=wedding",
  SALE: "/womenwear?category=sale",
  "VIRTUAL TRYON": "/virtual-tryon",
  "SEQUINNED LEHENGA": "/womenwear?category=lehenga",
  "FESTIVE FABRIC": "/womenwear?category=festive-fabric",
  BLOUSE: "/womenwear?category=blouses",
  BLOUSES: "/womenwear?category=blouses",
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

const FilterSection = ({ title, items, searchable = false, defaultOpen = false, filterType, subcategoryItems = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [displayItems, setDisplayItems] = useState(items);
  const { selectedFilters, updateFilter } = useFilter();
  const navigate = useNavigate();
  const location = useLocation();

  // Get current category from URL
  const getCurrentCategory = () => {
    const pathParts = location.pathname.split("/");
    if (pathParts.includes("women") && pathParts.length >= 3) {
      return pathParts[2].toUpperCase();
    }
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    return urlToSubcategoryKey[categoryParam] || null;
  };

  // Effect to switch between main categories and subcategories
  useEffect(() => {
    const currentCategory = getCurrentCategory();

    if (filterType === "categories" && currentCategory && subcategoryItems.length > 0) {
      // Show dynamic subcategories for the current main category
      const subCategoryItems = subcategoryItems.map((subCat) => ({
        name: subCat,
        count: 0,
      }));
      setDisplayItems(subCategoryItems);
    } else {
      // Show main categories or other filter items
      setDisplayItems(items);
    }
  }, [location.search, items, filterType, subcategoryItems]);

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
      updateFilter("subcategories", categoryName);
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
        // For subcategories - check if this subcategory is selected (case-insensitive)
        return selectedFilters.subcategories?.some(
          (s) => s.toLowerCase() === itemName.toLowerCase()
        ) || false;
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
        className="flex items-center justify-between w-full text-left mb-2.5 sm:mb-3"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h3>
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

          <div className="space-y-1 sm:space-y-1.5 max-h-48 sm:max-h-60 overflow-y-auto hide-scrollbar text-sm">
            {filtered.length === 0 && (
              <div className="text-gray-500 text-center py-2 sm:py-3 text-sm">
                No {filterType} available.
              </div>
            )}

            {filtered.length > 0 &&
              filtered.map((item, i) => (
                <label
                  key={i}
                  className="filter-checkbox-label"
                  data-checked={isChecked(item.name)}
                >
                  <div className="filter-checkbox-content">
                    <input
                      type="checkbox"
                      className="filter-checkbox-input"
                      checked={isChecked(item.name)}
                      onChange={() => handleFilterClick(item.name)}
                    />
                    <span className="filter-checkbox-box" />
                    <span className="filter-checkbox-name">{item.name}</span>
                  </div>
                  {item.count > 0 && <span className="filter-checkbox-count">({item.count})</span>}
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
