// src/components/b2c/TryOn/components/customization/ColorTab.jsx

import React from "react";

/**
 * Color Selection Tab Component
 * Displays color swatches for try-on customization
 */
const ColorTab = ({ selectedColor, setSelectedColor, colors, viewMode }) => {
  if (!colors || colors.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-gray-400 italic">No colour variants available for this product.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-3">
        Colour:{selectedColor && (
          <span className="uppercase text-gray-900 ml-1">{selectedColor}</span>
        )}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => viewMode === "2D" && setSelectedColor(color.name)}
            disabled={viewMode === "3D"}
            className={`aspect-square rounded-lg transition-all ${
              selectedColor === color.name
                ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
                : "hover:scale-105 border border-gray-200"
            } ${viewMode === "3D" ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ backgroundColor: color.color }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorTab;