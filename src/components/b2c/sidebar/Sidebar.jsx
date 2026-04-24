import { useState, useEffect, useMemo } from "react";
import { FilterSection, ColorFilter, PriceRange, DiscountFilter } from "../filters";
import { useFilter } from "../../../context/FilterContext";
import { useLocation } from "react-router-dom";
import BlouseFilter from "../filters/BlouseFilter";
import { Search } from "lucide-react";
import { extractCategories, extractSubcategories } from "../../../utils/categoryExtractor";

const Sidebar = ({ products = [], activeRouteCategory = null }) => {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const urlCategory = params.get("category");

  const isBoutiquePage = urlCategory?.toLowerCase() === "boutique" || urlCategory?.toLowerCase() === "boutiques";
  const isURLSaree = urlCategory?.toLowerCase() === "saree";

  const customDiscounts = [
    { range: "0% - 20%" },
    { range: "21% - 30%" },
    { range: "31% - 40%" },
  ];

  const defaultSizes = [
    { name: "XS", count: 12 },
    { name: "S", count: 3 },
    { name: "M", count: 4 },
    { name: "L", count: 5 },
    { name: "XL", count: 9 },
    { name: "XXL", count: 12 },
    { name: "3XL", count: 11 },
  ];

  const [filterData, setFilterData] = useState({
    categories: [],
    sizes: [],
    colors: [],
    boutiques: [],
    priceRange: { min: 0, max: 0 },
    weavingMethods: [],
    certifications: [],
    sareeBlouseOptions: [],
  });

  const { selectedFilters, updateFilter } = useFilter();
  const selectedCategory = selectedFilters.categories[0] || null;

  // Helper function to update filter data
  const updateAllFilterData = ({ categories, boutiques, sizes, colors, priceRange, weavingMethods, certifications, sareeBlouseOptions }) => {
    setFilterData({
      categories,
      boutiques,
      sizes,
      colors,
      priceRange,
      weavingMethods,
      certifications,
      sareeBlouseOptions,
    });
  };

  // Get current category from URL to extract subcategories
  const getCurrentCategory = () => {
    const pathParts = location.pathname.split("/");
    if (pathParts.includes("women") && pathParts.length >= 3) {
      return pathParts[2].toUpperCase();
    }
    return null;
  };

  // Extract dynamic subcategories for current category
  const currentCategory = getCurrentCategory();
  const dynamicSubcategories = currentCategory
    ? extractSubcategories(products, currentCategory)
    : [];

  const recentUploadsFilterItems = useMemo(() => {
    const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - FIFTEEN_DAYS_MS;

    const uploadedInLast15Days = (products || []).filter((product) => {
      const rawDate = product?.timestamp || product?.createdAt || product?.uploadedAt || product?.uploadDate;
      if (!rawDate) return false;

      const parsedDate =
        rawDate?.toDate?.() ||
        (rawDate instanceof Date ? rawDate : new Date(rawDate));

      if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
        return false;
      }

      return parsedDate.getTime() >= cutoff;
    }).length;

    return [{ name: "Uploaded in last 15 days", count: uploadedInLast15Days }];
  }, [products]);

  // Build the effective category list: merge route category + selected categories
  const effectiveCategories = useMemo(() => {
    const cats = [...(selectedFilters.categories || [])];
    // Map route category name to the label used in CATEGORY_GROUPS
    if (activeRouteCategory) {
      const routeCatMap = {
        "lehenga": "LEHENGA",
        "saree": "SAREE",
        "kurta-sets": "KURTA SETS",
        "anarkalis": "ANARKALIS",
        "shararas": "SHARARAS",
        "blouses": "BLOUSES",
        "salwar-suit": "SALWAR SUIT",
        "indo-western": "INDO WESTERN",
        "bridal": "BRIDAL",
        "wedding": "WEDDING",
        "boutique": null, // Don't filter by category for boutique pages
        "boutiques": null,
      };
      const mapped = routeCatMap[activeRouteCategory.toLowerCase()] ?? activeRouteCategory.toUpperCase();
      if (mapped && !cats.includes(mapped)) {
        cats.push(mapped);
      }
    }
    return cats;
  }, [selectedFilters.categories, activeRouteCategory]);

  useEffect(() => {
    if (products && products.length > 0) {
      const dynamicData = extractDynamicFilterData(products, urlCategory, selectedFilters.boutiques, effectiveCategories);
      updateAllFilterData(dynamicData);
    }
  }, [products, urlCategory, selectedFilters.boutiques, effectiveCategories]);

  const isSareeCategory =
    (selectedCategory && selectedCategory.toUpperCase().includes("SAREE")) || isURLSaree;

  return (
    <aside className="w-full bg-transparent h-auto block">
      <div className="p-4 sm:p-5 pt-0 sm:pt-0 space-y-6 sm:space-y-7">
        {/* Designer Section (Top) */}
        <FilterSection
          title="SELECT DESIGNER"
          items={filterData.boutiques}
          searchable={false}
          defaultOpen={true}
          filterType="boutiques"
        />

        {/* Category Section (Below Designers) */}
        <FilterSection
          title="SELECT CATEGORY"
          items={filterData.categories}
          searchable={false}
          defaultOpen={true}
          filterType="categories"
          subcategoryItems={dynamicSubcategories}
        />

        <FilterSection
          title="UPLOAD DATE"
          items={recentUploadsFilterItems}
          searchable={false}
          defaultOpen={true}
          filterType="recentUploads"
        />

        {!isSareeCategory && (
          <FilterSection
            title="SIZE"
            items={filterData.sizes.length > 0 ? filterData.sizes : defaultSizes}
            defaultOpen={true}
            filterType="sizes"
          />
        )}

        {filterData.colors.length > 0 && (
          <ColorFilter title="COLORS" colors={filterData.colors} defaultOpen={true} />
        )}

        <DiscountFilter title="DISCOUNT" discounts={customDiscounts} defaultOpen={true} />

        {filterData.priceRange.max > 0 && (
          <PriceRange
            min={filterData.priceRange.min}
            max={filterData.priceRange.max}
            defaultOpen={true}
          />
        )}

        {filterData.weavingMethods.length > 0 && (
          <FilterSection
            title="WEAVING METHOD"
            items={filterData.weavingMethods}
            searchable={true}
            defaultOpen={false}
            filterType="weavingMethods"
          />
        )}

        {filterData.certifications.length > 0 && (
          <FilterSection
            title="CERTIFICATION"
            items={filterData.certifications}
            searchable={true}
            defaultOpen={false}
            filterType="certifications"
          />
        )}

        {filterData.sareeBlouseOptions.length > 0 && (
          <FilterSection
            title="SAREE BLOUSE OPTION"
            items={filterData.sareeBlouseOptions}
            searchable={true}
            defaultOpen={false}
            filterType="sareeBlouseOptions"
          />
        )}
      </div>
    </aside>
  );
};

