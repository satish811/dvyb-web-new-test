import { useState, useEffect } from "react";
import { FilterSection, ColorFilter, PriceRange, DiscountFilter } from "../filters";
import { useFilter } from "../../../context/FilterContext";
import { useLocation } from "react-router-dom";
import BlouseFilter from "../filters/BlouseFilter";

const Sidebar = ({ products = [] }) => {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const urlCategory = params.get("category");

  const isURLSaree = urlCategory?.toLowerCase() === "saree";

  const [filterData, setFilterData] = useState({
    categories: [],
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 0 },
  });

  const { selectedFilters } = useFilter();
  const selectedCategory = selectedFilters.categories[0] || null;

  const customCategories = [
    { name: "LEHENGA", count: 5 },
    { name: "SAREE", count: 4 },
    { name: "KURTA SETS", count: 5 },
    { name: "ANARKALIS", count: 6 },
    { name: "SHARARAS", count: 8 },
    { name: "PRET", count: 3 },
    { name: "FUSION", count: 2 },
    { name: "WEDDING", count: 9 },
    { name: "SALE", count: 5 },
    { name: "VIRTUAL TRYON", count: 7 },
  ];

  const customDiscounts = [
    { range: "0% - 20%", count: 10 },
    { range: "21% - 30%", count: 12 },
    { range: "31% - 40%", count: 11 },
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

  useEffect(() => {
    if (products.length > 0) {
      const dynamicData = extractDynamicFilterData(products);
      setFilterData(dynamicData);
    }
  }, [products]);

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
        <FilterSection
          title="CATEGORY"
          items={customCategories}
          searchable
          defaultOpen={true}
          filterType="categories"
        />

        <BlouseFilter />

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

/* Helper Functions (unchanged) */
function extractDynamicFilterData(products) {
  return {
    categories: extractCategories(products),
    sizes: extractSizes(products),
    colors: extractColors(products),
    priceRange: getPriceRange(products),
  };
}

function extractCategories(products) {
  const map = new Map();

  products.forEach((product) => {
    if (product.category && product.category.trim()) {
      const category = product.category.trim();
      map.set(category, (map.get(category) || 0) + 1);
    }

    if (product.subDressType && product.subDressType.trim()) {
      const sub = product.subDressType.trim();
      map.set(sub, (map.get(sub) || 0) + 1);
    }
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
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
