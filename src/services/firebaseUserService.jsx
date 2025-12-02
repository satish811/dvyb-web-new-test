import { db } from "../config";
import { doc, setDoc } from "firebase/firestore";

/**
 * UserService — Handles user profile data
 * Implements Singleton pattern
 */
class UserOperationalService {
  static instance = null;

  static getInstance() {
    if (!UserOperationalService.instance) {
      UserOperationalService.instance = new UserOperationalService();
    }
    return UserOperationalService.instance;
  }

  /** Create or update a user document */
  async createUser(userId, userData) {
    try {
      console.log(`📝 Creating user: ${userId}`);
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ User created: ${userId}`);
      return userId;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }
}

/**
 * Export Singleton instances
 */
export const userService = UserOperationalService.getInstance();
