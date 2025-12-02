// components/navbar/MobileMenu.jsx
import { useAuth } from "../../../context/AuthContext";
import { FaTimes } from "react-icons/fa";
import { mainlogo } from "../../../assets";
import { LuHeart } from "react-icons/lu";
import { GoPerson } from "react-icons/go";
import { MdOutlineShoppingBag } from "react-icons/md";

export default function MobileMenu({ isOpen, onClose, navItems, onNavClick, onProtectedClick }) {
  if (!isOpen) return null;
  const { signOutUser } = useAuth();

  return (
    <div className="fixed inset-0 z-[9999] lg:hidden" onClick={onClose}>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/40" />

      {/* centered dropdown panel */}
      <div
        className="absolute top-16 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-white rounded-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <img src={mainlogo} alt="Logo" className="h-8" />
          <button onClick={onClose} aria-label="Close menu">
            <FaTimes className="text-2xl text-gray-600" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2">
          <button
            onClick={() => onProtectedClick("/categories")}
            className="w-full text-left text-gray-800 py-2"
          >
            CATEGORIES
          </button>

          <button
            onClick={() => onProtectedClick("/virtual-tryon")}
            className="w-full text-left text-gray-800 py-2"
          >
            VIRTUAL TRYON
          </button>

          <button
            onClick={() => onProtectedClick("/mywishlist")}
            className="w-full text-left text-gray-800 py-2 flex items-center gap-3"
          >
            <LuHeart size={18} />
            Wishlist
          </button>

          <button
            onClick={() => onProtectedClick("/mycart")}
            className="w-full text-left text-gray-800 py-2 flex items-center gap-3"
          >
            <MdOutlineShoppingBag size={18} />
            Cart
          </button>

          <button
            onClick={() => onProtectedClick("/profile")}
            className="w-full text-left text-gray-800 py-2 flex items-center gap-3"
          >
            <GoPerson size={18} />
            Profile
          </button>

          <button onClick={() => signOutUser()} className="w-full text-left text-gray-800 py-2">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// // components/navbar/MobileMenu.jsx
// import { FaTimes } from "react-icons/fa";

// export default function MobileMenu({ isOpen, onClose, navItems, onNavClick, onProtectedClick }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[9999] lg:hidden" onClick={onClose}>
//       <div className="fixed inset-0 bg-black/50" />
//       <div
//         className="fixed top-0 left-0 w-80 max-w-full h-full bg-white shadow-2xl overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center p-5 border-b">
//           <img src="/logo.png" alt="Logo" className="h-8" />
//           <button onClick={onClose}>
//             <FaTimes className="text-2xl text-gray-600" />
//           </button>
//         </div>

//         <nav className="py-4">
//           {navItems.map((item) => (
//             <button
//               key={item.label}
//               onClick={() => {
//                 onNavClick(item.path);
//                 onClose();
//               }}
//               className={`block w-full text-left px-6 py-4 font-medium transition ${
//                 item.isHighlight ? "text-red-600 bg-red-50" : "text-gray-800 hover:bg-gray-50"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         <div className="border-t mt-4 pt-4 px-6 space-y-3">
//           <button onClick={() => onProtectedClick("/mywishlist")} className="flex items-center gap-3 text-gray-700">
//             Wishlist
//           </button>
//           <button onClick={() => onProtectedClick("/mycart")} className="flex items-center gap-3 text-gray-700">
//             Cart ({/* cartCount */})
//           </button>
//           <button onClick={() => onProtectedClick("/profile")} className="flex items-center gap-3 text-gray-700">
//             Profile
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
