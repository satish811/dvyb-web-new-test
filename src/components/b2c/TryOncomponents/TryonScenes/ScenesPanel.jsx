
import React from "react";
import { Image } from "lucide-react";
import BackgroundGrid from "./BackgroundGrid";
import QuickActions from "./QuickActions";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * Right Sidebar - Scenes & Actions Panel (Desktop Only)
 * This component displays background options and quick action buttons
 */
const ScenesPanel = ({
  viewMode,
  selectedBackground,
  changeBackground,
  isChangingBackground,
  tryOnResult,
  tryOnData,
  isInWishlistState,
  wishlistLoading,
  handleToggleWishlist,
  navigate,
}) => {
  return (
  <div className="
  absolute top-20 
  right-6 xl:right-24 2xl:right-52
  z-20 hidden lg:block
  w-[260px] xl:w-[290px]
  scrollbar-none bg-white shadow-lg p-5
  max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar
">

      {/* ============================================ */}
      {/* SCENES SECTION - Only visible in 2D mode */}
      {/* ============================================ */}
      {viewMode === "2D" && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              {UI_TEXT.SCENES}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">{UI_TEXT.BACKGROUNDS}</p>

          {/* Background Grid Component */}
          <BackgroundGrid
            selectedBackground={selectedBackground}
            changeBackground={changeBackground}
            isChangingBackground={isChangingBackground}
            tryOnResult={tryOnResult}
          />
        </div>
      )}

      {/* ============================================ */}
      {/* QUICK ACTIONS SECTION */}
      {/* ============================================ */}
      <QuickActions
        tryOnData={tryOnData}
        navigate={navigate}
        isInWishlistState={isInWishlistState}
        wishlistLoading={wishlistLoading}
        handleToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
};

export default ScenesPanel;