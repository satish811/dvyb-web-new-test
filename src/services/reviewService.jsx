import { ReviewModel } from "../models/ReviewModel";
import { auth, db } from "../config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

class ReviewService {
  static instance = null;

  static getInstance() {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  constructor() {
    if (ReviewService.instance) {
      throw new Error("Use ReviewService.getInstance() instead of new ReviewService()");
    }
  }

  // -----------------------------
  // Submit a new review
  // -----------------------------
  async submitReview(reviewData) {
    try {
      const user = auth.currentUser;

      // Check if user is logged in
      if (!user) {
        throw new Error("User must be logged in to submit a review");
      }

      const reviewModel = new ReviewModel({
        ...reviewData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split("@")[0] || "User",
      });

      // Validate review data
      reviewModel.validate();

      const reviewObject = reviewModel.toFirestore();

      // Add timestamps
      reviewObject.createdAt = serverTimestamp();
      reviewObject.updatedAt = serverTimestamp();

      const docRef = await addDoc(collection(db, "product_reviews"), reviewObject);

      return {
        success: true,
        reviewId: docRef.id,
        message: "Review submitted successfully",
      };
    } catch (error) {
      console.error("Submit review error:", error);
      throw new Error(this.getErrorMessage(error.message));
    }
  }

  // -----------------------------
  // Get all reviews for a product
  // -----------------------------
  async getProductReviews(productId, options = {}) {
    try {
      const {
        limit: limitCount = 10,
        orderBy: orderByField = "createdAt",
        orderDirection = "desc",
      } = options;

      const reviewsQuery = query(
        collection(db, "product_reviews"),
        where("productId", "==", productId),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      const snapshot = await getDocs(reviewsQuery);
      const reviews = [];

      snapshot.forEach((doc) => {
        reviews.push(ReviewModel.fromFirestore(doc.id, doc.data()));
      });

      return {
        success: true,
        reviews,
        hasMore: reviews.length === limitCount,
      };
    } catch (error) {
      console.error("Get product reviews error:", error);

      if (error.code === "failed-precondition") {
        throw new Error("Database index is being created. Please try again in a few minutes.");
      } else if (error.code === "permission-denied") {
        throw new Error("Permission denied to read reviews");
      } else {
        throw new Error("Failed to fetch reviews. Please try again.");
      }
    }
  }

  // -----------------------------
  // Update review (Only by owner)
  // -----------------------------
  async updateReview(reviewId, updateData) {
    try {
      const user = auth.currentUser;

      // Check if user is logged in
      if (!user) {
        throw new Error("User must be logged in to update review");
      }

      const reviewRef = doc(db, "product_reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error("Review not found");
      }

      const reviewData = reviewDoc.data();

      // Check if user owns the review
      if (reviewData.userId !== user.uid) {
        throw new Error("You can only update your own reviews");
      }

      const updateObject = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(reviewRef, updateObject);

      return {
        success: true,
        message: "Review updated successfully",
      };
    } catch (error) {
      console.error("Update review error:", error);
      throw new Error(this.getErrorMessage(error.message));
    }
  }

  // -----------------------------
  // Delete review (Only by owner)
  // -----------------------------
  async deleteReview(reviewId) {
    try {
      const user = auth.currentUser;

      // Check if user is logged in
      if (!user) {
        throw new Error("User must be logged in to delete review");
      }

      const reviewRef = doc(db, "product_reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error("Review not found");
      }

      const reviewData = reviewDoc.data();

      // Check if user owns the review
      if (reviewData.userId !== user.uid) {
        throw new Error("You can only delete your own reviews");
      }

      await deleteDoc(reviewRef);

      return {
        success: true,
        message: "Review deleted successfully",
      };
    } catch (error) {
      console.error("Delete review error:", error);
      throw new Error(this.getErrorMessage(error.message));
    }
  }

  // -----------------------------
  // Get user's own reviews
  // -----------------------------
  async getUserReviews() {
    try {
      const user = auth.currentUser;

      // Check if user is logged in
      if (!user) {
        throw new Error("User must be logged in to view their reviews");
      }

      const reviewsQuery = query(
        collection(db, "product_reviews"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(reviewsQuery);
      const reviews = [];

      snapshot.forEach((doc) => {
        reviews.push(ReviewModel.fromFirestore(doc.id, doc.data()));
      });

      return {
        success: true,
        reviews,
      };
    } catch (error) {
      console.error("Get user reviews error:", error);
      throw new Error("Failed to fetch user reviews");
    }
  }

  // -----------------------------
  // Error message helper
  // -----------------------------
  getErrorMessage(error) {
    const errors = {
      "User must be logged in to submit a review": "Please log in to submit a review",
      "User must be logged in to update review": "Please log in to update review",
      "User must be logged in to delete review": "Please log in to delete review",
      "User must be logged in to view their reviews": "Please log in to view your reviews",
      "Rating must be between 1 and 5": "Please select a rating between 1 and 5 stars",
      "Review title is required": "Please provide a title for your review",
      "Review comment is required": "Please write your review comment",
      "You can only update your own reviews": "You can only update your own reviews",
      "You can only delete your own reviews": "You can only delete your own reviews",
      "Review not found": "Review not found",
    };

    return errors[error] || error || "An error occurred";
  }
}

export default ReviewService.getInstance();
