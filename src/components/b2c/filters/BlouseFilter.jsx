// BlouseFilter.jsx
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

    // If we're NOT already on blouses page, redirect to blouses page with the filter
    if (!currentCategory?.includes("blouses")) {
      navigate(`/womenwear?category=blouses`);
      // Set the filter after a small delay to ensure navigation happens
      setTimeout(() => {
        updateFilter("blouses", blouseName);
      }, 100);
    } else {
      // If we're already on blouses page, just toggle the filter
      updateFilter("blouses", blouseName);
    }
  };

  if (!isRelevantCategory()) {
    return null;
  }

  return (
    <div className="pb-4 hide-scrollbar scrollbar-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <h3 className="font-medium text-gray-900 text-sm">BLOUSES</h3>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div>
          <div className="space-y-1 max-h-40 overflow-y-auto hide-scrollbar text-xs">
            {blouseTypes.map((blouse, i) => (
              <label
                key={i}
                className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked(blouse.name)}
                    onChange={() => handleBlouseClick(blouse.name)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-500 w-3 h-3"
                  />
                  <span className="text-black">{blouse.name}</span>
                </div>
                <span className="text-gray-500">({blouse.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlouseFilter;
