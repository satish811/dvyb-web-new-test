import React from "react";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export default function DisplayCard({
  product,
  className,
  showDiscount = true,
  showShopNow = true,
}) {
  const navigate = useNavigate();
  
  const handleNavigate = (e) => {
    e?.stopPropagation();
    if (product?.path) {
      navigate(product.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigate();
    }
  };

  const discountPercent = product?.discountPercent || 0;
  const imageUrl = product?.images?.[0] || "";
  const productTitle = product?.title || "Product";

  return (
    <article
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        className
      )}
      role="article"
      aria-label={`Product card: ${productTitle}`}
    >
      {/* Image Container - Removed all spacing */}
      <div className="relative w-full">
        {/* Product Image */}
        <div 
          className="w-full h-full cursor-pointer flex items-center justify-center "
          onClick={handleNavigate}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${productTitle}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productTitle}
              className="min-w-[120%] max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/fallback-image.jpg";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
        </div>

        {/* Text Overlay - Reduced padding for tighter layout */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-10 pb-10 px-4">
          {/* Product Title */}
          <h3 className="text-center text-sm sm:text-base md:text-lg text-white font-semibold uppercase tracking-tight mb-1">
            {productTitle}
          </h3>
          
          {/* Shop Now Button */}
          {showShopNow && (
            <div className="flex justify-center">
              <button
                onClick={handleNavigate}
                className="text-white uppercase text-xs md:text-sm tracking-wider hover:underline font-medium focus:outline-none focus:underline"
                aria-label={`Shop now for ${productTitle}`}
              >
                SHOP NOW
              </button>
            </div>
          )}
          
          {/* Price Display - Moved price here like in your design */}
          {/* {product?.price && ( */}
            {/* // <div className="text-center mt-2">
            //   <span className="text-white font-medium text-lg md:text-xl">
            //     ${product.price.toFixed(2)}
            //   </span>
            // </div>
          // )} */}
          
          {/* Discount Badge - Positioned differently if needed */}
          {showDiscount && discountPercent > 0 && (
            <div className="absolute top-3 right-3">
              <span
                className="inline-block px-2 py-1 bg-red-600 text-white uppercase rounded text-xs font-bold"
                aria-label={`Discount: up to ${discountPercent} percent`}
              >
                {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}