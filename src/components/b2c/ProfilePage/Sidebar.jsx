import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaShoppingBag,
  FaImages,
  FaHeart,
  FaSignOutAlt,
  FaChevronRight,
  FaUserPlus,
} from "react-icons/fa";
import { LogOut } from "lucide-react";
import B2BAuthService from "../../../services/b2bAuthService";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();

  // Base menu items - common for all users
  const baseMenu = [
    { id: "my-info", label: "My info", icon: <FaUser /> },
    { id: "my-orders", label: "My orders", icon: <FaShoppingBag /> },
    { id: "my-tryon-gallery", label: "My Try-On Gallery", icon: <FaImages /> },
    { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
  ];

  // Profile creation item - only for B2C users
  const profileCreationItem = {
    id: "profile-creation",
    label: "Profile Creation",
    icon: <FaUserPlus />,
  };

  // Safe URL creation helper
  const safeGetUserCompleteProfile = async (uid) => {
    try {
      // Ensure uid is valid
      if (!uid || typeof uid !== "string") {
        throw new Error("Invalid user ID");
      }

      return await B2BAuthService.getUserCompleteProfile(uid);
    } catch (error) {
      console.error("❌ [Sidebar] Error in getUserCompleteProfile:", error);
      return null;
    }
  };

  // Fetch user data including role
  useEffect(() => {
    const getUserRoleAndData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 [Sidebar] Fetching user role for UID:", user.uid);

        // First try to get B2B user complete profile
        const completeProfile = await safeGetUserCompleteProfile(user.uid);

        if (completeProfile && completeProfile.success && completeProfile.data) {
          const userData = completeProfile.data;
          const hasB2BData = userData.pan || userData.aadhaar;

          if (hasB2BData) {
            console.log("✅ [Sidebar] User is B2B with complete profile");
            setUserRole("B2B");
            setData(userData);
          } else {
            console.log("ℹ️ [Sidebar] User doesn't have B2B data, defaulting to B2C");
            setUserRole("B2C");
            await fetchB2CData();
          }
        } else {
          console.log("ℹ️ [Sidebar] No B2B profile found, defaulting to B2C");
          setUserRole("B2C");
          await fetchB2CData();
        }
      } catch (error) {
        console.error("❌ [Sidebar] Error getting user role and data:", error);
        setUserRole("B2C"); // Default fallback
        await fetchB2CData();
      } finally {
        setLoading(false);
      }
    };

    const fetchB2CData = async () => {
      try {
        let ref = doc(db, "b2c_users", user.uid);
        let snap = await getDoc(ref);

        if (snap.exists()) {
          const userData = snap.data();
          console.log("✅ [Sidebar] Found B2C user data");
          setData(userData);
        } else {
          console.log("ℹ️ [Sidebar] No B2C user data found");
          // Try to get basic user info from auth
          setData({
            name: user.displayName || user.email?.split("@")[0] || "User",
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("❌ [Sidebar] Error fetching B2C data:", error);
        // Fallback to basic auth info
        setData({
          name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email || "",
        });
      }
    };

    getUserRoleAndData();
  }, [user]);

  // Create menu based on user role
  const getMenuItems = () => {
    // Start with base menu
    let menuItems = [...baseMenu];

    console.log("📋 [Sidebar] Building menu for role:", userRole);

    // Add profile creation only for B2C users
    if (userRole === "B2C") {
      console.log("➕ [Sidebar] Adding Profile Creation for B2C user");
      menuItems.push(profileCreationItem);
    } else if (userRole === "B2B") {
      console.log("➖ [Sidebar] Skipping Profile Creation for B2B user");
    }

    console.log(
      "📋 [Sidebar] Final menu items:",
      menuItems.map((item) => item.label)
    );
    return menuItems;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      // Use navigate instead of window.location for better routing
      navigate("/");

      // Force a small delay before reload to ensure navigation happens
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get menu items based on role
  const menu = getMenuItems();

  // Show loading state
  if (loading) {
    return (
      <div className="hidden md:block w-64 h-[calc(100vh-40px)] mt-12 bg-gray-50 p-4 fixed left-0 top-[40px] overflow-y-auto z-40">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP SIDEBAR - Fixed position below navbar */}
      <div className="hidden md:block w-64 h-[calc(100vh-40px)] mt-12 bg-gray-50 p-4 fixed left-0 top-[40px] overflow-y-auto z-40">
        {/* Welcome Message with Role Badge */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            Hello {data?.name || data?.username || "User"}
          </h2>
          {userRole && (
            <div
              className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${userRole === "B2C" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
            >
              {userRole === "B2B" ? "Business Account" : "Personal Account"}
            </div>
          )}
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
              {item.icon && <span className="text-lg">{item.icon}</span>}
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
        {/* Header with Role Badge */}
        <div className="bg-white  border-gray-200 px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              MY ACCOUNT
            </h2>
            {userRole && (
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${userRole === "B2C" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
              >
                {userRole}
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <ul className="bg-white">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="border-b border-gray-100 px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-gray-500">{item.icon}</span>}
                <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  {item.label}
                </span>
              </div>
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
