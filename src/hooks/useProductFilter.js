import { useMemo } from "react";
import { useFilter } from "../context/FilterContext";

export const useProductFilter = (products = []) => {
  const { selectedFilters } = useFilter();

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    const hasFilters =
      selectedFilters.categories?.length > 0 ||
      selectedFilters.subcategories?.length > 0 ||
      selectedFilters.sizes?.length > 0 ||
      selectedFilters.colors?.length > 0 ||
      selectedFilters.priceMin != null ||
      selectedFilters.priceMax != null ||
      selectedFilters.discounts?.length > 0 ||
      selectedFilters.blouses?.length > 0 ||
      selectedFilters.boutiques?.length > 0;

    console.log(`[useProductFilter] Total products: ${products.length}`);
    console.log(`[useProductFilter] Active filters:`, selectedFilters);
    console.log(`[useProductFilter] Has filters: ${hasFilters}`);

    if (!hasFilters) {
      console.log("[useProductFilter] No filters applied, returning all products");
      return products;
    }

    const result = products.filter((product) => {
      // === CATEGORY FILTER ===
      if (selectedFilters.categories?.length > 0) {
        const selectedCat = selectedFilters.categories[0].trim().toUpperCase();

        // Get all possible category-related fields from product
        const productCat = (product.category?.trim() || "").toUpperCase();
        const productDressType = (product.dressType?.trim() || "").toUpperCase();
        const productSubDressType = (product.subDressType?.trim() || "").toUpperCase();
        const productSubcategory = (product.subcategory?.trim() || "").toUpperCase();
        const productType = (product.type?.trim() || "").toUpperCase();

        // Helper: Check if a value matches or is related to the selected category
        const belongsToCategory = (value, category) => {
          if (!value || !category) return false;

          // Exact match
          if (value === category) return true;

          // Plural variations (SAREE <-> SAREES, LEHENGA <-> LEHENGAS)
          if (value === category + "S" || value + "S" === category) return true;

          // The value contains the category as a major component
          // e.g., "BANARASI SAREE" contains "SAREE"
          if (value.includes(category)) {
            // Only match if category is a significant part (not just coincidental)
            const parts = value.split(/\s+/);
            if (parts.some(part => part === category || part === category + "S")) {
              return true;
            }
          }

          // The category contains the value (for shorter subcategory names)
          // e.g., category "SAREES" contains type "SAREE"
          if (category.includes(value) && value.length >= 4) {
            return true;
          }

          return false;
        };

        // Check if product belongs to the selected category through ANY field
        const matchesCategory =
          belongsToCategory(productCat, selectedCat) ||
          belongsToCategory(productDressType, selectedCat) ||
          belongsToCategory(productSubDressType, selectedCat) ||
          belongsToCategory(productSubcategory, selectedCat) ||
          belongsToCategory(productType, selectedCat);

        if (!matchesCategory) return false;
      }

      // === BOUTIQUE FILTER ===
      if (selectedFilters.boutiques?.length > 0) {
        const productShopName = product.shopName?.trim() || product.boutiqueName?.trim();
        if (!productShopName) return false;

        const hasBoutiqueMatch = selectedFilters.boutiques.some(
          (selectedBoutique) => selectedBoutique.trim() === productShopName
        );

        if (!hasBoutiqueMatch) return false;
      }

      // === BLOUSE FILTER === (FIXED - Only apply to blouse products)
      if (selectedFilters.blouses?.length > 0) {
        console.log("Applying blouse filter:", selectedFilters.blouses);
        console.log("Product dressType:", product.dressType);
        console.log("Product subDressType:", product.subDressType);
        const isBlouseProduct = product.dressType?.toLowerCase() === "blouses";

        if (isBlouseProduct) {
          const productBlouseType = product.subDressType?.trim()?.toLowerCase();

          if (!productBlouseType) return false;

          const hasBlouseMatch = selectedFilters.blouses.some(
            (selectedBlouse) => selectedBlouse.toLowerCase() === productBlouseType
          );

          if (!hasBlouseMatch) return false;
        }
        // If it's not a blouse product, don't apply blouse filtering
      }

      // === SUBCATEGORY FILTER ===
      if (selectedFilters.subcategories?.length > 0) {
        const productSub =
          product.subcategory?.trim()?.toLowerCase() || product.subDressType?.trim()?.toLowerCase();

        const matchSub = selectedFilters.subcategories.some(
          (sub) => sub.toLowerCase() === productSub
        );

        if (!matchSub) return false;
      }

      // === SIZE FILTER ===
      if (selectedFilters.sizes?.length > 0) {
        const productSizes = product.selectedSizes || [];
        const hasSizeMatch = selectedFilters.sizes.some((selectedSize) =>
          productSizes.some((size) => size.trim().toUpperCase() === selectedSize.toUpperCase())
        );
        if (!hasSizeMatch) return false;
      }

      // === COLOR FILTER ===
      if (selectedFilters.colors?.length > 0) {
        const productColors = product.selectedColors || [];
        const hasColorMatch = selectedFilters.colors.some((selectedColor) => {
          const [colorName] = selectedColor.split("_");
          return productColors.some((color) => {
            const [pcName] = color.split("_");
            return pcName?.trim().toUpperCase() === colorName.toUpperCase();
          });
        });
        if (!hasColorMatch) return false;
      }

      // === PRICE FILTER ===
      const productPrice = Number(product.price) || 0;
      if (selectedFilters.priceMin != null && productPrice < selectedFilters.priceMin) return false;
      if (selectedFilters.priceMax != null && productPrice > selectedFilters.priceMax) return false;

      return true;
    });

    console.log(`[useProductFilter] Filtered from ${products.length} to ${result.length} products`);
    return result;
  }, [products, selectedFilters]);

  return filteredProducts;
};
