// src/components/b2c/TryOn/components/layout/TryOnMobileSheet.jsx

import React, { useRef, useState } from "react";
import { Heart, Palette, Image as ImageIcon, RotateCcw, ArrowRight, Camera, Bookmark } from "lucide-react";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import ColorTab from "../TryOncustomization/ColorTab";
import FabricTab from "../TryOncustomization/FabricTab";
import BackgroundGrid from "../TryonScenes/BackgroundGrid";
import BlouseNeckCustomizer from "../TryOncustomization/BlouseNeckCustomizer";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * Mobile Bottom Sheet Component
 * Contains all customization options for mobile view
 */
const TryOnMobileSheet = ({
  selectedTab,
  setSelectedTab,
  viewMode,
  handleViewModeSwitch,
  selectedColor,
  setSelectedColor,
  colors,
  selectedFabric,
  setSelectedFabric,
  fabricTypes,
  selectedBackground,
  changeBackground,
  isChangingBackground,
  tryOnResult,
  tryOnData,
  pendingBlouse,
  setPendingBlouse,
  pendingNeck,
  setPendingNeck,
  isApplying,
  applyChanges,
  handleToggleWishlist,
  wishlistLoading,
  isInWishlistState,
  navigate,
  performTryOn,
  isProcessing,
  handleSaveLook,
  isSaving,
  isLookSaved,
}) => {
  const isSaree = tryOnData?.outfitType?.toLowerCase() === 'saree';

  const fileInputRef = useRef(null);
  const [customScenes, setCustomScenes] = useState([]);
  const [selectedCustomBg, setSelectedCustomBg] = useState(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newScene = {
          id: `custom-${Date.now()}-${Math.random()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          image: event.target.result,
          isCustom: true,
        };
        setCustomScenes((prev) => [...prev, newScene]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleCustomBgSelect = (scene) => {
    setSelectedCustomBg(scene.id);
    if (changeBackground) {
      changeBackground(scene.id, scene.image);
    }
  };

  return (
    <div className="lg:hidden w-full px-4 pt-2 pb-20 flex flex-col gap-5 relative z-10 max-w-lg mx-auto">

      {/* 360 View Toggle Card */}
      <div className="bg-[#FAF5FB] rounded-[24px] p-4 flex items-center justify-between w-full shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus-visible:outline-none">
        <ViewModeToggle
          viewMode={viewMode}
          handleViewModeSwitch={handleViewModeSwitch}
        />
      </div>

      {/* Reset Button */}
      <div className="flex justify-center -mt-3 mb-1">
        <button
          onClick={() => performTryOn && performTryOn({ force: true })}
          disabled={isProcessing}
          className="flex items-center gap-1.5 text-sm text-[#4a044e] font-medium transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} /> Re-Try
        </button>
      </div>

      {/* Customize Outfit Card */}
      <div className="bg-[#FAF5FB] rounded-[24px] p-5 w-full shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-1 text-gray-900">
          <Palette className="w-[18px] h-[18px]" strokeWidth={2.5} />
          <h3 className="text-[16px] font-bold">{UI_TEXT.CUSTOMIZE_OUTFIT}</h3>
        </div>
        <p className="text-[13px] text-gray-600 mb-5 leading-snug">
          Select a sleeve and neck , then apply<br />to generate your look
        </p>

        {/* Colors */}
        {colors && colors.length > 0 && selectedTab === "colours" && (
          <div className="mb-4">
            <ColorTab
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              colors={colors}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* Customization Grid */}
        {isSaree ? (
          <BlouseNeckCustomizer
            pendingBlouse={pendingBlouse}
            setPendingBlouse={setPendingBlouse}
            pendingNeck={pendingNeck}
            setPendingNeck={setPendingNeck}
            isApplying={isApplying}
            applyChanges={applyChanges}
            tryOnResult={tryOnResult}
          />
        ) : (
          fabricTypes && fabricTypes.length > 0 && selectedTab === "fabrics" && (
            <FabricTab
              selectedFabric={selectedFabric}
              setSelectedFabric={setSelectedFabric}
              fabrics={fabricTypes}
              viewMode={viewMode}
            />
          )
        )}
      </div>

      {/* Scenes Section */}
      {viewMode === "2D" && (
        <div className="w-full mt-2">
          <div className="flex items-center gap-2 mb-1 px-1 text-gray-900">
            <ImageIcon className="w-[18px] h-[18px]" strokeWidth={2.5} />
            <h3 className="text-[16px] font-bold">{UI_TEXT.SCENES || "Backgrounds"}</h3>
          </div>
          <p className="text-[13px] text-gray-600 mb-4 px-1 leading-snug">
            Choose a background you like or add your own<br />to generate your look
          </p>
          <BackgroundGrid
            selectedBackground={selectedBackground}
            changeBackground={changeBackground}
            isChangingBackground={isChangingBackground}
            tryOnResult={tryOnResult}
          />

          {/* ============================================ */}
          {/* CUSTOM SCENE UPLOAD (Mobile) */}
          {/* ============================================ */}
          <div className="mt-4 px-1">
            {/* Upload Row */}
            <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 mb-2">
              <button
                onClick={handleCameraClick}
                disabled={!tryOnResult || isChangingBackground}
                title="Add your own scene"
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white transition-colors ${!tryOnResult || isChangingBackground ? 'opacity-50' : 'cursor-pointer hover:opacity-90'}`}
                style={{ background: 'var(--villy-primary, #33022F)' }}
              >
                <Camera className="w-4 h-4" />
              </button>
              <span className="text-[13px] font-medium text-gray-600 flex-1">Add your scenes</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-5 px-1">
              Upload a clear background image for the best screen placement. Plain, well-lit scenes work best.
            </p>

            {/* Custom Scenes Grid */}
            {customScenes.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {customScenes.map((scene) => (
                  <div key={scene.id}>
                    <button
                      onClick={() => handleCustomBgSelect(scene)}
                      disabled={!tryOnResult || isChangingBackground}
                      className={`relative cursor-pointer p-1 overflow-hidden transition-all w-full ${selectedCustomBg === scene.id || selectedBackground === scene.id
                        ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
                        : "hover:scale-105 border border-gray-200"
                        } ${!tryOnResult || isChangingBackground
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                        }`}
                    >
                      <div className="aspect-square">
                        <img
                          src={scene.image}
                          alt={scene.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                    </button>
                    <p className="text-[11px] font-medium text-center pt-1.5 text-gray-600 truncate">
                      {scene.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions - Scrollable (Web Styling) */}
      <div className="w-full flex justify-center mt-10 mb-10">
        <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-3 py-2 flex items-center gap-4 max-w-full overflow-x-auto hide-scrollbar">
          <button
            onClick={() => {
              navigate(`/product/${tryOnData?.productId}`);
            }}
            className="bg-[#74136C] hover:bg-[#5a0f54] text-white px-6 py-3 rounded-full text-[13px] font-bold tracking-wide flex items-center gap-2 transition-all uppercase shrink-0"
          >
            VIEW PRODUCT <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={handleSaveLook}
            disabled={isSaving || !tryOnResult || isLookSaved}
            className={`flex items-center gap-2 text-[13px] font-semibold px-4 py-3 rounded-full border border-[#74136C] text-[#74136C] shrink-0 transition-colors hover:bg-[#74136C] hover:text-white ${
              isSaving || !tryOnResult || isLookSaved ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? (
              <span className="animate-spin h-4 w-4 border-2 border-[#74136C] border-t-transparent rounded-full" />
            ) : (
              <Bookmark className={`w-4 h-4 ${isLookSaved ? "fill-current" : ""}`} />
            )}
            <span>{isSaving ? "Saving..." : isLookSaved ? "Saved" : "Save My Look"}</span>
          </button>

          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`flex items-center gap-2 text-[13px] font-semibold pr-3 shrink-0 transition-colors ${isInWishlistState ? "text-red-500" : "text-gray-700 hover:text-gray-900"
              } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {wishlistLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full" />
            ) : (
              <Heart
                className={`w-[18px] h-[18px] ${isInWishlistState ? "fill-current" : ""}`}
              />
            )}
            <span>{isInWishlistState ? "Added to Wishlist" : "Add to Wishlist"}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default TryOnMobileSheet;