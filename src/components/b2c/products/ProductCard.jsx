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
      className="bg-white cursor-pointer overflow-hidden duration-300 group flex flex-col"
      style={{
        width: "207px",
        height: "386px",
        gap: "12px",
        borderRadius: "0px",
      }}
      onClick={() => {
        navigate(`/products/${product.id}`);
        onClose();
      }}
    >
      {/* Product Image */}
      <div
        className="bg-gray-50 overflow-hidden relative"
        style={{ width: "207px", height: "288px", flexShrink: 0 }}
      >
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onError={handleImageError}
          style={{
            maxWidth: "207px",
            maxHeight: "288px",
          }}
        />
      </div>

      {/* Product Info */}
      <div
        className="px-1 pt-2 flex flex-col items-start"
        style={{
          width: "207px",
          height: "89px",
          overflow: "hidden",
          gap: "10px",
        }}
      >
        {/* Product Name */}
        <h3
          className="uppercase"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "12.11px",
            letterSpacing: "0.45px",
            color: "#101828",
          }}
        >
          {(product.name || "Product Name").length > 10
            ? (product.name || "Product Name").slice(0, 10) + "..."
            : product.name || "Product Name"}
        </h3>

        {/* Product Description */}
        <p
          className="line-clamp-2"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "14px",
            letterSpacing: "0.5px",
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
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "15.14px",
              letterSpacing: "0px",
              color: "#400000",
            }}
          >
            ₹{product.price?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
