import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../../../context/WishlistContext";
import { isProductOutOfStock } from "../../../utils/productVisibility";

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

  // Stock Status
  const stockStatus = product.stockStatus || "In Stock";
  const isOutOfStock = isProductOutOfStock(product) || stockStatus === "Out of Stock";

  // Calculate total inventory for sarees
  const calculateTotalInventory = () => {
    if (!product.units || typeof product.units !== "object") return 0;
    let total = 0;
    Object.values(product.units).forEach((colorSizes) => {
      if (typeof colorSizes === "object" && colorSizes !== null) {
        Object.values(colorSizes).forEach((quantity) => {
          total += parseInt(quantity) || 0;
        });
      }
    });
    return total;
  };

  const totalInventory = calculateTotalInventory();
  const isSaree = product.dressType?.toLowerCase() === "saree";
  const shouldShowInventory = isSaree && totalInventory > 0 && totalInventory < 10;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    if (!isOutOfStock) {
      navigate(`/products/${product.id}`);
      onClose?.();
    }
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
      className={`bg-white rounded-md shadow-sm overflow-hidden duration-300 group flex flex-col w-full relative ${!isOutOfStock ? 'hover:shadow-md cursor-pointer' : 'opacity-70'}`}
      onClick={handleCardClick}
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-[2/3] bg-gray-50 overflow-hidden rounded-t-md">
        <img
          src={displayImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${!isOutOfStock ? 'group-hover:scale-105' : ''}`}
          onError={handleImageError}
        />

        {/* NEW Label */}
        {isNew && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
            New
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-lg">
              <p className="text-gray-900 font-bold text-sm uppercase">Out of Stock</p>
            </div>
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
        {/* Product Name - Bold Serif as per Image 2 */}
        <h3
          className="w-full text-left truncate text-gray-900 capitalize"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '11.08px',
            lineHeight: '14.77px',
            letterSpacing: '0px',
          }}
        >
          {product.name || product.title || "Product Name"}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2.5 w-full">
          <span
            className="text-black"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400, // Matching the requested weight
              fontSize: '11.08px', // Matching the requested size for consistency, or should I scale? Let's try to match the title's style or keep it slightly larger if it's price? 
              // The user said "this is the font and the design". I will apply it to the price too or just the title?
              // Usually price is distinct. But if I use the same style it might look uniform.
              // Let's stick to the requested font family for price at least.
              // Actually, looking at the crop 4/6, the price "₹ 1,200.00" looks large.
              // The text "Classic Cotton Dress" in crop 4/6 also looks large.
              // BUT the user gave specific 11.08px. This is very specific. 11px is small. 
              // Maybe the user is referring to the *grid item* details?
              // The first image shows a grid. The titles there are small.
              // I will apply the 11.08px to the title in the card.
              // For the price, I will use Outfit but maybe let it inherit or pick a size? 
              // I will update the price to use Outfit font-family to be safe.
            }}
          >
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

        {/* Inventory Count for Sarees (< 10 items)
        {shouldShowInventory && (
          <div className="text-xs text-red-600 font-medium mt-1">
            Only {totalInventory} item{totalInventory !== 1 ? 's' : ''} left
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ProductCard;
