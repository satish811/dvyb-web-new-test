// src/context/WishlistContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { wishlistService } from "../services/wishlistService";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, userRole, loading: authLoading } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get guest wishlist from sessionStorage
  const getGuestWishlist = useCallback(() => {
    try {
      return JSON.parse(sessionStorage.getItem("guest_wishlist")) || [];
    } catch {
      return [];
    }
  }, []);

  // Update guest wishlist in sessionStorage
  const updateGuestWishlist = useCallback((wishlist) => {
    try {
      sessionStorage.setItem("guest_wishlist", JSON.stringify(wishlist));
      setWishlistCount(wishlist.length);
      setWishlistItems(wishlist);
    } catch (error) {
      console.error("Error updating guest wishlist:", error);
    }
  }, []);

  // Subscribe to real-time wishlist updates for authenticated users
  useEffect(() => {
    let unsubscribe = null;
    let isSubscribed = true;

    const setupWishlistSubscription = async () => {
      if (user && !authLoading && isSubscribed) {
        setLoading(true);

        try {
          unsubscribe = await wishlistService.subscribeToWishlist((items) => {
            if (isSubscribed) {
              setWishlistItems(items);
              setWishlistCount(items.length);
              setLoading(false);
              setError(null);
            }
          });
        } catch (error) {
          if (isSubscribed) {
            if (error.message === "User not found in any collection") {
              console.log("User collection not found, using guest wishlist");
              const guestWishlist = getGuestWishlist();
              setWishlistItems(guestWishlist);
              setWishlistCount(guestWishlist.length);
            } else {
              setError(error.message);
              console.error("Wishlist subscription error:", error);
            }
            setLoading(false);
          }
        }
      } else if (!authLoading && isSubscribed) {
        const guestWishlist = getGuestWishlist();
        setWishlistItems(guestWishlist);
        setWishlistCount(guestWishlist.length);
        setLoading(false);
      }
    };

    setupWishlistSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, authLoading, getGuestWishlist]);

  // Add item to wishlist
  const addToWishlist = async (product, size = "M", color = "Default") => {
    try {
      setLoading(true);

      const wishlistItem = {
        id: product.id,
        productId: product.id,
        name: product.title || product.name,
        price: product.price,
        image: product.imageUrls?.[0] || product.images?.[0],
        size,
        color,
        addedAt: new Date().toISOString(),
        vendorId: product.vendorId || null,
      };

      if (user) {
        try {
          await wishlistService.addToWishlist(product.id, wishlistItem);
          return { success: true, message: "Item added to wishlist", inWishlist: true };
        } catch (error) {
          if (error.message === "User not found in any collection") {
            // Fallback to guest wishlist
            const guestWishlist = getGuestWishlist();
            const existingItemIndex = guestWishlist.findIndex((item) => item.id === product.id);

            if (existingItemIndex === -1) {
              guestWishlist.push(wishlistItem);
              updateGuestWishlist(guestWishlist);
            }
            return { success: true, message: "Item added to wishlist", inWishlist: true };
          }
          throw error;
        }
      } else {
        // Guest user - use sessionStorage
        const guestWishlist = getGuestWishlist();
        const existingItemIndex = guestWishlist.findIndex((item) => item.id === product.id);

        if (existingItemIndex === -1) {
          guestWishlist.push(wishlistItem);
          updateGuestWishlist(guestWishlist);
        }
        return { success: true, message: "Item added to wishlist", inWishlist: true };
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);

      if (user) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        const guestWishlist = getGuestWishlist();
        const updatedWishlist = guestWishlist.filter((item) => item.id !== productId);
        updateGuestWishlist(updatedWishlist);
      }

      return { success: true };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (product, size = "M", color = "Default") => {
    try {
      setLoading(true);

      const wishlistItem = {
        id: product.id,
        productId: product.id,
        name: product.title || product.name,
        price: product.price,
        image: product.imageUrls?.[0] || product.images?.[0],
        size,
        color,
        addedAt: new Date().toISOString(),
        vendorId: product.vendorId || null,
      };

      if (user) {
        try {
          const result = await wishlistService.toggleWishlist(product.id, wishlistItem);
          return {
            success: true,
            message: `Item ${result.action} from wishlist`,
            inWishlist: result.inWishlist,
          };
        } catch (error) {
          if (error.message === "User not found in any collection") {
            // Fallback to guest wishlist
            const guestWishlist = getGuestWishlist();
            const existingItemIndex = guestWishlist.findIndex((item) => item.id === product.id);

            let inWishlist;
            if (existingItemIndex >= 0) {
              guestWishlist.splice(existingItemIndex, 1);
              inWishlist = false;
            } else {
              guestWishlist.push(wishlistItem);
              inWishlist = true;
            }
            updateGuestWishlist(guestWishlist);

            return {
              success: true,
              message: inWishlist ? "Item added to wishlist" : "Item removed from wishlist",
              inWishlist,
            };
          }
          throw error;
        }
      } else {
        // Guest user - use sessionStorage
        const guestWishlist = getGuestWishlist();
        const existingItemIndex = guestWishlist.findIndex((item) => item.id === product.id);

        let inWishlist;
        if (existingItemIndex >= 0) {
          guestWishlist.splice(existingItemIndex, 1);
          inWishlist = false;
        } else {
          guestWishlist.push(wishlistItem);
          inWishlist = true;
        }
        updateGuestWishlist(guestWishlist);

        return {
          success: true,
          message: inWishlist ? "Item added to wishlist" : "Item removed from wishlist",
          inWishlist,
        };
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      setLoading(true);

      if (user) {
        await wishlistService.clearWishlist();
      } else {
        updateGuestWishlist([]);
      }

      return { success: true };
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Migrate guest wishlist to user wishlist after login
  const migrateGuestWishlist = async () => {
    try {
      const guestWishlist = getGuestWishlist();
      if (guestWishlist.length === 0 || !user) return;

      setLoading(true);

      for (const item of guestWishlist) {
        try {
          await wishlistService.addToWishlist(item.productId, item);
        } catch (error) {
          console.error(`Failed to migrate wishlist item ${item.id}:`, error);
        }
      }

      updateGuestWishlist([]);
      console.log("Guest wishlist migrated successfully");
    } catch (error) {
      console.error("Error migrating guest wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-migrate guest wishlist when user logs in
  useEffect(() => {
    if (user && !authLoading) {
      migrateGuestWishlist();
    }
  }, [user, authLoading]);

  const value = {
    wishlistCount,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    loading,
    error,
    clearError: () => setError(null),
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
