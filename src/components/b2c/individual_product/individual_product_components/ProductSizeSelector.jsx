import React, { useState, useEffect } from "react";
import SizeChartPopup from "../../../common/PopUps/sizeChartPopup";

const ProductSizeSelector = ({
  selectedSizes = [],
  units = {},
  onSizeSelect,
  selectedSize,
  showError,
  sizeChart = null,
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

  // Predefined order for standard sizes
  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "FREE SIZE"];

  // Final size list - use sizes from colors if available, otherwise use selectedSizes
  // Sort them based on predefined size order
  const displaySizes = (
    Object.keys(sizesWithStock).length > 0 ? Object.keys(sizesWithStock) : selectedSizes
  ).sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a);
    const indexB = SIZE_ORDER.indexOf(b);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

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
          className="flex items-center justify-between w-full"
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
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "21.33px",
              letterSpacing: "0.18px",
              color: "#33022F",
              cursor: "pointer",
              margin: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              transition: "0.2s",
              whiteSpace: "nowrap",
              textDecoration: "underline",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#4a0344";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#33022F";
            }}
          >
            Size Guide
          </button>
        </div>

        {/* ------------------------------- */}
        {/* SIZE BOX ROW */}
        {/* ------------------------------- */}
        <div
          className={`flex flex-wrap gap-3`}
          style={{
            gap: "12px",
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
                  className="rounded-lg transition-all duration-200"
                  style={{
                    minWidth: "64px",
                    height: "48px",
                    padding: "0 16px",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: available
                      ? internalSelectedSize === size
                        ? "#FFFFFF"
                        : "#000000"
                      : "#808080",
                    background: available
                      ? internalSelectedSize === size
                        ? "#000000"
                        : "#FFFFFF"
                      : "#F5F5F5",
                    border: available
                      ? internalSelectedSize === size
                        ? "2px solid #000000"
                        : showError
                          ? "2px solid #EF4444"
                          : "2px solid #D1D5DB"
                      : "2px solid #E5E7EB",
                    cursor: available ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
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
      {showSizeChart && <SizeChartPopup onClose={handleCloseSizeChart} sizeChart={sizeChart} />}
    </>
  );
};

export default ProductSizeSelector;
