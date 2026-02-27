// src/components/b2c/TryOn/components/customization/CustomizationPanel.jsx

import React from "react";
import ColorTab from "./ColorTab";
import FabricTab from "./FabricTab";
import BlouseNeckCustomizer from "../TryOncustomization/BlouseNeckCustomizer";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import { UI_TEXT } from "../../../../utils/tryOnConstants";
import { Palette, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── SHARED TOKEN ────────────────────────────────────────────────────────────
// Change ONE value here to resize both left-side boxes together
const W = "w-[308px]";
const LEFT = "left-[56px]";
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
    <div
      className={`
        absolute top-20 ${LEFT}
        z-20 hidden lg:flex flex-col items-center gap-4
        ${W}
        max-h-[calc(100vh-90px)] overflow-y-auto
        scrollbar-none
      `}
    >
      {/* ── MAIN CUSTOMIZATION CARD ─────────────────────────────────── */}
      <div className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[24px] overflow-hidden p-5 pb-6">

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-2 text-gray-900">
          <Palette className="w-[18px] h-[18px]" strokeWidth={2.5} />
          <h2 className="text-[15px] font-bold">Customize Outfit</h2>
        </div>
        <p className="text-[13px] text-gray-600 mb-4 leading-snug pr-2">
          Select a sleeve and neck , then apply to generate your look
        </p>

        {/* ── COLOUR SECTION ────────────────────────────────────────── */}
        {colors && colors.length > 0 && selectedTab === "colours" && (
          <div className="mb-5">
            <ColorTab
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              colors={colors}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* ── FABRIC SECTION ────────────────────────────────────────── */}
        {fabricTypes && fabricTypes.length > 0 && selectedTab === "fabrics" && (
          <div className="mb-5">
            <FabricTab
              selectedFabric={selectedFabric}
              setSelectedFabric={setSelectedFabric}
              fabricTypes={fabricTypes}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* ── BLOUSE & NECK CUSTOMIZER ──────────────────────────────── */}
        {isSaree && (
          <BlouseNeckCustomizer
            pendingBlouse={pendingBlouse}
            setPendingBlouse={setPendingBlouse}
            pendingNeck={pendingNeck}
            setPendingNeck={setPendingNeck}
            isApplying={isApplying}
            applyChanges={applyChanges}
            tryOnResult={tryOnResult}
          />
        )}
      </div>

      {/* ── 360 VIEW TOGGLE CARD ────────────────────────────────── */}
      <div className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[24px] p-4 px-5 flex items-center justify-between">
        <ViewModeToggle viewMode={viewMode} handleViewModeSwitch={handleViewModeSwitch} />
      </div>

    </div>
  );
};

export default CustomizationPanel;