import React from "react";
import { X } from "lucide-react";

export default function ReviewFormModal({
  rating,
  hoverRating,
  setRating,
  setHoverRating,
  title,
  setTitle,
  comment,
  setComment,
  isSubmitting,
  handleSubmitReview,
  handleCloseForm,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[999]">
      <div className="bg-white max-w-md w-full relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleCloseForm}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="pt-12 pb-8 px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">SUBMIT A REVIEW</h2>

          <form onSubmit={handleSubmitReview}>
            {/* ⭐ Star Rating */}
            <div className="mb-6 items-start">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-start">
                Give the star rating for the product
              </label>

              <div className="flex items-start justify-start space-x-2 text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating || rating) ? "🤩" : "⭐"}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-start">
                Write a title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter review title"
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                maxLength={100}
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">{title.length}/100</div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-start">
                Write the review......
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                maxLength={1000}
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">{comment.length}/1000</div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full bg-red-800 text-white py-4 font-semibold text-sm uppercase tracking-wide hover:bg-red-700 transition disabled:bg-gray-400"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
