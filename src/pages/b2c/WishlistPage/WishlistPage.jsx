import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Trash2, ShoppingCart, Eye, Heart, ChevronDown } from "lucide-react";

// Contexts
import { usePopup } from "../../../context/ToastPopupContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";

// Services
import { wishlistService } from "../../../services/wishlistService";
import { cartService } from "../../../services/cartService";

// Assets
import empty_wishlistIc from "../../../assets/ProfileImages/empty_wishlistIc.png";
import LoginModal from "../login/loginModel";

// --- New Wishlist Card Component ---
const WishlistProductCard = ({ item, onAddToCart, onRemove, onEdit }) => {
  const navigate = useNavigate();
  // Mock badges for visual match (In real app, use item.stockStatus)
  // Randomly assign stock status if not present for demo visual fidelity
  const stockStatus = item.stockStatus || (Math.random() > 0.7 ? "Low Stock" : Math.random() > 0.9 ? "Out of Stock" : "In Stock");

  const getBadgeColor = (status) => {
    switch (status) {
      case "In Stock": return "bg-[#00D95F] text-white"; // Green
      case "Low Stock": return "bg-[#FFC107] text-black"; // Yellow
      case "Out of Stock": return "bg-gray-500 text-white"; // Gray
      default: return "bg-[#00D95F] text-white";
    }
  };

  const isOutOfStock = stockStatus === "Out of Stock";

  return (
    <div className="group w-full flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
        {/* Badge */}
        <div className={`absolute top-2 left-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getBadgeColor(stockStatus)}`}>
          {stockStatus}
        </div>

        {/* Product Image */}
        <img
          src={item.image || item.imageUrls?.[0] || "/placeholder.jpg"}
          alt={item.name}
          className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-105"
        />

        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(item.productId || item.id); }}
            className="w-10 h-10 bg-[#33022F] rounded-full flex items-center justify-center text-white hover:bg-[#5a0452] transition transform hover:scale-110 shadow-lg"
            title="Remove from Wishlist"
          >
            <Heart size={18} fill="white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
            disabled={isOutOfStock}
            className={`w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:text-[#33022F] transition transform hover:scale-110 shadow-lg ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
          <button
            onClick={() => navigate(`/products/${item.productId || item.id}`)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:text-[#33022F] transition transform hover:scale-110 shadow-lg"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide truncate">
          {item.name}
        </h3>
        <p className="text-sm font-bold text-gray-900">
          ₹{item.price?.toLocaleString()}
          {item.mrp && item.mrp > item.price && (
            <span className="text-xs text-gray-400 line-through ml-2 font-normal">₹{item.mrp.toLocaleString()}</span>
          )}
        </p>

        {/* Colors Swatches (Mock/Real) */}
        <div className="flex gap-1 pt-1 h-3">
          {/* If item has variants with color, map them. Else default */}
          {(item.variants && item.variants.length > 0) ? (
            item.variants.slice(0, 3).map((v, i) => (
              <div key={i} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: v.color || '#33022F' }} title={v.color}></div>
            ))
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-[#FFD700]"></div>
              <div className="w-3 h-3 rounded-full bg-[#33022F]"></div>
            </>
          )}
        </div>
      </div>

      {/* Add To Cart Button (Bottom) */}
      <button
        onClick={() => onAddToCart(item)}
        disabled={isOutOfStock}
        className={`mt-4 w-full py-2.5 border border-[#33022F] text-[#33022F] font-medium text-xs uppercase tracking-wider hover:bg-[#33022F] hover:text-white transition-colors duration-300 ${isOutOfStock ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400 hover:bg-transparent hover:text-gray-400' : ''}`}
      >
        {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
      </button>

    </div>
  );
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const [userRole, setUserRole] = useState("B2C");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sortBy, setSortBy] = useState("recently-added");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Safe popup access
  const popupContext = usePopup();
  const showPopup = popupContext?.showPopup;

  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await wishlistService.getCurrentUserRole();
        setUserRole(role);
      } catch (error) {
        console.error("Error getting user role:", error);
        setUserRole("B2C");
      }
    };

    if (user) {
      getUserRole();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortDropdown]);

  const handleRemoveItem = async (productId) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        toast.success("Item removed from wishlist");
      } else {
        toast.error("Failed to remove item.");
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      let result;

      // Logic for B2B Items (with variants)
      if ((userRole === "B2B" || item.isB2B) && item.variants && item.variants.length > 0) {
        result = await cartService.addToCart(
          item.productId || item.id,
          {
            name: item.name || item.productName,
            price: item.price || 0,
            image: item.image || item.imageUrls?.[0],
            description: item.description,
          },
          item.variants
        );
      } else {
        // Logic for B2C Items
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
          firstVariant.quantity || item.quantity || 1
        );
      }

      if (result === true) {
        await removeFromWishlist(item.productId || item.id);
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

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) return;

    const confirm = window.confirm("Are you sure you want to move all items to cart?");
    if (!confirm) return;

    let addedCount = 0;
    for (const item of wishlistItems) {
      // Check stock logic if needed
      await handleAddToCart(item); // Note: this removes from wishlist one by one inside handleAddToCart, might be slow but safe
      addedCount++;
    }
    if (addedCount > 0) toast.success("Moved all available items to cart!");
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-600">Loading your wishlist...</div>
      </div>
    );
  }

  // Not Logged In State
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]  max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="max-w-md w-[30%] flex flex-col items-center justify-center">
          <img src={empty_wishlistIc} alt="Login required" className="w-50 h-50 mb-8 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login to View Your Wishlist
          </h2>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-8 py-4 bg-[#33022F] text-white font-semibold rounded-lg transition"
          >
            LOGIN TO CONTINUE
          </button>
        </div>
        {showLoginModal && <LoginModal isOpen={true} onClose={() => setShowLoginModal(false)} />}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 font-[Outfit]">

      {/* Header Section */}
      <div className="mb-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <Link to="/" className="hover:text-[#33022F]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#33022F]">Wishlist</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#33022F]">My Wishlist</h1>
            <p className="text-gray-500 mt-1 text-sm">{wishlistItems.length} items saved</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative sort-dropdown-container">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:border-[#33022F] transition-colors"
              >
                {sortBy === "recently-added" && "Recently Added"}
                {sortBy === "price-high-low" && "Price high to low"}
                {sortBy === "price-low-high" && "Price low to high"}
                <ChevronDown size={14} />
              </button>

              {/* Dropdown Menu */}
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg z-50">
                  <button
                    onClick={() => { setSortBy("recently-added"); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition ${sortBy === "recently-added" ? "bg-[#33022F] text-white hover:bg-[#33022F]" : "text-gray-700"}`}
                  >
                    Recently added
                  </button>
                  <button
                    onClick={() => { setSortBy("price-high-low"); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition ${sortBy === "price-high-low" ? "bg-[#33022F] text-white hover:bg-[#33022F]" : "text-gray-700"}`}
                  >
                    Price high to low
                  </button>
                  <button
                    onClick={() => { setSortBy("price-low-high"); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition ${sortBy === "price-low-high" ? "bg-[#33022F] text-white hover:bg-[#33022F]" : "text-gray-700"}`}
                  >
                    Price low to high
                  </button>
                </div>
              )}
            </div>

            {/* Move All to Cart */}
            <button
              onClick={handleMoveAllToCart}
              disabled={wishlistItems.length === 0}
              className="px-6 py-2 border border-[#33022F] text-[#33022F] font-semibold text-sm hover:bg-[#33022F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Move All to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Empty Wishlist UI */}
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
          <div className="h-[200px] w-full max-w-[300px] flex items-center justify-center mb-6">
            <img
              src={empty_wishlistIc}
              className="object-contain h-full w-full opacity-60"
              alt="Empty wishlist"
            />
          </div>
          <p className="text-xl font-bold text-gray-800">Your Wishlist is Empty</p>
          <p className="text-sm font-medium text-gray-500 mt-2 mb-8">Items added to your wishlist will appear here</p>

          <Link
            to={userRole === "B2B" ? "/b2b-products" : "/products"}
            className="px-8 py-3 bg-[#33022F] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#5a0452] transition shadow-lg"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {[...wishlistItems]
            .sort((a, b) => {
              if (sortBy === "price-high-low") return (b.price || 0) - (a.price || 0);
              if (sortBy === "price-low-high") return (a.price || 0) - (b.price || 0);
              return 0; // recently-added (default order)
            })
            .map((item) => (
              <WishlistProductCard
                key={item.productId || item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onRemove={handleRemoveItem}
              />))}
        </div>
      )}

      {/* Footer Navigation (as per mockup) */}
      {wishlistItems.length > 0 && (
        <div className="mt-12 text-center">
          <Link to="/products" className="text-[#2B7CEC] font-medium text-sm hover:underline">
            ← Continue Shopping
          </Link>
        </div>
      )}

    </div>
  );
};

export default WishlistPage;
