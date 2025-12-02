import React from "react";
import { formatPrice } from "../../../utils";

const EmptyCardProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition duration-200">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
        <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-2 leading-tight">
          {product.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
          {product.description}
        </p>
        <div className="text-gray-900 font-medium text-lg">₹{formatPrice(product.price)}</div>
      </div>
    </div>
  );
};

export default EmptyCardProductCard;
