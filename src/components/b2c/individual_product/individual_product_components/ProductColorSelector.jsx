import React from "react";
import { useNavigate } from "react-router-dom";

const ProductColorSelector = ({ similarProducts = [], currentProductId, currentColorName = "" }) => {
  const navigate = useNavigate();

  // If no similar products at all, don't render
  if (similarProducts.length === 0) return null;

  const handleProductClick = (productId) => {
    if (String(productId) !== String(currentProductId)) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="flex flex-col w-full" style={{ gap: "10px" }}>
      {/* Label: COLOUR: <current color name> */}
      <p
        style={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 550,
          fontSize: "14px",
          lineHeight: "21.33px",
          letterSpacing: "0.5px",
          color: "#333333",
          whiteSpace: "nowrap",
        }}
      >
        COLOUR: &nbsp;
        <span style={{ fontWeight: 400, color: "#555555" }}>
          {currentColorName}
        </span>
      </p>

      {/* Similar Product Thumbnails */}
      <div
        className="flex items-center flex-wrap"
        style={{ gap: "8px" }}
      >
        {similarProducts.map((sp) => {
          const isCurrentProduct = String(sp.id) === String(currentProductId);
          const thumbImage = sp.imageUrls?.[0] || "/placeholder.jpg";

          return (
            <button
              key={sp.id}
              onClick={() => handleProductClick(sp.id)}
              className="transition-all duration-200 overflow-hidden flex-shrink-0 cursor-pointer"
              style={{
                width: "72px",
                height: "90px",
                border: isCurrentProduct
                  ? "2px solid #33022F"
                  : "1px solid #E5E7EB",
                padding: 0,
                backgroundColor: "#F9FAFB",
                borderRadius: "4px",
                opacity: isCurrentProduct ? 1 : 0.85,
              }}
              title={sp.colorName || ""}
            >
              <img
                src={thumbImage}
                alt={sp.colorName || "Color variant"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductColorSelector;


