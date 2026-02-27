// src/components/b2c/TryOn/components/customization/CustomizationPanel.jsx

import React from "react";
import ColorTab from "./ColorTab";
import FabricTab from "./FabricTab";
import BlouseNeckCustomizer from "../TryOncustomization/BlouseNeckCustomizer";
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
  const navigate = useNavigate();

  return (
    <div
      className={`
        absolute top-[48px] ${LEFT}
        z-20 hidden lg:flex flex-col items-stretch gap-[24px]
        ${W}
        max-h-[calc(100vh-48px)] overflow-y-auto hide-scrollbar
      `}
    >
      {/* ── HEADER: BACK BUTTON ────────────────────────────── */}
      <button
        onClick={() => {
          navigate(-1)
        }}
        className="flex items-center gap-2 text-[#33022F] hover:opacity-80 transition-opacity w-fit"
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 400,
          fontSize: '14.77px',
          lineHeight: '100%',
        }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span>Back to Products</span>
      </button>

      {/* ── CARD 1 · Main Customization ─────────────────────── */}
      <div className="flex flex-col w-full bg-[#FFFFFFCC] shadow-[0_4px_44px_0_rgba(0,0,0,0.08)] rounded-[24px] p-[14.77px]">

        {/* Header */}
        <div className="flex items-center gap-2 mb-[14.77px] text-gray-900">
          <Palette className="w-5 h-5" strokeWidth={2} />
          <h2 className="text-[15px] font-bold">Customize Outfit</h2>
        </div>
        <p
          className="mb-[14.77px] text-[#000000] opacity-70 w-[241px] h-[38px] text-[14.77px] font-normal leading-none"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Select a sleeve and neck , then apply to generate your look
        </p>


        {/* Existing Selectors */}
        {selectedTab === "colours" && (
          <div className="mb-4">
            <ColorTab
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              colors={colors}
              viewMode={viewMode}
            />
          </div>
        )}
        {selectedTab === "fabrics" && (
          <div className="mb-4">
            <FabricTab
              selectedFabric={selectedFabric}
              setSelectedFabric={setSelectedFabric}
              fabricTypes={fabricTypes}
              viewMode={viewMode}
            />
          </div>
        )}



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

      {/* ── CARD 2 · View Mode Toggle ────────────────────────────────── */}
      <div className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] px-5 py-3.5 mb-10">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-900">
            View virtual video
          </span>
          <button
            onClick={() => handleViewModeSwitch(viewMode === "2D" ? "3D" : "2D")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${viewMode === "3D" ? "bg-[#3B074B]" : "bg-gray-200"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewMode === "3D" ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>
      </div>

    </div>
  );
};

export default CustomizationPanel;