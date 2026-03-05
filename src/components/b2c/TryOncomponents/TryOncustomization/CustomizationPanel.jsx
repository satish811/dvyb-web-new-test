// src/components/b2c/TryOn/components/customization/CustomizationPanel.jsx

import React from "react";
import ColorTab from "./ColorTab";
import FabricTab from "./FabricTab";
import BlouseNeckCustomizer from "../TryOncustomization/BlouseNeckCustomizer";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import { UI_TEXT } from "../../../../utils/tryOnConstants";
import { Palette, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import resetButtonImg from "../../../../assets/b2c/landing/Landing-villy/resetbutton.png";

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
  handleReset,
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

      {/* ── RESET BUTTON ────────────────────────────────────────── */}
      <button
        onClick={handleReset}
        className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full py-3.5 px-6 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98]"
      >
        <span className="text-[17px] font-medium text-black tracking-wide">
          Reset
        </span>
        <img
          src={resetButtonImg}
          alt="Reset"
          className="w-[22px] h-[22px] object-contain"
        />
      </button>

    </div>
  );
};

export default CustomizationPanel;