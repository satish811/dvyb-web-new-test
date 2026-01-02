// src/components/b2c/TryOn/components/customization/FabricTab.jsx

import React from "react";

/**
 * Fabric Selection Tab Component
 * Displays fabric options for try-on customization
 */
const FabricTab = ({
  selectedFabric,
  setSelectedFabric,
  fabrics,
  viewMode,
}) => {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-3">
        Fabric:{" "}
        <span className="uppercase text-gray-900">
          {selectedFabric?.replace("-", " ")}
        </span>
      </p>

      <div className="space-y-2">
        {fabrics.map((fabric) => (
          <button
            key={fabric.id}
            onClick={() =>
              viewMode === "2D" && setSelectedFabric(fabric.id)
            }
            disabled={viewMode === "3D"}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              selectedFabric === fabric.id
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
            } ${viewMode === "3D" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="font-medium text-sm mb-1">
              {fabric.name}
            </div>
            <div
              className={`text-xs ${
                selectedFabric === fabric.id
                  ? "text-gray-300"
                  : "text-gray-500"
              }`}
            >
              {fabric.category} • {fabric.style}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FabricTab;
