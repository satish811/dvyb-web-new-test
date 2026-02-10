import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white max-w-md w-full relative overflow-hidden rounded-lg shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={handleCloseForm}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10 transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none rounded-md"
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
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none resize-none rounded-md"
                  maxLength={1000}
                  required
                />
                <div className="text-right text-xs text-gray-500 mt-1">{comment.length}/1000</div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full bg-red-800 text-white py-4 font-semibold text-sm uppercase tracking-wide hover:bg-red-700 transition disabled:bg-gray-400 rounded-md"
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
