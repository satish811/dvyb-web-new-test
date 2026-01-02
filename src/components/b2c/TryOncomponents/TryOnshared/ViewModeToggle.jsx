// src/components/b2c/TryOn/components/shared/ViewModeToggle.jsx

import React from "react";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * View Mode Toggle Component (2D/3D Switch)
 */
const ViewModeToggle = ({ viewMode, handleViewModeSwitch }) => {
  return (
    <div className="pt-5 mt-4 border-t  border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {UI_TEXT.VIEW_IN_360}
        </span>
        <button
          onClick={() => handleViewModeSwitch(viewMode === "2D" ? "3D" : "2D")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            viewMode === "3D" ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              viewMode === "3D" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;