import React, { useState } from "react";

const ProductColorSelector = ({ colors = [] }) => {
  console.log("The colors we get", colors);

  // Static fallback colors
  const staticColors = ["#424647", "#E9D252", "#EC8CB7", "#A32033"];

  // Extract hex values from backend like "pink_#DB7093"
  const backendColors = colors
    .map((c) => {
      if (typeof c === "string") {
        // Handle formats like "white_#ffffffff" or just "#FFFFFF"
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

    // Handle 8-digit hex (with alpha) - take first 6 digits
    let rgbHex = cleanHex;
    if (cleanHex.length === 8) {
      rgbHex = cleanHex.slice(0, 6);
    }

    // Convert to RGB
    const r = parseInt(rgbHex.slice(0, 2), 16);
    const g = parseInt(rgbHex.slice(2, 4), 16);
    const b = parseInt(rgbHex.slice(4, 6), 16);

    // Check if it's white or very light (threshold can be adjusted)
    return r > 240 && g > 240 && b > 240;
  };

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
              style={{
                width: "30px",
                height: "30px",
                border: isSelected ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
                padding: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                borderRadius: "2px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: hex,
                  borderRadius: "1px",
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
