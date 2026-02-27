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
      <p className="text-[14px] font-medium text-[#4b5563] mb-2.5">
        Colour:{selectedColor && (
          <span className="uppercase text-gray-900 ml-1.5 font-bold tracking-wide">{selectedColor}</span>
        )}
      </p>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => viewMode === "2D" && setSelectedColor(color.name)}
            disabled={viewMode === "3D"}
            className={`w-[28px] h-[28px] rounded-sm transition-all outline-none ${selectedColor === color.name
              ? "ring-2 ring-gray-400 ring-offset-2 scale-[1.05]"
              : "border border-gray-200"
              } ${viewMode === "3D" ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.05]"}`}
            style={{ backgroundColor: color.color }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorTab;