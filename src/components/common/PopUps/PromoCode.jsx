import React from "react";

export default function OfferPopup() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {/* Popup Container */}
      <div className="relative bg-white w-[90%] max-w-sm text-center p-8 shadow-lg border border-gray-200 rounded-md">
        {/* Close Button */}
        <button className="absolute top-3 right-3 text-gray-500 hover:text-black text-3xl font-light">
          ×
        </button>

        {/* Main Text */}
        <h2 className="text-gray-900 text-lg md:text-xl font-medium mb-2 tracking-wide">
          CHECKOUT NOW
        </h2>
        <p className="text-gray-900 text-base md:text-lg font-medium mb-5">GET FLAT 15% OFF</p>

        {/* Code Section */}
        <p className="text-gray-800 text-base md:text-lg font-medium mb-6">
          Code : <span className="text-red-700 font-semibold">HAPPY15</span>
        </p>

        {/* Copy Code Button */}
        <button className="bg-black text-white text-sm md:text-base font-medium py-3 w-full hover:bg-gray-900 transition-colors">
          COPY CODE
        </button>

        {/* Terms */}
        <p className="text-gray-600 text-[12px] md:text-[13px] mt-4 tracking-wide">
          *T & C’s Apply - Applicable on selected items
        </p>
      </div>
    </div>
  );
}
