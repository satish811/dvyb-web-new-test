import React, { useState } from "react";
import Login from "@/assets/b2c/images/Popups/Login.svg";

export default function GetOff() {
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white max-w-5xl w-full flex flex-col md:flex-row relative shadow-2xl rounded-lg overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Left side - Image */}
        <div className="w-full md:w-1/2 relative overflow-hidden bg-gray-800">
          <img
            src={Login}
            alt="Traditional Fashion"
            className="w-full h-48 md:h-full object-cover"
          />
          {/* Mobile close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 md:hidden w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
          >
            <span className="text-white text-lg font-bold leading-none">×</span>
          </button>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-6 sm:px-12 md:px-16 py-8 md:py-12 relative">
          {/* Desktop close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 hidden md:flex w-9 h-9 rounded-full border-2 border-gray-800 flex items-center justify-center bg-white hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-800 text-xl font-bold leading-none">×</span>
          </button>

          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-light mb-2 tracking-wide text-gray-900">
                GET <span className="font-semibold text-gray-900">30% OFF</span> RIGHT NOW
              </h1>

              <p className="text-xs sm:text-sm tracking-widest text-gray-600 uppercase font-medium">
                Enter email below to unlock
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
              <div className="flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="w-4 h-4 border-2 border-gray-600 cursor-pointer focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-sm"
                />
              </div>
              <span className="text-xs text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                Yes, I would like to receive news and special offers.
              </span>
            </label>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                className="w-full bg-gradient-to-r from-red-700 to-red-800 text-white py-3 text-sm font-medium tracking-widest uppercase hover:from-red-800 hover:to-red-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                style={{ letterSpacing: "1.5px" }}
              >
                Get my 30% off
              </button>

              <button
                onClick={() => setIsVisible(false)}
                className="w-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 py-3 text-sm font-medium tracking-widest uppercase hover:from-gray-400 hover:to-gray-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-gray-300"
                style={{ letterSpacing: "1.5px" }}
              >
                No, thanks
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Limited time offer. Terms and conditions apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
