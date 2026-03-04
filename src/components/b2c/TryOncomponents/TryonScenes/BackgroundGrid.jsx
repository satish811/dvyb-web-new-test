// src/components/b2c/TryOn/components/scenes/BackgroundGrid.jsx

import React from "react";
import { BACKGROUND_OPTIONS } from "../../../../utils/tryOnConstants";

/**
 * Background Selection Grid Component
 */
const BackgroundGrid = ({
  selectedBackground,
  changeBackground,
  isChangingBackground,
  tryOnResult,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {BACKGROUND_OPTIONS.map((bg) => (
        <div key={bg.id}>
          <button
            onClick={() => changeBackground(bg.id)}
            disabled={!tryOnResult || isChangingBackground}
            className={`relative cursor-pointer p-1 overflow-hidden transition-all ${selectedBackground === bg.id
              ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
              : "hover:scale-105 border border-gray-200"
              } ${!tryOnResult || isChangingBackground
                ? "opacity-50 cursor-not-allowed"
                : ""
              }`}
          >
            <div className="aspect-square">
              <img
                src={bg.image}
                alt={bg.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {isChangingBackground && selectedBackground === bg.id && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </button>

        </div>
      ))}

    </div>
  );
};

export default BackgroundGrid;