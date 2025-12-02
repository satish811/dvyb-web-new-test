import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartService } from "../../../services/cartService";
import { wishlistService } from "../../../services/wishlistService";
import { auth } from "../../../config";
import { toast } from "react-toastify";
import B2BAuthService from "../../../services/b2bAuthService";
import { Minus, Plus, X, Heart, Edit2, Trash2 } from "lucide-react";
import WishlistHeartButton from "../../../components/common/WishlistHeartButton";
import TrendingProducts from "../../../components/common/TrendingProducts/TrendingProducts";

// --- MOCK DATA FOR NEW SECTIONS ---
const trendingProducts = [
  {
    id: 1,
    name: "SURINO",
    description: "Mustard Chiniya Silk & Zari Embroidered Lehenga Set",
    price: 44900,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop",
  },
  {
    id: 2,
    name: "KANCHIVARAM",
    description: "Pink Weaving Silk Saree With Gold Zari Work",
    price: 35000,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop",
  },
  {
    id: 3,
    name: "ARANYA",
    description: "Embellished Black Printed Kurta Set",
    price: 19500,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop",
  },
  {
    id: 4,
    name: "RANGRAGE",
    description: "Embroidered Green Anarkali Suit With Dupatta",
    price: 18750,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop",
  },
  {
    id: 5,
    name: "MEERA",
    description: "Cherry Floral Print Anarkali With Belt",
    price: 24500,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop",
  },
  {
    id: 6,
    name: "KALYAN",
    description: "Traditional Banarasi Brocade Saree",
    price: 45000,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop",
  },
];

const recentlyViewedProducts = [...trendingProducts.slice(0, 6).reverse()];

// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({ product }) => (
  <div className="w-full h-[386px] flex flex-col space-y-3">
    <img src={product.image} alt={product.name} className="w-full h-[276px] object-cover" />
    <div className="flex flex-col space-y-2">
      <h3 className="font-[Outfit,sans-serif] font-medium text-[14px] tracking-[0.45px] uppercase">
        {product.name}
      </h3>
      <p className="font-[Outfit,sans-serif] font-normal text-[13px] leading-[100%]">
        {product.description}
      </p>
      <p className="font-[Outfit,sans-serif] font-medium text-[14px] pt-1">
        ₹{product.price.toLocaleString()}
      </p>
    </div>
  </div>
);

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
const B2BCartItem = ({ item, onRemove, onQuantityChange, onEdit }) => {
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
              className={`text-[12px] text-gray-600 lowercase leading-tight ${
                showFullDescription ? "" : "line-clamp-2"
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
            />
            <button
              onClick={() => onRemove(item.uniqueId)}
              className="hover:text-red-500 text-gray-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Variants - Color, Size, Quantity with +/- buttons */}
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

              {/* Right: Quantity Controls */}
              <div
                className="flex items-center border border-gray-300 bg-white flex-shrink-0"
                style={{ borderRadius: "0px" }}
              >
                <button
                  onClick={() => onQuantityChange(item.uniqueId, -1, idx)}
                  className="px-2 py-1 text-[14px] hover:bg-gray-100 text-amber-800"
                  disabled={variant.quantity <= 1}
                >
                  <Minus className="w-4 h-4 cursor-pointer" />
                </button>
                <span className="px-3 text-[14px] font-medium">
                  {variant.quantity < 10 ? `0${variant.quantity}` : variant.quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(item.uniqueId, 1, idx)}
                  className="px-2 py-1 text-[14px] hover:bg-gray-100 text-amber-800"
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

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const fontStyles =
    "font-[Outfit,sans-serif] font-medium uppercase tracking-[0.27px] leading-[100%] text-[#000]";

  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.log("🛒 [Cart] No user found, setting role to B2C");
          setRole("B2C");
          return;
        }

        const userData = await B2BAuthService.getUserById(user.uid);
        const userRole = userData?.data?.role || "B2C";
        console.log("🛒 [Cart] User role detected:", userRole);
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

      console.log("🛒 [Cart] ========== LOADING CART ==========");
      console.log("🛒 [Cart] User:", user);
      console.log("🛒 [Cart] User Role:", role);

      if (!user) {
        const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        console.log("🛒 [Cart] Loading guest cart from sessionStorage:", guestCart);
        console.log("🛒 [Cart] Guest cart items count:", guestCart.length);

        setRawCart(guestCart);
        const simplified = simplifyCart(guestCart);
        setCartItems(simplified);
        setLoading(false);
        setUseFirestore(false);
        return;
      }

      try {
        console.log("🛒 [Cart] Loading from Firestore...");
        unsubscribe = await cartService.subscribeToCart((cartData) => {
          console.log("🛒 [Cart] Firestore cart data received:", cartData);
          setRawCart(cartData);
          const simplified = simplifyCart(cartData);
          setCartItems(simplified);
          setLoading(false);
          setUseFirestore(true);
        });
      } catch (error) {
        console.error("🛒 [Cart] Error subscribing to cart:", error);
        const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        console.log("🛒 [Cart] Fallback to guest cart:", guestCart);
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

  // Enhanced simplifyCart function with detailed B2B detection
  const simplifyCart = (items) => {
    const simplified = [];
    console.log("🛒 [Cart] ========== SIMPLIFY CART START ==========");
    console.log("🛒 [Cart] Raw input items:", items);

    items.forEach((item, index) => {
      console.log(`🛒 [Cart] --- Processing Item ${index} ---`);
      console.log("🛒 [Cart] Full item:", item);
      console.log("🛒 [Cart] Item keys:", Object.keys(item));

      // Check for B2B indicators
      const hasB2BFlag = item.isB2BVariant === true;
      const hasB2BFlag2 = item.b2bItem === true;
      const hasVariantsArray = item.variants && Array.isArray(item.variants);
      const hasVariantsData = hasVariantsArray && item.variants.length > 0;
      const hasVariantStructure =
        hasVariantsData && item.variants.some((v) => v && v.color && v.size);
      const hasTotalQuantity = item.totalQuantity > 0;

      console.log("🛒 [Cart] B2B Detection Check:");
      console.log("  - isB2BVariant:", hasB2BFlag);
      console.log("  - b2bItem:", hasB2BFlag2);
      console.log("  - hasVariantsArray:", hasVariantsArray);
      console.log("  - hasVariantsData:", hasVariantsData);
      console.log("  - hasVariantStructure:", hasVariantStructure);
      console.log("  - hasTotalQuantity:", hasTotalQuantity);
      console.log("  - variants count:", item.variants?.length || 0);
      console.log("  - variants content:", item.variants);

      // B2B Item Detection Logic
      const isB2BItem =
        hasB2BFlag || hasB2BFlag2 || (hasVariantsArray && hasVariantsData && hasVariantStructure);

      console.log(`🛒 [Cart] Final Decision: isB2BItem = ${isB2BItem}`);

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

        console.log("🛒 [Cart] Created B2B Item:", b2bItem);
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

        console.log("🛒 [Cart] Created B2C Item:", b2cItem);
        simplified.push(b2cItem);
      }
    });

    console.log("🛒 [Cart] ========== SIMPLIFY CART RESULTS ==========");
    console.log("🛒 [Cart] Final simplified array:", simplified);
    console.log("🛒 [Cart] Total items:", simplified.length);

    const b2bItems = simplified.filter((item) => item.isB2BVariant);
    const b2cItems = simplified.filter((item) => !item.isB2BVariant);

    console.log("🛒 [Cart] B2B items count:", b2bItems.length);
    console.log("🛒 [Cart] B2B items:", b2bItems);
    console.log("🛒 [Cart] B2C items count:", b2cItems.length);
    console.log("🛒 [Cart] B2C items:", b2cItems);
    console.log("🛒 [Cart] ========== SIMPLIFY CART END ==========");

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

  // Move to Wishlist
  const handleMoveToWishlist = async (item) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to move items to your wishlist.");
      return;
    }

    try {
      const inWishlist = await wishlistService.isInWishlist(item.productId);

      if (!inWishlist) {
        const productData = {
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          size: item.size,
        };
        await wishlistService.toggleWishlist(item.productId, productData);
      }

      await handleRemove(item.uniqueId);
      toast.success("Moved to Wishlist");
    } catch (error) {
      console.error("Error moving to wishlist:", error);
      toast.error("Failed to move to wishlist");
    }
  };

  // Quantity change with B2B bulk functionality
  const handleQuantityChange = async (uniqueId, delta, variantIndex = null) => {
    if (updatingItemId) return;

    const item = cartItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;

    const user = auth.currentUser;

    try {
      setUpdatingItemId(uniqueId);

      if (!user) {
        let guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");

        if (item.isB2BVariant && variantIndex !== null) {
          // B2B variant quantity update
          const productIndex = guestCart.findIndex((p) => (p.productId || p.id) === item.productId);
          if (productIndex !== -1) {
            const currentQty = guestCart[productIndex].variants[variantIndex].quantity;
            const newQty = Math.max(1, currentQty + delta);

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
          await cartService.updateB2BVariantQuantity(
            item.productId,
            variant.color,
            variant.size,
            variant.quantity + delta
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
    console.log("🛒 [Cart] Editing B2B item:", item);
    sessionStorage.setItem(
      "editingCartItem",
      JSON.stringify({
        ...item.rawItem,
        cartUniqueId: item.uniqueId,
      })
    );
    navigate(`/product/${item.productId}`);
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

      // For logged-in users, implement Firestore update
      if (useFirestore) {
        console.log("Size change for logged-in user not implemented yet");
      }
    } catch (error) {
      console.error("Error updating size:", error);
      toast.error("Failed to update size");
    }
  };

  // Calculate totals with B2B support
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
  const discount = subtotal * 0.12;
  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal - discount + shipping;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    console.log("🛒 [Cart] Proceeding to checkout with:", { role, cartItems: rawCart });

    if (role === "B2B") {
      navigate("/checkout", {
        state: {
          cartItems: rawCart,
          role: role,
        },
      });
    } else {
      navigate("/checkout", {
        state: {
          cartItems: rawCart,
          role: role,
        },
      });
    }
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

  // B2C Cart Item Render
  const renderB2CItem = (item) => (
    <div
      key={item.uniqueId}
      className="flex flex-col md:flex-row p-4 sm:p-6 border border-[#A4A4A4]"
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-[120px] h-[150px] object-cover rounded-md flex-shrink-0"
      />
      <div className="flex-1 flex flex-col justify-between mt-4 md:mt-0 md:ml-4">
        <div>
          <h2 className="font-[Outfit,sans-serif] font-medium text-[16px] leading-[15px] tracking-[0.27px] uppercase text-[#000000]">
            {item.name}
          </h2>
          <p className="text-[14px] text-gray-600 capitalize pt-1">{item.description}</p>
          <p className="text-[14px] text-gray-600 mt-3 uppercase">
            CODE: {item.productId || "SUSC0425127"}
          </p>
          <div className="flex items-center gap-4 pt-3 flex-wrap">
            <div className="flex items-center border border-gray-300 rounded-sm px-3 py-1.5">
              <span className="text-[14px] text-gray-700 mr-2">Size :</span>
              <select
                value={item.size || "S"}
                onChange={(e) => handleSizeChange(item.uniqueId, e.target.value)}
                className="appearance-none bg-transparent border-none p-0 text-[14px] font-medium text-black focus:outline-none focus:ring-0 cursor-pointer pr-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.25rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.25em 1.25em",
                }}
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center border border-gray-300 rounded-sm">
              <button
                onClick={() => handleQuantityChange(item.uniqueId, -1)}
                disabled={item.quantity <= 1 || updatingItemId === item.uniqueId}
                className={`px-3 py-1.5 ${
                  item.quantity <= 1 || updatingItemId === item.uniqueId
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="px-4 text-[14px] font-medium min-w-[40px] text-center">
                {item.quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(item.uniqueId, 1)}
                disabled={item.quantity >= 5 || updatingItemId === item.uniqueId}
                className={`px-3 py-1.5 ${
                  item.quantity >= 5 || updatingItemId === item.uniqueId
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-[13px] text-gray-600 mt-2">ESTIMATED SHIPPING DATE: 4TH OF NOVEMBER</p>
      </div>
      <div className="flex flex-col justify-between items-start md:items-end mt-4 md:mt-0 md:ml-5">
        <p className="text-[18px] font-medium text-gray-900 text-left md:text-right">
          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
        </p>
        <div className="flex gap-5 mt-4 md:mt-0">
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
          />
          <button
            onClick={() => handleRemove(item.uniqueId)}
            className="hover:text-red-500 text-gray-400"
            title="Remove from Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 mt-40">
        Loading your cart...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white py-22 mt-15">
        <div className="max-w-[1166px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* --- LEFT COLUMN --- */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className={`${fontStyles} text-[20px] font-medium md:text-[22px]`}>
                  Your Shopping <span>Cart</span>
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  {role === "B2B" ? "B2B Bulk Order Cart" : "B2C Shopping Cart"}
                </p>
              </div>

              {/* <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm">
                  <strong>Debug Info:</strong> Role: <span className="font-mono">{role}</span> |
                  Cart Items: <span className="font-mono">{cartItems.length}</span> |
                  B2B Items: <span className="font-mono">{cartItems.filter(item => item.isB2BVariant).length}</span>
                </p>
              </div> */}

              <div>
                {cartItems.length === 0 ? (
                  <p className="text-gray-600 text-center py-10">Your cart is empty.</p>
                ) : (
                  cartItems.map((item, index) => {
                    console.log("🛒 [Cart Rendering] Item:", {
                      role,
                      itemId: item.uniqueId,
                      isB2BVariant: item.isB2BVariant,
                      name: item.name,
                      variants: item.variants,
                    });

                    // B2B Users see B2B design for B2B items
                    if (role === "B2B" && item.isB2BVariant === true) {
                      console.log("🛒 [Cart] Rendering as B2B item");
                      return (
                        <B2BCartItem
                          key={item.uniqueId}
                          item={item}
                          onRemove={handleRemove}
                          onQuantityChange={handleQuantityChange}
                          onEdit={handleEditItem}
                        />
                      );
                    } else {
                      // B2C users OR B2B users with simple items see B2C design
                      console.log("🛒 [Cart] Rendering as B2C item");
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
                      className="bg-[#800000] text-white py-[10px] px-6 font-[Outfit] font-medium uppercase tracking-[0px] rounded-sm sm:rounded-r-sm sm:rounded-l-none hover:bg-[#600000] transition text-[14px] leading-[15.14px] mt-2 sm:mt-0"
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
                    className="w-full bg-[#800000] text-white py-[15px] font-[Outfit] font-medium uppercase tracking-[0px]  hover:bg-[#600000] transition text-[14px] leading-[15.14px]"
                  >
                    Proceed To Checkout
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full border border-[#800000] text-[#800000] py-[15px] font-[Outfit] font-medium uppercase tracking-[0px]  hover:bg-gray-50 transition text-[14px] leading-[15.14px]"
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
                <TrendingProducts column={6} onClose={() => {}} heading="Trending Products" />
              </div>
            </section>

            <section className="mt-16">
              <div>
                <TrendingProducts column={6} onClose={() => {}} heading="Recently Viewed" />
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
                className="flex-1 py-2 bg-[#9C0000] text-white hover:bg-[#7A0000]"
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
