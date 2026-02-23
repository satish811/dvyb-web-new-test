// src/components/b2c/TryOn/components/customization/BlouseCustomizer.jsx

import React from "react";
import LazyImageLoader from "../../LazyImageLoader/LazyImageLoader";
import { BLOUSE_SLEEVE_OPTIONS } from "../../../../utils/tryOnConstants";

/**
 * Blouse Sleeve Customizer Component
 * 3-column grid, all images same height (h-20), text centered.
 */
const BlouseCustomizer = ({
  selectedBlouse,
  isChangingBlouse,
  changeBlouse,
  tryOnResult,
}) => {
  return (
    <div className="w-full p-3 grid grid-cols-3 gap-x-3 gap-y-9 bg-white">
      {BLOUSE_SLEEVE_OPTIONS.map((blouse) => (
        <div key={blouse.id} className="flex flex-col items-center gap-1.5">

          {/* Image — fixed height for all cards */}
          <div className="w-full h-[140px] overflow-hidden relative shadow-sm border border-gray-100">
            <img
              src={blouse.image}
              alt={blouse.name}
              className={`w-full h-full object-cover transition-opacity ${
                isChangingBlouse && selectedBlouse === blouse.id
                  ? "opacity-30"
                  : "opacity-100"
              }`}
            />
            {isChangingBlouse && selectedBlouse === blouse.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <LazyImageLoader isProcessing={true} size="overlay" />
              </div>
            )}
          </div>

          {/* Label button — full width, centered text */}
          <button
            onClick={() => changeBlouse(blouse.id)}
            disabled={!tryOnResult || isChangingBlouse}
            className={`
              w-full py-2 text-[13px] font-medium text-center transition-all
              border border-gray-300
              flex items-center justify-center gap-1
              ${selectedBlouse === blouse.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-800 hover:bg-gray-50"}
              ${!tryOnResult || isChangingBlouse
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"}
            `}
          >
            {isChangingBlouse && selectedBlouse === blouse.id && (
              <LazyImageLoader isProcessing={true} size="button" />
            )}
            <span>{blouse.name}</span>
          </button>

        </div>
      ))}
    </div>
  );
};

export default BlouseCustomizer;