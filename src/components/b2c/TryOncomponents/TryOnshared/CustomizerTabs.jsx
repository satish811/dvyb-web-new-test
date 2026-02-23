// src/components/b2c/TryOn/components/shared/CustomizerTabs.jsx

import React from "react";

/**
 * Customizer Tabs Component (Blouse/Neck/Saree Style Switch)
 */
const CustomizerTabs = ({ activeCustomizer, setActiveCustomizer }) => {
  return (
<div className="flex w-full border-b border-gray-200 overflow-hidden">

      <button
        onClick={() => setActiveCustomizer("blouse")}
        className={`flex-1 py-1.5 text-xs font-medium ${
          activeCustomizer === "blouse"
            ? "bg-primary text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Blouse
      </button>

      <button
        onClick={() => setActiveCustomizer("neck")}
        className={`flex-1 py-1.5 px-1 text-xs font-medium border-l border-gray-200 ${
          activeCustomizer === "neck"
            ? "bg-primary text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Neck
      </button>

      <button
        onClick={() => setActiveCustomizer("saree-style")}
        className={`flex-1 py-1.5 px-1 text-xs font-medium border-l border-gray-200 whitespace-nowrap ${
          activeCustomizer === "saree-style"
            ? "bg-primary text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Saree Style
      </button>
    </div>
  );
};

export default CustomizerTabs;