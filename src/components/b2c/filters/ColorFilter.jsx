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
              className="filter-checkbox-label"
              data-checked={selectedFilters.colors.includes(`${color.name}_${color.hex}`)}
            >
              <div className="filter-checkbox-content">
                <input
                  type="checkbox"
                  checked={selectedFilters.colors.includes(`${color.name}_${color.hex}`)}
                  onChange={() => updateFilter("colors", `${color.name}_${color.hex}`)}
                  className="border-gray-300 text-gray-900 focus:ring-gray-500 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-none"
                />
                <span className="filter-checkbox-box" />

                {/* Color swatch */}
                <div
                  className={`filter-color-swatch ${color.hex.toLowerCase() === "#ffffff" ? "filter-color-swatch--white" : ""}`}
                  style={{ backgroundColor: color.hex }}
                />

                <span className="filter-checkbox-name" style={{ textTransform: "capitalize" }}>
                  {color.name}
                </span>
              </div>

              <span className="filter-checkbox-count">
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