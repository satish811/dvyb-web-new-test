import { useState, useEffect } from "react";
import { FilterSection, ColorFilter, PriceRange, DiscountFilter } from "../filters";
import { useFilter } from "../../../context/FilterContext";
import { useLocation } from "react-router-dom";
import BlouseFilter from "../filters/BlouseFilter";
import { Search } from "lucide-react";

const Sidebar = ({ products = [] }) => {
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
    boutiques: [], // New state for boutiques
    priceRange: { min: 0, max: 0 },
  });

  const { selectedFilters, updateFilter } = useFilter();
  const selectedCategory = selectedFilters.categories[0] || null;

  useEffect(() => {
    if (products.length > 0) {
      const dynamicData = extractDynamicFilterData(products, urlCategory, selectedFilters.boutiques);
      setFilterData(dynamicData);
    }
  }, [products, urlCategory, selectedFilters.boutiques]);

  const isSareeCategory =
    (selectedCategory && selectedCategory.toUpperCase().includes("SAREE")) || isURLSaree;

  return (
    <aside
      className="
      w-full 
      sm:w-72
      md:w-64
      lg:w-60
      xl:w-64
      2xl:w-72
      bg-white shadow-none 
      lg:sticky lg:top-20 lg:h-fit 
      h-auto
    "
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 pt-0 sm:pt-0 space-y-6 sm:space-y-7 no-scrollbar">
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
      </div>
    </aside>
  );
};

/* Helper Functions */
function extractDynamicFilterData(products, activeCategory, selectedBoutiques) {
  // If designers are selected, filter the products for category/size/color extraction
  let filteredProducts = products;
  if (selectedBoutiques && selectedBoutiques.length > 0) {
    const selectedLower = selectedBoutiques.map(b => b.toLowerCase());
    filteredProducts = products.filter((p) => {
      const shopName = (p.shopName?.trim() || p.boutiqueName?.trim() || "").toLowerCase();
      return selectedLower.includes(shopName);
    });
  }

  return {
    categories: extractCategories(filteredProducts),
    boutiques: extractBoutiques(products, activeCategory),
    sizes: extractSizes(filteredProducts),
    colors: extractColors(filteredProducts),
    priceRange: getPriceRange(filteredProducts),
  };
}

function extractBoutiques(products, activeCategory) {
  const map = new Map();

  products.forEach((product) => {
    // Contextual filtering: If a category is selected, only show boutiques from that category
    // Skip this check if we are on the 'boutique' landing page
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
    if (shopName) {
      map.set(shopName, (map.get(shopName) || 0) + 1);
    }
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const STANDARD_CATEGORIES = [
  "LEHENGA",
  "SAREE",
  "KURTA SETS",
  "ANARKALIS",
  "SHARARAS",
  "WEDDING",
  "BOUTIQUE",
  "SALE",
  "VIRTUAL TRYON",
];

function extractCategories(products) {
  const counts = {};
  STANDARD_CATEGORIES.forEach((cat) => (counts[cat] = 0));

  products.forEach((product) => {
    const cat = (String(product.category || "")).toUpperCase().trim();
    const dressType = (String(product.dressType || "")).toUpperCase().trim();
    const subDressType = (String(product.subDressType || "")).toUpperCase().trim();

    const checkMatch = (str) => {
      if (str.includes("SAREE")) counts["SAREE"]++;
      else if (str.includes("LEHENGA")) counts["LEHENGA"]++;
      else if (str.includes("KURTA")) counts["KURTA SETS"]++;
      else if (str.includes("ANARKALI")) counts["ANARKALIS"]++;
      else if (str.includes("SHARARA")) counts["SHARARAS"]++;
      else if (str.includes("WEDDING")) counts["WEDDING"]++;
      else if (str.includes("BOUTIQUE")) counts["BOUTIQUE"]++;
      else if (str.includes("SALE")) counts["SALE"]++;
      else if (str.includes("VIRTUAL") || str.includes("TRYON")) counts["VIRTUAL TRYON"]++;
      else return false;
      return true;
    };

    if (!checkMatch(dressType)) {
      if (!checkMatch(cat)) {
        checkMatch(subDressType);
      }
    }
  });

  return STANDARD_CATEGORIES.map((name) => ({
    name,
    count: counts[name],
  })).filter((cat) => cat.count > 0); // Only show categories with products
}

function extractSizes(products) {
  const sizeMap = new Map();

  products.forEach((product) => {
    const units = product.units || {};

    Object.keys(units).forEach((colorKey) => {
      const colorSizes = units[colorKey];

      if (typeof colorSizes === "object" && colorSizes !== null) {
        Object.keys(colorSizes).forEach((size) => {
          if (!size.includes("_") && !size.includes("#") && size.trim() !== "") {
            const sizeKey = size.trim().toUpperCase();
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

  return colorMap[hex] || `bg-[${hex}]`;
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
