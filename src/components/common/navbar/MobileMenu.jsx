import { useAuth } from "../../../context/AuthContext";
import { useUI } from "../../../context/UIContext";
import { FaTimes } from "react-icons/fa";
import villyLogo from "../../../assets/b2c/landing/Landing-villy/VillyLogo11.png";
import { LuHeart } from "react-icons/lu";
import { GoPerson } from "react-icons/go";
import { MdOutlineShoppingBag } from "react-icons/md";
import { useLocation } from "react-router-dom";

export default function MobileMenu({ isOpen, onClose, navItems, onNavClick, onProtectedClick }) {
  if (!isOpen) return null;
  const { user, loading, signOutUser, userRole, userProfile } = useAuth();
  const { setTryOnModalOpen } = useUI();
  const location = useLocation();

  const isB2B = () => {
    const urlParams = new URLSearchParams(location.search);
    const userType = urlParams.get("usertype");
    const path = location.pathname.toLowerCase();

    const isB2BPath = path.includes("b2b") || urlParams.get("b2b") === "true";
    const isB2BRole = userRole?.toUpperCase() === "B2B" || userProfile?.role?.toUpperCase() === "B2B" || userProfile?.userType?.toUpperCase() === "B2B";
    const isB2BSession = sessionStorage.getItem("villy_b2b_mode") === "true";

    const currentlyB2B = userType?.toLowerCase() === "b2b" || isB2BPath || isB2BRole;

    // If we explicitly see B2C, reset session storage
    if (userType?.toLowerCase() === "b2c" || path.includes("b2c")) {
      if (isB2BSession) sessionStorage.removeItem("villy_b2b_mode");
      return false;
    }

    // If we detect B2B now, persist it
    if (currentlyB2B && !isB2BSession) {
      sessionStorage.setItem("villy_b2b_mode", "true");
    }

    return currentlyB2B || isB2BSession;
  };

  const handleLoginClick = () => {
    onClose();
    // This will trigger the login modal via the guard function in navbar
    onProtectedClick("/profile");
  };

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
            onClick={() => {
              onNavClick("/womenwear");
              onClose();
            }}
            className="w-full text-left text-gray-800 py-1.5 sm:py-2 font-bold tracking-widest uppercase"
          >
            CATEGORIES
          </button>

          <div className="flex flex-col items-start py-1.5 sm:py-2">
            <button
              onClick={() => {
                onNavClick("/menwear");
                onClose();
              }}
              className="w-full text-left text-gray-800 font-bold tracking-widest uppercase"
            >
              MEN
            </button>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider pointer-events-none">
              Coming Soon
            </span>
          </div>

          {!isB2B() && (
            <button
              onClick={() => {
                setTryOnModalOpen(true);
                onClose();
              }}
              className="w-full text-left font-['Outfit'] py-1.5 sm:py-2 animate-subtle-blink font-bold tracking-widest uppercase text-black text-lg"
            >
              VIRTUAL TRY ON
            </button>
          )}

          {/* Show Login/Signup button when NOT logged in */}
          {!user && !loading && (
            <button
              onClick={handleLoginClick}
              className="w-full text-left bg-[#800000] text-white py-2.5 px-4 rounded-md font-semibold text-sm uppercase tracking-wide hover:bg-[#660000] transition-colors mt-2"
            >
              Login / Signup
            </button>
          )}

          {/* Show user-specific items when logged in */}
          {user && (
            <>
              <button
                onClick={() => {
                  onProtectedClick("/wishlist");
                  onClose();
                }}
                className="w-full text-left text-gray-800 py-1.5 sm:py-2 flex items-center gap-3"
              >
                <LuHeart size={18} />
                Wishlist
              </button>

              <button
                onClick={() => {
                  onNavClick("/cart");
                  onClose();
                }}
                className="w-full text-left text-gray-800 py-1.5 sm:py-2 flex items-center gap-3"
              >
                <MdOutlineShoppingBag size={18} />
                Cart
              </button>

              <button
                onClick={() => {
                  onProtectedClick("/profile");
                  onClose();
                }}
                className="w-full text-left text-gray-800 py-1.5 sm:py-2 flex items-center gap-3"
              >
                <GoPerson size={18} />
                Profile
              </button>

              <button
                onClick={() => {
                  signOutUser();
                  onClose();
                }}
                className="w-full text-left text-gray-800 py-1.5 sm:py-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
