// src/components/b2c/TryOn/components/shared/CustomizerTabs.jsx

import React from "react";

/**
 * Customizer Tabs Component (Blouse/Neck Switch)
 */
const CustomizerTabs = ({ activeCustomizer, setActiveCustomizer }) => {
  return (
<div className="flex mb-2 w-full max-w-[300px] border border-gray-200 overflow-hidden">

      <button
        onClick={() => setActiveCustomizer("blouse")}
        className={`flex-1  text-sm font-medium ${
          activeCustomizer === "blouse"
            ? "bg-primary text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Blouse
      </button>

      <button
        onClick={() => setActiveCustomizer("neck")}
        className={`flex-1 p-1 text-sm font-medium ${
          activeCustomizer === "neck"
            ? "bg-primary text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Neck
      </button>
    </div>
  );
};

export default CustomizerTabs;