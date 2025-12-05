import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * ProductCard displays a single product with clean UI and enhanced visual hierarchy.
 */
const ProductCard = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = product.imageUrls?.[0];
  const displayImage =
    imageError || !imageUrl
      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E"
      : imageUrl;

  return (
    <div
      className="bg-white cursor-pointer overflow-hidden duration-300 group flex flex-col w-full"
      style={{
        height: "auto", // Let content determine height
        gap: "8px", // Smaller gap on mobile
        borderRadius: "0px",
      }}
      onClick={() => {
        navigate(`/products/${product.id}`);
        onClose?.();
      }}
    >
      {/* Product Image Container */}
      <div
        className="bg-gray-50 overflow-hidden relative w-full"
        style={{
          aspectRatio: "3/4", // Maintain 3:4 aspect ratio
          flexShrink: 0,
        }}
      >
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onError={handleImageError}
        />
      </div>

      {/* Product Info */}
      <div
        className="px-1 pt-1 sm:pt-2 flex flex-col items-start w-full"
        style={{
          height: "auto",
          overflow: "hidden",
          gap: "6px", // Smaller gap on mobile
        }}
      >
        {/* Product Name */}
        <h3
          className="uppercase w-full truncate"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: "12px", // Smaller on mobile
            lineHeight: "1.1",
            letterSpacing: "0.35px",
            color: "#101828",
          }}
        >
          {product.name || "Product Name"}
        </h3>

        {/* Product Description - Hide on mobile, show on tablet+ */}
        <p
          className="hidden xs:block line-clamp-2 w-full"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 400,
            fontSize: "11px", // Smaller on mobile
            lineHeight: "1.2",
            letterSpacing: "0.4px",
            color: "#545555",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.description || "Product Description"}
        </p>

        {/* Price Section */}
        <div className="flex items-center gap-2 w-full">
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 500,
              fontSize: "13px", // Smaller on mobile
              lineHeight: "1.2",
              letterSpacing: "0px",
              color: "#400000",
            }}
          >
            ₹{product.price?.toLocaleString() || "0"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
