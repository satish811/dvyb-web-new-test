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
    <div className="flex flex-col gap-2">
      {/* Price Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Current Selling Price */}
        <span className="text-3xl md:text-4xl font-bold text-gray-900">
          ₹{price?.toLocaleString()}
        </span>

        {/* Original Price (strikethrough) */}
        <span className="text-gray-500 line-through text-xl font-medium">
          ₹{originalPrice?.toLocaleString()}
        </span>

        {/* Discount Percentage Badge */}
        <span className="bg-red-100 text-red-600 font-bold text-sm px-3 py-1 rounded-full">
          {discountPercent}% OFF
        </span>
      </div>

      {/* Tax Info */}
      <p className="text-sm text-gray-600 font-normal">inclusive of all taxes</p>
    </div>
  );
};

export default ProductPriceSection;
