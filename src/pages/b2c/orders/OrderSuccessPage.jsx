import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, paymentMethod } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We've received your payment and your order is being processed.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-semibold text-gray-900">{orderId || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-semibold text-gray-900">
              {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-sm text-gray-500 mb-6">
          You will receive an order confirmation email with details of your order and a link to
          track its progress.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/profile?tab=my-orders")}
            className="w-full bg-[#800000] hover:bg-[#660000] text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-md font-medium border border-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
