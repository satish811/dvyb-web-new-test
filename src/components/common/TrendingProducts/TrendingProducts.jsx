// TrendingProducts.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useProducts } from "../../../hooks/useProducts";
import { getDailyRandomProducts } from "../../utils/getDailyRandomProducts";
import { useNavigate } from "react-router-dom";
import { isProductOutOfStock, isProductPublishedByBoth } from "../../../utils/productVisibility";

const TrendingProducts = ({
  onClose,
  column = 4,
  heading = "Trending Products",
  cardSize = "large",
}) => {
  const { products } = useProducts();
  const [dailyPicks, setDailyPicks] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  // clamp columns to sensible range
  const cols = Math.min(Math.max(column || 2, 2), 6);

  useEffect(() => {
    if (products && products.length) {
      const availableProducts = products.filter(
        (product) => isProductPublishedByBoth(product) && !isProductOutOfStock(product)
      );
      setDailyPicks(getDailyRandomProducts(availableProducts, cols));
    } else {
      setDailyPicks([]);
    }
  }, [products, cols]);

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleViewAllClick = () => {
    navigate("/womenwear");
  };

  // Desktop grid template — inline style overrides Tailwind only on large screens
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  };

  const getDisplayImage = (product) => {
    if (imageErrors[product.id] || !product.imageUrls?.[0]) {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    return product.imageUrls[0];
  };

  // Card size styles
  const isSmall = cardSize === "small";
  const cardStyles = {
    // Mobile: 160px width, Desktop: 210px width for small cards
    cardWidth: isSmall ? "160px" : "auto",
    cardWidthMd: isSmall ? "210px" : "auto",
    imageAspect: "3/4",
    gap: isSmall ? "4px" : "8px",
    nameSize: isSmall ? "11px" : "12px",
    descSize: isSmall ? "10px" : "11px",
    priceSize: isSmall ? "12px" : "13px",
    infoGap: isSmall ? "2px" : "6px",
  };

  return (
    <div className="w-full">
      {heading && (
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`font-semibold ${isSmall ? "text-sm sm:text-base" : "text-base sm:text-lg md:text-xl"}`}
          >
            {heading}
          </h2>
          <button
            onClick={handleViewAllClick}
            className="font-[Outfit,sans-serif] text-xs sm:text-sm md:text-[14px] font-medium uppercase text-gray-700 hover:text-black hover:border-b border-primary transition pb-1"
          >
            View All
          </button>
        </div>
      )}

      {/* Horizontal Scroll for Small / Grid for Large */}
      <div
        className={
          isSmall
            ? "flex gap-4 md:gap-10 overflow-x-auto pb-2 scroll-smooth"
            : "grid gap-4 sm:gap-5 lg:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
        }
        style={
          isSmall
            ? {
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }
            : gridStyle
        }
      >
        {dailyPicks && dailyPicks.length > 0
          ? dailyPicks.map((product) => (
              <div
                key={product.id}
                className={`bg-white cursor-pointer overflow-hidden duration-300 group flex flex-col ${isSmall ? "shrink-0" : ""}`}
                style={{
                  width: isSmall ? cardStyles.cardWidth : "100%",
                  minWidth: isSmall ? cardStyles.cardWidth : "auto",
                  gap: cardStyles.gap,
                  borderRadius: "0px",
                }}
                onClick={() => {
                  navigate(`/products/${product.id}`);
                  if (onClose) onClose();
                }}
              >
                {/* Product Image Container */}
                <div
                  className="bg-gray-50 overflow-hidden relative w-full"
                  style={{
                    aspectRatio: cardStyles.imageAspect,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={getDisplayImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    onError={() => handleImageError(product.id)}
                  />
                </div>

                {/* Product Info */}
                <div
                  className={`${isSmall ? "px-0.5 pt-0.5" : "px-1 pt-1 sm:pt-2"} flex flex-col items-start w-full`}
                  style={{
                    height: "auto",
                    overflow: "hidden",
                    gap: cardStyles.infoGap,
                  }}
                >
                  {/* Product Name */}
                  <h3
                    className="uppercase w-full truncate"
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 600,
                      fontSize: cardStyles.nameSize,
                      lineHeight: "1.1",
                      letterSpacing: "0.35px",
                      color: "#101828",
                    }}
                  >
                    {product.name || "Product Name"}
                  </h3>

                  {/* Product Description */}
                  <p
                    className="line-clamp-2 w-full"
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 400,
                      fontSize: cardStyles.descSize,
                      lineHeight: "1.3",
                      letterSpacing: "0.2px",
                      color: "#545555",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {product.description || product.shortDescription || ""}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-center gap-2 w-full">
                    <span
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 500,
                        fontSize: cardStyles.priceSize,
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
            ))
          : // Skeletons
            Array.from({ length: cols }).map((_, i) => (
              <div
                key={i}
                className={`animate-pulse bg-slate-100 ${isSmall ? "h-32 sm:h-40 shrink-0" : "h-48 sm:h-56"}`}
                style={{
                  aspectRatio: cardStyles.imageAspect,
                  width: isSmall ? cardStyles.cardWidth : "auto",
                  minWidth: isSmall ? cardStyles.cardWidth : "auto",
                }}
              />
            ))}
      </div>
    </div>
  );
};

TrendingProducts.propTypes = {
  onClose: PropTypes.func,
  column: PropTypes.number,
  heading: PropTypes.string,
  cardSize: PropTypes.oneOf(["small", "large"]),
};

export default TrendingProducts;
