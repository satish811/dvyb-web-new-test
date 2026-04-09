import React, { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import Bag_ic from "@/assets/b2c/images/commmon/Bag_ic.svg";
import { useNavigate } from "react-router-dom";

import { cartService } from "../../services/cartService";
import { wishlistService } from "../../services/wishlistService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useProducts } from "../../hooks";

function PremiumSection05() {
  const { products, loading, error } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [togglingWishlist, setTogglingWishlist] = useState(new Set());
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [cartIds, setCartIds] = useState(new Set());
  const [inFlightAdds, setInFlightAdds] = useState(new Set());

  // Subscribe to real-time cart
  useEffect(() => {
    let unsubscribe = null;
    const setup = async () => {
      unsubscribe = await cartService.subscribeToCart((cartItems) => {
        const ids = new Set(cartItems.map((item) => item.productId || item.id));
        setCartIds(ids);
      });
    };
    setup();
    return () => unsubscribe?.();
  }, [user]);

  // Responsive product display
  useEffect(() => {
    const updateDisplay = () => {
      const isMobile = window.innerWidth < 768;
      setDisplayedProducts(isMobile ? products.slice(0, 4) : products);
    };

    updateDisplay();
    window.addEventListener("resize", updateDisplay);
    return () => window.removeEventListener("resize", updateDisplay);
  }, [products]);

  // Load wishlist status
  useEffect(() => {
    if (!user || products.length === 0) return;

    const checkWishlistStatus = async () => {
      try {
        const results = await Promise.all(products.map((p) => wishlistService.isInWishlist(p.id)));
        const wishlistSet = new Set();
        products.forEach((p, i) => results[i] && wishlistSet.add(p.id));
        setWishlistItems(wishlistSet);
      } catch (err) {
        console.error("Failed to load wishlist status:", err);
      }
    };

    checkWishlistStatus();
  }, [user, products]);

  // Add to Cart
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to add items to cart!");
      return;
    }

    if (cartIds.has(product.id)) {
      navigate("/mycart");
      return;
    }

    if (inFlightAdds.has(product.id)) return;

    setInFlightAdds((prev) => new Set(prev).add(product.id));
    setCartIds((prev) => new Set(prev).add(product.id)); // Optimistic UI

    try {
      await cartService.addToCart(
        product.id,
        {
          name: product.name || product.title,
          price: product.price,
          imageUrls: product.imageUrls || [],
        },
        1
      );

      toast.success("Added to cart!");
    } catch (err) {
      setCartIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      toast.error("Failed to add to cart.");
      console.error("Cart error:", err);
    } finally {
      setInFlightAdds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  // Toggle Wishlist
  const handleWishlistToggle = async (product, e) => {
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to manage wishlist!");
      return;
    }

    if (togglingWishlist.has(product.id)) return;

    setTogglingWishlist((prev) => new Set(prev).add(product.id));

    const productData = {
      name: product.name || product.title,
      price: parseFloat(product.price) || 0,
      imageUrls: product.imageUrls || [],
      selectedColors: product.selectedColors || [],
      selectedSizes: product.selectedSizes || [],
      fabric: product.fabric || "",
      craft: product.craft || "",
      description: product.description || "",
    };

    try {
      const result = await wishlistService.toggleWishlist(product.id, productData);
      setWishlistItems((prev) => {
        const next = new Set(prev);
        result.inWishlist ? next.add(product.id) : next.delete(product.id);
        return next;
      });

      toast.success(result.inWishlist ? "Added to wishlist!" : "Removed from wishlist");
    } catch (err) {
      toast.error("Failed to update wishlist.");
      console.error("Wishlist error:", err);
    } finally {
      setTogglingWishlist((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  // Loading & Error States
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600 text-lg">Loading premium collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-600 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 font-outfit">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-6 py-2 bg-[#E6F0F5] text-[#3C8E9A] text-sm font-semibold tracking-widest rounded-full mb-6">
            VILLY COLLECTION
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            PREMIUM SELECTIONS
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Indulge in our curated luxury collection, where fashion meets culture.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-10 justify-center">
          {displayedProducts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 text-lg">No premium products available at the moment.</p>
            </div>
          ) : (
            displayedProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                  <img
                    src={product.imageUrls?.[0] || "https://via.placeholder.com/400"}
                    alt={product.name || product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      -{product.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">(4.0)</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                    {product.name || product.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{Math.round(parseFloat(product.price) * 1.3)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={inFlightAdds.has(product.id)}
                      className={`flex-1 bg-[#3C8E9A] hover:bg-[#327a85] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                        inFlightAdds.has(product.id) ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      <img src={Bag_ic} alt="bag" className="w-5 h-5" />
                      {cartIds.has(product.id)
                        ? "GO TO BAG"
                        : inFlightAdds.has(product.id)
                          ? "ADDING..."
                          : "ADD TO BAG"}
                    </button>

                    <button
                      onClick={(e) => handleWishlistToggle(product, e)}
                      disabled={togglingWishlist.has(product.id)}
                      className={`p-3 border border-gray-300 rounded-lg transition-all ${
                        togglingWishlist.has(product.id) ? "opacity-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Heart
                        size={20}
                        className={`transition-all ${
                          wishlistItems.has(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PremiumSection05;
