import React, { useState, useEffect } from "react";
import { wishlistService } from "../../../services/wishlistService";
import { cartService } from "../../../services/cartService";
import { toast } from "react-toastify";
import {
  Trash2,
  ShoppingCart,
  Heart,
  ChevronDown,
  ChevronUp,
  Edit2,
  Minus,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePopup } from "../../../context/ToastPopupContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";

import empty_wishlistIc from "../../../assets/ProfileImages/empty_wishlistIc.png";

// Reusable Wishlist Button Component
export const WishlistButton = ({ productId, productData, className = "", variants = [] }) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await wishlistService.isInWishlist(productId);
        setInWishlist(status);
      } catch (err) {
        console.error("Wishlist status check failed:", err);
      }
    };
    if (productId) checkStatus();
  }, [productId]);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await wishlistService.toggleWishlist(productId, productData, variants);
      setInWishlist(result.inWishlist);
      toast.success(result.inWishlist ? "Added to wishlist!" : "Removed from wishlist");
    } catch (err) {
      toast.error("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`wishlist-btn ${inWishlist ? "in-wishlist" : ""} ${className}`}
      style={{
        background: inWishlist ? "#ff4757" : "#ddd",
        color: inWishlist ? "white" : "#333",
        border: "none",
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "..." : inWishlist ? "❤️ Remove" : "🤍 Add to Wishlist"}
    </button>
  );
};

// B2B Wishlist Item Component (Same as B2B Cart Design)
const B2BWishlistItem = ({ item, onRemove, onAddToCart, onEdit }) => {
  const variants = item.variants || [];
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div
      className="border border-gray-200 p-6 mb-4 bg-white"
      style={{
        width: "619px",
        borderRadius: "0px",
      }}
    >
      {/* ROW 1: Image, Details, Price & Actions */}
      <div className="flex gap-4 mb-4">
        {/* Product Image */}
        <img
          src={item.image}
          alt={item.name}
          className="w-[70px] h-[90px] object-cover flex-shrink-0"
          style={{ borderRadius: "0px" }}
        />

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Product Name - Auto size and multi-line */}
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wide mb-1 leading-tight line-clamp-3">
            {item.name}
          </h2>

          {/* Product Description - 2 lines with show more/less */}
          <div className="mb-1">
            <p
              className={`text-[12px] text-gray-600 lowercase leading-tight ${showFullDescription ? "" : "line-clamp-2"
                }`}
            >
              {item.description || "mustard spun silk anarkali set"}
            </p>
            {(item.description || "").length > 60 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-[11px] text-gray-500 hover:text-gray-700 mt-1 underline"
              >
                {showFullDescription ? "Show Less" : "Show More"}
              </button>
            )}
          </div>

          {/* Code and Shipping Date */}
          <p className="text-[11px] text-gray-600 mb-1">CODE: {item.productId || "SUSC0425127"}</p>
          <p className="text-[11px] text-gray-600">ESTIMATED SHIPPING DATE: 4TH OF NOVEMBER</p>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <p className="text-[16px] font-semibold text-gray-900 mb-2">
            ₹{(item.price || 0).toLocaleString()}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onAddToCart(item)}
              className="hover:text-green-600 text-gray-400"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(item.productId || item.id)}
              className="hover:text-red-500 text-gray-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Variants - Color, Size, Quantity */}
      {variants.length > 0 && (
        <div className="space-y-2 mb-4">
          {variants.map((variant, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between"
              style={{ borderRadius: "0px" }}
            >
              {/* Left: Color, Size, Quantity */}
              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 ps-3 pe-3 p-2">
                <div
                  className="w-6 h-6 border border-gray-300 flex-shrink-0"
                  style={{
                    backgroundColor: variant.color,
                    borderRadius: "0px",
                  }}
                />
                <div className="text-[12px] text-gray-700">
                  <span className="font-medium text-[14px]">Size: {variant.size}</span>
                  <span className="ml-3 text-[14px]">
                    Quantity: {variant.quantity < 10 ? `0${variant.quantity}` : variant.quantity}
                  </span>
                </div>
              </div>

              {/* Right: Quantity Display (Read-only in wishlist) */}
              <div
                className="flex items-center border border-gray-300 bg-gray-50 flex-shrink-0"
                style={{ borderRadius: "0px" }}
              >
                <span className="px-3 text-[14px] font-medium text-gray-600">
                  {variant.quantity < 10 ? `0${variant.quantity}` : variant.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROW 3: Edit Button */}
      <button
        className="flex items-center gap-2 px-3 py-2 border border-gray-800 hover:bg-gray-50 transition text-[14px] font-medium"
        style={{ borderRadius: "0px" }}
        onClick={() => onEdit(item)}
      >
        <Edit2 className="w-3 h-3" />
        <span>Edit</span>
      </button>
    </div>
  );
};

// B2C Wishlist Item Component (Grid Card)
const B2CWishlistItem = ({ item, onAddToCart, onRemove }) => {
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const shouldTruncateTitle = item.name && item.name.length > 60;
  const shouldTruncateDescription = item.description && item.description.length > 80;

  return (
    <div
      className={`group w-full overflow-hidden transition bg-white border border-gray-200 ${showFullTitle ? "min-h-[550px]" : "min-h-[502px]"
        }`}
    >
      {/* Fixed Image Area */}
      <Link to={`/products/${item.productId || item.id}`}>
        <div className="w-full h-[322px] bg-gray-100 overflow-hidden">
          <img
            src={item.image || item.imageUrls?.[0] || "/placeholder.jpg"}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Fixed Content Areas */}
      <div className="p-4">
        {/* Fixed Title Area - Grows when expanded */}
        <div className="h-[48px] mb-3">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-medium text-gray-900 ${showFullTitle ? "" : "line-clamp-2"
                  }`}
                style={{
                  lineHeight: "1.2",
                  maxHeight: showFullTitle ? "none" : "2.4rem",
                }}
              >
                {item.name || " "}
              </h3>
            </div>
            {shouldTruncateTitle && (
              <button
                onClick={() => setShowFullTitle(!showFullTitle)}
                className="ml-2 text-xs text-gray-500 hover:text-gray-700 flex-shrink-0 mt-0.5"
              >
                {showFullTitle ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Fixed Description Area */}
        <div className="h-[40px] mb-3">
          {item.description ? (
            <>
              <p className={`text-xs text-gray-600 ${showFullDescription ? "" : "line-clamp-2"}`}>
                {item.description}
              </p>
              {shouldTruncateDescription && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
                >
                  {showFullDescription ? "Show Less" : "Show More"}
                  {showFullDescription ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </>
          ) : (
            <div className="h-full"></div>
          )}
        </div>

        {/* Fixed Price Area */}
        <div className="h-[24px] mb-4 flex items-center">
          {item.price ? (
            <p className="text-sm font-semibold text-gray-900">
              ₹{item.price?.toLocaleString("en-IN")}
            </p>
          ) : (
            <div className="h-full"></div>
          )}
        </div>

        {/* Fixed Button Area */}
        <div className="h-[36px]">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onAddToCart(item)}
              className="flex-1 flex items-center justify-center gap-2 h-[36px] bg-[#800000] text-white text-sm font-medium hover:bg-[#600000] transition rounded"
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Add to Cart</span>
            </button>
            <button
              onClick={() => onRemove(item.productId || item.id)}
              className="w-[36px] h-[36px] flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition rounded"
              title="Remove from Wishlist"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Wishlist Page
const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [userRole, setUserRole] = useState("B2C");

  // Safe popup access
  const popupContext = usePopup();
  const showPopup = popupContext?.showPopup;

  // Get user role on component mount
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await wishlistService.getCurrentUserRole();
        setUserRole(role);
        if (role === "B2B") {
          console.log("👑 B2B ROLE DETECTED — Wishlist Data:", wishlistItems);
        }
      } catch (error) {
        console.error("Error getting user role:", error);
        setUserRole("B2C");
      }
    };

    if (user) {
      getUserRole();
    }
  }, [user]);

  const handleRemoveItem = async (productId) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        toast.success("Item removed from wishlist");
      } else {
        toast.error("Failed to remove item. Please try again.");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const handleAddToCart = async (item) => {
    try {
      console.log("🛒 Adding to cart:", item);

      let result;

      // B2B Items with variants
      if ((userRole === "B2B" || item.isB2B) && item.variants && item.variants.length > 0) {
        console.log("🛒 B2B item detected, variants:", item.variants);

        // Use the existing cartService.addToCart method for B2B
        result = await cartService.addToCart(
          item.productId || item.id,
          {
            name: item.name || item.productName,
            price: item.price || 0,
            image: item.image || item.imageUrls?.[0],
            description: item.description,
          },
          item.variants // This should be an array of variants
        );
      } else {
        // B2C Items
        console.log("🛒 B2C item detected");

        // For B2C, use the first variant or default values
        const firstVariant = item.variants?.[0] || {};

        result = await cartService.addToCart(
          item.productId || item.id,
          {
            name: item.name || item.productName,
            price: item.price || 0,
            image: item.image || item.imageUrls?.[0],
            description: item.description,
            color: firstVariant.color || item.color || "Default",
            size: firstVariant.size || item.size || "M",
          },
          firstVariant.quantity || item.quantity || 1 // Single quantity for B2C
        );
      }

      console.log("🛒 Cart service result:", result);

      if (result === true) {
        // Remove from wishlist after successful cart addition
        await removeFromWishlist(item.productId || item.id);

        // Show success notification
        if (showPopup) {
          showPopup("cart", {
            id: item.productId || item.id,
            name: item.name || item.productName,
            image: item.image || item.imageUrls?.[0],
            title: item.name || item.productName,
          });
        } else {
          toast.success("Added to cart successfully!");
        }
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      toast.error(`Failed to add to cart: ${err.message}`);
    }
  };

  const handleEditItem = (item) => {
    console.log("🛒 [Wishlist] Editing B2B item:", item);
    sessionStorage.setItem(
      "editingWishlistItem",
      JSON.stringify({
        ...item,
        wishlistUniqueId: item.uniqueId,
      })
    );
    navigate(`/product/${item.productId}`);
  };

  // Filter items by role for display
  const displayItems = wishlistItems.filter((item) => {
    if (userRole === "B2B") {
      return true;
    } else {
      return !item.isB2B;
    }
  });

  // Separate B2B and B2C items for different rendering
  const b2bItems = displayItems.filter((item) => item.isB2B === true);
  const b2cItems = displayItems.filter((item) => !item.isB2B);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading your wishlist...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="max-w-md w-full flex flex-col items-center justify-center">
          <img
            src={empty_wishlistIc}
            alt="Login required"
            className="w-50 h-50 mb-8 mx-auto"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login to View Your Wishlist
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in to see your saved items and continue shopping
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-[#9C0000] text-white font-semibold rounded-lg hover:bg-[#7A0000] transition"
          >
            LOGIN TO CONTINUE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-23 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist ({userRole})</h1>
        </div>
      </div>

      {/* Empty Wishlist UI */}
      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-[400px] w-[800px] flex items-center justify-center rounded-full">
            <img
              src={empty_wishlistIc}
              className="object-cover h-auto w-auto"
              alt="Empty wishlist"
            />
          </div>

          <p className="text-lg font-semibold text-gray-800 mt-12">Your Wishlist is Empty</p>
          <p className="text-sm font-medium text-gray-700 mt-3 mb-6">Start adding your favorites</p>

          <Link
            to={userRole === "B2B" ? "/b2b-products" : "/products"}
            className="px-6 py-2 border border-double border-gray-400 text-gray-900 hover:bg-gray-900 hover:text-white transition text-sm font-medium"
          >
            CONTINUE SHOPPING
          </Link>

          {/* Trending section */}
          <div className="w-full mt-20">
            <h2 className="text-base font-semibold tracking-wide text-gray-900 mb-6">
              TRENDING PRODUCTS
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-md overflow-hidden">
                  <div className="w-full h-64 bg-gray-100" />
                  <div className="p-3">
                    <p className="text-sm text-gray-700 font-medium">Sample Product</p>
                    <p className="text-sm text-gray-900 font-semibold mt-1">₹12345</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Populated Wishlist UI */
        <>
          <h1 className="font-medium text-[12.07px] py-2 leading-[18.67px] tracking-[0.27px] uppercase align-middle font-outfit">
            MY WISHLIST ITEMS{" "}
            <span className="text-sm font-medium text-gray-600">
              ({displayItems.length} products)
            </span>
          </h1>

          {/* B2B Items - Same design as B2B Cart */}
          {b2bItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">B2B Items ({b2bItems.length})</h2>
              <div className="space-y-4">
                {b2bItems.map((item) => (
                  <B2BWishlistItem
                    key={item.productId || item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onAddToCart={handleAddToCart}
                    onEdit={handleEditItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* B2C Items - Grid Layout */}
          {b2cItems.length > 0 && (
            <div>
              {b2bItems.length > 0 && (
                <h2 className="text-lg font-semibold mb-4">B2C Items ({b2cItems.length})</h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                {b2cItems.map((item) => (
                  <B2CWishlistItem
                    key={item.productId || item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WishlistPage;
