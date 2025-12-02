import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import b2clogo from "../../../assets/Navbar/B2cLogo.png";
import { Navigate, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaShoppingBag,
  FaCamera,
  FaImages,
  FaHeart,
  FaTrophy,
  FaShareAlt,
  FaRupeeSign,
  FaSignOutAlt,
  FaChevronRight,
} from "react-icons/fa";
import { LogOut } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();

  const menu = [
    { id: "my-info", label: "My info", icon: <FaUser /> },
    { id: "my-orders", label: "My orders", icon: <FaShoppingBag /> },
    { id: "my-tryon-gallery", label: "My Try-On Gallery", icon: <FaImages /> },
    { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
  {id: "profile-creation", label: "Profile Creation"}

  ];

  // Fetch user data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        let ref = doc(db, "b2c_users", user.uid);
        let snap = await getDoc(ref);

        if (snap.exists()) {
          setData(snap.data());
        } else {
          ref = doc(db, "B2BBulkOrders_users", user.uid);
          snap = await getDoc(ref);
          if (snap.exists()) {
            setData(snap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* DESKTOP SIDEBAR - Fixed position below navbar */}
      <div className="hidden md:block w-64 h-[calc(100vh-40px)] mt-12 bg-gray-50 p-4 fixed left-0 top-[40px] overflow-y-auto z-40">
        {/* Welcome Message */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Hello {data?.name || "User"}</h2>
        </div>

        {/* Menu Items */}
        <ul className="space-y-1">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`cursor-pointer flex items-center gap-3 p-3 rounded-md transition-all duration-200 ${
                activeTab === item.id ? "text-primary font-semibold" : "text-gray-700"
              }`}
            >
              <span>{item.label}</span>
            </li>
          ))}

          {/* Logout Button */}
          <li
            onClick={() => setShowLogoutModal(true)}
            className="cursor-pointer flex items-center gap-3 p-3 rounded-md mt-4 text-red-600 hover:bg-red-50 transition-all duration-200 border-t border-gray-200 pt-4"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </li>
        </ul>
      </div>

      {/* MOBILE SIDEBAR - Full page overlay */}
      <div className="md:hidden bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white  border-gray-200 px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            MY ACCOUNT
          </h2>
        </div>

        {/* Menu Items */}
        <ul className="bg-white">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="border-b border-gray-100 px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                {item.label}
              </span>
              <FaChevronRight className="text-gray-400 text-xs" />
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="px-4 mt-auto pt-8 pb-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full bg-[#8B0000] text-white py-3 flex items-center justify-center gap-2 font-medium text-sm uppercase tracking-wide hover:bg-[#6d0000] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-80 text-center mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Are you sure you want to Log Out?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
