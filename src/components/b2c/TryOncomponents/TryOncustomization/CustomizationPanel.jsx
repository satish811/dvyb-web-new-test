// src/components/b2c/TryOn/components/customization/CustomizationPanel.jsx

import React from "react";
import ColorTab from "./ColorTab";
import FabricTab from "./FabricTab";
import BlouseNeckCustomizer from "../TryOncustomization/BlouseNeckCustomizer";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

// ─── SHARED TOKEN ────────────────────────────────────────────────────────────
// Change ONE value here to resize both left-side boxes together
const W = "w-[320px]";
const LEFT = "left-6 xl:left-24 2xl:left-52";
// ─────────────────────────────────────────────────────────────────────────────

const CustomizationPanel = ({
  selectedTab,
  setSelectedTab,
  selectedColor,
  setSelectedColor,
  selectedFabric,
  setSelectedFabric,
  colors,
  fabricTypes,
  viewMode,
  handleViewModeSwitch,
  outfitType,
  tryOnResult,
  pendingBlouse,
  setPendingBlouse,
  pendingNeck,
  setPendingNeck,
  isApplying,
  applyChanges,
}) => {
  const isSaree = outfitType?.toLowerCase() === 'saree';
  return (
    /* Single column — both boxes share the same anchor & width */
    <div
      className={`
        absolute top-20 ${LEFT}
        z-20 hidden lg:flex flex-col items-stretch gap-3
        ${W}
        max-h-[calc(100vh-90px)] overflow-y-auto
      `}
    >

      {/* ── BOX 1 · Blouse + Neck combined (saree only) ─────────────────────── */}
      {isSaree && (
        <div className="w-full bg-white shadow-lg">
          <BlouseNeckCustomizer
            pendingBlouse={pendingBlouse}
            setPendingBlouse={setPendingBlouse}
            pendingNeck={pendingNeck}
            setPendingNeck={setPendingNeck}
            isApplying={isApplying}
            applyChanges={applyChanges}
            tryOnResult={tryOnResult}
          />
        </div>
      )}

      {/* ── BOX 2 · Colour / View Mode ────────────────────────────────── */}
      <div className="w-full bg-white shadow-lg p-5">

        {selectedTab === "colours" && (
          <ColorTab
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            colors={colors}
            viewMode={viewMode}
          />
        )}
        {selectedTab === "fabrics" && (
          <FabricTab
            selectedFabric={selectedFabric}
            setSelectedFabric={setSelectedFabric}
            fabricTypes={fabricTypes}
            viewMode={viewMode}
          />
        )}

        {/* 360 Toggle */}
        <ViewModeToggle viewMode={viewMode} handleViewModeSwitch={handleViewModeSwitch} />
      </div>

    </div>
  );
};

export default CustomizationPanel;