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

  // Handle View All button click
  const handleViewAllClick = () => {
    navigate("/womenwear");
  };

  // Inline grid template prevents Tailwind purge from stripping dynamic classes
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  };

  return (
    <div className=" p-5 w-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold ">{heading}</h2>
        </div>
        {/* View All Button */}
        <button
          onClick={handleViewAllClick}
          className="text-primary hover:border-b border-primary relative font-[Outfit,sans-serif] text-[14px] font-medium uppercase text-gray-700 hover:text-black transition-colors duration-200 pb-1 group"
        >
          View All
        </button>
      </div>

      {/* Responsive grid — we use inline style for reliable dynamic columns */}
      <div className="grid gap-4 auto-rows-fr" style={gridStyle}>
        {dailyPicks && dailyPicks.length > 0
          ? dailyPicks.map((product) => (
              <article
                key={product.id}
                className="bg-white  border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                // ensure cards don't overlap and are on top
                style={{ minHeight: 360, zIndex: 10 }}
              >
                {/* Image wrapper: fixed aspect ratio box */}
                <div className="w-full h-48 sm:h-56 md:h-48 lg:h-56 overflow-hidden">
                  <img
                    src={product.imageUrls[0] || product.imageUrls?.[0] || ""}
                    alt={product.name}
                    className="w-full h-full object-cover block"
                    // onError={(e) => (e.currentTarget.style.opacity = 0.6)}
                  />
                </div>

                {/* content */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {product.shortDescription || product.description || ""}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-lg font-semibold text-rose-700 dark:text-rose-400">
                      {product.price ? `₹${product.price.toLocaleString()}` : "—"}
                    </div>
                  </div>
                </div>
              </article>
            ))
          : Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-700  h-72" />
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
