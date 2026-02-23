// src/components/b2c/TryOn/components/customization/SareeStyleCustomizer.jsx

import React from "react";
import { SAREE_STYLE_OPTIONS } from "../../../../utils/tryOnConstants";

/**
 * Saree Style Customizer Component
 * Displays mock saree draping style options
 */
const SareeStyleCustomizer = ({ selectedStyle, onSelectStyle, tryOnResult }) => {
  return (
    <div className="
      bg-white
      p-4
      w-full
      grid grid-cols-2 gap-4
    ">
      {SAREE_STYLE_OPTIONS.map((style) => (
        <div key={style.id} className="flex flex-col items-center">
          <div className="w-full h-28 md:h-20 mb-2 shadow-sm overflow-hidden relative rounded-sm">
            <img
              src={style.image}
              alt={style.name}
              className={`w-full h-full object-cover transition-opacity ${
                selectedStyle === style.id ? "opacity-80" : "opacity-100"
              }`}
            />
          </div>
          <button
            onClick={() => onSelectStyle && onSelectStyle(style.id)}
            disabled={!tryOnResult}
            className={`
              w-full py-1 px-2 text-xs font-medium transition-all
              border border-gray-300
              ${
                selectedStyle === style.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }
              ${!tryOnResult ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              flex items-center justify-center
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
