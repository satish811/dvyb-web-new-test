import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const ProductDescriptionSection = ({ product }) => {
  const { description, id } = product || {};
  const code = id;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full border-b border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-base font-semibold text-gray-900">Description & fit</h3>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </button>

      {expanded && (
        <div className="pb-4 text-sm text-gray-700 space-y-3">
          {/* Description */}
          {description && (
            <div>
              <p className="leading-relaxed">{description}</p>
            </div>
          )}

          {/* Product Code */}
          <div>
            <span className="font-semibold">Product Code: </span>
            <span>{code || "AKAR102524"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDescriptionSection;
