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
const B2BCartItem = ({ item, onRemove, onQuantityChange, onEdit, updatingItemId, role, isSelected, onToggleSelect }) => {
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
        {/* Checkbox for selection */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.uniqueId)}
          className="mt-1 w-5 h-5 text-[#800000] border-gray-300 rounded focus:ring-[#800000] cursor-pointer flex-shrink-0"
        />

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
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected items for checkout

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

  // Auto-select all items when cart loads
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItems(new Set(cartItems.map(item => item.uniqueId)));
    }
  }, [cartItems]);


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

  // Calculate totals (only for selected items)
  const calculateSubtotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.uniqueId)) // Only selected items
      .reduce((sum, item) => {
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
    if (selectedItems.size === 0) {
      alert("Please select at least one item to checkout!");
      return;
    }

    // Filter rawCart to include only selected items
    const selectedCartItems = rawCart.filter(item =>
      selectedItems.has(item.productId || item.id)
    );

    navigate("/checkout", {
      state: {
        cartItems: selectedCartItems, // Only selected items
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

  // Toggle individual item selection
  const handleToggleSelect = (uniqueId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uniqueId)) {
        newSet.delete(uniqueId);
      } else {
        newSet.add(uniqueId);
      }
      return newSet;
    });
  };

  // Select/deselect all items
  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set()); // Deselect all
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.uniqueId))); // Select all
    }
  };


  // B2C Cart Item Render
  const renderB2CItem = (item) => {
    const isUpdating = updatingItemId === item.uniqueId;

    return (
      <div
        key={item.uniqueId}
        className="flex gap-4 py-6 border-b border-gray-100 last:border-0 relative"
      >
        {/* Product Image */}
        <div className="w-[100px] h-[120px] flex-shrink-0 bg-gray-50">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide leading-tight mb-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 capitalize mb-3">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Color:</span>
                <span className="font-medium">{item.color}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Size:</span>
                <span className="font-medium">{item.size}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            {/* Quantity Control */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-sm">
                <button
                  onClick={() => handleQuantityChange(item.uniqueId, -1)}
                  disabled={item.quantity <= 1 || isUpdating}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="w-8 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-200">
                  {item.quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(item.uniqueId, 1)}
                  disabled={item.quantity >= 5 || isUpdating}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Price & Actions (Right Side) */}
        <div className="flex flex-col items-end justify-between ml-4">
          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 cursor-pointer text-gray-400 hover:text-red-500 transition-colors group">
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
                className="!w-5 !h-5 text-gray-400 group-hover:text-red-500"
                disabled={isUpdating}
                userRole={role}
                userId={auth.currentUser?.uid}
              />
              <span className="text-xs text-gray-500 group-hover:text-red-500 hidden sm:inline">Save for later</span>
            </div>

            <button
              onClick={() => handleRemove(item.uniqueId)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              disabled={isUpdating}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Price */}
          <div className="font-bold text-lg text-gray-900">
            ₹{(item.price || 0).toLocaleString()}
          </div>
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
      <div className="min-h-screen bg-white font-[Outfit,sans-serif]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 font-medium text-sm hover:underline gap-1"
            >
              <span>&larr;</span> Continue Shopping
            </button>
          </div>

          {/* Heading */}
          <h1 className="text-[28px] font-bold text-gray-900 mb-8">
            Shopping Cart ({cartItems.length} items)
          </h1>

          {/* Main Grid: 2 Cols for Items (Left), 1 Col for Summary (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* LEFT COLUMN: Cart Items */}
            <div className="lg:col-span-8">

              {/* Welcome Banner */}
              <div className="bg-[#FFF9E6] p-4 flex items-center justify-between mb-8 rounded-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👋</span>
                  <div>
                    <p className="text-gray-900 font-bold mb-0.5">Welcome Offer - Get 15% OFF</p>
                    <p className="text-sm text-gray-600">Use code <span className="font-bold text-black">WELCOME15</span> on your first purchase</p>
                  </div>
                </div>
                <button onClick={() => { setCouponCode("WELCOME15"); handleApplyCoupon(); }} className="bg-[#3D0C2E] text-white px-6 py-2 text-sm font-medium rounded-sm hover:bg-[#2a0820] transition">
                  Apply Now
                </button>
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button onClick={() => navigate("/")} className="text-[#800000] font-medium hover:underline">Start Shopping</button>
                </div>
              ) : (
                <div className="bg-white">
                  {cartItems.map((item) => {
                    if (role === "B2B" && item.isB2BVariant === true) {
                      return (
                        <B2BCartItem
                          key={item.uniqueId}
                          item={item}
                          onRemove={handleRemove}
                          onQuantityChange={handleQuantityChange}
                          onEdit={handleEditItem}
                          updatingItemId={updatingItemId}
                          role={role}
                          isSelected={selectedItems.has(item.uniqueId)}
                          onToggleSelect={handleToggleSelect}
                        />
                      );
                    } else {
                      return renderB2CItem(item);
                    }
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gray-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[#3D0C2E] text-white px-4 py-2 text-sm font-medium rounded-sm hover:bg-[#2a0820] transition"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3 pb-6 border-b border-gray-100">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tax (18% GST)</span>
                    <span className="font-medium text-gray-900">₹{(subtotal * 0.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">₹{(total + (subtotal * 0.18)).toLocaleString()}</span>
                </div>

                {/* Free Shipping Banner */}
                <div className="bg-[#eff6ff] text-blue-700 text-sm py-2 px-3 flex items-center gap-2 rounded-sm mb-6">
                  <span>🎉</span>
                  <span className="font-medium">You’re eligible for FREE shipping!</span>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={selectedItems.size === 0}
                    className="w-full bg-[#3D0C2E] text-white py-3.5 rounded-sm font-medium hover:bg-[#2a0820] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    className="w-full border border-gray-300 text-gray-700 py-3.5 rounded-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    {/* Share Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    Share Your Cart
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-2">
                    Estimated delivery: 5-7 business days
                  </p>
                </div>
              </div>
            </div>
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
