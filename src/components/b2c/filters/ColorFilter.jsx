import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFilter } from "../../../context/FilterContext";

const ColorFilter = ({ title, colors, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { selectedFilters, updateFilter } = useFilter();

  return (
    <div className="pb-3 sm:pb-4">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-2 sm:mb-3"
      >
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm">{title}</h3>
        {isOpen ? (
          <ChevronUp size={14} className="sm:size-4" />
        ) : (
          <ChevronDown size={14} className="sm:size-4" />
        )}
      </button>

      {/* Color List */}
      {isOpen && (
        <div className="space-y-1.5 sm:space-y-2">
          {colors.map((color) => (
            <label
              key={color.name}
              className="flex items-center justify-between cursor-pointer p-0.5 sm:p-1 rounded hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Sharper checkbox */}
                <input
                  type="checkbox"
                  checked={selectedFilters.colors.includes(color.name)}
                  onChange={() => updateFilter("colors", color.name)}
                  className="border-gray-300 text-gray-900 focus:ring-gray-500 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-none"
                />

                {/* Color circle */}
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-200"
                  style={{
                    backgroundColor: color.hex,
                    border:
                      color.hex.toLowerCase() === "#ffffff"
                        ? "1px solid #d1d5db"
                        : "1px solid transparent",
                  }}
                />

                <span className="text-[10px] sm:text-sm text-gray-800 capitalize">
                  {color.name}
                </span>
              </div>

              {/* Count (not percentage) */}
              <span className="text-[10px] sm:text-sm text-gray-500">
                ({color.count})
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorFilter;