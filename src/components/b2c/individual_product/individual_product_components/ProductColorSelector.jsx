import React from "react";
import { useNavigate } from "react-router-dom";
import colorUtils from "../../../utils/colorUtils";

const ProductColorSelector = ({
  similarProducts = [],
  currentProductId,
  currentColorName = "",
  availableColorNames = [],
  totalInventory = 0,
  isSaree = false
}) => {
  const navigate = useNavigate();

  // If no similar products at all, don't render
  if (similarProducts.length === 0) return null;

  const shouldShowInventory = isSaree && totalInventory > 0 && totalInventory < 10;

  const colorToProductId = similarProducts.reduce((acc, sp) => {
    const key = (sp.colorName || "").trim().toLowerCase();
    if (key && !acc[key]) {
      acc[key] = sp.id;
    }
    return acc;
  }, {});

  const availableColors = Array.from(
    new Set(
      [...availableColorNames, ...similarProducts.map((sp) => sp.colorName)]
        .map((name) => (name || "").trim())
        .filter(Boolean)
    )
  );

  const handleProductClick = (productId) => {
    if (String(productId) !== String(currentProductId)) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="flex flex-col w-full" style={{ gap: "10px" }}>
      {/* Label: COLOUR: all available color circles */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: "Outfit, sans-serif",
          fontWeight: 550,
          fontSize: "14px",
          letterSpacing: "0.5px",
          color: "#333333",
          whiteSpace: "nowrap",
          gap: "8px",
        }}
      >
        <span>COLOUR:</span>
        <div className="flex items-center flex-wrap" style={{ gap: "6px" }}>
          {(availableColors.length ? availableColors : [currentColorName]).map((colorName) => {
            const isCurrent = (colorName || "").toLowerCase() === (currentColorName || "").toLowerCase();
            const targetProductId = colorToProductId[(colorName || "").toLowerCase()];
            return (
              <button
                key={colorName || "default-color"}
                type="button"
                onClick={() => targetProductId && handleProductClick(targetProductId)}
                style={{
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: colorUtils.getHexFromName(colorName || currentColorName),
                  border: isCurrent ? "2px solid #33022F" : "1px solid #E5E7EB",
                  boxShadow: isCurrent ? "0 0 0 1px #FFFFFF inset" : "none",
                  cursor: targetProductId ? "pointer" : "default",
                }}
                title={colorName || currentColorName}
                aria-label={`Color ${colorName || currentColorName}`}
              />
            );
          })}
        </div>
      </div>

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

      {/* Inventory Count for Sarees (< 10 items) */}
      {shouldShowInventory && (
        <div style={{ marginTop: "1px", color: "#DC2626", fontWeight: "600", fontSize: "13px" }}>
          Only {totalInventory} item{totalInventory !== 1 ? 's' : ''} left
        </div>
      )}
    </div>
  );
};

export default ProductColorSelector;


