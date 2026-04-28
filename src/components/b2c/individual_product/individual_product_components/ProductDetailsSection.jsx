import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const ProductDetailsSection = ({ product }) => {
  if (!product) return null;
  const [expanded, setExpanded] = useState(false);

  const detailRows = useMemo(() => {
    const formatDate = (val) => {
      if (!val) return "N/A";
      try {
        const d = val?.toDate ? val.toDate() : new Date(val);
        return d.toLocaleDateString();
      } catch (e) {
        return String(val);
      }
    };

    const colorDisplay = (colorKey) => {
      if (!colorKey) return colorKey;
      const parts = String(colorKey).split("_");
      return parts[0] || colorKey;
    };

    const unitBreakdown = () => {
      const units = product.units || product.availability?.units || {};
      if (!units || typeof units !== "object") return "N/A";

      const lines = [];
      for (const [colorKey, sizes] of Object.entries(units)) {
        if (!sizes) continue;
        // If nosize is present, show it directly
        if (sizes.nosize !== undefined) {
          lines.push(`${colorDisplay(colorKey)}: ${sizes.nosize}`);
          continue;
        }

        // Otherwise, summarize sizes
        const perSize = [];
        for (const [sizeKey, qty] of Object.entries(sizes)) {
          perSize.push(`${sizeKey}: ${qty}`);
        }
        if (perSize.length) lines.push(`${colorDisplay(colorKey)} — ${perSize.join(", ")}`);
      }

      return lines.length ? lines.join(" | ") : "N/A";
    };

    const capitalizeWords = (input) => {
      if (input === undefined || input === null) return "";
      if (Array.isArray(input)) return input.map((v) => capitalizeWords(v)).join(", ");
      const str = String(input).trim();
      return str
        .split(" ")
        .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
        .join(" ");
    };

    const formatValue = (val) => {
      if (val === undefined || val === null || val === "") return "N/A";
      if (typeof val === "number") return String(val);
      if (Array.isArray(val)) return capitalizeWords(val);
      return capitalizeWords(val);
    };

    const getOccasionValue = () => {
      const occasionSource =
        product.occasion ??
        product.attributes?.occasion ??
        product.details?.occasion;

      if (Array.isArray(occasionSource)) {
        return occasionSource;
      }

      if (typeof occasionSource === "string" && occasionSource.trim()) {
        return occasionSource.trim();
      }

      return "";
    };

    const rows = [
      { label: "Category", value: firstNonEmptyString(product.category) },
      { label: "Product Type", value: firstNonEmptyString(product.productType) },
      { label: "Dress Type", value: firstNonEmptyString(product.dressType) },
      { label: "Saree Blouse Option", value: firstNonEmptyString(product.sareeBlouseOption, product.sareeBlouse) },
      { label: "Occasion", value: getOccasionValue() },
      { label: "Primary Fabric", value: firstNonEmptyString(product.primaryFabric, product.fabric, product.material) },
      { label: "Fabric Sub-Category", value: firstNonEmptyString(product.fabricSubCategory, product.fabricSubcategory) },
      { label: "Weave Type", value: firstNonEmptyString(product.weave, product.weaveType) },
      { label: "Craft", value: firstNonEmptyString(product.craft) },
      { label: "Boutique Name / Shop Name", value: firstNonEmptyString(product.boutiqueName, product.shopName, product.boutique) },
      { label: "Sizes", value: Array.isArray(product.selectedSizes) && product.selectedSizes.length ? product.selectedSizes : (product.sizes || "N/A") },
      { label: "Colors", value: Array.isArray(product.selectedColors) && product.selectedColors.length ? product.selectedColors.map(colorDisplay) : (product.colors || "N/A") },
      { label: "Note", value: firstNonEmptyString(product.note) },
      { label: "Components", value: firstNonEmptyString(product.components) },
    ];

    return rows.map((row) => ({ ...row, value: row.value ? formatValue(row.value) : "N/A" }));
  }, [product]);

  return (
    <div className="w-full border-b border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-base font-semibold text-gray-900">Product Details</h3>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </button>

      {expanded && (
        <div className="pb-4 text-sm text-gray-700">
          {detailRows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-6 py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600">{row.label}:</span>
              <span className="text-right text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDetailsSection;
