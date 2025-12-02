// src/hooks/useUserCart.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const useUserCart = () => {
  const { user, userCollection, userRole } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCollection = () => {
    return userCollection || (userRole === "B2B" ? "B2BBulkOrders_users" : "b2c_users");
  };

  useEffect(() => {
    if (user && userCollection) {
      loadUserData();
    }
  }, [user, userCollection]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, getCollection(), user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCart(userData.cart || []);
        setWishlist(userData.wishlist || []);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingItem = guestCart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        guestCart.push({
          ...product,
          quantity,
          addedAt: new Date().toISOString(),
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      setCart(guestCart);
      return;
    }

    setLoading(true);
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        quantity,
        addedAt: new Date().toISOString(),
        ...(userRole === "B2B" && {
          bulkPrice: product.bulkPrice,
          minOrderQuantity: product.minOrderQuantity,
          businessDiscount: product.businessDiscount,
        }),
      };

      const userRef = doc(db, getCollection(), user.uid);
      await updateDoc(userRef, {
        cart: arrayUnion(cartItem),
        updatedAt: new Date(),
      });

      await loadUserData(); // Reload to get updated cart
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const updatedCart = guestCart.filter((item) => item.id !== productId);
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, getCollection(), user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const updatedCart = (userData.cart || []).filter((item) => item.id !== productId);

      await updateDoc(userRef, {
        cart: updatedCart,
        updatedAt: new Date(),
      });

      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
      return;
    }

    if (!user) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const updatedCart = guestCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, getCollection(), user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const updatedCart = (userData.cart || []).map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );

      await updateDoc(userRef, {
        cart: updatedCart,
        updatedAt: new Date(),
      });

      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!user) {
      const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      if (!guestWishlist.find((item) => item.id === product.id)) {
        guestWishlist.push({
          ...product,
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem("guestWishlist", JSON.stringify(guestWishlist));
        setWishlist(guestWishlist);
      }
      return;
    }

    setLoading(true);
    try {
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        addedAt: new Date().toISOString(),
      };

      const userRef = doc(db, getCollection(), user.uid);
      await updateDoc(userRef, {
        wishlist: arrayUnion(wishlistItem),
        updatedAt: new Date(),
      });

      await loadUserData(); // Reload to get updated wishlist
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) {
      const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      const updatedWishlist = guestWishlist.filter((item) => item.id !== productId);
      localStorage.setItem("guestWishlist", JSON.stringify(updatedWishlist));
      setWishlist(updatedWishlist);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, getCollection(), user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const updatedWishlist = (userData.wishlist || []).filter((item) => item.id !== productId);

      await updateDoc(userRef, {
        wishlist: updatedWishlist,
        updatedAt: new Date(),
      });

      setWishlist(updatedWishlist);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const mergeGuestData = async () => {
    if (!user) return;

    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");

    if (guestCart.length > 0 || guestWishlist.length > 0) {
      try {
        const userRef = doc(db, getCollection(), user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        const updates = {
          updatedAt: new Date(),
        };

        if (guestCart.length > 0) {
          const existingCart = userData.cart || [];
          const mergedCart = [...existingCart];

          guestCart.forEach((guestItem) => {
            const existingItem = mergedCart.find((item) => item.id === guestItem.id);
            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              mergedCart.push(guestItem);
            }
          });

          updates.cart = mergedCart;
        }

        if (guestWishlist.length > 0) {
          const existingWishlist = userData.wishlist || [];
          const mergedWishlist = [
            ...new Map([
              ...existingWishlist.map((item) => [item.id, item]),
              ...guestWishlist.map((item) => [item.id, item]),
            ]).values(),
          ];

          updates.wishlist = mergedWishlist;
        }

        await updateDoc(userRef, updates);

        localStorage.removeItem("guestCart");
        localStorage.removeItem("guestWishlist");

        await loadUserData();
      } catch (error) {
        console.error("Error merging guest data:", error);
      }
    }
  };

  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem("guestCart");
      setCart([]);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, getCollection(), user.uid);
      await updateDoc(userRef, {
        cart: [],
        updatedAt: new Date(),
      });
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    wishlist,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist,
    mergeGuestData,
    clearCart,
    cartCount: cart.reduce((total, item) => total + (item.quantity || 1), 0),
    wishlistCount: wishlist.length,
  };
};
