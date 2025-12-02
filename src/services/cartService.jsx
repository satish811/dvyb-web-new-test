import { auth, db, envConfig } from "../config";
import { B2BCartItemModel } from "../models/B2BCartItemModel";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

class CartOperationalService {
  static instance = null;

  constructor() {
    if (CartOperationalService.instance) {
      return CartOperationalService.instance;
    }

    this.db = db;
    this.auth = auth;
    this.b2cCollection = envConfig.firebaseStorage.b2cCollection;
    this.b2bCollection = envConfig.firebaseStorage.b2bCollection;

    CartOperationalService.instance = this;
  }

  static getInstance() {
    if (!CartOperationalService.instance) {
      CartOperationalService.instance = new CartOperationalService();
    }
    return CartOperationalService.instance;
  }

  async getUserCollection(userId) {
    try {
      const b2cRef = doc(this.db, this.b2cCollection, userId);
      const b2cSnap = await getDoc(b2cRef);
      if (b2cSnap.exists()) return this.b2cCollection;

      const b2bRef = doc(this.db, this.b2bCollection, userId);
      const b2bSnap = await getDoc(b2bRef);
      if (b2bSnap.exists()) return this.b2bCollection;

      return this.b2cCollection;
    } catch (err) {
      console.error("Error detecting user collection:", err);
      return this.b2cCollection;
    }
  }

  getCurrentUserCollection() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("usertype");
    return type === "b2b" ? this.b2bCollection : this.b2cCollection;
  }

  async addToCart(productId, productData = {}, variantsOrQuantity = 1, userIdOverride) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("User must be authenticated");

    const uid = userIdOverride || user.uid;
    const userCollection = await this.getUserCollection(uid);

    if (Array.isArray(variantsOrQuantity)) {
      return this._addToCartB2B(productId, productData, variantsOrQuantity, uid, userCollection);
    }

    return this._addToCartB2C(productId, productData, variantsOrQuantity, uid, userCollection);
  }

  async _addToCartB2C(productId, productData, quantity = 1, uid, userCollection) {
    const cartItemRef = doc(this.db, userCollection, uid, "cart", productId);

    const cartItem = {
      productId,
      quantity: Math.max(1, quantity),
      addedAt: new Date(),
      updatedAt: new Date(),
      userId: uid,
      name: productData.name || productData.title,
      price: productData.price || 0,
      image: productData.image || productData.imageUrls?.[0],
      color: productData.color || "Default",
      size: productData.size || "M",
      subtotal: (productData.price || 0) * Math.max(1, quantity),
    };

    await setDoc(cartItemRef, cartItem, { merge: true });
    return true;
  }

  async _addToCartB2B(productId, productData, variants = [], uid, userCollection) {
    if (!productId) throw new Error("Product ID required");
    if (variants.length === 0) throw new Error("Variants required for B2B");

    const cartItemRef = doc(this.db, userCollection, uid, "cart", productId);
    const snap = await getDoc(cartItemRef);
    const existing = snap.exists() ? snap.data().variants || [] : [];

    const merged = [...existing];
    variants.forEach((newVar) => {
      const idx = merged.findIndex((v) => v.color === newVar.color && v.size === newVar.size);
      if (idx >= 0) {
        merged[idx].quantity += newVar.quantity;
      } else {
        merged.push(newVar);
      }
    });

    const cartItem = new B2BCartItemModel({
      productId,
      productData,
      variants: merged,
      userId: uid,
    });

    await setDoc(cartItemRef, cartItem.toFirestore());
    return true;
  }

  async removeFromCart(productId) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Authentication required");

    const userCollection = await this.getUserCollection(user.uid);
    const ref = doc(this.db, userCollection, user.uid, "cart", productId);
    await deleteDoc(ref);
    return true;
  }

  async getCart() {
    const user = this.auth.currentUser;
    if (!user) return [];

    const userCollection = await this.getUserCollection(user.uid);
    const cartRef = collection(this.db, userCollection, user.uid, "cart");
    const q = query(cartRef, orderBy("addedAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  subscribeToCart(callback) {
    return new Promise(async (resolve) => {
      const user = this.auth.currentUser;
      if (!user) {
        callback([]);
        resolve(() => {});
        return;
      }

      const userCollection = await this.getUserCollection(user.uid);
      const cartRef = collection(this.db, userCollection, user.uid, "cart");
      const q = query(cartRef, orderBy("addedAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          callback(items);
        },
        (err) => {
          console.error("Cart listener error:", err);
          callback([]);
        }
      );

      resolve(unsubscribe);
    });
  }

  async updateCartItemQuantity(productId, quantity) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Authentication required");

    const userCollection = await this.getUserCollection(user.uid);
    const ref = doc(this.db, userCollection, user.uid, "cart", productId);

    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Item not found");

    const data = snap.data();
    const isB2B = data.variants && Array.isArray(data.variants);

    if (isB2B) {
      throw new Error("B2B items require variant-specific quantity updates");
    }

    const price = data.price || 0;
    const qty = Math.max(1, quantity);

    await updateDoc(ref, {
      quantity: qty,
      subtotal: price * qty,
      updatedAt: new Date(),
    });

    return true;
  }

  async updateB2BVariantQuantity(productId, color, size, quantity) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Authentication required");

    const userCollection = await this.getUserCollection(user.uid);
    const ref = doc(this.db, userCollection, user.uid, "cart", productId);

    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Item not found");

    const data = snap.data();
    if (!data.variants || !Array.isArray(data.variants)) {
      throw new Error("Not a B2B cart item");
    }

    const updatedVariants = data.variants
      .map((variant) =>
        variant.color === color && variant.size === size
          ? { ...variant, quantity: Math.max(0, quantity) }
          : variant
      )
      .filter((variant) => variant.quantity > 0);

    if (updatedVariants.length === 0) {
      await deleteDoc(ref);
      return true;
    }

    const cartItem = new B2BCartItemModel({
      productId,
      productData: data,
      variants: updatedVariants,
      userId: user.uid,
    });

    await setDoc(ref, cartItem.toFirestore());
    return true;
  }
}

export const cartService = CartOperationalService.getInstance();
