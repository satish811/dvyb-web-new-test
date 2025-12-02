import React, { useMemo } from "react";

const ProductPriceSection = ({ product }) => {
  const { price } = product || {};

  // ✅ Random discount (30–80%) — only once per render
  const discountPercent = useMemo(() => {
    return Math.floor(Math.random() * (80 - 30 + 1)) + 30;
  }, []);

  // ✅ Calculate the original (higher) price
  const originalPrice = useMemo(() => {
    if (!price) return null;
    const increasedAmount = (price * discountPercent) / 100;
    return Math.round(price + increasedAmount);
  }, [price, discountPercent]);

  return (
    <div className="flex flex-col gap-1">
      {/* Price Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Current Selling Price */}
        <span className="text-2xl md:text-3xl font-semibold text-gray-900">
          ₹{price?.toLocaleString()}
        </span>

        {/* Original Price (strikethrough) */}
        <span className="text-gray-400 line-through text-lg">
          ₹{originalPrice?.toLocaleString()}
        </span>

        {/* Discount Percentage */}
        <span className="text-red-500 font-semibold text-sm">{discountPercent}% OFF</span>
      </div>

      {/* Tax Info */}
      <p className="text-sm text-gray-600">inclusive of all taxes</p>
    </div>
  );
};

export default ProductPriceSection;
