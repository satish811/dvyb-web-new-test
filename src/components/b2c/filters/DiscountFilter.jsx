import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFilter } from "../../../context/FilterContext";

const DiscountFilter = ({ title, discounts = [], defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { selectedFilters, updateFilter } = useFilter();

  // Default discounts if none provided
  const discountRanges =
    discounts.length > 0
      ? discounts
      : [
        { range: "0% - 20%" },
        { range: "21% - 30%" },
        { range: "31% - 40%" },
      ];

  const isChecked = (range) => {
    return selectedFilters.discounts?.includes(range) || false;
  };

  return (
    <div className="pb-3 sm:pb-4">
      {/* Header with toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-1.5 sm:mb-2"
      >
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm">{title}</h3>
        {isOpen ? (
          <ChevronUp size={14} className="sm:size-4" />
        ) : (
          <ChevronDown size={14} className="sm:size-4" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="space-y-0.5">
          {discountRanges.map((discount, index) => (
            <label
              key={index}
              className="filter-checkbox-label"
              data-checked={isChecked(discount.range)}
            >
              <div className="filter-checkbox-content">
                <input
                  type="checkbox"
                  className="filter-checkbox-input"
                  checked={isChecked(discount.range)}
                  onChange={() => updateFilter("discounts", discount.range)}
                />
                <span className="filter-checkbox-box" />
                <span className="filter-checkbox-name">
                  {discount.range}
                </span>
              </div>
              {discount.count > 0 && (
                <span className="filter-checkbox-count">
                  ({discount.count})
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountFilter;