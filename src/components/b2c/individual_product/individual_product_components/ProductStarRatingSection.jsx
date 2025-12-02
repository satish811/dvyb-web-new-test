import { Star } from "lucide-react";

const ProductStarRatingSection = ({ averageRating = 0 }) => {
  // Don't render anything if no reviews or zero rating
  if (!averageRating || averageRating === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center"
      style={{
        gap: "25px",
        height: "auto",
        width: "auto",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      {/* Star Icons */}
      <div className="flex items-center" style={{ gap: "4px" }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: "22px",
              height: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Star
              size={20}
              className={
                i < Math.floor(averageRating)
                  ? "text-yellow-500 fill-yellow-500"
                  : i < averageRating
                    ? "text-yellow-500 fill-yellow-500" // For partial stars, still show full
                    : "text-gray-300"
              }
              style={{
                clipPath:
                  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Numeric Rating */}
      <span
        style={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "21.33px",
          letterSpacing: "0.42px",
          color: "#808080",
        }}
      >
        {averageRating.toFixed(1)}
      </span>
    </div>
  );
};

export default ProductStarRatingSection;
