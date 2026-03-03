// src/components/b2c/TryOn/components/layout/TryOnMobileSheet.jsx

import React from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import ViewModeToggle from "../TryOnshared/ViewModeToggle";
import ColorTab from "../TryOncustomization/ColorTab";
import FabricTab from "../TryOncustomization/FabricTab";
import BackgroundGrid from "../TryonScenes/BackgroundGrid";
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
  handleToggleWishlist,
  wishlistLoading,
  isInWishlistState,
  navigate,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl max-h-[60vh] overflow-y-auto">

      {/* Mobile Handle */}
      <div className="sticky top-0 bg-white pt-2 pb-3 flex justify-center border-b border-gray-200 z-10">
        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
      </div>

      {/* View 360 Toggle */}
      <div className="px-4 py-4 border-b border-gray-200">
        <ViewModeToggle
          viewMode={viewMode}
          handleViewModeSwitch={handleViewModeSwitch}
        />
      </div>

      {/* Customize Section */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3">{UI_TEXT.CUSTOMIZE_OUTFIT}</h3>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("colours")}
            className={`pb-2 text-sm font-medium ${selectedTab === "colours"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
              }`}
          >
            Colours
          </button>
          <button
            onClick={() => setSelectedTab("fabrics")}
            className={`pb-2 text-sm font-medium ${selectedTab === "fabrics"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
              }`}
          >
            Fabrics
          </button>
        </div>

        {/* Colors */}
        {selectedTab === "colours" && (
          <ColorTab
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            colors={colors}
            viewMode={viewMode}
          />
        )}

        {/* Fabrics */}
        {selectedTab === "fabrics" && (
          <FabricTab
            selectedFabric={selectedFabric}
            setSelectedFabric={setSelectedFabric}
            fabricTypes={fabricTypes}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* Scenes Section - Only in 2D */}
      {viewMode === "2D" && (
        <div className="px-4 py-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold mb-3">{UI_TEXT.SCENES}</h3>
          <BackgroundGrid
            selectedBackground={selectedBackground}
            changeBackground={changeBackground}
            isChangingBackground={isChangingBackground}
            tryOnResult={tryOnResult}
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-2 pb-6">
        <button
          onClick={() => navigate(`/product/${tryOnData?.productId}`)}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium text-sm"
        >
          {UI_TEXT.VIEW_PRODUCT}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${isInWishlistState
                ? "bg-red-50 border-2 border-red-500 text-red-500"
                : "border-2 border-gray-300 text-gray-700"
              }`}
          >
            <Heart
              className={`w-4 h-4 ${isInWishlistState ? "fill-current" : ""}`}
            />
            Wishlist
          </button>

          <button
            onClick={() => toast.info("Share feature coming soon!")}
            className="py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default TryOnMobileSheet;