/* Helper Functions */
function extractDynamicFilterData(products, activeCategory, selectedBoutiques, selectedCategories) {
  // ── Step 1: Filter products by selected CATEGORIES ──
  // Use the same matching logic as useProductFilter.js
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

  let categoryFilteredProducts = products;
  if (selectedCategories && selectedCategories.length > 0) {
    categoryFilteredProducts = products.filter((product) => {
      const productCat = (product.category?.trim() || "").toUpperCase();
      const productDressType = (product.dressType?.trim() || "").toUpperCase();
      const productSubDressType = (product.subDressType?.trim() || "").toUpperCase();
      const productSubcategory = (product.subcategory?.trim() || "").toUpperCase();
      const productType = (product.type?.trim() || "").toUpperCase();

      return selectedCategories.some((cat) => {
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
    });
  }

  // ── Step 2: Further filter by selected BOUTIQUES ──
  let finalFilteredProducts = categoryFilteredProducts;
  if (selectedBoutiques && selectedBoutiques.length > 0) {
    const selectedLower = selectedBoutiques.map(b => b.toLowerCase());
    finalFilteredProducts = categoryFilteredProducts.filter((p) => {
      const shopName = (p.shopName?.trim() || p.boutiqueName?.trim() || "").toLowerCase();
      return selectedLower.includes(shopName);
    });
  }

  // ── Step 3: Extract filter facets from the filtered product set ──
  // Categories always come from ALL products (so user can see all options)
  // Boutiques come from category-filtered products (so you only see relevant designers)
  // Sizes, colors, priceRange come from the fully filtered set
  return {
    categories: extractCategories(products),
    boutiques: extractBoutiques(categoryFilteredProducts, activeCategory),
    sizes: extractSizes(finalFilteredProducts),
    colors: extractColors(finalFilteredProducts),
    priceRange: getPriceRange(finalFilteredProducts),
    weavingMethods: extractFilterFacet(finalFilteredProducts, ["weavingMethod", "weavingmethod", "weaving"], true),
    certifications: extractFilterFacet(finalFilteredProducts, ["certification", "certifications", "certified"], true),
    sareeBlouseOptions: extractFilterFacet(finalFilteredProducts, ["sareeBlouseOption", "sareeBlouse", "saree_blouse_option", "saree_blouse"], true),
  };
}

function extractFilterFacet(products, keys, useCount = false) {
  const map = new Map();

  products.forEach((product) => {
    keys.forEach((key) => {
      const value = product[key] || product[key?.toLowerCase?.()];
      if (value && typeof value === "string") {
        const normalized = value.trim();
        if (normalized.length === 0) return;

        const currentCount = map.get(normalized) || 0;
        map.set(normalized, currentCount + 1);
      }
    });
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function extractBoutiques(products, activeCategory) {
  const map = new Map();
  // Garbage boutique names to exclude
  const GARBAGE_NAMES = new Set([
    "shop name", "boutique nam", "boutique name", "test", "test shop",
    "demo", "demo shop", "sample", "n/a", "na", ""
  ]);

  products.forEach((product) => {
    if (
      activeCategory &&
      activeCategory.toLowerCase() !== "boutique" &&
      activeCategory.toLowerCase() !== "boutiques"
    ) {
      const selectedCat = activeCategory.toLowerCase();
      const productCat = product.category?.trim()?.toLowerCase();
      const productDressType = product.dressType?.trim()?.toLowerCase();

      const matchesCategory =
        productCat === selectedCat ||
        productDressType === selectedCat ||
        (selectedCat === "saree" && productDressType === "sarees") ||
        (selectedCat === "lehenga" && productDressType === "lehengas");

      if (!matchesCategory) return;
    }

    const shopName = product.shopName?.trim() || product.boutiqueName?.trim();
    if (shopName && !GARBAGE_NAMES.has(shopName.toLowerCase())) {
      map.set(shopName, (map.get(shopName) || 0) + 1);
    }
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function extractSizes(products) {
  const sizeMap = new Map();
  // Garbage size values to exclude
  const GARBAGE_SIZES = new Set(["NOSIZE", "NO SIZE", "FREESIZE", "FREE SIZE", "FREE", "NA", "N/A", ""]);

  products.forEach((product) => {
    const units = product.units || {};

    Object.keys(units).forEach((colorKey) => {
      const colorSizes = units[colorKey];

      if (typeof colorSizes === "object" && colorSizes !== null) {
        Object.keys(colorSizes).forEach((size) => {
          if (!size.includes("_") && !size.includes("#") && size.trim() !== "") {
            const sizeKey = size.trim().toUpperCase();
            if (GARBAGE_SIZES.has(sizeKey)) return; // Skip garbage
            const currentCount = sizeMap.get(sizeKey) || 0;
            const quantity = parseInt(colorSizes[size]) || 0;

            if (quantity > 0) {
              sizeMap.set(sizeKey, currentCount + 1);
            }
          }
        });
      }
    });

    if (Object.keys(units).length === 0 && Array.isArray(product.selectedSizes)) {
      product.selectedSizes.forEach((size) => {
        if (size && size.trim()) {
          const sizeKey = size.trim().toUpperCase();
          if (GARBAGE_SIZES.has(sizeKey)) return; // Skip garbage
          sizeMap.set(sizeKey, (sizeMap.get(sizeKey) || 0) + 1);
        }
      });
    }
  });

  return Array.from(sizeMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const sizeOrder = {
        XS: 1,
        S: 2,
        M: 3,
        L: 4,
        XL: 5,
        XXL: 6,
        "3XL": 7,
        "4XL": 8,
      };
      return (sizeOrder[a.name] || 99) - (sizeOrder[b.name] || 99);
    });
}

function extractColors(products) {
  const map = new Map();

  products.forEach((product) => {
    if (Array.isArray(product.selectedColors)) {
      product.selectedColors.forEach((color) => {
        if (color && typeof color === "string") {
          const [name, hex] = color.split("_");
          if (name && hex) {
            const colorName = name.trim();
            const existing = map.get(colorName);
            map.set(colorName, {
              name: colorName,
              hex: hex,
              bgClass: hexToClass(hex),
              count: (existing?.count || 0) + 1,
            });
          }
        }
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function hexToClass(hex) {
  const colorMap = {
    "#FF0000": "bg-red-500",
    "#B22222": "bg-red-600",
    "#8B0000": "bg-red-900",

    "#800080": "bg-purple-600",
    "#9370DB": "bg-purple-500",

    "#008000": "bg-green-600",
    "#32CD32": "bg-green-400",

    "#FFFF00": "bg-yellow-400",

    "#FFB6C1": "bg-pink-300",
    "#FFC0CB": "bg-pink-300",

    "#000000": "bg-black",
    "#FFFFFF": "bg-white border border-gray-300",

    "#0000FF": "bg-blue-500",
  };

  return colorMap[hex] || `bg - [${hex}]`;
}

function getPriceRange(products) {
  const prices = products.map((p) => Number(p.price)).filter((p) => !isNaN(p) && p > 0);

  if (prices.length === 0) {
    return { min: 55, max: 37967 };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export default Sidebar;
