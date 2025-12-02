import React, { useState } from "react";

const ProductDescriptionSection = ({ product }) => {
  const { description, id } = product || {};
  const code = id;
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  // Limit description to ~3 lines when collapsed
  const truncatedDescription =
    description && description.length > 160 ? description.substring(0, 160) + "..." : description;
  description && description.length > 160 ? description.substring(0, 160) + "..." : description;

  return (
    <div className="w-full border-t border-gray-200 pt-5 mt-6 pb-3">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        {/* LEFT: Product Description */}
        <div className="md:w-2/3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Product Description
          </h3>

          <p className="text-sm text-gray-700 leading-relaxed">
            {expanded ? description : truncatedDescription}
          </p>

          {description && description.length > 160 && (
            <button
              onClick={toggleExpand}
              className="text-xs font-medium text-yellow-600 mt-1 hover:text-yellow-700 transition"
            >
              {expanded ? "See Less" : "See More"}
            </button>
          )}
        </div>

        {/* RIGHT: Product Code & Supplier Info */}
        <div className="md:w-1/3 flex flex-col items-start md:items-end">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">
            Product Code
          </h3>
          <p className="text-sm text-gray-700 mb-1">{code || "AKAR102524"}</p>

          {/* <button className="text-xs font-medium text-yellow-600 hover:text-yellow-700 transition">
            View Supplier Information
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ProductDescriptionSection;
