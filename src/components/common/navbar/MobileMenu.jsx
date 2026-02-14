import { useAuth } from "../../../context/AuthContext";
import { FaTimes } from "react-icons/fa";
// import { mainlogo } from "../../../assets";
import villyLogo from "../../../assets/b2c/landing/Landing-villy/VillyLogo11.png";
import { LuHeart } from "react-icons/lu";
import { GoPerson } from "react-icons/go";
import { MdOutlineShoppingBag } from "react-icons/md";

export default function MobileMenu({ isOpen, onClose, navItems, onNavClick, onProtectedClick }) {
  if (!isOpen) return null;
  const { signOutUser } = useAuth();

  return (
    <div className="fixed inset-0 z-[9999] lg:hidden" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" />

      {/* Centered Dropdown Panel */}
      <div
        className="
          absolute 
          top-14
          left-1/2 
          transform -translate-x-1/2
          w-[92%] sm:w-11/12
          max-w-md 
          bg-white 
          rounded-md 
          shadow-2xl 
          overflow-hidden 
          max-h-[80vh] 
          overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <img src={villyLogo} alt="Villy Logo" className="h-10 w-auto object-contain" />
          <button onClick={onClose} aria-label="Close menu">
            <FaTimes className="text-2xl text-gray-600" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-1.5 sm:space-y-2">
          <button
            onClick={() => onProtectedClick("/categories")}
            className="w-full text-left text-gray-800 py-1.5 sm:py-2"
          >
            CATEGORIES
          </button>

          <button
            onClick={() => onProtectedClick("/virtual-tryon")}
            className="w-full text-left text-gray-800 py-1.5 sm:py-2"
          >
            VIRTUAL TRYON
          </button>

          <button
            onClick={() => onProtectedClick("/wishlist")}
            className="w-full text-left text-gray-800 py-1.5 sm:py-2 flex items-center gap-3"
          >
            <LuHeart size={18} />
            Wishlist
          </button>

          <button
            onClick={() => onProtectedClick("/mycart")}
            className="w-full text-left text-gray-800 py-1.5 sm:py-2 flex items-center gap-3"
          >
            <MdOutlineShoppingBag size={18} />
            Cart
          </button>

          <button
            onClick={() => onProtectedClick("/profile")}
            className="w-full text-left text-gray-800 py-1.5 sm:py-2 flex items-center gap-3"
          >
            <GoPerson size={18} />
            Profile
          </button>

          <button
            onClick={() => signOutUser()}
            className="w-full text-left text-gray-800 py-1.5 sm:py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
