import React, { useState } from "react";

const ProductColorSelector = ({ colors = [] }) => {
  // Static fallback colors
  const staticColors = ["#424647", "#E9D252", "#EC8CB7", "#A32033"];


  const backendColors = colors
    .map((c) => {
      if (typeof c === "string") {
        if (c.includes("_")) {
          return c.split("_")[1];
        }
        return c;
      }
      return c;
    })
    .filter(Boolean);

  const displayColors = backendColors.length ? backendColors : staticColors;

  const [selectedColor, setSelectedColor] = useState(displayColors[0]);

  // Function to check if color is white or close to white
  const isWhiteColor = (hex) => {
    if (!hex || typeof hex !== "string") return false;

    // Clean the hex code
    const cleanHex = hex.replace("#", "").toLowerCase();


    let rgbHex = cleanHex;
    if (cleanHex.length === 8) {
      rgbHex = cleanHex.slice(0, 6);
    }

    // Convert to RGB
    const r = parseInt(rgbHex.slice(0, 2), 16);
    const g = parseInt(rgbHex.slice(2, 4), 16);
    const b = parseInt(rgbHex.slice(4, 6), 16);


    return r > 240 && g > 240 && b > 240;
  };

  return (
    <div
      className="flex flex-col w-full max-w-[159px]"
      style={{
        gap: "8px",
      }}
    >
      {/* Title */}
      <p
        style={{
          height: "22px",
          fontFamily: "Outfit, sans-serif",
          fontWeight: 550,
          fontSize: "16px",
          lineHeight: "21.33px",
          letterSpacing: "1px",
          textTransform: "capitalize",
          color: "#000000",
          whiteSpace: "nowrap",
        }}
      >
        Available Colors
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
          const isWhite = isWhiteColor(hex);

          // Determine border color
          let borderColor = hex;
          if (isWhite) {
            borderColor = "#374151"; // grey-700 color
          }

          return (
            <button
              key={index}
              onClick={() => setSelectedColor(hex)}
              className="transition-all duration-200"
              style={{
                width: "24px",
                height: "24px",
                border: isSelected ? `3px solid ${borderColor}` : `2px solid ${borderColor}`,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: hex,
                borderRadius: "50%",
                cursor: "pointer",
                boxShadow: isSelected ? "0 0 0 2px white, 0 0 0 4px " + borderColor : "none",
              }}
            >
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductColorSelector;
