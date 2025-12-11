import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, paymentMethod } = location.state || {};

  return (
    <div className="w-full min-h-[calc(100vh-160px)] lg:min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center px-4 font-[Outfit] py-8">
      {/* Small Card (max-w-sm) */}
      <div className="max-w-sm w-full bg-white rounded-xl shadow-xl p-6 text-center border border-gray-100 relative overflow-hidden">

        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#800000]"></div>

        {/* Success Icon */}
        <div className="flex justify-center mb-5 mt-2">
          <div className="w-16 h-16 bg-[#800000]/5 rounded-full flex items-center justify-center animate-pulse-slow">
            <CheckCircle className="w-8 h-8 text-[#800000]" strokeWidth={2.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6 text-sm px-2">
          Thank you! We've received your order and payment.
        </p>

        {/* Compact Details Box */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-100 text-sm">
          <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="font-bold text-gray-900 font-mono">{orderId || "#12345678"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Payment</span>
            <span className="font-bold text-gray-900">
              {paymentMethod === "COD" ? "Cash on Delivery" : "Online"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/profile?tab=my-orders")}
            className="w-full bg-[#800000] hover:bg-[#660000] text-white py-3 px-4 rounded-lg font-semibold uppercase text-xs tracking-wider transition-all shadow-md"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white hover:bg-gray-50 text-[#800000] py-3 px-4 rounded-lg font-semibold border border-[#800000] uppercase text-xs tracking-wider transition-all"
          >
            Continue Shopping
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-gray-400 mt-5">
          Confirmation email sent to your inbox.
        </p>
      </div>
    </div>
  );
};


export default OrderSuccessPage;