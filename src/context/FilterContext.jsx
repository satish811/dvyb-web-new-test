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
    recentUploads: [],
  });

  const [navbarCategory, setNavbarCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const updateFilter = useCallback(
    (filterType, value) => {
      console.log(`[FilterContext] updateFilter called: ${filterType} = "${value}"`);

      setSelectedFilters((prev) => {
        const newFilters = { ...prev };

        switch (filterType) {
          case "categories":
            // MULTI-SELECT — toggle value in categories[]
            if (newFilters.categories.includes(value)) {
              // Deselect this category
              newFilters.categories = newFilters.categories.filter(c => c !== value);
              if (newFilters.categories.length === 0) {
                setNavbarCategory("");
              }
              newFilters.subcategories = [];
            } else {
              // Add this category
              newFilters.categories = [...newFilters.categories, value];
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

          case "recentUploads":
            const recentUploads = newFilters.recentUploads || [];
            if (recentUploads.includes(value)) {
              newFilters.recentUploads = recentUploads.filter((item) => item !== value);
            } else {
              newFilters.recentUploads = [...recentUploads, value];
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
      recentUploads: [],
    });
    setNavbarCategory("");
  }, []);

  /**
   * Atomically reset all filters and apply new ones in a single state update.
   * Prevents race conditions between clearAllFilters + updateFilter.
   * @param {Object} newFilters - Partial filter state to merge on top of clean slate
   */
  const resetAndSetFilters = useCallback((newFilters = {}) => {
    setSelectedFilters({
      categories: newFilters.categories || [],
      subcategories: newFilters.subcategories || [],
      sizes: newFilters.sizes || [],
      colors: newFilters.colors || [],
      priceMin: newFilters.priceMin ?? null,
      priceMax: newFilters.priceMax ?? null,
      discounts: newFilters.discounts || [],
      blouses: newFilters.blouses || [],
      boutiques: newFilters.boutiques || [],
      recentUploads: newFilters.recentUploads || [],
    });
    if (newFilters.categories?.length > 0) {
      setNavbarCategory(newFilters.categories[0]);
    } else {
      setNavbarCategory("");
    }
  }, []);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      selectedFilters,
      updateFilter,
      clearAllFilters,
      resetAndSetFilters,
      navbarCategory,
      searchQuery,
      setSearchQuery,
    }),
    [filters, selectedFilters, updateFilter, clearAllFilters, resetAndSetFilters, navbarCategory, searchQuery]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
