// components/navbar/NavIcons.jsx
import React from "react";
import { MdOutlineShoppingBag } from "react-icons/md";
import { GoPerson } from "react-icons/go";
import { LuHeart } from "react-icons/lu";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

export default function NavIcons({ onSearch, onWishlist, onCart, onProfile }) {
  const { cartCount, loading } = useCart();
  const { wishlistCount, loading: wishlistLoading } = useWishlist();
  return (
    <div className="md:flex items-center gap-6 sm:pr-0 md:pr-10 ">
      <button
        onClick={onSearch}
        className="hidden md:block text-gray-700 hover:text-black transition cursor-pointer"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      <button
        onClick={onWishlist}
        className="relative hidden md:block cursor-pointer"
        disabled={wishlistLoading}
      >
        <LuHeart size={24} />
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {wishlistLoading ? "..." : wishlistCount}
          </span>
        )}
      </button>

      <button onClick={onProfile} className="px-2 sm:px-0 cursor-pointer">
        <GoPerson size={24} />
      </button>

      <button onClick={onCart} className="relative cursor-pointer" disabled={loading}>
        <MdOutlineShoppingBag size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5  flex items-center justify-center font-bold">
            {loading ? "..." : cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
