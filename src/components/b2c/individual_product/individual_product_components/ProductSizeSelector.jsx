import React, { useState, useEffect } from "react";
import SizeChartPopup from "../../../common/PopUps/sizeChartPopup";

const ProductSizeSelector = ({
  selectedSizes = [],
  units = {},
  onSizeSelect,
  selectedSize,
  showError,
}) => {
  const [internalSelectedSize, setInternalSelectedSize] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Sync with parent selectedSize
  useEffect(() => {
    setInternalSelectedSize(selectedSize);
  }, [selectedSize]);

  const extractSizesFromColors = () => {
    const sizesWithStock = {};

    Object.keys(units).forEach((key) => {
      if (["XS", "S", "M", "L", "XL", "XXL", "FREE SIZE"].includes(key)) {
        return;
      }

      if (key.includes("_#")) {
        const colorSizes = units[key];
        if (typeof colorSizes === "object" && colorSizes !== null) {
          Object.keys(colorSizes).forEach((size) => {
            const stock = colorSizes[size];
            const stockNumber = typeof stock === "number" ? stock : parseInt(stock, 10) || 0;

            if (!sizesWithStock[size] || stockNumber > sizesWithStock[size]) {
              sizesWithStock[size] = stockNumber;
            }
          });
        }
      }
    });

    return sizesWithStock;
  };

  // Get available sizes with their stock
  const sizesWithStock = extractSizesFromColors();

  // Final size list - use sizes from colors if available, otherwise use selectedSizes
  const displaySizes =
    Object.keys(sizesWithStock).length > 0 ? Object.keys(sizesWithStock) : selectedSizes;

  // Get stock for a specific size
  const getStockForSize = (size) => {
    return sizesWithStock[size] || 0;
  };

  // Check availability
  const isAvailable = (size) => getStockForSize(size) > 0;

  const handleSizeSelect = (size) => {
    if (!isAvailable(size)) return;
    setInternalSelectedSize(size);
    if (onSizeSelect) {
      onSizeSelect(size);
    }
  };

  const handleSizeGuideClick = () => {
    setShowSizeChart(true);
  };

  const handleCloseSizeChart = () => {
    setShowSizeChart(false);
  };

  return (
    <>
      <div
        className={`flex flex-col w-full max-w-[539px] ${showError ? "animate-shake" : ""}`}
        style={{
          gap: "15px", 
        }}
      >
        {/* ---------------------------------- */}
        {/* HEADER SECTION (ONE LINE ALWAYS) */}
        {/* ---------------------------------- */}
        <div
          className="flex items-center"
          style={{
            gap: "10px",
            whiteSpace: "nowrap", 
          }}
        >
          {/* Title */}
          <p
            style={{
              width: "auto",
              height: "22px",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "21.33px",
              letterSpacing: "0.18px",
              color: "#000000",
              margin: 1,
            }}
          >
            Select your size
          </p>

          {/* Size Guide */}
          <button
            onClick={handleSizeGuideClick}
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "13px",
              lineHeight: "21.33px",
              letterSpacing: "0.18px",
              color: "#E53935",
              cursor: "pointer",
              margin: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              transition: "0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = "underline";
              e.target.style.color = "#b32f2fff";
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = "none";
              e.target.style.color = "#E53935";
            }}
          >
            Size Guide
          </button>
        </div>

        {/* ------------------------------- */}
        {/* SIZE BOX ROW */}
        {/* ------------------------------- */}
        <div
          className={`flex flex-wrap xl:gap-[28px] 2xl:gap-[36px] `}
          style={{
            gap: "16px",
          }}
        >
          {displaySizes.map((size, index) => {
            const available = isAvailable(size);
            const stock = getStockForSize(size);

            return (
              <div key={index} className="relative">
                <button
                  onClick={() => handleSizeSelect(size)}
                  disabled={!available}
                  style={{
                    width: "46.22px",
                    height: "42.67px",
                    borderRadius: "px",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "14px",
                    color: available
                      ? internalSelectedSize === size
                        ? "#FFFFFF"
                        : "#000000"
                      : "#808080",
                    background: available
                      ? internalSelectedSize === size
                        ? "#573131ff"
                        : "#FFFFFF"
                      : "#F4F4F4",
                    border: available
                      ? internalSelectedSize === size
                        ? "1px solid #573131ff"
                        : showError
                          ? "1px solid #EF4444"
                          : "0.89px solid #D8D8D8"
                      : "0.89px solid #D8D8D8",
                    cursor: available ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  className={showError && !internalSelectedSize ? "hover:border-red-500" : ""}
                >
                  {size === "FREE SIZE" ? "FREE" : size}

                  {/* Stock Badge */}
                  {stock > 0 && (
                    <span
                      className="absolute"
                      style={{
                        top: "-10px",
                        right: "-10px",
                        background: "#B76E79",
                        color: "#fff",
                        fontSize: "9px",
                        padding: "2px 4px",
                        borderRadius: "3px",
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {stock} LEFT
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {showError && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Please select a size before adding to cart
          </p>
        )}
      </div>

      {/* Size Chart Popup */}
      {showSizeChart && <SizeChartPopup onClose={handleCloseSizeChart} />}
    </>
  );
};

export default ProductSizeSelector;
