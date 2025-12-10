// components/navbar/NavIcons.jsx
import React from "react";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { BsCart4 } from "react-icons/bs";
import { GoPerson } from "react-icons/go";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { IoMdHeartEmpty } from "react-icons/io";

export default function NavIcons({ onSearch, onWishlist, onCart, onProfile }) {
  const { cartCount, loading } = useCart();
  const { wishlistCount, loading: wishlistLoading } = useWishlist();
  return (
    <div className="md:flex items-center gap-6 sm:pr-0 md:pr-10 ">
      <button
        onClick={onSearch}
        className="hidden md:block text-gray-700 hover:text-black transition cursor-pointer"
      >
        <HiMiniMagnifyingGlass size={24} />
      </button>

      <button
        onClick={onWishlist}
        className="relative hidden md:block cursor-pointer"
        disabled={wishlistLoading}
      >
        <IoMdHeartEmpty size={24} />
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {wishlistLoading ? "..." : wishlistCount}
          </span>
        )}
      </button>

      <button onClick={onProfile} className="px-2 sm:px-0 cursor-pointer">
        <GoPerson size={24} />

      </button>

      <button onClick={onCart} className="relative cursor-pointer" disabled={loading}>
        <BsCart4 size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5  flex items-center justify-center font-bold">
            {loading ? "..." : cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
