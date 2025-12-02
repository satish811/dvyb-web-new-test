import React from "react";
import { ShoppingBag, Zap, Eye } from "lucide-react";

const ProductActionButtons = ({
  user,
  isB2BUser,
  onAddToBag,
  onBuyNow,
  onVirtualTryOn,
  onAddToWishlist,
  addingToCart,
  addingToWishlist,
}) => {
  const isGuest = !user;

  // Guest Alert
  const handleLoginRequired = () => {
    alert("Please login to continue.");
  };

  // B2B Alert
  const handleB2BRestricted = () => {
    alert("You can't buy directly. Please use 'ADD TO BAG'.");
  };

  return (
    <div className="flex flex-col gap-3 mt-4 w-full">
      {/* Row for Buy Now and Add to Bag */}
      <div className="flex gap-3">
        {/* BUY NOW */}
        <button
          onClick={isGuest ? handleLoginRequired : isB2BUser ? handleB2BRestricted : onBuyNow}
          disabled={addingToCart}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm uppercase tracking-wide
            ${
              isGuest || isB2BUser
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#7a0000] text-white hover:bg-[#5a0000]"
            }
            transition disabled:opacity-50`}
        >
          {addingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Zap size={16} />
              Buy Now
            </>
          )}
        </button>

        {/* ADD TO BAG */}
        <button
          onClick={isGuest ? handleLoginRequired : onAddToBag}
          disabled={addingToCart}
          className={`flex-1 flex items-center justify-center gap-2 border py-3 font-semibold text-sm uppercase tracking-wide
            ${
              isGuest
                ? "border-gray-400 text-gray-400 cursor-not-allowed"
                : "border-[#7a0000] text-[#7a0000] hover:bg-[#7a0000] hover:text-white"
            }
            transition disabled:opacity-50`}
        >
          {addingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-[#7a0000] border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              Add to Bag
            </>
          )}
        </button>
      </div>

      {/* VIRTUAL TRY ON */}
      <button
        onClick={isGuest ? handleLoginRequired : onVirtualTryOn}
        className={`flex items-center justify-center gap-2 py-3 font-semibold text-sm uppercase tracking-wide transition
          ${
            isGuest
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#FFC400] text-white hover:bg-[#e6b200]"
          }`}
      >
        <Eye size={16} />
        Virtual Try On
      </button>
    </div>
  );
};

export default ProductActionButtons;
