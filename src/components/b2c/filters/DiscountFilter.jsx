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
    <div className="pb-4">
      {/* Header with toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="space-y-2 text-xs">
          {discountRanges.map((discount, index) => (
            <label
              key={index}
              className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-500 w-3 h-3"
                />
                <span className="text-gray-800">{discount.range}</span>
              </div>
              <span className="text-gray-500">({discount.count})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountFilter;
