import { auth, db, envConfig } from "../config";
import {
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
} from "firebase/firestore";

class TryOnProductService {
    static instance = null;

    constructor() {
        if (TryOnProductService.instance) {
            return TryOnProductService.instance;
        }

        this.db = db;
        this.auth = auth;
        this.b2cCollection = envConfig.firebaseStorage?.b2cCollection || "b2c_users";

        TryOnProductService.instance = this;
    }

    static getInstance() {
        if (!TryOnProductService.instance) {
            TryOnProductService.instance = new TryOnProductService();
        }
        return TryOnProductService.instance;
    }

    /**
     * Store try-on data for a user
     * @param {Object} params - Parameters object
     * @param {string} params.userId - The user's UID
     * @param {Object} params.tryOnData - The try-on data to store
     * @param {string} params.productId - The product ID
     * @param {string} params.modelImage - The selected model image URL
     * @param {string} params.garmentImage - The garment image URL
     * @param {boolean} params.is3D - Whether it's 3D try-on
     * @param {string} params.modelName - The selected model name
     */
    async storeTryOnData({
        userId,
        tryOnData,
        productId,
        modelImage,
        garmentImage,
        is3D,
        modelName
    }) {
        console.log("🔥🔥🔥 SERVICE CALLED with:", {
            userId,
            productId,
            modelName,
            hasTryOnData: !!tryOnData
        });

        const user = this.auth.currentUser;
        console.log("🔥 Current auth user:", user?.uid, user?.email);

        if (!user) {
            console.error("❌ No authenticated user");
            throw new Error("User must be authenticated to store try-on data");
        }

        if (user.uid !== userId) {
            console.error("❌ User ID mismatch:", { authUid: user.uid, passedUid: userId });
            throw new Error("User ID mismatch");
        }

        if (!productId) {
            console.error("❌ No product ID");
            throw new Error("Product ID is required");
        }

        try {
            const userRef = doc(this.db, this.b2cCollection, userId);
            console.log("📌 Document path:", userRef.path);

            // Test if we can access the document
            const userDoc = await getDoc(userRef);
            console.log("📌 Document exists?", userDoc.exists());

            if (userDoc.exists()) {
                console.log("📌 Existing document data keys:", Object.keys(userDoc.data()));
            }

            const tryOnEntry = {
                id: `${productId}_${Date.now()}`,
                timestamp: new Date().toISOString(),
                tryOnData: tryOnData || {},
                productId: productId,
                modelImage: modelImage || null,
                garmentImage: garmentImage || null,
                is3D: is3D || false,
                modelName: modelName || "Default Model",
                action: "try_on_completed",
                deviceInfo: {
                    userAgent: navigator?.userAgent || null,
                    platform: navigator?.platform || null,
                }
            };

            console.log("📌 About to write entry:", tryOnEntry);

            if (!userDoc.exists()) {
                console.log("📌 Creating new document...");
                const newDoc = {
                    userId: userId,
                    tryOnHistory: [tryOnEntry],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    email: user.email,
                    displayName: user.displayName || null,
                };
                console.log("📌 New document data:", newDoc);

                await setDoc(userRef, newDoc);
                console.log("✅ Create successful");
            } else {
                console.log("📌 Updating existing document...");
                const updateData = {
                    tryOnHistory: arrayUnion(tryOnEntry),
                    updatedAt: new Date().toISOString(),
                    lastTryOn: new Date().toISOString(),
                };
                console.log("📌 Update data:", updateData);

                await updateDoc(userRef, updateData);
                console.log("✅ Update successful");
            }

            // Verify the write by reading back
            const verifyDoc = await getDoc(userRef);
            console.log("📌 Verification - Document exists?", verifyDoc.exists());
            if (verifyDoc.exists()) {
                const data = verifyDoc.data();
                console.log("📌 Verification - tryOnHistory length:", data.tryOnHistory?.length || 0);
            }

            return {
                success: true,
                entryId: tryOnEntry.id,
                timestamp: tryOnEntry.timestamp
            };

        } catch (error) {
            console.error("❌❌❌ ERROR DETAILS:");
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Full error:", error);
            throw new Error(`Failed to store try-on data: ${error.message}`);
        }
    }

