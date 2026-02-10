import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../../../context/WishlistContext";

/**
 * ProductCard displays a single product with clean UI and enhanced visual hierarchy.
 * Updated to match Reference Image 2:
 * - White card background, rounded corners (md), subtle shadow
 * - Product image full width
 * - Wishlist icon in rounded-circle on top-right
 * - Product title (bold serif)
 * - Price & old price
 * - Small colored swatches
 * - "New" label
 */
const ProductCard = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Wishlist Logic
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    toggleWishlist(product);
  };

  const imageUrl = product.imageUrls?.[0];
  const displayImage =
    imageError || !imageUrl
      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E"
      : imageUrl;

  // Pricing Logic
  const price = product.price || 0;
  const originalPrice = product.originalPrice || 0;
  const hasDiscount = originalPrice > price;

  // "New" Label Logic (assuming product.isNew or based on timestamp, defaulting to false if not found unless clearly new)
  // Image 2 shows "NEW" label. I'll try to use product.isNew or similar if exists, otherwise mocked for demo if needed, but per instruction "no logic change", I will use whatever property is available. 
  // B2CProductModel says `isNew`.
  const isNew = product.isNew;

  // Colors Logic
  // Extract colors for swatches. Sidebar.jsx logic suggests `selectedColors` is array of string "Name_Hex" or similar?
  // Sidebar says: color.split("_"), [name, hex].
  const colors = Array.isArray(product.selectedColors)
    ? product.selectedColors.map(c => {
      if (typeof c === 'string') {
        const parts = c.split('_');
        return parts.length > 1 ? parts[1] : null; // Hex
      }
      return null;
    }).filter(Boolean).slice(0, 4) // Limit to 4 swatches
    : [];

  return (
    <div
      className="bg-white rounded-md shadow-sm hover:shadow-md cursor-pointer overflow-hidden duration-300 group flex flex-col w-full relative"
      onClick={() => {
        navigate(`/products/${product.id}`);
        onClose?.();
      }}
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-[2/3] bg-gray-50 overflow-hidden rounded-t-md">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          onError={handleImageError}
        />

        {/* NEW Label */}
        {isNew && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
            New
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md hover:scale-110 transition-transform duration-200 z-10"
        >
          <Heart
            size={18}
            className={`${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col items-start w-full gap-2">
        {/* Product Name - Bold Serif as per Image 2 */}
        <h3 className="w-full text-left truncate font-serif font-bold text-base text-gray-900 tracking-wide capitalize">
          {product.name || product.title || "Product Name"}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2.5 w-full">
          <span className="text-black font-bold text-base sm:text-lg">
            ₹{price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 text-sm line-through decoration-gray-400">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            {colors.map((hex, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: hex }}
              />
            ))}
            {/* If more than 4 colors, maybe show +X? Image 2 shows just dots. */}
            {product.selectedColors?.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">+{product.selectedColors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
