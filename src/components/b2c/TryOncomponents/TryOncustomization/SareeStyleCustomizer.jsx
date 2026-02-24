// src/components/b2c/TryOn/components/customization/SareeStyleCustomizer.jsx

import React from "react";
import { SAREE_STYLE_OPTIONS } from "../../../../utils/tryOnConstants";

/**
 * Saree Style Customizer Component
 * 2-column grid, all images same height (h-24), text centered.
 */
const SareeStyleCustomizer = ({ selectedStyle, onSelectStyle, tryOnResult }) => {
  return (
    <div className="w-full p-4 grid grid-cols-2 gap-4 bg-white">
      {SAREE_STYLE_OPTIONS.map((style) => (
        <div key={style.id} className="flex flex-col items-center gap-1">

          {/* Image — fixed height for all cards */}
          <div className="w-full h-24 overflow-hidden shadow-sm border border-gray-100">
            <img
              src={style.image}
              alt={style.name}
              className={`w-full h-full object-cover transition-opacity ${
                selectedStyle === style.id ? "opacity-80" : "opacity-100"
              }`}
            />
          </div>

          {/* Label button — full width, centered */}
          <button
            onClick={() => onSelectStyle && onSelectStyle(style.id)}
            disabled={!tryOnResult}
            className={`
              w-full py-1 text-xs font-medium text-center transition-all
              border border-gray-300
              flex items-center justify-center
              ${selectedStyle === style.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-800 hover:bg-gray-50"}
              ${!tryOnResult ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {style.name}
          </button>

        </div>
      ))}
    </div>
  );
};

export default SareeStyleCustomizer;
