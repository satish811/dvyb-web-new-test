// src/context/FilterContext.jsx
import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilter must be used within a FilterProvider");
  return context;
};

export const FilterProvider = ({ children }) => {
  // Define categoryPathMap inside the component
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

  const [filters, setFilters] = useState({
    categories: [],
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 50000 },
    discounts: [],
  });

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    subcategories: [],
    sizes: [],
    colors: [],
    priceMin: null,
    priceMax: null,
    discounts: [],
    blouses: [],
  });

  const [navbarCategory, setNavbarCategory] = useState("");

  const updateFilter = (filterType, value) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };

      switch (filterType) {
        case "categories":
          const normalized = value.toLowerCase();
          const isMainCategory = Object.keys(categoryPathMap).includes(value.toUpperCase());

          if (!isMainCategory) {
            // SUBCATEGORY - toggle in subcategories array
            newFilters.subcategories = newFilters.subcategories || []; // Ensure array exists
            newFilters.subcategories = newFilters.subcategories.includes(normalized)
              ? newFilters.subcategories.filter((v) => v !== normalized)
              : [...newFilters.subcategories, normalized];
          } else {
            // MAIN CATEGORY - replace the categories array
            if (newFilters.categories.includes(value)) {
              newFilters.categories = [];
              setNavbarCategory("");
              newFilters.subcategories = []; // Clear subcategories when main category is deselected
            } else {
              newFilters.categories = [value];
              setNavbarCategory(value);
              // Optionally keep subcategories when switching main categories
              // newFilters.subcategories = []; // Or clear them
            }
          }
          break;

        case "blouses":
          newFilters.blouses = newFilters.blouses?.includes(value)
            ? newFilters.blouses.filter((item) => item !== value)
            : [...(newFilters.blouses || []), value];
          break;

        case "sizes":
        case "colors":
        case "discounts":
          newFilters[filterType] = newFilters[filterType].includes(value)
            ? newFilters[filterType].filter((item) => item !== value)
            : [...newFilters[filterType], value];
          break;

        case "priceMin":
          newFilters.priceMin = value;
          break;

        case "priceMax":
          newFilters.priceMax = value;
          break;

        default:
          break;
      }

      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      sizes: [],
      colors: [],
      priceMin: null,
      priceMax: null,
      discounts: [],
      blouses: [],
    });
    setNavbarCategory("");
  };

  const value = {
    filters,
    setFilters,
    selectedFilters,
    updateFilter,
    clearAllFilters,
    navbarCategory,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
