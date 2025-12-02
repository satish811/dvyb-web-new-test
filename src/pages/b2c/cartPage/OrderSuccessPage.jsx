import React from "react";
import { useNavigate } from "react-router-dom";
import confimImg from "../../../assets/b2c/images/SucessCart/confirmImg.png";

export default function OrderSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 font-[Outfit]">
      {/* ✅ Illustration */}
      <img
        src={confimImg} // replace with your image path
        alt="Order Confirmed"
        className="w-[220px] h-auto mb-6"
      />

      {/* ✅ Text Section */}
      <h1 className="text-[24px] font-semibold text-gray-900 mb-2 text-center">Order Confirmed</h1>
      <p className="text-gray-600 text-[15px] mb-8 text-center">Your payment was successful!</p>

      {/* ✅ Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate("/")}
          className="bg-[#800000] hover:bg-[#5e0000] text-white w-full py-3 text-[14px] uppercase tracking-wide rounded-sm transition-all duration-200"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate("/orders")}
          className="border border-[#800000] text-[#800000] hover:bg-gray-50 w-full py-3 text-[14px] uppercase tracking-wide rounded-sm transition-all duration-200"
        >
          Track Order
        </button>
      </div>
    </div>
  );
}
