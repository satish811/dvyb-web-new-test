// TrendingProducts.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useProducts } from "../../../hooks/useProducts";
import { getDailyRandomProducts } from "../../utils/getDailyRandomProducts";
import ProductCard from "../../product/ProductCard";
import { useNavigate } from "react-router-dom";

const TrendingProducts = ({ onClose, column = 4, heading = "Trending Products" }) => {
  const { products } = useProducts();
  const [dailyPicks, setDailyPicks] = useState([]);
  const navigate = useNavigate();

  // clamp columns to sensible range
  const cols = Math.min(Math.max(column || 2, 2), 6);

  useEffect(() => {
    if (products && products.length) {
      setDailyPicks(getDailyRandomProducts(products, cols));
    } else {
      setDailyPicks([]);
    }
  }, [products, cols]);

  const handleViewAllClick = () => {
    navigate("/womenwear");
  };

  // Desktop grid template — inline style overrides Tailwind only on large screens
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  };

  return (
    <div className="p-4 sm:p-5 w-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          {heading && <h2 className="text-base sm:text-lg md:text-xl font-semibold">{heading}</h2>}
        </div>

        {/* View All Button */}
        <button
          onClick={handleViewAllClick}
          className="text-primary hover:border-b border-primary font-[Outfit,sans-serif] 
          text-xs sm:text-sm md:text-[14px] font-medium uppercase text-gray-700 
          hover:text-black transition pb-1"
        >
          View All
        </button>
      </div>

      {/* Fully Responsive Grid */}
      <div
        className="
          grid gap-3 sm:gap-4 auto-rows-fr
          grid-cols-2            /* Mobile */
          sm:grid-cols-2         /* Small devices */
          md:grid-cols-3         /* Tablet */
          lg:gap-5               /* More spacing on desktop */
        "
        style={gridStyle} /* Desktop dynamic override */
      >
        {dailyPicks && dailyPicks.length > 0
          ? dailyPicks.map((product) => (
              <article
                key={product.id}
                className="
                bg-white border border-slate-100 overflow-hidden shadow-sm 
                transition flex flex-col cursor-pointer group
              "
                style={{ minHeight: 340, zIndex: 10 }}
                onClick={() => {
                  navigate(`/products/${product.id}`);
                  if (onClose) onClose();
                }}
              >
                {/* Improved responsive image heights */}
                <div className="w-full h-40 sm:h-48 md:h-52 lg:h-56 overflow-hidden">
                  <img
                    src={product.imageUrls[0] || ""}
                    alt={product.name}
                    className="w-full h-full object-cover block group-hover:scale-105 
                  transition-transform duration-300"
                  />
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <h3
                    className="text-xs sm:text-sm md:text-base font-medium 
                  text-slate-800 mb-1 line-clamp-2"
                  >
                    {product.name}
                  </h3>

                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mb-3 line-clamp-2">
                    {product.shortDescription || product.description || ""}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-base sm:text-lg font-semibold text-rose-700">
                      {product.price ? `₹${product.price.toLocaleString()}` : "—"}
                    </div>
                  </div>
                </div>
              </article>
            ))
          : // Skeletons
            Array.from({ length: cols }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-slate-100 dark:bg-slate-700 h-64 sm:h-72 rounded"
              />
            ))}
      </div>
    </div>
  );
};

TrendingProducts.propTypes = {
  onClose: PropTypes.func.isRequired,
  column: PropTypes.number,
};

export default TrendingProducts;
