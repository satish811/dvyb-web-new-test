// src/components/b2c/TryOn/components/shared/ViewModeToggle.jsx

import React from "react";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * View Mode Toggle Component (2D/3D Switch)
 */
const ViewModeToggle = ({ viewMode, handleViewModeSwitch }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-gray-900">
          View virtual video
        </span>
        <button
          onClick={() => handleViewModeSwitch(viewMode === "2D" ? "3D" : "2D")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none ${viewMode === "3D" ? "bg-[#4a044e]" : "bg-gray-200"
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewMode === "3D" ? "translate-x-6" : "translate-x-1"
              }`}
          />
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;