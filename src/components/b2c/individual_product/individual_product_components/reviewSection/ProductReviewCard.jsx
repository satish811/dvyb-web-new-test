import React from "react";
import { Star } from "lucide-react";

const ProductReviewCard = ({ review }) => {
  // Handle both static and real review data structures
  const name = review.userName || review.name;
  const rating = review.rating;
  const comment = review.comment;
  const date = review.createdAt
    ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
    : review.date;
  const image = review.userImage || review.image;

  return (
    <div className="flex gap-3 pb-3">
      <img
        src={image}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
        onError={(e) => {
          e.target.src = "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
        }}
      />

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{name}</p>
            {review.userRole && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {review.userRole}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{date}</p>
        </div>

        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={`${
                i < Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-700 leading-snug">{comment}</p>
      </div>
    </div>
  );
};

export default ProductReviewCard;
