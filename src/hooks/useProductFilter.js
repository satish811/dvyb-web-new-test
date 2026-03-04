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
      // === CATEGORY FILTER (MULTI-SELECT — OR logic) ===
      if (selectedFilters.categories?.length > 0) {
        // Category groups: selected filter → matcher function (all comparisons are uppercase)
        const CATEGORY_GROUPS = {
          "KURTA SETS": (v) => v.includes("KURTA"),
          "KURTA SET": (v) => v.includes("KURTA"),
          "SAREE": (v) => v === "SAREE" || v === "SAREES",
          "LEHENGA": (v) => v.includes("LEHENGA"),
          "ANARKALIS": (v) => v === "ANARKALI" || v === "ANARKALIS" || v.includes("ANARKALI"),
          "ANARKALI": (v) => v === "ANARKALI" || v === "ANARKALIS" || v.includes("ANARKALI"),
          "SHARARAS": (v) => v === "SHARARA" || v === "SHARARAS" || v.includes("SHARARA"),
          "BLOUSES": (v) => v.includes("BLOUS"),
          "SALWAR SUIT": (v) => v.includes("SALWAR"),
          "INDO WESTERN": (v) => v.includes("INDO") || v.includes("WESTERN"),
          "BRIDAL": (v) => v === "BRIDAL" || v.includes("BRIDAL") || v === "WEDDING" || v.includes("WEDDING"),
        };

        // Get all possible category-related fields from product
        const productCat = (product.category?.trim() || "").toUpperCase();
        const productDressType = (product.dressType?.trim() || "").toUpperCase();
        const productSubDressType = (product.subDressType?.trim() || "").toUpperCase();
        const productSubcategory = (product.subcategory?.trim() || "").toUpperCase();
        const productType = (product.type?.trim() || "").toUpperCase();

        // Check if product matches ANY selected category (OR logic)
        const matchesAnyCategory = selectedFilters.categories.some((cat) => {
          const selectedCat = cat.trim().toUpperCase();
          const groupMatcher = CATEGORY_GROUPS[selectedCat] ||
            ((v) => v === selectedCat || v === selectedCat + "S" || v + "S" === selectedCat);

          return (
            groupMatcher(productDressType) ||
            groupMatcher(productCat) ||
            groupMatcher(productSubDressType) ||
            groupMatcher(productSubcategory) ||
            groupMatcher(productType)
          );
        });

        if (!matchesAnyCategory) return false;
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
        const productFields = [
          product.subcategory,
          product.subCategory,
          product.sub_category,
          product.subDressType,
          product.dressType,
          product.category,
        ].filter(Boolean).map((f) => f.trim().toLowerCase());

        const matchSub = selectedFilters.subcategories.some((sub) =>
          productFields.some((field) => field === sub.toLowerCase())
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
