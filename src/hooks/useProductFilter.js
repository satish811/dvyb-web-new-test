import { useMemo } from "react";
import { useFilter } from "../context/FilterContext";

export const useProductFilter = (products = []) => {
  const { selectedFilters } = useFilter();

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    console.log("Selected Filters:", selectedFilters);
    console.log("Products count:", products.length);

    const hasFilters =
      selectedFilters.categories?.length > 0 ||
      selectedFilters.subcategories?.length > 0 ||
      selectedFilters.sizes?.length > 0 ||
      selectedFilters.colors?.length > 0 ||
      selectedFilters.priceMin != null ||
      selectedFilters.priceMax != null ||
      selectedFilters.discounts?.length > 0 ||
      selectedFilters.blouses?.length > 0;

    if (!hasFilters) {
      console.log("No filters applied, returning all products");
      return products;
    }

    return products.filter((product) => {
      // === CATEGORY FILTER ===
      if (selectedFilters.categories?.length > 0) {
        const selectedCat = selectedFilters.categories[0].toLowerCase();
        const productCat = product.category?.trim()?.toLowerCase();
        const productDressType = product.dressType?.trim()?.toLowerCase();

        const matchesCategory =
          productCat === selectedCat ||
          productDressType === selectedCat ||
          (selectedCat === "saree" && productDressType === "sarees") ||
          (selectedCat === "lehenga" && productDressType === "lehengas");

        if (!matchesCategory) return false;
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
  }, [products, selectedFilters]);

  return filteredProducts;
};
