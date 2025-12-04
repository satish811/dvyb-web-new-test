import React, { useState } from "react";

const ProductColorSelector = ({ colors = [] }) => {
  // Static fallback colors
  const staticColors = ["#424647", "#E9D252", "#EC8CB7", "#A32033"];

  // Extract hex values from backend like "pink_#DB7093"
  const backendColors = colors
    .map((c) => (typeof c === "string" && c.includes("_") ? c.split("_")[1] : c))
    .filter(Boolean);

  const displayColors = backendColors.length ? backendColors : staticColors;

  const [selectedColor, setSelectedColor] = useState(displayColors[0]);

  return (
    <div
      className="flex flex-col w-full max-w-[159px]"
      style={{
        gap: "25px",
      }}
    >
      {/* Title */}
      <p
        style={{
          height: "22px",
          fontFamily: "Outfit, sans-serif",
          fontWeight: 600,
          fontSize: "16px",
          lineHeight: "21.33px",
          letterSpacing: "0px",
          textTransform: "uppercase",
          color: "#000000",
          whiteSpace: "nowrap",
        }}
      >
        AVAILABLE COLORS
      </p>

      {/* Color Row */}
      <div
        className="flex items-center flex-wrap"
        style={{
          gap: "19px",
          minHeight: "30px",
        }}
      >
        {displayColors.map((hex, index) => {
          const isSelected = selectedColor === hex;

          return (
            <button
              key={index}
              onClick={() => setSelectedColor(hex)}
              style={{
                width: "30px",
                height: "30px",
                border: isSelected ? `2px solid ${hex}` : `1px solid ${hex}`,
                padding: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: hex,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductColorSelector;
