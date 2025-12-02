import React from "react";
import { Clock } from "lucide-react";
import truck from "../../../../assets/ProductsPage/Vector.svg";

const ProductStockAndShipping = ({ stock = 1 }) => {
  const isLowStock = stock <= 3; // customize threshold

  // Calculate shipping date (today + 6 days)
  const calculateShippingDate = () => {
    const today = new Date();
    const shippingDate = new Date(today);
    shippingDate.setDate(today.getDate() + 6);

    return shippingDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const shippingDate = calculateShippingDate();

  return (
    <div className="space-y-3 mt-4">
      {/* Stock Info */}
      <div className="flex items-center gap-2 text-gray-800 text-sm">
        <Clock size={16} className="text-gray-600" />
        <span>Limited Stock Available</span>

        {isLowStock && (
          <span className="ml-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-[2px] uppercase tracking-wide">
            Hurry
          </span>
        )}
      </div>

      {/* Shipping Info */}
      <div className="flex items-start gap-2 text-gray-700 text-sm leading-relaxed">
        <img
          src={truck}
          alt="Shipping"
          style={{
            width: "18.33px",
            height: "12.55px",
            marginTop: "4.44px",
            marginLeft: "1.51px",
          }}
        />
        <p>
          <span className="font-semibold text-gray-900">Standard Shipping : </span>
          The estimated shipping date for this product is by{" "}
          <span className="font-medium text-gray-900">{shippingDate}</span>. Please note that this
          is the shipping date and not the delivery date.
          <span className="font-medium text-gray-900">{shippingDate}</span>. Please note that this
          is the shipping date and not the delivery date.
        </p>
      </div>
    </div>
  );
};

export default ProductStockAndShipping;
