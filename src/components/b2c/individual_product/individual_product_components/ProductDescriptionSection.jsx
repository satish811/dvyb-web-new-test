import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const capitalizeWords = (input) => {
  if (input === undefined || input === null) return "";
  const value = String(input).trim();
  if (!value) return "";

  return value
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
};

const formatDisplayValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => capitalizeWords(item)).join(", ");
  }

  return capitalizeWords(value);
};

const ProductDescriptionSection = ({ product }) => {
  const [expanded, setExpanded] = useState(false);

  const description = firstNonEmptyString(
    product?.description,
    product?.shortDescription,
    product?.productDescription,
    product?.details?.description
  );

  const fit = firstNonEmptyString(
    product?.fit,
    product?.fitInfo,
    product?.descriptionFit,
    product?.details?.fit
  );

  const code = firstNonEmptyString(
    product?.productCode,
    product?.sku,
    product?.code,
    product?.id ? String(product.id) : ""
  );

  const displayDescription = formatDisplayValue(description);
  const displayFit = formatDisplayValue(fit);
  const displayCode = code; // Don't capitalize product code

  return (
    <div className="w-full border-b border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-base font-semibold text-gray-900">Description & Fit</h3>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </button>

      {expanded && (
        <div className="pb-4 text-sm text-gray-700 space-y-3">
          {description && (
            <div>
              <span className="font-semibold">Product Description: </span>
              <span>{displayDescription}</span>
            </div>
          )}

          {fit && (
            <div>
              <span className="font-semibold">Fit: </span>
              <span>{displayFit}</span>
            </div>
          )}

          {code && (
            <div>
              <span className="font-semibold">Product Code: </span>
              <span>{displayCode}</span>
            </div>
          )}

          {!description && !fit && !code && <p>Details not available.</p>}
        </div>
      )}
    </div>
  );
};

export default ProductDescriptionSection;
