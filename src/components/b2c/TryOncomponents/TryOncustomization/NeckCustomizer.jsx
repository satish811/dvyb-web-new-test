// src/components/b2c/TryOn/components/customization/NeckCustomizer.jsx

import React from "react";
import LazyImageLoader from "../../LazyImageLoader/LazyImageLoader";
import { NECK_OPTIONS } from "../../../../utils/tryOnConstants";

/**
 * Neck Style Customizer Component
 */
const NeckCustomizer = ({
  selectedNeck,
  isChangingNeck,
  changeNeck,
  tryOnResult,
}) => {
  return (
<div className="
  bg-white
  p-4
  w-full
  grid grid-cols-2 gap-3
">

      {NECK_OPTIONS.map((neck) => (
        <div key={neck.id} className="flex flex-col items-center">
          <div className="w-full h-24 mb-2 shadow-sm overflow-hidden relative">
            <img
              src={neck.image}
              className={`w-full h-full object-cover transition-opacity ${
                isChangingNeck && selectedNeck === neck.id
                  ? "opacity-30"
                  : "opacity-100"
              }`}
              alt={neck.label}
            />
            {isChangingNeck && selectedNeck === neck.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <LazyImageLoader isProcessing={true} size="overlay" />
              </div>
            )}
          </div>
          <button
            onClick={() => changeNeck(neck.id)}
            disabled={!tryOnResult || isChangingNeck}
            className={`
              w-full p-1.5 text-xs font-medium transition-all
              border border-gray-300
              ${
                selectedNeck === neck.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }
              ${
                !tryOnResult || isChangingNeck
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
              flex items-center justify-center gap-2
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