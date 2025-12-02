import React from "react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPopUp() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="relative w-full max-w-4xl bg-white p-8 md:p-12">
        {/* Close Button */}
        <button className="absolute top-5 right-6 text-gray-500 hover:text-black text-xl font-light">
          ×
        </button>

        {/* Title */}
        <h4 className="text-black text-xl md:text-2xl font-semibold mb-10">LOGIN</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Existing Customers Section */}
          <div>
            <h5 className="text-gray-900 text-base md:text-lg font-medium mb-6">
              For Existing Customers
            </h5>

            <div className="flex flex-col gap-5 mb-4">
              <input
                type="email"
                placeholder="Email ID"
                className="w-full border border-gray-300 focus:border-black text-sm md:text-base px-4 py-3 outline-none placeholder-gray-500"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 focus:border-black text-sm md:text-base px-4 py-3 outline-none placeholder-gray-500"
              />
            </div>

            <p className="text-gray-600 text-sm mb-5 cursor-pointer hover:underline">
              Forgot your password ?
            </p>

            <button className="w-full bg-black text-white py-3 text-sm md:text-base font-medium hover:bg-gray-900 transition-colors">
              LOGIN
            </button>
          </div>

          {/* Google Login Section */}
          <div className="flex flex-col justify-center">
            <h2 className="text-gray-900 text-base md:text-lg font-medium mb-6">
              Login with Google
            </h2>

            <button className="flex items-center justify-center gap-3 w-full border border-gray-300 py-3 hover:bg-gray-50 transition-colors">
              <FcGoogle className="text-xl" />
              <span className="text-gray-900 text-sm md:text-base font-medium">
                LOGIN WITH GOOGLE
              </span>
            </button>

            <p className="text-gray-700 text-sm md:text-base mt-10">
              Don’t have an account ?{" "}
              <span className="text-red-700 font-medium cursor-pointer hover:underline">
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
