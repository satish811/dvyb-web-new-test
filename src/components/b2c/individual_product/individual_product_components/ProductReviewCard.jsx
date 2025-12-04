import React from "react";
import { Star } from "lucide-react";

const ProductReviewCard = ({ review }) => {
  const { name, rating, comment, date, image } = review;

  return (
    <div className="flex gap-3 pb-3">
      <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
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
