// src/components/b2c/filters/PriceRange.jsx
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFilter } from "../../../context/FilterContext";

const PriceRange = ({ min: initialMin, max: initialMax, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [localMin, setLocalMin] = useState(initialMin || 0);
  const [localMax, setLocalMax] = useState(initialMax || 100000);
  const { updateFilter } = useFilter();

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  // Debounced update to global filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilter("priceMin", localMin);
      updateFilter("priceMax", localMax);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localMin, localMax, updateFilter]);

  const handleRangeChange = (value) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setLocalMax(numValue);
    }
  };

  // Helper to check active button
  const isSelected = (minValue, maxValue) => {
    return localMin === minValue && localMax === maxValue;
  };

  return (
    <div className="pb-3 sm:pb-4">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-1.5 sm:mb-2"
      >
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm">PRICE</h3>
        {isOpen ? (
          <ChevronUp size={14} className="sm:size-4" />
        ) : (
          <ChevronDown size={14} className="sm:size-4" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs">
          {/* Display selected price */}
          <div className="text-center text-gray-700 font-medium py-0.5 sm:py-1 text-[11px] sm:text-sm">
            ₹{formatPrice(localMin)} - ₹{formatPrice(localMax)}
          </div>


          {/* Quick Price Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
            {/* Under 1k */}
            <button
              onClick={() => {
                setLocalMin(0);
                setLocalMax(1000);
              }}
              className={`
                px-1.5 py-1 sm:px-2 sm:py-1.5 text-[10px] sm:text-xs border rounded-none transition-colors
                ${isSelected(0, 1000)
                  ? "text-primary border-primary bg-red-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              Under ₹1k
            </button>

            {/* 1k - 5k */}
            <button
              onClick={() => {
                setLocalMin(1000);
                setLocalMax(5000);
              }}
              className={`
                px-1.5 py-1 sm:px-2 sm:py-1.5 text-[10px] sm:text-xs border rounded-none transition-colors
                ${isSelected(1000, 5000)
                  ? "text-primary border-primary bg-red-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              ₹1k - ₹5k
            </button>

            {/* 5k - 10k */}
            <button
              onClick={() => {
                setLocalMin(5000);
                setLocalMax(10000);
              }}
              className={`
                px-1.5 py-1 sm:px-2 sm:py-1.5 text-[10px] sm:text-xs border rounded-none transition-colors
                ${isSelected(5000, 10000)
                  ? "text-primary border-primary bg-red-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              ₹5k - ₹10k
            </button>

            {/* 10k+ */}
            <button
              onClick={() => {
                setLocalMin(10000);
                setLocalMax(50000);
              }}
              className={`
                px-1.5 py-1 sm:px-2 sm:py-1.5 text-[10px] sm:text-xs border rounded-none transition-colors
                ${isSelected(10000, 50000)
                  ? "text-primary border-primary bg-red-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              ₹10k+
            </button>
          </div>

          {/* Slider */}
          <div className="px-0.5 sm:px-1">
            <input
              type="range"
              min={initialMin || 0}
              max={initialMax || 100000}
              value={localMax}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="w-full h-0.5 sm:h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:h-2.5
                [&::-webkit-slider-thumb]:w-2.5
                sm:[&::-webkit-slider-thumb]:h-3
                sm:[&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gray-900
                [&::-webkit-slider-thumb]:border
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-sm"
            />
          </div>

        </div>
      )}
    </div>
  );
};

export default PriceRange;