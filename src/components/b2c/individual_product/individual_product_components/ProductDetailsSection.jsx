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
    const rows = [
      {
        label: "Dress Type",
        value: firstNonEmptyString(product.dressType),
      },
      {
        label: "Occasion",
        value: firstNonEmptyString(product.occasion),
      },
      {
        label: "Boutique Name / Shop Name",
        value: firstNonEmptyString(
          product.boutiqueName,
          product.shopName,
          product.boutique
        ),
      },
    ];

    return rows.map((row) => ({
      ...row,
      value: row.value || "N/A",
    }));
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
