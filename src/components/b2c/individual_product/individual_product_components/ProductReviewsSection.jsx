import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { Star } from "lucide-react";
import ReviewFormModal from "./reviewSection/ProductReviewModal";
import { auth } from "../../../../config";
import ReviewService from "../../../../services/reviewService";
import ErrorBoundary from "../../../common/ErrorBoundary";

const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_REVIEW_IMAGE_COUNT = 5;

const ProductReviewsSection = ({ productId, reviews = [], vendorReviews = [], onAverageRatingChange }) => {
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayReviews, setDisplayReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // Lightbox state
  const [reviewImages, setReviewImages] = useState([]);
  const [toastData, setToastData] = useState(null);

  // Use ref for callback to prevent infinite loops
  const onAverageRatingChangeRef = useRef(onAverageRatingChange);

  // Update ref when callback changes
  useEffect(() => {
    onAverageRatingChangeRef.current = onAverageRatingChange;
  }, [onAverageRatingChange]);

  const showToast = useCallback((message, type = "success") => {
    setToastData({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toastData) return;
    const timer = setTimeout(() => setToastData(null), 2200);
    return () => clearTimeout(timer);
  }, [toastData]);

  // Lock scroll while lightbox is open.
  useEffect(() => {
    if (!selectedImage) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [selectedImage]);

  const transformFirebaseReviews = useCallback((firebaseReviews) => {
    if (!firebaseReviews || !Array.isArray(firebaseReviews)) return [];

    return firebaseReviews.map((review, index) => {
      let name = "Vendor Review";
      if (review.userName && review.userName !== "Anonymous User") {
        name = review.userName;
      } else if (review.userEmail) {
        name = review.userEmail.split("@")[0];
      }

      // Handle both array of images (standard) and single image (vendor)
      let images = [];
      if (Array.isArray(review.images)) {
        images = review.images;
      } else if (review.image) {
        images = [review.image];
      }

      return {
        id: review.id || `review-${index}`,
        name: name,
        rating: review.rating || 5,
        title: review.title || "",
        comment: review.comment || review.text || review.description || "No comment provided",
        images: images,
      };
    });
  }, []);

  // Load reviews only when productId or reviews prop changes
  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        let reviewsToUse = [];

        // 1. Try to get Real Reviews
        // If reviews are passed as props, use them
        if (reviews && reviews.length > 0) {
          reviewsToUse = transformFirebaseReviews(reviews);
        }
        // Otherwise, fetch from service if we have productId
        else if (productId) {
          const result = await ReviewService.getProductReviews(productId);
          if (result.success && result.reviews && result.reviews.length > 0) {
            reviewsToUse = transformFirebaseReviews(result.reviews);
          }
        }

        // 2. Fallback to Vendor Reviews if Real Reviews are empty
        if (reviewsToUse.length === 0 && vendorReviews && vendorReviews.length > 0) {
          reviewsToUse = transformFirebaseReviews(vendorReviews);
        }

        if (isMounted) {
          setDisplayReviews(reviewsToUse);

          if (reviewsToUse.length > 0) {
            const avgRating =
              reviewsToUse.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsToUse.length;
            if (onAverageRatingChangeRef.current) {
              onAverageRatingChangeRef.current(avgRating);
            }
          } else {
            if (onAverageRatingChangeRef.current) {
              onAverageRatingChangeRef.current(0);
            }
          }
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [productId, reviews, transformFirebaseReviews, vendorReviews]);

  // Calculate current average rating for display
  const currentAvgRating =
    displayReviews.length > 0
      ? (
        displayReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / displayReviews.length
      ).toFixed(1)
      : 0;

  // Handle review submission
  const loadImageFromFile = (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to read image"));
      };

      img.src = objectUrl;
    });

  const canvasToBlob = (canvas, quality) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    });

  const compressImageToMax5MB = async (file) => {
    if (file.size <= MAX_REVIEW_IMAGE_SIZE) return file;

    const img = await loadImageFromFile(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image compression is not supported in this browser");

    let width = img.width;
    let height = img.height;
    const maxDimension = 1920;

    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.max(1, Math.floor(width * ratio));
      height = Math.max(1, Math.floor(height * ratio));
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.9;
    let compressedBlob = await canvasToBlob(canvas, quality);

    while (compressedBlob.size > MAX_REVIEW_IMAGE_SIZE && quality > 0.45) {
      quality -= 0.1;
      compressedBlob = await canvasToBlob(canvas, quality);
    }

    while (compressedBlob.size > MAX_REVIEW_IMAGE_SIZE && width > 640 && height > 640) {
      width = Math.floor(width * 0.85);
      height = Math.floor(height * 0.85);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      compressedBlob = await canvasToBlob(canvas, quality);
    }

    if (compressedBlob.size > MAX_REVIEW_IMAGE_SIZE) {
      throw new Error("Could not compress image under 5MB");
    }

    const compressedName = file.name.replace(/\.[^/.]+$/, "") + "-compressed.jpg";
    return new File([compressedBlob], compressedName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  const uploadReviewImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "tryon_unsigned");
    data.append("cloud_name", "doiezptnn");

    const res = await fetch("https://api.cloudinary.com/v1_1/doiezptnn/image/upload", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    if (!json.secure_url) throw new Error("Review image upload failed");
    return json.secure_url;
  };

  const handleReviewImageChange = (event) => {
    const inputEl = event.target;
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const invalidType = selectedFiles.find((file) => !allowedTypes.includes(file.type));
    if (invalidType) {
      showToast("Please upload JPG, PNG, or WEBP image only", "error");
      inputEl.value = "";
      return;
    }

    const availableSlots = MAX_REVIEW_IMAGE_COUNT - reviewImages.length;
    if (availableSlots <= 0) {
      showToast(`You can upload up to ${MAX_REVIEW_IMAGE_COUNT} images only`, "error");
      inputEl.value = "";
      return;
    }

    const filesToProcess = selectedFiles.slice(0, availableSlots);

    (async () => {
      try {
        const processedImages = [];

        for (const file of filesToProcess) {
          const compressedFile = await compressImageToMax5MB(file);
          const preview = URL.createObjectURL(compressedFile);
          processedImages.push({ file: compressedFile, preview });
        }

        setReviewImages((prev) => [...prev, ...processedImages]);

        if (selectedFiles.length > filesToProcess.length) {
          showToast(`Only ${MAX_REVIEW_IMAGE_COUNT} images can be uploaded`, "error");
        }
      } catch (error) {
        showToast(error.message || "Failed to process selected image(s)", "error");
      } finally {
        inputEl.value = "";
      }
    })();
  };

  const clearReviewImages = () => {
    setReviewImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
  };

  const handleRemoveReviewImage = (indexToRemove) => {
    setReviewImages((prev) => {
      const next = prev.filter((_, index) => index !== indexToRemove);
      const removed = prev[indexToRemove];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0 || !title.trim() || !comment.trim()) {
      showToast("Please fill all fields and select a rating", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImages = [];
      if (reviewImages.length > 0) {
        uploadedImages = await Promise.all(
          reviewImages.map((imageItem) => uploadReviewImageToCloudinary(imageItem.file))
        );
      }

      const reviewData = {
        productId: productId,
        rating: rating,
        title: title.trim(),
        comment: comment.trim(),
        images: uploadedImages,
      };

      console.log("Submitting review:", reviewData);

      const result = await ReviewService.submitReview(reviewData);

      if (result.success) {
        // Only reload if we have productId
        if (productId) {
          const updatedReviews = await ReviewService.getProductReviews(productId);
          if (updatedReviews.success) {
            const transformedReviews = transformFirebaseReviews(updatedReviews.reviews);
            setDisplayReviews(transformedReviews);

            // Update average rating
            if (transformedReviews.length > 0) {
              const avgRating =
                transformedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                transformedReviews.length;
              if (onAverageRatingChangeRef.current) {
                onAverageRatingChangeRef.current(avgRating);
              }
            }
          }
        }

        // Reset form
        setRating(0);
        setTitle("");
        setComment("");
        clearReviewImages();
        setShowReviewForm(false);
        showToast("Review submitted successfully!", "success");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      showToast(error.message || "Failed to submit review. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setRating(0);
    setTitle("");
    setComment("");
    clearReviewImages();
    setShowReviewForm(false);
  };

  const canWriteReview = auth.currentUser !== null;

  const handleWriteReviewClick = () => {
    if (!canWriteReview) {
      showToast("Please log in to write a review", "error");
      return;
    }
    setShowReviewForm(true);
  };

  // Review Card Component
  const ReviewCard = React.memo(({ review }) => {
    const hasImages = Array.isArray(review.images) && review.images.length > 0;

    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-[0_1px_8px_rgba(17,24,39,0.04)]">
        {/* Reviewer Name */}
        {review.name && (
          <h4 className="font-semibold text-gray-900 text-[16px] mb-1">{review.name}</h4>
        )}

        {/* Rating */}
        {review.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(review.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">{Number(review.rating).toFixed(1)}</span>
          </div>
        )}

        {/* Title */}
        {review.title && (
          <h5 className="text-sm font-semibold text-gray-800 mb-1">{review.title}</h5>
        )}

        {/* Comment */}
        {review.comment && (
          <p className="text-gray-700 text-[14px] leading-normal mb-2 whitespace-pre-line wrap-break-word">
            {review.comment}
          </p>
        )}

        {/* Images */}
        {hasImages && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-1">
            {review.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Review upload ${index + 1}`}
                className="w-full h-16 sm:h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImage(img)}
                onError={(e) => (e.target.style.display = "none")}
              />
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <ErrorBoundary>
      <div className="w-full border-b border-gray-200">
        <button
          onClick={() => setIsReviewsExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-gray-900">
              Reviews({displayReviews.length})
            </h3>
            {displayReviews.length > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < Math.round(currentAvgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                      }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">{currentAvgRating}</span>
              </div>
            )}
          </div>
          {isReviewsExpanded ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {isReviewsExpanded && (
          <div className="pb-4">
            {/* Write Review Button */}
            <button
              onClick={handleWriteReviewClick}
              className="w-full px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              disabled={!canWriteReview}
            >
              {canWriteReview ? "WRITE A REVIEW" : "LOGIN TO WRITE REVIEW"}
            </button>

            {/* Reviews List */}
            {displayReviews.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {displayReviews.map((review, index) => (
                  <ReviewCard key={review?.id || index} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to write one!</p>
              </div>
            )}
          </div>
        )}

        {/* Review Form Modal (unchanged) */}
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
            reviewImagePreviews={reviewImages.map((img) => img.preview)}
            onReviewImageChange={handleReviewImageChange}
            onRemoveReviewImage={handleRemoveReviewImage}
            isSubmitting={isSubmitting}
            handleSubmitReview={handleSubmitReview}
            handleCloseForm={handleCloseForm}
          />
        )}

        {/* Image Lightbox Modal */}
        {selectedImage &&
          ReactDOM.createPortal(
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/90 p-4 overflow-hidden"
              style={{ zIndex: 2147483647 }}
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <img
                src={selectedImage}
                alt="Full view"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body
          )}

        {toastData &&
          ReactDOM.createPortal(
            <div className="fixed top-5 right-5 pointer-events-none" style={{ zIndex: 2147483647 }}>
              <div
                className={`pointer-events-auto rounded-lg px-4 py-3 shadow-xl text-sm font-medium text-white ${
                  toastData.type === "error" ? "bg-red-700" : "bg-primary"
                }`}
              >
                {toastData.message}
              </div>
            </div>,
            document.body
          )}
      </div>
    </ErrorBoundary>
  );
};

export default ProductReviewsSection;
