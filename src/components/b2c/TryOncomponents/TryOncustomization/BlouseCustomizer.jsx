// src/components/b2c/TryOn/components/customization/BlouseCustomizer.jsx

import React from "react";
import LazyImageLoader from "../../LazyImageLoader/LazyImageLoader";
import { BLOUSE_SLEEVE_OPTIONS } from "../../../../utils/tryOnConstants";

/**
 * Blouse Sleeve Customizer Component
 */
const BlouseCustomizer = ({
  selectedBlouse,
  isChangingBlouse,
  changeBlouse,
  tryOnResult,
}) => {
  return (
<div className="
  bg-white
  shadow-sm
  border border-gray-200
  p-4
  w-full max-w-[300px]
  grid grid-cols-2 gap-4
  max-h-[calc(100vh-120px)]
">

      {BLOUSE_SLEEVE_OPTIONS.map((blouse) => (
        <div key={blouse.id} className="flex flex-col items-center">
          <div className="w-28 h-28 mb-2 shadow-sm overflow-hidden relative">
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
          <button
            onClick={() => changeBlouse(blouse.id)}
            disabled={!tryOnResult || isChangingBlouse}
            className={`
              w-full py-2 px-3 text-sm font-medium transition-all
              border border-gray-300
              ${
                selectedBlouse === blouse.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }
              ${
                !tryOnResult || isChangingBlouse
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
              flex items-center justify-center gap-2
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