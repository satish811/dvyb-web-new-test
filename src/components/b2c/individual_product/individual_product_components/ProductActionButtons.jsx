import React, { useState } from "react";
import { ShoppingBag, Zap, Eye } from "lucide-react";
import BuyNowColorsPopup from "../../../b2b/common/BuyNowColorPopup";
import { useNavigate } from "react-router-dom";
import RightSlidePopup from "../../../common/PopUps/RightSlidePopup";

const ProductActionButtons = ({
  user,
  isB2BUser,
  onAddToBag,
  onBuyNow,
  onVirtualTryOn,
  onAddToWishlist,
  onB2BBuyNow,
  addingToCart,
  addingToWishlist,
  product,
  selectedSize,
  selectedColor,
}) => {
  const navigate = useNavigate();
  const isGuest = !user;
  const isVirtualTryOnDisabled = isGuest || isB2BUser;
  const [showBulkPopup, setShowBulkPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Guest Alert
  const handleLoginRequired = () => {
    setShowLoginPopup(true);
  };

  // B2C Buy Now handler (for regular users)
  const handleB2CBuyNow = async () => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        image: product.imageUrls?.[0] || "/placeholder.jpg",
        color: selectedColor || product.selectedColors?.[0] || "Default",
        size: selectedSize || "M",
        quantity: 1,
      };

      const currentUser = user;

      navigate("/checkout", {
        state: {
          cartItems: [cartItem],
          user: currentUser
            ? {
              uid: currentUser.uid,
              email: currentUser.email,
            }
            : null,
        },
      });
    } catch (error) {
      console.error("Error in B2C Buy Now:", error);
      alert("Failed to process Buy Now. Please try again.");
    }
  };

  // Main Buy Now handler
  const handleBuyNowClick = () => {
    console.log("Buy Now clicked!", { isGuest, isB2BUser, user, product });

    if (isGuest) {
      handleLoginRequired();
      return;
    }

    if (isB2BUser) {
      // Show B2B popup for bulk order
      setShowBulkPopup(true);
    } else {
      // For B2C users, either use parent's handler or default
      if (onBuyNow) {
        onBuyNow();
      } else {
        handleB2CBuyNow();
      }
    }
  };

  // Handle B2B popup confirmation
  const handleB2BPopupConfirm = async (variants) => {
    console.log("B2B Bulk Order Confirmed:", variants);

    try {
      // After adding to cart, navigate to checkout
      navigate("/checkout", {
        state: {
          cartItems: [], // This will be loaded from cart in checkout page
          isB2BOrder: true,
        },
      });
    } catch (error) {
      console.error("Error processing B2B Buy Now:", error);
      alert("Failed to process bulk order. Please try again.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mt-6 w-full">
        {/* Row for Add to cart and Buy Now */}

        <div className="flex gap-4">
          {/* ADD TO CART */}
          <button
            onClick={isGuest ? handleLoginRequired : onAddToBag}
            disabled={addingToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-base rounded-md
    ${addingToCart
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#33022F] text-white"
              }
    transition-all duration-200 disabled:opacity-50`}
          >
            {addingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                Add to cart
              </>
            )}
          </button>

          {/* BUY NOW */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBuyNowClick();
            }}
            disabled={addingToCart}
            className={`flex-1 flex items-center justify-center gap-2 border-2 py-4 font-semibold text-base rounded-md
    ${addingToCart
                ? "border-gray-400 text-gray-400 cursor-not-allowed"
                : "border-[#33022F] text-[#33022F]"
              }
    transition-all duration-200 disabled:opacity-50`}
            style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
          >
            {addingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap size={18} />
                {isB2BUser ? "Buy Now (Bulk)" : "Buy Now"}
              </>
            )}
          </button>
        </div>

        {/* VIRTUAL TRY ON - Only show for non-B2B users */}
        {!isB2BUser && (
          <button
            onClick={isGuest ? handleLoginRequired : onVirtualTryOn}
            className="flex items-center justify-center gap-2 py-4 font-semibold text-base rounded-md transition-all duration-200 bg-[#FFC400] text-white hover:bg-[#e6b200]"
          >
            <Eye size={18} />
            Virtual try on
          </button>
        )}
      </div>

      {/* B2B Bulk Order Popup */}
      {showBulkPopup && (
        <BuyNowColorsPopup
          product={product}
          onClose={() => setShowBulkPopup(false)}
          userRole="B2B"
          onConfirm={handleB2BPopupConfirm}
        />
      )}

      {/* Login Required Popup */}
      {showLoginPopup && (
        <RightSlidePopup
          keyProp="login-required"
          content="Please login to continue."
          autoHideDelay={4000}
          onClose={() => setShowLoginPopup(false)}
        />
      )}
    </>
  );
};

export default ProductActionButtons;