    /**
     * Get try-on history for a user
     * @param {string} userId - The user's UID
     * @param {Object} options - Query options
     * @param {number} options.limit - Number of records to fetch
     * @param {string} options.orderBy - Order by field (timestamp)
     * @returns {Promise<Array>} - Array of try-on entries
     */
    async getUserTryOnHistory(userId, options = {}) {
        const user = this.auth.currentUser;

        if (!user) {
            throw new Error("User must be authenticated");
        }

        if (!userId || userId !== user.uid) {
            throw new Error("Invalid user ID");
        }

        try {
            const userRef = doc(this.db, this.b2cCollection, userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return [];
            }

            const userData = userDoc.data();
            let history = userData.tryOnHistory || [];


            history = history.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );


            if (options.limit && options.limit > 0) {
                history = history.slice(0, options.limit);
            }

            return history;

        } catch (error) {
            console.error("❌ Error fetching try-on history:", error);
            throw new Error(`Failed to fetch try-on history: ${error.message}`);
        }
    }

    /**
     * Get try-on history for a specific product
     * @param {string} userId - The user's UID
     * @param {string} productId - The product ID
     * @returns {Promise<Array>} - Array of try-on entries for the product
     */
    async getProductTryOnHistory(userId, productId) {
        const user = this.auth.currentUser;

        if (!user) {
            throw new Error("User must be authenticated");
        }

        if (!userId || userId !== user.uid) {
            throw new Error("Invalid user ID");
        }

        if (!productId) {
            throw new Error("Product ID is required");
        }

        try {
            const userRef = doc(this.db, this.b2cCollection, userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return [];
            }

            const userData = userDoc.data();
            const history = userData.tryOnHistory || [];


            return history
                .filter(entry => entry.productId === productId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error("❌ Error fetching product try-on history:", error);
            throw new Error(`Failed to fetch product try-on history: ${error.message}`);
        }
    }

    /**
     * Delete a specific try-on entry
     * @param {string} userId - The user's UID
     * @param {string} entryId - The try-on entry ID to delete
     */
    async deleteTryOnEntry(userId, entryId) {
        const user = this.auth.currentUser;

        if (!user) {
            throw new Error("User must be authenticated");
        }

        if (!userId || userId !== user.uid) {
            throw new Error("Invalid user ID");
        }

        if (!entryId) {
            throw new Error("Entry ID is required");
        }

        try {
            const userRef = doc(this.db, this.b2cCollection, userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User document not found");
            }

            const userData = userDoc.data();
            const history = userData.tryOnHistory || [];


            const updatedHistory = history.filter(entry => entry.id !== entryId);


            await updateDoc(userRef, {
                tryOnHistory: updatedHistory,
                updatedAt: new Date().toISOString()
            });

            return { success: true };

        } catch (error) {
            console.error("❌ Error deleting try-on entry:", error);
            throw new Error(`Failed to delete try-on entry: ${error.message}`);
        }
    }

    /**
     * Clear all try-on history for a user
     * @param {string} userId - The user's UID
     */
    async clearTryOnHistory(userId) {
        const user = this.auth.currentUser;

        if (!user) {
            throw new Error("User must be authenticated");
        }

        if (!userId || userId !== user.uid) {
            throw new Error("Invalid user ID");
        }

        try {
            const userRef = doc(this.db, this.b2cCollection, userId);

            await updateDoc(userRef, {
                tryOnHistory: [],
                updatedAt: new Date().toISOString(),
                lastCleared: new Date().toISOString()
            });

            return { success: true };

        } catch (error) {
            console.error("❌ Error clearing try-on history:", error);
            throw new Error(`Failed to clear try-on history: ${error.message}`);
        }
    }
}

export const tryOnProductService = TryOnProductService.getInstance();