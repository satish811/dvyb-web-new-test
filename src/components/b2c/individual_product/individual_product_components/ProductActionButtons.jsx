import React, { useState } from "react";
import { ShoppingBag, Zap, Eye, ShoppingCart, CheckCircle } from "lucide-react";
import BuyNowColorsPopup from "../../../b2b/common/BuyNowColorPopup";
import { useNavigate } from "react-router-dom";
import RightSlidePopup from "../../../common/PopUps/RightSlidePopup";
import { useCart } from "../../../../context/CartContext";
import virtualTryOnLogo from "../../../../assets/b2c/landing/Landing-villy/virtualtryonlogo.png";

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
  const { isInCart } = useCart();
  const isGuest = !user;
  const isVirtualTryOnDisabled = isGuest || isB2BUser;
  const [showBulkPopup, setShowBulkPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showGuestMessage, setShowGuestMessage] = useState(false);
  const [guestMessage, setGuestMessage] = useState("");

  // Check if this product is already in the cart
  const isProductInCart = isInCart(product?.id);

  // Guest Alert
  const handleLoginRequired = (message) => {
    setGuestMessage(message);
    setShowGuestMessage(true);

    // Auto hide after 4 seconds
    setTimeout(() => {
      setShowGuestMessage(false);
    }, 4000);
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
  const handleBuyNowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Buy Now clicked!", { isGuest, isB2BUser, user, product });

    if (isGuest) {
      handleLoginRequired("Please login to buy products.");
      return;
    }

    if (isB2BUser) {
      // Show B2B popup for bulk order
      setShowBulkPopup(true);
    } else {
      // For B2C users, either use parent's handler or default
      if (onBuyNow) {
        onBuyNow(e);
      } else {
        handleB2CBuyNow();
      }
    }
  };

  // Handle Add to Cart click
  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGuest) {
      handleLoginRequired("Please login to add products to cart.");
      return;
    }

    // Call the onAddToBag function passed from parent with the event
    if (onAddToBag) {
      onAddToBag(e);
    }
  };

  // Handle Virtual Try On click
  const handleVirtualTryOnClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGuest) {
      handleLoginRequired("Please login to use Virtual Try On.");
      return;
    }

    // Call the onVirtualTryOn function passed from parent with the event
    if (onVirtualTryOn) {
      onVirtualTryOn(e);
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
          {/* ADD TO CART / GO TO CART */}
          <button
            onClick={isProductInCart ? () => navigate("/cart") : handleAddToCartClick}
            disabled={addingToCart && !isProductInCart}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-base rounded-none border border-[#88117F]
              ${(addingToCart && !isProductInCart)
                ? "border-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-white text-[#88117F] hover:bg-[#88117F] hover:text-white"
              }
              transition-all duration-200 disabled:opacity-50`}
          >
            {(addingToCart && !isProductInCart) ? (
              <>
                <div className="w-4 h-4 border-2 border-[#88117F] border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              isProductInCart ? "Go to cart" : "Add to cart"
            )}
          </button>

          {/* BUY NOW */}
          <button
            onClick={handleBuyNowClick}
            disabled={addingToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-base rounded-none
              ${addingToCart
                ? "border-2 border-gray-400 text-gray-400 bg-gray-300 cursor-not-allowed"
                : "bg-[#88117F] text-white hover:opacity-90 hover:shadow-md"
              }
              transition-all duration-200 disabled:opacity-50`}
            style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
          >
            {addingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                {isB2BUser ? "BUY NOW (BULK)" : "BUY NOW"}
              </>
            )}
          </button>
        </div>

        {/* Guest Message - Display under the buttons */}
        {showGuestMessage && (
          <div className="text-sm text-red-600 font-medium mt-1 text-center bg-red-50 py-2 px-3 rounded-md border border-red-200">
            {guestMessage}
          </div>
        )}

        {/* VIRTUAL TRY ON - Only show for non-B2B users */}
        {!isB2BUser && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleVirtualTryOnClick}
              className="flex items-center justify-center gap-2 py-4 font-semibold text-sm md:text-base rounded-none transition-all duration-200 text-white hover:opacity-90 hover:shadow-md"
              style={{ background: "linear-gradient(90deg, #9A6E97 0%, #835D80 32.69%, #8F658B 63.94%, #8F688C 100%)" }}
            >
              <img
                src={virtualTryOnLogo}
                alt="Virtual Try On"
                className="w-5 h-5 md:w-7 md:h-7 object-contain"
              />
              Virtual try on
            </button>

        />
      )}
    </>
  );
};

export default ProductActionButtons;