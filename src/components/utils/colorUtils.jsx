// Color palette mapping
const COLOR_PALETTE = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  blue: "#0000FF",
  green: "#00AA00",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  brown: "#A52A2A",
  gray: "#808080",
  navy: "#000080",
  teal: "#008080",
  maroon: "#800000",
  olive: "#808000",
  lime: "#00FF00",
  aqua: "#00FFFF",
  silver: "#C0C0C0",
  gold: "#FFD700",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  ivory: "#FFFFF0",
  khaki: "#F0E68C",
  turquoise: "#40E0D0",
  coral: "#FF7F50",
  salmon: "#FA8072",
  peach: "#FFDAB9",
  lavender: "#E6E6FA",
  mint: "#98FF98",
  indigo: "#4B0082",
};

// Standard color options
export const FILTER_OPTIONS = {
  selectedColors: Object.entries(COLOR_PALETTE).map(([name, hex]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    hex,
  })),
};

export const colorUtils = {
  /**
   * Parse color from "colorName_#hexCode" format
   * Handles both formats: "red_#FF0000" and just "red"
   */
  parseColor: (colorString) => {
    if (!colorString) return { name: "Unknown", hex: "#000000" };

    // Handle "colorName_#hexCode" format
    if (colorString.includes("_")) {
      const [name, hex] = colorString.split("_");
      return {
        name: name.trim().toLowerCase(),
        hex: hex?.trim() || "#000000",
      };
    }

    // Handle just color name - lookup in palette
    const lowerColorString = colorString.toLowerCase().trim();
    const hex = COLOR_PALETTE[lowerColorString];

    if (hex) {
      return { name: lowerColorString, hex };
    }

    // Fallback - if it looks like a hex code, use it
    if (colorString.startsWith("#")) {
      return { name: "Custom", hex: colorString };
    }

    // Last resort - use input as name with default color
    return { name: lowerColorString, hex: "#000000" };
  },

  /**
   * Get hex code from color name
   */
  getHexFromName: (colorName) => {
    if (!colorName) return "#000000";
    return COLOR_PALETTE[colorName.toLowerCase()] || "#000000";
  },

  /**
   * Format color for storage (name_#hex)
   */
  formatColor: (name, hex) => {
    if (!name || !hex) return "";
    return `${name.toLowerCase().trim()}_${hex.trim()}`;
  },

  /**
   * Get color name from hex code
   */
  getNameFromHex: (hex) => {
    if (!hex) return "Unknown";
    const entry = Object.entries(COLOR_PALETTE).find(
      ([_, color]) => color.toUpperCase() === hex.toUpperCase()
    );
    return entry ? entry[0] : "Custom";
  },

  /**
   * Validate if color exists in palette
   */
  isValidColor: (colorName) => {
    return colorName && colorName.toLowerCase() in COLOR_PALETTE;
  },

  /**
   * Get all available colors
   */
  getAllColors: () => {
    return Object.entries(COLOR_PALETTE).map(([name, hex]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      hex,
    }));
  },
};

export default colorUtils;
