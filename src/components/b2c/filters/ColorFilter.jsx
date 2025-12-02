// src/components/b2c/filters/ColorFilter.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFilter } from "../../../context/FilterContext";

const ColorFilter = ({ title, colors, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { selectedFilters, updateFilter } = useFilter();

  return (
    <div className="pb-4">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Color List */}
      {isOpen && (
        <div className="space-y-2">
          {colors.map((color) => (
            <label
              key={color.name}
              className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedFilters.colors.includes(color.name)}
                  onChange={() => updateFilter("colors", color.name)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-500 w-4 h-4"
                />

                {/* Color circle */}
                <div
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{
                    backgroundColor: color.hex,
                    border:
                      color.hex.toLowerCase() === "#ffffff"
                        ? "1px solid #d1d5db"
                        : "1px solid transparent",
                  }}
                />

                <span className="text-sm text-gray-800 capitalize">{color.name}</span>
              </div>

              {/* Count (not percentage) */}
              <span className="text-sm text-gray-500">({color.count})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorFilter;
