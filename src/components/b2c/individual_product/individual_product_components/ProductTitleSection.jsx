import React, { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import ShareCart from "../../../common/PopUps/ShareCart";
import HeartColorsPopup from "../../../b2b/common/HeartColorPopup";
import RightSlidePopup from "../../../common/PopUps/RightSlidePopup";

const ProductTitleSection = ({
  user,
  userRole,
  onAddToWishlist,
  onAddToB2BWishlist,
  addingToWishlist,
  product,
}) => {
  const { title, name, description } = product || {};
  const [isExpanded, setIsExpanded] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openHeartPopup, setOpenHeartPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const displayTitle = title || name;

  const maxLength = 120;
  const isLongDescription = description && description.length > maxLength;

  const displayText = isExpanded
    ? description
    : description?.slice(0, maxLength) + (isLongDescription ? "..." : "");

  /**
   * Guest Alert
   */
  const handleLoginRequired = () => {
    setShowLoginPopup(true);
  };

  /**
   * B2B Alert
   */
  const handleB2BRestricted = () => {
    alert("You can't buy directly. Please use 'ADD TO BAG'.");
  };

  /**
   * Handle Heart Icon Click - Different behavior for B2B users
   */
  const handleHeartClick = () => {
    if (!user) {
      handleLoginRequired();
      return;
    }

    if (userRole === "B2B") {
      setOpenHeartPopup(true);
    } else {
      onAddToWishlist();
    }
  };

  /**
   * Handle B2B Wishlist Confirmation
   */
  const handleB2BWishlistConfirm = async (variants) => {
    try {
      if (!onAddToB2BWishlist) {
        console.error("B2B wishlist handler not provided");
        alert("B2B wishlist functionality not available");
        return;
      }

      const success = await onAddToB2BWishlist(variants);
      if (success) {
        setOpenHeartPopup(false);
      }
    } catch (error) {
      console.error("Error adding B2B item to wishlist:", error);
      alert("Failed to add item to wishlist");
    }
  };

  return (
    <>
      {showLoginPopup && (
        <RightSlidePopup
          content={
            <div className="flex items-center gap-3">
              <div className="text-2xl">Please sign in</div>
              <div className="text-sm text-gray-600">Login to save items to your wishlist</div>
            </div>
          }
          autoHideDelay={5000}
          onClose={() => setShowLoginPopup(false)}
          keyProp="login-required"
        />
      )}

      <div className="flex flex-col" style={{ gap: "1px" }}>
        {/* Title + Icons */}
        <div className="flex items-start justify-between">
          {/* Product Title */}
          {displayTitle && (
            <h1
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 500,
                fontSize: "22px",
                lineHeight: "1.2",
                letterSpacing: "0.66px",
                color: "#000000",
                margin: 0,
                padding: 0,
                textTransform: "uppercase",
                display: "-webkit-box",
                WebkitLineClamp: isExpanded ? "none" : 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: "26.4px",
                maxHeight: isExpanded ? "none" : "105.6px",
                flex: 1,
                marginRight: "12px",
              }}
            >
              {displayTitle}
            </h1>
          )}

          {/* Icons */}
          <div className="flex items-center" style={{ gap: "12px", flexShrink: 0 }}>
            {/* Share Button */}
            <button
              title="Share Product"
              className="p-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setOpenShare(true)}
            >
              <Share2 size={20} className="text-gray-700" />
            </button>

            {/* Wishlist Button - Different behavior for B2B */}
            <button
              title={userRole === "B2B" ? "Add to B2B Wishlist" : "Add to Wishlist"}
              className="p-2 rounded-full hover:bg-gray-100 transition relative"
              onClick={handleHeartClick}
              disabled={addingToWishlist}
            >
              <Heart
                size={20}
                className={`${addingToWishlist ? "text-gray-400" : "text-gray-700 hover:text-red-500"}`}
              />
              {addingToWishlist && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div
            className="w-full max-w-[384px]"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "21.33px",
              letterSpacing: "0.42px",
              color: "#808080",
              marginTop: "8px",
            }}
          >
            {displayText}

            {isLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 hover:underline font-medium"
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "21.33px",
                  letterSpacing: "0.42px",
                  color: "#808080",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {isExpanded ? "See less" : "See more"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Share Cart Popup */}
      {openShare && <ShareCart onClose={() => setOpenShare(false)} product={product} />}

      {/* B2B Heart Colors Popup */}
      {openHeartPopup && (
        <HeartColorsPopup
          product={product}
          onClose={() => setOpenHeartPopup(false)}
          userRole={userRole}
          onConfirm={handleB2BWishlistConfirm}
        />
      )}
    </>
  );
};

export default ProductTitleSection;
