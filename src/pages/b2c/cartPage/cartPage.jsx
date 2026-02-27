import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { cartService } from "../../../services/cartService";
import { auth } from "../../../config";
import { toast } from "react-toastify";
import B2BAuthService from "../../../services/b2bAuthService";
import { Minus, Plus, X, Trash2, Heart, Share2, Copy } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTwitter, FaEnvelope } from "react-icons/fa";
import LazyImageLoader from "../../../components/b2c/LazyImageLoader/LazyImageLoader";

// --- COMPONENTS ---

const WelcomeBanner = () => (
  <div className="bg-[#FFF8E1] p-4 rounded-lg flex items-center justify-between mb-6 shadow-sm border border-[#FFE0B2]">
    <div className="flex items-center gap-3">
      <span className="text-2xl">🎉</span>
      <div>
        <p className="font-bold text-gray-900 text-sm">Free Shipping on All Orders!</p>
        <p className="text-xs text-gray-600 mt-0.5">No minimum order value • Delivered in 5-7 business days</p>
      </div>
    </div>
  </div>
);

const CartItemCard = ({ item, onRemove, onQuantityChange, onSizeChange }) => {
  // Mock Brand Name for demo matching image (In real app, this comes from product data)
  const brandName = item.brand || "VILLY FASHION";

  return (
    <div className="bg-white border border-gray-100 p-4 rounded-xl flex gap-6 mb-4 relative shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-32 h-40 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase mb-1">{brandName}</h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-md">{item.name}</p>

            <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Color: <span className="font-medium text-gray-900">{item.color || "N/A"}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span>Size:</span>
                <select
                  value={item.size}
                  onChange={(e) => onSizeChange(item.uniqueId, e.target.value)}
                  className="font-medium text-gray-900 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                >
                  {["XS", "S", "M", "L", "XL"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button className="text-gray-400 hover:text-[#33022F] flex items-center gap-1.5 text-xs font-medium transition-colors">
              <Heart size={16} /> Save for later
            </button>
            <button onClick={() => onRemove(item.uniqueId)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Quantity */}
          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={() => onQuantityChange(item.uniqueId, -1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 h-8 flex items-center justify-center font-medium text-sm text-gray-900">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.uniqueId, 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <p className="text-xl font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

const ShareCartModal = ({ isOpen, onClose, cartUrl }) => {
  if (!isOpen) return null;
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'qr'

  // Lock body scroll while modal is open, preserving current scroll position
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const originalStyle = document.body.style.cssText;
      document.body.style.cssText = `overflow: hidden; position: fixed; top: -${scrollY}px; left: 0; right: 0;`;

      return () => {
        document.body.style.cssText = originalStyle;
        window.scrollTo({ top: scrollY, behavior: "instant" });
      };
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-[Outfit]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up relative">
        {/* Header */}
        <div className="bg-[#33022F] p-4 flex items-center justify-center relative">
          <h3 className="text-white text-lg font-bold">Share Your Cart</h3>
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="bg-[#33022F] w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-[#33022F]/10">
            <Share2 className="text-white" size={28} />
          </div>
          <p className="text-gray-500 text-sm mb-6">Share your curated collection with friends and family</p>

          {/* Tabs */}
          <div className="flex w-full mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'link' ? 'bg-white text-[#33022F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('link')}
            >
              <Share2 size={14} className="inline mr-2" /> Share Link
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'qr' ? 'bg-white text-[#33022F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('qr')}
            >
              QR Code
            </button>
          </div>

          {activeTab === 'link' ? (
            <div className="w-full space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={cartUrl}
                  readOnly
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#33022F]"
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(cartUrl); toast.success("Link copied!"); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#33022F] rounded-md text-white hover:bg-[#5a0452] transition"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-left">Share Via</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(cartUrl)}`, '_blank')}
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:border-[#25D366] hover:text-[#25D366] hover:bg-green-50 transition"
                  >
                    <FaWhatsapp size={20} /> <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=Check out my Villy Cart&body=${encodeURIComponent(cartUrl)}`)}
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:border-gray-600 hover:text-gray-700 hover:bg-gray-50 transition"
                  >
                    <FaEnvelope size={18} /> <span className="text-sm font-medium">Email</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cartUrl)}`, '_blank')}
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-blue-50 transition"
                  >
                    <FaFacebook size={18} /> <span className="text-sm font-medium">Facebook</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(cartUrl)}`, '_blank')}
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:border-[#1DA1F2] hover:text-[#1DA1F2] hover:bg-sky-50 transition"
                  >
                    <FaTwitter size={18} /> <span className="text-sm font-medium">Twitter</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border-2 border-[#33022F]/10 shadow-inner flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(cartUrl)}&color=33022f`}
                alt="Cart QR Code"
                className="w-48 h-48"
              />
              <p className="text-xs text-gray-400 mt-4">Scan this QR code to view the cart</p>
            </div>
          )}

          <p className="text-[10px] text-gray-400 mt-6">Share link expires in 30 days • Recipients can view and copy items to their own cart</p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};


// --- MAIN PAGE ---

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("B2C");

  // State for Layout
  const [promoCode, setPromoCode] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const dummyShareUrl = `https://villy.com/shared-cart/${Date.now()}`;

  // --- LOGIC (Simplified from original for succinctness, keeping core functionality) ---

  // 1. Fetch User Role
  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userData = await B2BAuthService.getUserById(user.uid);
        setRole(userData?.data?.role || "B2C");
      }
    };
    checkRole();
  }, []);

  // 2. Load Cart
  // 2. Load Cart
  useEffect(() => {
    let unsubscribe;

    const loadCart = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
          setCartItems(formatCart(guestCart));
        } else {
          unsubscribe = await cartService.subscribeToCart((data) => {
            setCartItems(formatCart(data));
          });
        }
      } catch (error) {
        console.error("Cart load error:", error);
        const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        setCartItems(formatCart(guestCart));
      } finally {
        setLoading(false);
      }
    };

    loadCart();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, [role]);

  // Helper to standardise cart items
  const formatCart = (items) => {
    // Simplified formatter - creates flat list for UI
    return items.map(item => {
      // Flatten variants if necessary or take main properties
      const variant = item.variants?.[0] || {}; // Take first variant or item props
      return {
        uniqueId: item.uniqueId || item.productId || item.id,
        ...item,
        quantity: item.quantity || variant.quantity || 1,
        size: item.size || variant.size || "M",
        color: item.color || variant.color || "Default",
        // Ensure numeric price
        price: Number(item.price) || 0
      };
    });
  };

  const handleRemove = async (uniqueId) => {
    const item = cartItems.find(i => i.uniqueId === uniqueId);
    if (!item) return;

    const user = auth.currentUser;
    if (!user) {
      const newCart = cartItems.filter(i => i.uniqueId !== uniqueId);
      sessionStorage.setItem("guest_cart", JSON.stringify(newCart));
      setCartItems(newCart);
    } else {
      await cartService.removeFromCart(item.productId); // Assuming remove by ProductID
    }
    toast.success("Item removed");
  };

  const handleQuantity = async (uniqueId, delta) => {
    const newItems = cartItems.map(item => {
      if (item.uniqueId === uniqueId) {
        const newQty = Math.max(1, item.quantity + delta);
        // In real app, update DB/Session here
        // Simulating local update for UI responsiveness
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(newItems);

    // Update actual background storage (Simplified for demo)
    const user = auth.currentUser;
    const item = cartItems.find(i => i.uniqueId === uniqueId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      if (!user) {
        // Update session
        const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        const idx = guestCart.findIndex(g => g.id === item.productId || g.productId === item.productId);
        if (idx > -1) {
          guestCart[idx].quantity = newQty;
          sessionStorage.setItem("guest_cart", JSON.stringify(guestCart));
        }
      } else {
        // Update DB
        await cartService.updateCartItemQuantity(item.productId, newQty);
      }
    }
  };

  const handleSizeChange = (uniqueId, newSize) => {
    const newItems = cartItems.map(item => item.uniqueId === uniqueId ? { ...item, size: newSize } : item);
    setCartItems(newItems);
    // Add logic to persist size change if needed
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // FREE
  const tax = subtotal * 0.18; // 18% GST example
  const total = subtotal + shipping + tax;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LazyImageLoader isProcessing={true} size="page" />
    </div>
  );

  return (
    <div className="bg-[#f9f9f9] min-h-screen font-[Outfit] pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">

        {/* Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-[#33022F]">Home</Link> <span>&gt;</span> <span className="font-semibold text-[#33022F]">Cart</span>
          </div>
          <Link to="/womenwear" className="text-blue-500 font-medium text-sm hover:underline">← Continue Shopping</Link>
        </div>

        <h1 className="text-3xl font-extrabold text-[#33022F] mb-8">Shopping Cart ({cartItems.length} items)</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xl text-gray-500 mb-4">Your cart is empty.</p>
            <Link to="/womenwear" className="inline-block px-8 py-3 bg-[#33022F] text-white font-bold rounded-lg hover:bg-[#5a0452] transition">Start Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT COLUMN: Items */}
            <div className="flex-1">
              <WelcomeBanner />

              <div className="space-y-4">
                {cartItems.map(item => (
                  <CartItemCard
                    key={item.uniqueId}
                    item={item}
                    onRemove={handleRemove}
                    onQuantityChange={handleQuantity}
                    onSizeChange={handleSizeChange}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Summary */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-[#33022F] mb-6">Order Summary</h2>

                {/* Promo Code - Coming Soon */}
                <div className="mb-6">
                  <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coming soon"
                      disabled
                      className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Promo codes coming soon!</p>
                </div>

                {/* Costs */}
                <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (18% GST)</span>
                    <span className="font-medium text-gray-900">₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-[#33022F]">Total</span>
                  <span className="text-2xl font-extrabold text-[#33022F]">₹{total.toLocaleString()}</span>
                </div>

                {/* Free Shipping Banner */}
                <div className="bg-[#eef2ff] p-3 rounded-lg text-center mb-6">
                  <p className="text-xs font-medium text-indigo-800">🎉 You're eligible for FREE shipping!</p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-4 bg-[#33022F] text-white font-bold rounded-lg text-sm hover:bg-[#5a0452] transition shadow-lg hover:shadow-xl"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full py-3 bg-white border border-[#33022F] text-[#33022F] font-bold rounded-lg text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} /> Share Your Cart
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-4">Estimated delivery: 5-7 business days</p>

              </div>
            </div>
          </div>
        )}
      </div>

      <ShareCartModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        cartUrl={dummyShareUrl}
      />
    </div>
  );
}
