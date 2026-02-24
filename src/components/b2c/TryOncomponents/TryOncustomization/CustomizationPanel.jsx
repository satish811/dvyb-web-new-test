// src/components/b2c/TryOn/components/customization/CustomizationPanel.jsx

import React from "react";
import ColorTab from "./ColorTab";
import FabricTab from "./FabricTab";
import BlouseCustomizer from "../TryOncustomization/BlouseCustomizer";
import NeckCustomizer from "../TryOncustomization/NeckCustomizer";
import SareeStyleCustomizer from "../TryOncustomization/SareeStyleCustomizer";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import CustomizerTabs from "../TryOnshared/CustomizerTabs";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

// ─── SHARED TOKEN ────────────────────────────────────────────────────────────
// Change ONE value here to resize both left-side boxes together
const W = "w-[320px]";
const LEFT = "left-6 xl:left-24 2xl:left-52";
// ─────────────────────────────────────────────────────────────────────────────

const CustomizationPanel = ({
  selectedTab,
  setSelectedTab,
  activeCustomizer,
  setActiveCustomizer,
  selectedColor,
  setSelectedColor,
  selectedFabric,
  setSelectedFabric,
  colors,
  fabricTypes,
  viewMode,
  handleViewModeSwitch,
  selectedBlouse,
  isChangingBlouse,
  changeBlouse,
  tryOnResult,
  selectedNeck,
  isChangingNeck,
  changeNeck,
  selectedSareeStyle,
  onSelectSareeStyle,
}) => {
  return (
    /* Single column — both boxes share the same anchor & width */
    <div
      className={`
        absolute top-20 ${LEFT}
        z-20 hidden lg:flex flex-col items-stretch gap-3
        ${W}
        max-h-[calc(100vh-90px)] overflow-y-auto scrollbar-none
      `}
    >

      {/* ── BOX 1 · Blouse / Neck / Saree Style ─────────────────────── */}
      <div className="w-full h-[490px] bg-white shadow-lg overflow-hidden">

        {/* Tab bar — spans full box width */}
        <CustomizerTabs
          activeCustomizer={activeCustomizer}
          setActiveCustomizer={setActiveCustomizer}
        />

        {activeCustomizer === "blouse" && (
          <BlouseCustomizer
            selectedBlouse={selectedBlouse}
            isChangingBlouse={isChangingBlouse}
            changeBlouse={changeBlouse}
            tryOnResult={tryOnResult}
          />
        )}
        {activeCustomizer === "neck" && (
          <NeckCustomizer
            selectedNeck={selectedNeck}
            isChangingNeck={isChangingNeck}
            changeNeck={changeNeck}
            tryOnResult={tryOnResult}
          />
        )}
        {activeCustomizer === "saree-style" && (
          <SareeStyleCustomizer
            selectedStyle={selectedSareeStyle}
            onSelectStyle={onSelectSareeStyle}
            tryOnResult={tryOnResult}
          />
        )}
      </div>

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