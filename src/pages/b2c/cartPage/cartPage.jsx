import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartService } from "../../../services/cartService";
import { auth } from "../../../config";
import { toast } from "react-toastify";
import B2BAuthService from "../../../services/b2bAuthService";
import { Minus, Plus, X, Edit2, Trash2 } from "lucide-react";
import WishlistHeartButton from "../../../components/common/WishlistHeartButton";
import TrendingProducts from "../../../components/common/TrendingProducts/TrendingProducts";
import RecentlyViewedProducts from "../../../components/common/RecentlyViewedProducts/RecentlyViewedProducts";

// --- UTILS ---
const getEstimatedDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });
};

// --- POPUP COMPONENTS ---
const GiftPopup = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">Gift Item Information</h3>
      <p className="text-gray-600 mb-4">
        When you mark an item as a gift, we'll include special gift wrapping and a personalized
        message at no additional cost.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-[#800000] text-white py-2 font-medium uppercase hover:bg-[#600000] transition"
      >
        Got It
      </button>
    </div>
  </div>
);

const CodeAppliedPopup = ({ onClose, code }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 text-center">
      <h3 className="text-lg font-semibold mb-4 text-green-600">Coupon Applied!</h3>
      <p className="text-gray-600 mb-4">
        Coupon code <span className="font-bold">{code}</span> has been successfully applied to your
        order.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-[#800000] text-white py-2 font-medium uppercase hover:bg-[#600000] transition"
      >
        Continue Shopping
      </button>
    </div>
  </div>
);

// --- B2B CART ITEM COMPONENT ---
const B2BCartItem = ({ item, onRemove, onQuantityChange, onEdit, updatingItemId, role }) => {
  const variants = item.variants || [];
  const [showFullDescription, setShowFullDescription] = useState(false);
  const isUpdating = updatingItemId === item.uniqueId;

  return (
    <div
      className="border border-gray-200 p-6 mb-4 bg-white relative"
      style={{
        width: "619px",
        borderRadius: "0px",
      }}
    >
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
            <p className="text-sm text-gray-600 mt-2">Updating...</p>
          </div>
        </div>
      )}

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

          {/* Product Description */}
          <div className="mb-1">
            <p
              className={`text-[12px] text-gray-600 lowercase leading-tight ${showFullDescription ? "" : "line-clamp-2"
                }`}
            >
              {item.description || "Product description unavailable"}
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
          <p className="text-[11px] text-red-600 font-medium mb-1">MINIMUM: 6 PIECES PER VARIANT</p>
          <p className="text-[11px] text-gray-600">ESTIMATED SHIPPING DATE: 4TH OF NOVEMBER</p>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <p className="text-[16px] font-semibold text-gray-900 mb-2">
            ₹{(item.price || 0).toLocaleString()}
          </p>
          <div className="flex gap-3">
            <WishlistHeartButton
              productId={item.productId}
              productData={{
                name: item.name,
                price: item.price,
                image: item.image,
                description: item.description,
                variants: item.variants,
              }}
              className="hover:text-red-500 text-gray-400"
              disabled={isUpdating}
              userRole={role}
              userId={auth.currentUser?.uid}
            />
            <button
              onClick={() => onRemove(item.uniqueId)}
              className="hover:text-red-500 text-gray-400"
              disabled={isUpdating}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Variants */}
      {variants.length > 0 && (
        <div className="space-y-2 mb-4">
          {variants.map((variant, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between relative"
              style={{ borderRadius: "0px" }}
            >
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

              <div
                className="flex items-center border border-gray-300 bg-white flex-shrink-0 relative"
                style={{ borderRadius: "0px" }}
              >
                {isUpdating && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#800000]"></div>
                  </div>
                )}
                <button
                  onClick={() => onQuantityChange(item.uniqueId, -1, idx)}
                  className="px-2 py-1 text-[14px] hover:bg-gray-100 text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={variant.quantity <= 6 || isUpdating}
                >
                  <Minus className="w-4 h-4 cursor-pointer" />
                </button>
                <span className="px-3 text-[14px] font-medium">
                  {variant.quantity < 10 ? `0${variant.quantity}` : variant.quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(item.uniqueId, 1, idx)}
                  className="px-2 py-1 text-[14px] hover:bg-gray-100 text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  <Plus className="w-4 h-4 text-[14px] cursor-pointer" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROW 3: Edit Button */}
      <button
        className="flex items-center gap-2 px-3 py-2 border border-gray-800 hover:bg-gray-50 transition text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderRadius: "0px" }}
        onClick={() => onEdit(item)}
        disabled={isUpdating}
      >
        <Edit2 className="w-3 h-3" />
        <span>Edit</span>
      </button>
    </div>
  );
};

// --- MINIMUM QUANTITY POPUP ---
const MinimumQuantityPopup = ({ onClose, onRemove, itemName, variant }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
    <div className="bg-white p-6 shadow-xl max-w-md w-full">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Minimum Quantity Required</h2>
      </div>

      <p className="text-gray-600 mb-4 text-center">
        For B2B orders, minimum quantity per variant is <strong>6 pieces</strong>.
      </p>

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Item: {itemName}</p>
        <p className="text-sm text-gray-600">
          Variant: {variant.color} | Size: {variant.size}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Current Quantity: <span className="font-semibold">{variant.currentQuantity}</span>
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#800000] text-white font-medium hover:bg-[#600000] transition"
        >
          Keep Minimum 6 Pieces
        </button>

        <button
          onClick={onRemove}
          className="w-full py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          Remove This Variant
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN CART PAGE COMPONENT ---
function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [rawCart, setRawCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [useFirestore, setUseFirestore] = useState(false);

  const [isGift, setIsGift] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [showCodeApplied, setShowCodeApplied] = useState(false);
  const [showBulkPopup, setShowBulkPopup] = useState(false);
  const [bulkProduct, setBulkProduct] = useState(null);

  const [showMinQuantityPopup, setShowMinQuantityPopup] = useState(false);
  const [minQuantityItem, setMinQuantityItem] = useState(null);

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const deliveryDate = getEstimatedDeliveryDate();

  const fontStyles = "font-[Outfit,sans-serif] , uppercase";

  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setRole("B2C");
          return;
        }

        const userData = await B2BAuthService.getUserById(user.uid);
        const userRole = userData?.data?.role || "B2C";
        setRole(userRole);
      } catch (error) {
        console.error("🛒 [Cart] Error getting user role:", error);
        setRole("B2C");
      }
    };
    getUserRole();
    const unsubscribe = auth.onAuthStateChanged(getUserRole);
    return () => unsubscribe();
  }, []);

  // Cart loading useEffect
  useEffect(() => {
    let unsubscribe;

    const loadCart = async () => {
      const user = auth.currentUser;
      setLoading(true);

      if (!user) {
        const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        setRawCart(guestCart);
        const simplified = simplifyCart(guestCart);
        setCartItems(simplified);
        setLoading(false);
        setUseFirestore(false);
        return;
      }

      try {
        unsubscribe = await cartService.subscribeToCart((cartData) => {
          setRawCart(cartData);
          const simplified = simplifyCart(cartData);
          setCartItems(simplified);
          setLoading(false);
          setUseFirestore(true);
        });
      } catch (error) {
        console.error("🛒 [Cart] Error subscribing to cart:", error);
        const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        setRawCart(guestCart);
        const simplified = simplifyCart(guestCart);
        setCartItems(simplified);
        setLoading(false);
        setUseFirestore(false);
      }
    };

    loadCart();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [role]);

  // Enhanced simplifyCart function
  const simplifyCart = (items) => {
    const simplified = [];

    items.forEach((item, index) => {
      // Check for B2B indicators
      const hasB2BFlag = item.isB2BVariant === true;
      const hasB2BFlag2 = item.b2bItem === true;
      const hasVariantsArray = item.variants && Array.isArray(item.variants);
      const hasVariantsData = hasVariantsArray && item.variants.length > 0;
      const hasVariantStructure =
        hasVariantsData && item.variants.some((v) => v && v.color && v.size);

      // B2B Item Detection Logic
      const isB2BItem =
        hasB2BFlag || hasB2BFlag2 || (hasVariantsArray && hasVariantsData && hasVariantStructure);

      if (isB2BItem) {
        // Process as B2B item
        const b2bItem = {
          uniqueId: item.productId || item.id || `b2b-${index}-${Date.now()}`,
          productId: item.productId || item.id,
          name: item.name || item.title || "Unknown B2B Product",
          price: Number(item.price) || 0,
          image: item.imageUrls?.[0] || item.image || item.imageUrl || "/placeholder.jpg",
          description: item.description || "",
          isB2BVariant: true,
          variants: item.variants || [],
          totalQuantity:
            item.totalQuantity ||
            (item.variants ? item.variants.reduce((sum, v) => sum + (v.quantity || 1), 0) : 0),
          rawItem: item,
        };
        simplified.push(b2bItem);
      } else {
        // Process as B2C item
        const b2cItem = {
          uniqueId: item.productId || item.id || `b2c-${index}-${Date.now()}`,
          productId: item.productId || item.id,
          name: item.name || item.title || "Unknown Product",
          price: Number(item.price) || 0,
          image: item.imageUrls?.[0] || item.image || item.imageUrl || "/placeholder.jpg",
          description: item.description || "",
          color: item.color || item.selectedColors?.[0] || "Default",
          size: item.size || item.selectedSizes?.[0] || "M",
          quantity: item.quantity || 1,
          isB2BVariant: false,
          rawItem: item,
        };
        simplified.push(b2cItem);
      }
    });

    return simplified;
  };

  // Remove item functionality
  const handleRemove = async (uniqueId) => {
    const itemToRemove = cartItems.find((i) => i.uniqueId === uniqueId);
    if (!itemToRemove) return;

    const user = auth.currentUser;

    try {
      if (!user) {
        let guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        guestCart = guestCart.filter((p) => (p.productId || p.id) !== itemToRemove.productId);
        sessionStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setRawCart(guestCart);
        setCartItems(simplifyCart(guestCart));
        toast.success("Item removed from cart");
        return;
      }

      await cartService.removeFromCart(itemToRemove.productId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  // Quantity change with B2B bulk functionality
  const handleQuantityChange = async (uniqueId, delta, variantIndex = null) => {
    if (updatingItemId) return;

    const item = cartItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;

    const user = auth.currentUser;

    if (role === "B2B" && item.isB2BVariant && variantIndex !== null) {
      const variant = item.variants[variantIndex];
      const newQty = variant.quantity + delta;

      if (delta < 0 && newQty < 6) {
        setMinQuantityItem({
          itemName: item.name,
          variant: {
            color: variant.color,
            size: variant.size,
            currentQuantity: variant.quantity,
          },
        });
        setShowMinQuantityPopup(true);
        return;
      }
    }

    try {
      setUpdatingItemId(uniqueId);

      if (!user) {
        let guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");

        if (item.isB2BVariant && variantIndex !== null) {
          // B2B variant quantity update
          const productIndex = guestCart.findIndex((p) => (p.productId || p.id) === item.productId);
          if (productIndex !== -1) {
            const currentQty = guestCart[productIndex].variants[variantIndex].quantity;
            const newQty = Math.max(6, currentQty + delta); // Enforce minimum 6

            if (newQty >= 5) {
              setBulkProduct(item.rawItem);
              setShowBulkPopup(true);
            }

            guestCart[productIndex].variants[variantIndex].quantity = newQty;

            // Update total quantity
            guestCart[productIndex].totalQuantity = guestCart[productIndex].variants.reduce(
              (sum, v) => sum + v.quantity,
              0
            );
          }
        } else if (!item.isB2BVariant) {
          // B2C item quantity update
          const itemIndex = guestCart.findIndex((p) => (p.productId || p.id) === item.productId);
          if (itemIndex !== -1) {
            const currentQty = guestCart[itemIndex].quantity || 1;
            const newQty = Math.max(1, currentQty + delta);

            if (newQty >= 5) {
              setBulkProduct(item.rawItem);
              setShowBulkPopup(true);
            }

            guestCart[itemIndex].quantity = newQty;
          }
        }

        sessionStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setRawCart(guestCart);
        setCartItems(simplifyCart(guestCart));
        return;
      }

      // For logged-in users with Firestore
      if (useFirestore && user) {
        if (item.isB2BVariant && variantIndex !== null) {
          // Update B2B variant quantity in Firestore
          const variant = item.rawItem.variants[variantIndex];
          const newQty = Math.max(6, variant.quantity + delta); // Enforce minimum 6

          await cartService.updateB2BVariantQuantity(
            item.productId,
            variant.color,
            variant.size,
            newQty
          );
        } else if (!item.isB2BVariant) {
          // Update B2C item quantity in Firestore
          await cartService.updateCartItemQuantity(item.productId, item.quantity + delta);
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Edit B2B item
  const handleEditItem = (item) => {
    sessionStorage.setItem(
      "editingCartItem",
      JSON.stringify({
        ...item.rawItem,
        cartUniqueId: item.uniqueId,
      })
    );
    navigate(`/products/${item.productId}`);
  };

  // Size change for B2C items
  const handleSizeChange = async (uniqueId, newSize) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        let guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        const itemIndex = guestCart.findIndex((p) => (p.productId || p.id) === uniqueId);

        if (itemIndex !== -1) {
          guestCart[itemIndex].size = newSize;
          sessionStorage.setItem("guest_cart", JSON.stringify(guestCart));
          setRawCart(guestCart);
          setCartItems(simplifyCart(guestCart));
        }
        return;
      }

      if (useFirestore) {
        console.log("Size change for logged-in user not implemented yet");
      }
    } catch (error) {
      console.error("Error updating size:", error);
      toast.error("Failed to update size");
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      if (item.isB2BVariant) {
        return sum + item.price * (item.totalQuantity || 0);
      } else {
        return sum + item.price * (item.quantity || 1);
      }
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = subtotal * 0.12; // In real app, this should come from a DiscountService
  const shipping = cartItems.length > 0 ? 0 : 0; // In real app, this should come from ShippingService
  const total = subtotal - discount + shipping;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    navigate("/checkout", {
      state: {
        cartItems: rawCart,
        role: role,
      },
    });
  };

  // Handle coupon apply
  const handleApplyCoupon = () => {
    if (!couponCode) {
      alert("Please enter a coupon code.");
      return;
    }
    setAppliedCoupon(couponCode.toUpperCase());
    setShowCodeApplied(true);
    setCouponCode("");
    toast.success("Coupon applied successfully!");
  };

  const handleRemoveVariant = async (uniqueId, variantIndex) => {
    const item = cartItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;

    const user = auth.currentUser;

    try {
      if (!user) {
        let guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        const productIndex = guestCart.findIndex((p) => (p.productId || p.id) === item.productId);

        if (productIndex !== -1) {
          guestCart[productIndex].variants.splice(variantIndex, 1);

          if (guestCart[productIndex].variants.length === 0) {
            guestCart.splice(productIndex, 1);
          } else {
            guestCart[productIndex].totalQuantity = guestCart[productIndex].variants.reduce(
              (sum, v) => sum + v.quantity,
              0
            );
          }
        }

        sessionStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setRawCart(guestCart);
        setCartItems(simplifyCart(guestCart));
        toast.success("Variant removed from cart");
      } else {
        console.log("Variant removal for logged-in user not implemented yet");
      }
    } catch (error) {
      console.error("Error removing variant:", error);
      toast.error("Failed to remove variant");
    } finally {
      setShowMinQuantityPopup(false);
    }
  };

  // B2C Cart Item Render
  const renderB2CItem = (item) => {
    const isUpdating = updatingItemId === item.uniqueId;

    return (
      <div
        key={item.uniqueId}
        className="flex p-4 sm:p-5 md:p-6 border border-black relative mx-0"
        style={{ borderRadius: "0px" }}
      >
        {/* Heart and X icons - top right corner */}
        <div className="absolute top-3 right-3 flex gap-3 z-10">
          <WishlistHeartButton
            productId={item.productId}
            productData={{
              name: item.name,
              price: item.price,
              image: item.image,
              color: item.color,
              size: item.size,
              description: item.description,
            }}
            className="hover:text-red-500 text-gray-400"
            disabled={isUpdating}
            userRole={role}
            userId={auth.currentUser?.uid}
          />
          <button
            onClick={() => handleRemove(item.uniqueId)}
            className="hover:text-red-500 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove from Cart"
            disabled={isUpdating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Image - left side */}
        <img
          src={item.image}
          alt={item.name}
          className="w-[100px] h-[130px] sm:w-[120px] sm:h-[150px] object-cover flex-shrink-0"
        />

        {/* Product Details - right side */}
        <div className="flex-1 flex flex-col justify-between ml-3 sm:ml-4 pr-8">
          <div>
            {/* Product Name */}
            <h2 className="font-[Outfit,sans-serif] font-semibold text-[13px] sm:text-[15px] leading-tight tracking-[0.27px] uppercase text-[#000000] line-clamp-2">
              {item.name}
            </h2>

            {/* Product Description */}
            <p className="text-[11px] sm:text-[13px] text-gray-600 capitalize pt-1 line-clamp-2">
              {item.description}
            </p>

            {/* Product Code */}
            <p className="text-[10px] sm:text-[12px] text-gray-600 mt-2 uppercase">
              CODE: {item.productId || "SUSC0425127"}
            </p>
          </div>

          {/* Size and Quantity controls */}
          <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap">
            {/* Size Selector */}
            <div className="flex items-center border border-gray-300 px-2 sm:px-3 py-1 sm:py-1.5">
              <span className="text-[11px] sm:text-[13px] text-gray-700 mr-1 sm:mr-2">Size :</span>
              <select
                value={item.size || "S"}
                onChange={(e) => handleSizeChange(item.uniqueId, e.target.value)}
                className="appearance-none bg-transparent border-none p-0 text-[11px] sm:text-[13px] font-medium text-black focus:outline-none focus:ring-0 cursor-pointer pr-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0 center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1em 1em",
                }}
                disabled={isUpdating}
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Control */}
            <div className="flex items-center border border-gray-300 relative">
              {isUpdating && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center"></div>
              )}
              <button
                onClick={() => handleQuantityChange(item.uniqueId, -1)}
                disabled={item.quantity <= 1 || isUpdating}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 ${item.quantity <= 1 || isUpdating
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100 text-amber-700"
                  }`}
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              <span className="px-2 sm:px-3 text-[12px] sm:text-[14px] font-medium min-w-[30px] sm:min-w-[40px] text-center">
                {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(item.uniqueId, 1)}
                disabled={item.quantity >= 5 || isUpdating}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 ${item.quantity >= 5 || isUpdating
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100 text-amber-700"
                  }`}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Shipping Date */}
          <p className="text-[10px] sm:text-[12px] text-gray-600 mt-2 uppercase">
            ESTIMATED SHIPPING DATE : {deliveryDate.toUpperCase()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 mt-40">
        Loading your cart...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white py-1 lg:py-4">
        <div className="max-w-[1166px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* --- LEFT COLUMN --- */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1
                  className={`${fontStyles} font-outfit font-medium text-[10px] leading-[24px] tracking-[0.02em] md:text-[22px]`}
                >
                  Your Shopping <span>Cart</span>
                </h1>

                {/* <p className="text-sm text-gray-600 mt-2">
                  {role === "B2B" ? "B2B Bulk Order Cart" : "B2C Shopping Cart"}
                </p> */}
              </div>

              <div>
                {cartItems.length === 0 ? (
                  <p className="text-gray-600 text-center py-10">Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => {
                    // B2B Users see B2B design for B2B items
                    if (role === "B2B" && item.isB2BVariant === true) {
                      return (
                        <B2BCartItem
                          key={item.uniqueId}
                          item={item}
                          onRemove={handleRemove}
                          onQuantityChange={handleQuantityChange}
                          onEdit={handleEditItem}
                          updatingItemId={updatingItemId}
                        />
                      );
                    } else {
                      // B2C users OR B2B users with simple items see B2C design
                      return renderB2CItem(item);
                    }
                  })
                )}
              </div>

              <div className="mt-8">
                <div className="bg-orange-50 p-4 text-center rounded-sm">
                  <p className="font-medium text-[14px] text-red-700">
                    SHOP FOR <span className="font-bold">₹19,229 MORE</span> AND GET FLAT{" "}
                    <span className="font-bold">₹10,000 OFF!</span> USE COUPON CODE{" "}
                    <span className="font-bold">SHOPMORE175K</span>
                  </p>
                </div>

                <ul className="list-disc list-inside space-y-2 mt-6 text-gray-600 font-[Outfit,sans-serif] font-normal text-[12px] leading-[18px] tracking-[0.27px] lowercase">
                  <li>once your order has been placed no subsequent changes can be made in it.</li>
                  <li>shipping cost may vary depending on the delivery destination.</li>
                  <li>
                    please check the final amount on the order summary page before completing the
                    payment.
                  </li>
                </ul>

                <div className="flex flex-col items-start gap-4 mt-6 sm:flex-row sm:items-center sm:gap-6">
                  <a
                    href="#"
                    className="font-[Outfit,sans-serif] text-[14px] font-medium uppercase text-gray-800 hover:text-black"
                  >
                    Shipping Policy
                  </a>
                  <a
                    href="#"
                    className="font-[Outfit,sans-serif] text-[14px] font-medium uppercase text-gray-800 hover:text-black"
                  >
                    Help
                  </a>
                  <a
                    href="#"
                    className="font-[Outfit,sans-serif] text-[14px] font-medium uppercase text-gray-800 hover:text-black"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div>
              <div className="mb-6">
                <h2 className="font-[Outfit,sans-serif] text-[18px] font-medium uppercase tracking-[0.27px] text-[#000]">
                  Cart Summary
                </h2>
              </div>
              <div className="h-fit space-y-6">
                <div className="border border-gray-300 rounded-sm p-4 space-y-3">
                  <div className="flex justify-between text-[15px]">
                    <span className="font-medium">Cart Total</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="font-medium">Total Discount</span>
                    <span className="text-[#000] font-medium">
                      (–) ₹{discount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-[15px]">
                      <span className="font-medium">Shipping</span>
                      <span className="font-medium">₹{shipping}</span>
                    </div>
                    <p className="text-[13px] text-gray-600 mt-1">
                      Shipping Charges To Be Calculated On Checkout
                    </p>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-sm p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="giftItem"
                      checked={isGift}
                      onChange={() => setIsGift(!isGift)}
                      className="h-4 w-4 text-gray-700 border-gray-400 rounded-sm focus:ring-offset-0 focus:ring-0"
                    />
                    <label htmlFor="giftItem" className="text-[15px] font-medium text-gray-800">
                      This is a gift item
                    </label>
                  </div>
                  <button
                    onClick={() => setShowGiftPopup(true)}
                    className="text-[14px] text-gray-600 hover:text-primary hover:border-b hover:border-primary transition-all duration-200"
                  >
                    (Know More)
                  </button>
                </div>

                <div>
                  <h3 className="font-[Outfit,sans-serif] text-[14px] font-medium uppercase tracking-[0.27px] text-[#000] mb-4">
                    Coupon Code
                  </h3>
                  <div className="flex flex-col sm:flex-row">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter Coupon Code"
                      className="flex-1 border border-gray-300 rounded-sm sm:rounded-l-sm sm:rounded-r-none p-3 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[#33022F] text-white py-[10px] px-6 font-[Outfit] font-medium uppercase tracking-[0px] rounded-sm sm:rounded-r-sm sm:rounded-l-none text-[14px] leading-[15.14px] mt-2 sm:mt-0"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-[Outfit,sans-serif] text-[14px] font-medium uppercase text-[#000]">
                      Total Payable
                    </span>
                    <span className="font-[Outfit,sans-serif] text-[24px] font-semibold text-[#000]">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                  <hr className="border-gray-300 mt-4" />
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#33022F] text-white py-[15px] font-[Outfit] font-medium uppercase tracking-[0px] text-[14px] leading-[15.14px]"
                  >
                    Proceed To Checkout
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full border border-[#33022F] text-[#33022F] py-[15px] font-[Outfit] font-medium uppercase tracking-[0px]  hover:bg-gray-50 transition text-[14px] leading-[15.14px]"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-8">
            <section className="mt-16">
              <div>
                <TrendingProducts
                  column={6}
                  onClose={() => { }}
                  heading="Trending Products"
                  cardSize="small"
                />
              </div>
            </section>

            <section className="mt-16">
              <div>
                <RecentlyViewedProducts
                  column={6}
                  onClose={() => { }}
                  heading="Recently Viewed"
                  cardSize="small"
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showGiftPopup && <GiftPopup onClose={() => setShowGiftPopup(false)} />}
      {showCodeApplied && (
        <CodeAppliedPopup onClose={() => setShowCodeApplied(false)} code={appliedCoupon} />
      )}

      {/* Minimum Quantity Warning Popup */}
      {showMinQuantityPopup && minQuantityItem && (
        <MinimumQuantityPopup
          onClose={() => setShowMinQuantityPopup(false)}
          onRemove={() => {
            // Find the item and variant index to remove
            const item = cartItems.find((i) => i.name === minQuantityItem.itemName);
            if (item) {
              const variantIndex = item.variants.findIndex(
                (v) =>
                  v.color === minQuantityItem.variant.color &&
                  v.size === minQuantityItem.variant.size
              );
              if (variantIndex !== -1) {
                handleRemoveVariant(item.uniqueId, variantIndex);
              }
            }
          }}
          itemName={minQuantityItem.itemName}
          variant={minQuantityItem.variant}
        />
      )}

      {/* Bulk Order Popup */}
      {showBulkPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[200] p-4">
          <div className="bg-white p-6 shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-3">Order in Bulk for More Discounts!</h2>
            <p className="text-sm text-gray-600 mb-5">
              You selected <strong>{bulkProduct?.name}</strong> with high quantity. Bulk buyers get
              special discounted pricing.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowBulkPopup(false)}
                className="flex-1 py-2 border border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBulkPopup(false);
                  navigate("/b2bhome");
                }}
                className="flex-1 py-2 bg-[#33022F] text-white"
              >
                Go to Bulk Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CartPage;
