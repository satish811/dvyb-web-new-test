import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFilter } from "../../../context/FilterContext";
import { useLocation, useNavigate } from "react-router-dom";

const BlouseFilter = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { selectedFilters, updateFilter } = useFilter();
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentCategory = () => {
    const params = new URLSearchParams(location.search);
    return params.get("category");
  };

  const isRelevantCategory = () => {
    const currentCategory = getCurrentCategory();
    return (
      currentCategory?.includes("saree") ||
      currentCategory?.includes("lehenga") ||
      currentCategory?.includes("wedding") ||
      currentCategory?.includes("blouses")
    );
  };

  const blouseTypes = [
    { name: "Embroidered Blouse", count: 12 },
    { name: "Printed Blouse", count: 8 },
    { name: "Sequinned Blouse", count: 15 },
    { name: "Mirror Work Blouse", count: 6 },
    { name: "Zardosi Blouse", count: 9 },
    { name: "Cape Blouse", count: 11 },
    { name: "Ruffle Blouse", count: 14 },
    { name: "Halter Neck Blouse", count: 7 },
    { name: "High Neck Blouse", count: 18 },
    { name: "Padded Blouse", count: 10 },
    { name: "Backless Blouse", count: 13 },
    { name: "Peplum Blouse", count: 5 },
    { name: "Crop Blouse", count: 16 },
  ];

  const isChecked = (blouseName) => {
    return selectedFilters.blouses?.includes(blouseName) || false;
  };

  const handleBlouseClick = (blouseName) => {
    const currentCategory = getCurrentCategory();

    if (!currentCategory?.includes("blouses")) {
      navigate(`/womenwear?category=blouses`);
    }
    updateFilter("blouses", blouseName);
  };

  if (!isRelevantCategory()) {
    return null;
  }

  return (
    <div className="pb-3 sm:pb-4 hide-scrollbar scrollbar-none">
      {/* Header with toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-1.5 sm:mb-2"
      >
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm">BLOUSES</h3>
        {isOpen ? (
          <ChevronUp size={14} className="sm:size-4" />
        ) : (
          <ChevronDown size={14} className="sm:size-4" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div>
          <div className="space-y-0.5 sm:space-y-1 max-h-32 sm:max-h-40 overflow-y-auto hide-scrollbar text-[10px] sm:text-xs">
            {blouseTypes.map((blouse, i) => (
              <label
                key={i}
                className="filter-checkbox-label"
                data-checked={isChecked(blouse.name)}
              >
                <div className="filter-checkbox-content">
                  <input
                    type="checkbox"
                    className="filter-checkbox-input"
                    checked={isChecked(blouse.name)}
                    onChange={() => handleBlouseClick(blouse.name)}
                  />
                  <span className="filter-checkbox-box" />
                  <span className="filter-checkbox-name">{blouse.name}</span>
                </div>
                <span className="filter-checkbox-count">
                  ({blouse.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlouseFilter;