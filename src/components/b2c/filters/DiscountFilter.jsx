import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const DiscountFilter = ({ title, discounts = [], defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Default discounts if none provided
  const discountRanges =
    discounts.length > 0
      ? discounts
      : [
        { range: "0% - 20%", count: 4641 },
        { range: "21% - 30%", count: 654 },
        { range: "31% - 40%", count: 11 },
      ];

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
        <div className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
          {discountRanges.map((discount, index) => (
            <label
              key={index}
              className="flex items-center justify-between cursor-pointer p-0.5 sm:p-1 rounded hover:bg-gray-50"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Sharper checkbox */}
                <input
                  type="checkbox"
                  className="border-gray-300 text-gray-900 focus:ring-gray-500 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-none"
                />
                <span className="text-gray-800 text-[10px] sm:text-xs">
                  {discount.range}
                </span>
              </div>
              <span className="text-gray-500 text-[10px] sm:text-xs">
                ({discount.count})
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountFilter;