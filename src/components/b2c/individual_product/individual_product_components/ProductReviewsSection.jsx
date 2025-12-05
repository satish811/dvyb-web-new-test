import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import ReviewFormModal from "./reviewSection/ProductReviewModal";
import { auth } from "../../../../config";
import ReviewService from "../../../../services/reviewService";
import ErrorBoundary from "../../../common/ErrorBoundary";

const ProductReviewsSection = ({ productId, reviews = [], onAverageRatingChange }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayReviews, setDisplayReviews] = useState([]);

  console.log("The reviews we are getting", reviews);

  const transformFirebaseReviews = (firebaseReviews) => {
    return firebaseReviews.map((review, index) => {
      // Safely get the name
      let name = "Anonymous User";
      if (review.userName) {
        name = review.userName;
      } else if (review.userEmail) {
        name = review.userEmail.split("@")[0];
      }

      return {
        id: review.id || `review-${index}`,
        name: name,
        rating: review.rating || 5,
        comment: review.comment || review.text || "No comment provided",
        date: formatDate(review.createdAt) || "Recently",
        images: review.images || [],
      };
    });
  };

  // Helper function to format Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "Recently";

    try {
      // If Firestore Timestamp
      if (timestamp.toDate) {
        timestamp = timestamp.toDate();
      }

      // If raw JS Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }

      // If already string
      if (typeof timestamp === "string") {
        return timestamp;
      }

      return "Recently";
    } catch (error) {
      return "Recently";
    }
  };

  // Calculate average rating
  const calculateAverageRating = (reviewsArray) => {
    if (!reviewsArray || reviewsArray.length === 0) return 0;

    const totalRating = reviewsArray.reduce((sum, review) => {
      return sum + (review.rating || 0);
    }, 0);

    return totalRating / reviewsArray.length;
  };

  // Notify parent component about average rating change
  const notifyAverageRating = (reviewsArray) => {
    const avgRating = calculateAverageRating(reviewsArray);
    if (onAverageRatingChange) {
      onAverageRatingChange(avgRating);
    }
  };

  // Replace the problematic useEffect with this:
  useEffect(() => {
    const loadReviews = async () => {
      try {
        let reviewsToUse = [];

        if (productId) {
          const result = await ReviewService.getProductReviews(productId);
          console.log("ReviewService result:", result);

          if (result.success && result.reviews && result.reviews.length > 0) {
            reviewsToUse = transformFirebaseReviews(result.reviews);
          } else {
            reviewsToUse = reviews.length > 0 ? transformFirebaseReviews(reviews) : [];
          }
        } else {
          reviewsToUse = reviews.length > 0 ? transformFirebaseReviews(reviews) : [];
        }

        setDisplayReviews(reviewsToUse);
        notifyAverageRating(reviewsToUse);
      } catch (error) {
        console.error("Error loading reviews:", error);
        const reviewsToUse = reviews.length > 0 ? transformFirebaseReviews(reviews) : [];
        setDisplayReviews(reviewsToUse);
        notifyAverageRating(reviewsToUse);
      }
    };

    loadReviews();
  }, [productId]);

  // Calculate current average rating for display
  const currentAvgRating =
    displayReviews.length > 0
      ? (
          displayReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / displayReviews.length
        ).toFixed(1)
      : 0;

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0 || !title.trim() || !comment.trim()) {
      alert("Please fill all fields and select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        productId: productId,
        rating: rating,
        title: title.trim(),
        comment: comment.trim(),
      };

      console.log("Submitting review:", reviewData); // Debug log

      const result = await ReviewService.submitReview(reviewData);

      if (result.success) {
        // Refresh reviews after successful submission
        const updatedReviews = await ReviewService.getProductReviews(productId);
        if (updatedReviews.success) {
          const transformedReviews = transformFirebaseReviews(updatedReviews.reviews);
          setDisplayReviews(transformedReviews);
          // Notify parent about updated average rating
          notifyAverageRating(transformedReviews);
        }

        // Reset form
        setRating(0);
        setTitle("");
        setComment("");
        setShowReviewForm(false);
        alert("Review submitted successfully!");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      alert(error.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setRating(0);
    setTitle("");
    setComment("");
    setShowReviewForm(false);
  };

  const canWriteReview = auth.currentUser !== null;

  const handleWriteReviewClick = () => {
    if (!canWriteReview) {
      alert("Please log in to write a review");
      return;
    }
    setShowReviewForm(true);
  };

  // Review Card Component
  const ReviewCard = ({ review }) => {
    const hasImages = Array.isArray(review.images) && review.images.length > 0;

    return (
      <div className="w-full flex flex-col justify-center py-2 border-b border-gray-200">
        {/* Reviewer Name */}
        {review.name && (
          <h4 className="font-semibold text-gray-900 text-[16px] mb-1">{review.name}</h4>
        )}

        {/* Rating */}
        {review.rating && (
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-[16px] ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}
              >
                ✧
              </span>
            ))}
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <p className="text-gray-700 text-[14px] leading-[1.4] mb-2 line-clamp-2">
            {review.comment}
          </p>
        )}

        {/* Images */}
        {hasImages && (
          <div className="flex gap-2 mb-2">
            {review.images.slice(0, 3).map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="w-8 h-8 object-cover rounded"
                onError={(e) => (e.target.style.display = "none")}
              />
            ))}

            {review.images.length > 3 && (
              <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 rounded">
                +{review.images.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Date */}
        {review.date && <span className="text-gray-500 text-[12px]">{String(review.date)}</span>}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="w-full max-w-[615px] flex flex-col">
        {/* Write Review Button - ALWAYS SHOWS */}
        <button
          onClick={handleWriteReviewClick}
          className="w-full h-[40px] md:h-[40px] bg-red-800 text-white text-[12px] md:text-[14px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canWriteReview}
          style={{ minHeight: "36px", maxHeight: "40px" }}
        >
          {canWriteReview ? "WRITE A REVIEW" : "LOGIN TO WRITE REVIEW"}
        </button>

        {/* Reviews Container - ONLY SHOWS WHEN THERE ARE REVIEWS */}
        {displayReviews.length > 0 && (
          <div className="w-full max-w-[615px] mt-4 flex flex-col">
            <div className="w-full flex flex-col overflow-y-auto" style={{ maxHeight: "300px" }}>
              {displayReviews.map((review, index) => (
                <ReviewCard key={review?.id || index} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* No Reviews Message */}
        {displayReviews.length === 0 && (
          <div className="w-full max-w-[615px] mt-4 flex items-center justify-center h-[100px]">
            <p className="text-gray-500 text-[14px]">No reviews yet. Be the first to write one!</p>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewFormModal
            rating={rating}
            hoverRating={hoverRating}
            setRating={setRating}
            setHoverRating={setHoverRating}
            title={title}
            setTitle={setTitle}
            comment={comment}
            setComment={setComment}
            isSubmitting={isSubmitting}
            handleSubmitReview={handleSubmitReview}
            handleCloseForm={handleCloseForm}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProductReviewsSection;
