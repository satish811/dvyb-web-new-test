import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import { useWishlist } from "../../../../context/WishlistContext";
import SearchDropdown from "../../../common/navbar/SearchDropdown";
import { searchService } from "../../../../services/searchService";
import useDebounce from "../../../../hooks/useDebounce";
// Correct logo import
import villyLogo from "../../../../assets/b2c/landing/Landing-villy/VillyLogo11.png";

const MobileProductHeader = () => {
  const navigate = useNavigate();
  // ... (rest of the component until the render part)

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50">

      <div className="grid grid-cols-3 items-center px-4 h-[60px]">

        {/* Left */}
        <div className="flex justify-start">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Center LOGO */}
        <div className="flex justify-center">
          <img
            src={villyLogo}
            alt="Villy"
            className="h-10 object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Right Icons */}
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => setSearchOpen(true)}>
            <Search size={20} className="text-gray-900" />
          </button>

          <button onClick={() => navigate("/profile")}>
            <svg
              className="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>


    </div>
  );
};

export default MobileProductHeader;
