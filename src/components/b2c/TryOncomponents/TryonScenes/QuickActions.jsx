// src/components/b2c/TryOn/components/scenes/QuickActions.jsx

import React from "react";
import { ArrowLeft, Heart, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import share_ic from "../../../../assets/TryOn/share_ic.svg";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * Quick Actions Component
 * View Product, Wishlist, Share buttons
 */
const QuickActions = ({
  tryOnData,
  navigate,
  isInWishlistState,
  wishlistLoading,
  handleToggleWishlist,
  onClose,
  isProcessing,
  performTryOn,
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-3 text-center">
        {UI_TEXT.QUICK_ACTIONS}
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => performTryOn?.({ force: true })}
          disabled={!!isProcessing}
          className={`w-full bg-white border-2 border-primary text-primary py-2.5 transition-all font-medium flex items-center justify-center gap-2 text-sm ${
            isProcessing ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"
          }`}
        >
          <RefreshCcw size={16} />
          Retry Try-On
        </button>

        <button
          onClick={() => {
          onClose();

          }}
          className="w-full bg-primary hover:bg-hoverBg text-white py-2.5 transition-all font-medium flex items-center justify-center gap-2 text-sm"
        >
          <ArrowLeft size={16} className="rotate-180" />
          {UI_TEXT.VIEW_PRODUCT}
        </button>

     <button
  onClick={handleToggleWishlist}
  disabled={wishlistLoading}
  className={`w-full py-2.5 transition-all font-medium flex gap-2 items-center text-sm ${
    isInWishlistState
      ? "text-primary pl-3"
      : "bg-white border-2 justify-center border-primary text-primary"
  } ${wishlistLoading ? "opacity-60 cursor-not-allowed" : ""}`}
>
  {wishlistLoading ? (
    <>
      <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      <span>Updating...</span>
    </>
  ) : (
    <>
      <Heart
        className={`w-5 h-5 ${
          isInWishlistState ? "fill-current text-red-600" : ""
        }`}
      />
      {isInWishlistState
        ? UI_TEXT.ADDED_TO_WISHLIST
        : UI_TEXT.ADD_TO_WISHLIST}
    </>
  )}
</button>


        {/* <button
          onClick={() => toast.info("Share feature coming soon!")}
          className="w-full bg-white text-primary py-2.5 transition-all font-medium flex items-center justify-center gap-2 text-sm"
        >
          <img src={share_ic} alt="Share" />
          <span>{UI_TEXT.SHARE_MY_LOOK}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;