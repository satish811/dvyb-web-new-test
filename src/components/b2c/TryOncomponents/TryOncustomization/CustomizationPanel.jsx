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

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {/* <Palette className="w-5 h-5 text-gray-600" /> */}
          <h3 className="text-sm font-semibold text-gray-800">
            Choose Your Style
          </h3>
        </div>

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
      <ViewModeToggle viewMode={viewMode} handleViewModeSwitch={handleViewModeSwitch} />

      {/* ── RESET BUTTON ────────────────────────────────────────── */}
      <button
  onClick={handleReset}
  className="
    w-full
    min-h-12
    bg-white
    shadow-md
    rounded-full
    py-3
    px-6
    flex
    items-center
    justify-center
    gap-2
    border border-[#74136C]
    text-[#74136C]
    hover:bg-[#74136C]
    hover:text-white
    active:scale-[0.97]
    transition-all
  "
>
  <img
    src={resetButtonImg}
    alt="Reset"
    className="w-[18px] h-[18px] object-contain shrink-0"
  />

  <span className="text-[16px] font-semibold whitespace-nowrap">
    2D Re-Try
  </span>
</button>

    </div>
  );
};

export default CustomizationPanel;