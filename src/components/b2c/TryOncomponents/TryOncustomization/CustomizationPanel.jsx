// src/components/b2c/TryOn/components/customization/CustomizationPanel.jsx

import React from "react";
import { Palette } from "lucide-react";
import ColorTab from "./ColorTab";
import FabricTab from "./FabricTab";
import BlouseCustomizer from "../TryOncustomization/BlouseCustomizer";
import NeckCustomizer from "../TryOncustomization/NeckCustomizer";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import CustomizerTabs from "../TryOnshared/CustomizerTabs";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * Left Sidebar - Customization Panel (Desktop Only)
 * Contains color/fabric selection and view mode toggle
 */
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
}) => {
  return (
    <>
      {/* ============================================ */}
      {/* MAIN CUSTOMIZATION PANEL */}
      {/* ============================================ */}
     <div className="
  absolute top-20
  left-6 xl:left-24 2xl:left-52
  z-20 hidden lg:block
  w-[260px] xl:w-[294px]
  bg-white shadow-lg p-5
  max-h-[calc(100vh-120px)] overflow-y-auto
">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              {UI_TEXT.CUSTOMIZE_OUTFIT}
            </h3>
          </div>
          <p className="text-sm line-clamp-1 font-medium text-gray-500">
            {UI_TEXT.CUSTOMIZE_SUBTITLE}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-5 w-1/2 border-b p-1 bg-[#F0E0E0] border-gray-200">
          <button
            onClick={() => setSelectedTab("colours")}
            className={`pb-2 text-sm w-[128px] p-1 text-center font-medium transition-all relative ${
              selectedTab === "colours"
                ? "text-primary bg-white border-gray-900"
                : "text-primary hover:text-hoverBg"
            }`}
          >
            Colours
          </button>
        </div>

        {/* Colors Tab */}
        {selectedTab === "colours" && (
          <ColorTab
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            colors={colors}
            viewMode={viewMode}
          />
        )}

        {/* Fabrics Tab */}
        {selectedTab === "fabrics" && (
          <FabricTab
            selectedFabric={selectedFabric}
            setSelectedFabric={setSelectedFabric}
            fabricTypes={fabricTypes}
            viewMode={viewMode}
          />
        )}

        {/* View in 360 Toggle */}
        <ViewModeToggle 
          viewMode={viewMode} 
          handleViewModeSwitch={handleViewModeSwitch} 
        />
      </div>

      {/* ============================================ */}
      {/* BLOUSE & NECK CUSTOMIZER (Below main panel) */}
      {/* ============================================ */}
    <div
  className="
    absolute
    top-[440px] xl:top-[425px]
    left-4 md:left-6 xl:left-24 2xl:left-52
    z-20
    hidden lg:block
  "
>

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
      </div>
    </>
  );
};

export default CustomizationPanel;