// src/components/b2c/TryOn/components/customization/CustomizationPanel.jsx

import React from "react";
import { Palette } from "lucide-react";
import ColorTab from "./ColorTab";
import FabricTab from "./FabricTab";
import BlouseCustomizer from "../TryOncustomization/BlouseCustomizer";
import NeckCustomizer from "../TryOncustomization/NeckCustomizer";
import SareeStyleCustomizer from "../TryOncustomization/SareeStyleCustomizer";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import CustomizerTabs from "../TryOnshared/CustomizerTabs";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * Left Sidebar - Customization Panel (Desktop Only)
 * Both Outfit Details and Blouse/Neck/Saree boxes share the same width & alignment.
 */
const PANEL_WIDTH = "w-[310px] xl:w-[330px]";
const PANEL_LEFT  = "left-6 xl:left-24 2xl:left-52";

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
    <>
      {/* ============================================ */}
      {/* OUTER WRAPPER — same left anchor for both boxes */}
      {/* ============================================ */}
      <div
        className={`
          absolute top-20
          ${PANEL_LEFT}
          z-20 hidden lg:flex flex-col items-center gap-3
          ${PANEL_WIDTH}
          max-h-[calc(100vh-90px)] overflow-y-auto
          scrollbar-none
        `}
      >

        {/* ============================================ */}
        {/* BOX 1 — Outfit Details */}
        {/* ============================================ */}
        <div className="w-full bg-white shadow-lg p-5">

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

          {/* Colour tab pill */}
          <div className="flex mb-5 border-b p-1 bg-[#F0E0E0] border-gray-200 w-fit">
            <button
              onClick={() => setSelectedTab("colours")}
              className={`text-sm px-4 py-1 font-medium transition-all ${
                selectedTab === "colours"
                  ? "text-primary bg-white"
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

          {/* View 360 Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            handleViewModeSwitch={handleViewModeSwitch}
          />
        </div>

        {/* ============================================ */}
        {/* BOX 2 — Blouse / Neck / Saree Style */}
        {/* ============================================ */}
        <div className="w-full bg-white shadow-lg">

          {/* Tab Bar */}
          <CustomizerTabs
            activeCustomizer={activeCustomizer}
            setActiveCustomizer={setActiveCustomizer}
          />

          {/* Blouse */}
          {activeCustomizer === "blouse" && (
            <BlouseCustomizer
              selectedBlouse={selectedBlouse}
              isChangingBlouse={isChangingBlouse}
              changeBlouse={changeBlouse}
              tryOnResult={tryOnResult}
            />
          )}

          {/* Neck */}
          {activeCustomizer === "neck" && (
            <NeckCustomizer
              selectedNeck={selectedNeck}
              isChangingNeck={isChangingNeck}
              changeNeck={changeNeck}
              tryOnResult={tryOnResult}
            />
          )}

          {/* Saree Style */}
          {activeCustomizer === "saree-style" && (
            <SareeStyleCustomizer
              selectedStyle={selectedSareeStyle}
              onSelectStyle={onSelectSareeStyle}
              tryOnResult={tryOnResult}
            />
          )}
        </div>

      </div>
    </>
  );
};

export default CustomizationPanel;