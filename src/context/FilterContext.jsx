// src/context/FilterContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from "react";

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilter must be used within a FilterProvider");
  return context;
};

export const FilterProvider = ({ children }) => {
  const categoryPathMap = useMemo(
    () => ({
      LEHENGA: "/womenwear?category=lehenga",
      SAREE: "/womenwear?category=saree",
      "KURTA SETS": "/womenwear?category=kurta-sets",
      "KURTA SET": "/womenwear?category=kurta-sets",
      ANARKALIS: "/womenwear?category=anarkalis",
      SHARARAS: "/womenwear?category=shararas",
      PRÊT: "/womenwear?category=pret",
      FUSION: "/womenwear?category=fusion",
      WEDDING: "/womenwear?category=wedding",
      SALE: "/womenwear?category=sale",
      "VIRTUAL TRYON": "/virtual-tryon",
    }),
    []
  );

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
    boutiques: [],
  });

  const [navbarCategory, setNavbarCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const updateFilter = useCallback(
    (filterType, value) => {
      console.log(`[FilterContext] updateFilter called: ${filterType} = "${value}"`);

      setSelectedFilters((prev) => {
        // Quick optimization: Check if value actually changes
        if (filterType === "categories" && prev.categories[0] === value) {
          console.log(`[FilterContext] Category already set to "${value}", no change`);
          return prev; // No change
        }

        const newFilters = { ...prev };

        switch (filterType) {
          case "categories":
            // MAIN CATEGORY only — toggle in categories[]
            if (newFilters.categories.includes(value)) {
              // Deselect
              newFilters.categories = [];
              setNavbarCategory("");
              newFilters.subcategories = [];
            } else {
              // Select
              newFilters.categories = [value];
              setNavbarCategory(value);
              newFilters.subcategories = [];
            }
            break;

          case "subcategories": {
            // SUBCATEGORY — toggle in subcategories[] (case-insensitive)
            const normalizedSub = value.toLowerCase();
            const subs = newFilters.subcategories || [];
            if (subs.includes(normalizedSub)) {
              newFilters.subcategories = subs.filter((v) => v !== normalizedSub);
            } else {
              newFilters.subcategories = [...subs, normalizedSub];
            }
            break;
          }

          case "blouses":
            const blouses = newFilters.blouses || [];
            if (blouses.includes(value)) {
              newFilters.blouses = blouses.filter((item) => item !== value);
            } else {
              newFilters.blouses = [...blouses, value];
            }
            break;

          case "boutiques":
            const boutiques = newFilters.boutiques || [];
            if (boutiques.includes(value)) {
              newFilters.boutiques = boutiques.filter((item) => item !== value);
            } else {
              newFilters.boutiques = [...boutiques, value];
            }
            break;

          case "sizes":
            const sizes = newFilters.sizes || [];
            if (sizes.includes(value)) {
              newFilters.sizes = sizes.filter((item) => item !== value);
            } else {
              newFilters.sizes = [...sizes, value];
            }
            break;

          case "colors":
            const colors = newFilters.colors || [];
            if (colors.includes(value)) {
              newFilters.colors = colors.filter((item) => item !== value);
            } else {
              newFilters.colors = [...colors, value];
            }
            break;

          case "discounts":
            const discounts = newFilters.discounts || [];
            if (discounts.includes(value)) {
              newFilters.discounts = discounts.filter((item) => item !== value);
            } else {
              newFilters.discounts = [...discounts, value];
            }
            break;

          case "priceMin":
            if (newFilters.priceMin === value) return prev; // No change
            newFilters.priceMin = value;
            break;

          case "priceMax":
            if (newFilters.priceMax === value) return prev; // No change
            newFilters.priceMax = value;
            break;

          default:
            break;
        }

        console.log(`[FilterContext] Updated filters:`, newFilters);
        return newFilters;
      });
    },
    [categoryPathMap]
  );

  const clearAllFilters = useCallback(() => {
    setSelectedFilters({
      categories: [],
      subcategories: [],
      sizes: [],
      colors: [],
      priceMin: null,
      priceMax: null,
      discounts: [],
      blouses: [],
      boutiques: [],
    });
    setNavbarCategory("");
  }, []);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      selectedFilters,
      updateFilter,
      clearAllFilters,
      navbarCategory,
      searchQuery,
      setSearchQuery,
    }),
    [filters, selectedFilters, updateFilter, clearAllFilters, navbarCategory, searchQuery]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
