// src/components/b2c/TryOn/components/shared/ViewModeToggle.jsx

import React from "react";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * View Mode Toggle Component (2D/3D Switch)
 */
const ViewModeToggle = ({ viewMode, handleViewModeSwitch }) => {
  return (
    <button
      onClick={() => handleViewModeSwitch(viewMode === "2D" ? "3D" : "2D")}
      className="w-full min-h-12 bg-[#74136C] shadow-md rounded-full py-3 px-6 text-[16px] font-semibold text-white hover:bg-[#5a0f54] active:scale-[0.97] transition-all border border-[#74136C]"
      type="button"
    >
      {viewMode === "3D" ? "View 2D Image" : "View 3D Video"}
    </button>
  );
};

export default ViewModeToggle;