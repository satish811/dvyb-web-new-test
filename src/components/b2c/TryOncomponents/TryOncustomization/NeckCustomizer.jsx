// src/components/b2c/TryOn/components/customization/NeckCustomizer.jsx

import React from "react";
import LazyImageLoader from "../../LazyImageLoader/LazyImageLoader";
import { NECK_OPTIONS } from "../../../../utils/tryOnConstants";

/**
 * Neck Style Customizer Component
 * 2-column grid, all images same height (h-24), text centered.
 */
const NeckCustomizer = ({
  selectedNeck,
  isChangingNeck,
  changeNeck,
  tryOnResult,
}) => {
  return (
    <div className="w-full p-4 grid grid-cols-2 gap-3 bg-white">
      {NECK_OPTIONS.map((neck) => (
        <div key={neck.id} className="flex flex-col items-center gap-1">

          {/* Image — fixed height for all cards */}
          <div className="w-full h-24 overflow-hidden relative shadow-sm border border-gray-100">
            <img
              src={neck.image}
              alt={neck.label}
              className={`w-full h-full object-cover transition-opacity ${
                isChangingNeck && selectedNeck === neck.id
                  ? "opacity-30"
                  : "opacity-100"
              }`}
            />
            {isChangingNeck && selectedNeck === neck.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <LazyImageLoader isProcessing={true} size="overlay" />
              </div>
            )}
          </div>

          {/* Label button — full width, centered text */}
          <button
            onClick={() => changeNeck(neck.id)}
            disabled={!tryOnResult || isChangingNeck}
            className={`
              w-full py-1.5 text-xs font-medium text-center transition-all
              border border-gray-300
              flex items-center justify-center gap-1
              ${selectedNeck === neck.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-800 hover:bg-gray-50"}
              ${!tryOnResult || isChangingNeck
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"}
            `}
          >
            {isChangingNeck && selectedNeck === neck.id && (
              <LazyImageLoader isProcessing={true} size="button" />
            )}
            <span>{neck.label}</span>
          </button>

        </div>
      ))}
    </div>
  );
};

export default NeckCustomizer;