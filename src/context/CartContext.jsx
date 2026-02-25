// src/context/CartContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "../services/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, userRole, loading: authLoading } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get guest cart from sessionStorage
  const getGuestCart = useCallback(() => {
    try {
      return JSON.parse(sessionStorage.getItem("guest_cart")) || [];
    } catch {
      return [];
    }
  }, []);

  // Update guest cart in sessionStorage
  const updateGuestCart = useCallback((cart) => {
    try {
      sessionStorage.setItem("guest_cart", JSON.stringify(cart));
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
      setCartItems(cart);
    } catch (error) {
      console.error("Error updating guest cart:", error);
    }
  }, []);

  // Calculate cart count from items
  const calculateCartCount = useCallback((items) => {
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
  }, []);

  // ✅ FIXED: Subscribe to real-time cart updates for authenticated users
  useEffect(() => {
    let unsubscribe = null;
    let isSubscribed = true;

    const setupCartSubscription = async () => {
      if (user && !authLoading && isSubscribed) {
        // User is authenticated - use Firestore real-time updates
        setLoading(true);

        try {
          // ✅ FIXED: subscribeToCart now returns a Promise that resolves to unsubscribe function
          unsubscribe = await cartService.subscribeToCart((items) => {
            if (isSubscribed) {
              setCartItems(items);
              setCartCount(calculateCartCount(items));
              setLoading(false);
              setError(null);
            }
          });
        } catch (error) {
          if (isSubscribed) {
            // If user collection doesn't exist, treat as guest
            if (error.message === "User not found in any collection") {
              console.log("User collection not found, using guest cart");
              const guestCart = getGuestCart();
              setCartItems(guestCart);
              setCartCount(calculateCartCount(guestCart));
            } else {
              setError(error.message);
              console.error("Cart subscription error:", error);
            }
            setLoading(false);
          }
        }
      } else if (!authLoading && isSubscribed) {
        // User is not authenticated - use sessionStorage
        const guestCart = getGuestCart();
        setCartItems(guestCart);
        setCartCount(calculateCartCount(guestCart));
        setLoading(false);
      }
    };

    setupCartSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, authLoading, calculateCartCount, getGuestCart]);

  // Add item to cart (works for both authenticated and guest users)
  const addToCart = async (product, size = "M", color = "Default", quantity = 1) => {
    try {
      setLoading(true);

      const cartItem = {
        id: product.id,
        productId: product.id,
        name: product.title || product.name,
        price: product.price,
        image: product.imageUrls?.[0] || product.images?.[0],
        size,
        color,
        quantity,
        addedAt: new Date().toISOString(),
        vendorId: product.vendorId || null,
        freeShipping: product.freeShipping || false,
        shippingMessage: product.shippingMessage || null,
        subtotal: product.price * quantity,
      };

      if (user) {
        // Authenticated user - use Firestore
        try {
          await cartService.addToCart(product.id, cartItem, quantity);
          // Cart count will update automatically via subscription
          return { success: true, message: "Item added to cart" };
        } catch (error) {
          if (error.message === "User not found in any collection") {
            // Fallback to guest cart if user collection doesn't exist
            console.log("User collection not found, falling back to guest cart");
            const guestCart = getGuestCart();
            const existingItemIndex = guestCart.findIndex(
              (item) => item.id === product.id && item.size === size && item.color === color
            );

            if (existingItemIndex >= 0) {
              guestCart[existingItemIndex].quantity += quantity;
            } else {
              guestCart.push(cartItem);
            }

            updateGuestCart(guestCart);
            return { success: true, message: "Item added to cart" };
          }
          throw error;
        }
      } else {
        // Guest user - use sessionStorage
        const guestCart = getGuestCart();
        const existingItemIndex = guestCart.findIndex(
          (item) => item.id === product.id && item.size === size && item.color === color
        );

        if (existingItemIndex >= 0) {
          guestCart[existingItemIndex].quantity += quantity;
        } else {
          guestCart.push(cartItem);
        }

        updateGuestCart(guestCart);
        return { success: true, message: "Item added to cart" };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId, size, color) => {
    try {
      setLoading(true);

      if (user) {
        await cartService.removeFromCart(productId);
        // Cart count will update automatically via subscription
      } else {
        const guestCart = getGuestCart();
        const updatedCart = guestCart.filter(
          (item) => !(item.id === productId && item.size === size && item.color === color)
        );
        updateGuestCart(updatedCart);
      }

      return { success: true };
    } catch (error) {
      console.error("Error removing from cart:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);

      if (user) {
        await cartService.clearCart();
      } else {
        updateGuestCart([]);
      }

      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity, size, color) => {
    try {
      setLoading(true);

      if (user) {
        await cartService.updateCartItemQuantity(productId, newQuantity);
      } else {
        const guestCart = getGuestCart();
        const itemIndex = guestCart.findIndex(
          (item) => item.id === productId && item.size === size && item.color === color
        );

        if (itemIndex >= 0) {
          guestCart[itemIndex].quantity = newQuantity;
          guestCart[itemIndex].subtotal = guestCart[itemIndex].price * newQuantity;
          updateGuestCart(guestCart);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Migrate guest cart to user cart after login
  const migrateGuestCart = async () => {
    try {
      const guestCart = getGuestCart();
      if (guestCart.length === 0 || !user) return;

      setLoading(true);

      // Add all guest cart items to user's Firestore cart
      for (const item of guestCart) {
        try {
          if (!item.productId) {
            console.warn("Skipping migration of invalid cart item (missing productId):", item);
            continue;
          }
          await cartService.addToCart(item.productId, item, item.quantity);
        } catch (error) {
          console.error(`Failed to migrate item ${item.id}:`, error);
        }
      }

      // Clear guest cart after successful migration
      updateGuestCart([]);
      console.log("Guest cart migrated successfully");
    } catch (error) {
      console.error("Error migrating guest cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-migrate guest cart when user logs in
  useEffect(() => {
    if (user && !authLoading) {
      migrateGuestCart();
    }
  }, [user, authLoading]);

  /**
   * Check if a product is already in the cart by productId.
   * Handles both authenticated (Firestore) and guest (sessionStorage) cart items.
   */
  const isInCart = (productId) => {
    if (!productId) return false;
    return cartItems.some(
      (item) =>
        String(item.id) === String(productId) ||
        String(item.productId) === String(productId)
    );
  };

  const value = {
    cartCount,
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    isInCart,
    loading,
    error,
    clearError: () => setError(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};


