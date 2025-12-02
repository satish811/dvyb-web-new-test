// src/context/FilterContext.jsx
import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilter must be used within a FilterProvider");
  return context;
};

export const BlouseProvider = ({ children }) => {
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
    sizes: [],
    colors: [],
    priceMin: null,
    priceMax: null,
    discounts: [],
  });

  const [navbarCategory, setNavbarCategory] = useState("");

  const updateFilter = (filterType, value) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };

      switch (filterType) {
        case "categories":
          // Check if the value is a main category (from navItems) or subcategory
          const isMainCategory = Object.keys(categoryPathMap).includes(value.toUpperCase());

          if (isMainCategory) {
            // Main category - replace the entire categories array
            if (newFilters.categories.includes(value)) {
              newFilters.categories = [];
              setNavbarCategory("");
            } else {
              newFilters.categories = [value];
              setNavbarCategory(value);
            }
          } else {
            // Subcategory - toggle it in the array
            newFilters.categories = newFilters.categories.includes(value)
              ? newFilters.categories.filter((item) => item !== value)
              : [...newFilters.categories, value];
          }
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
