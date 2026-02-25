import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import B2BAuthService from "../../../services/b2bAuthService";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, signOutUser } = useAuth();
  const [data, setData] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();

  // Base menu items - Uppercase labels, no icons (MY MODEL & MY TRY-ON GALLERY hidden for B2B)
  const baseMenu = [
    { id: "my-info", label: "MY INFO" },
    { id: "my-orders", label: "MY ORDERS" },
    { id: "profile-creation", label: "MY MODEL", b2cOnly: true },
    { id: "my-tryon-gallery", label: "MY TRY-ON GALLERY", b2cOnly: true },
    { id: "wishlist", label: "MY WISHLIST" },
  ];

  // Safe URL creation helper
  const safeGetUserCompleteProfile = async (uid) => {
    try {
      if (!uid || typeof uid !== "string") throw new Error("Invalid user ID");
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
        const completeProfile = await safeGetUserCompleteProfile(user.uid);

        if (completeProfile && completeProfile.success && completeProfile.data) {
          const userData = completeProfile.data;
          const hasB2BData = userData.pan || userData.aadhaar;

          if (hasB2BData) {
            setUserRole("B2B");
            setData(userData);
          } else {
            setUserRole("B2C");
            await fetchB2CData();
          }
        } else {
          setUserRole("B2C");
          await fetchB2CData();
        }
      } catch (error) {
        console.error("❌ [Sidebar] Error getting user role and data:", error);
        setUserRole("B2C");
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
          setData(snap.data());
        } else {
          setData({
            name: user.displayName || user.email?.split("@")[0] || "User",
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("❌ [Sidebar] Error fetching B2C data:", error);
        setData({
          name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email || "",
        });
      }
    };

    getUserRoleAndData();
  }, [user]);

  // Create menu based on user role — hide B2C-only items for B2B users
  const getMenuItems = () => {
    if (userRole === "B2B") {
      return baseMenu.filter((item) => !item.b2cOnly);
    }
    return [...baseMenu];
  };

  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);
      await signOutUser(); // This will handle redirect to home page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menu = getMenuItems();

  if (loading) {
    return (
      <div className="hidden md:block w-64 h-screen mt-20 bg-white p-4 fixed left-0 top-0 z-40">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 h-screen pt-32 pb-10 bg-white fixed left-0 top-0 z-40 border-r border-gray-100 overflow-y-auto font-[Outfit]">

        <ul className="flex flex-col w-full">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`cursor-pointer px-8 py-5 text-sm font-semibold tracking-wide transition-all duration-200 border-l-[5px]
                ${activeTab === item.id
                  ? "bg-[#FFF5F5] text-[#800000] border-[#800000]"
                  : "text-[#1C1B1F] border-transparent hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {item.label}
            </li>
          ))}

          {/* Logout Button */}
          <li
            onClick={() => setShowLogoutModal(true)}
            className="cursor-pointer px-8 py-5 text-sm font-semibold tracking-wide text-[#1C1B1F] border-l-[5px] border-transparent hover:bg-gray-50 hover:text-red-700 transition-all duration-200 mt-8"
          >
            LOGOUT
          </li>
        </ul>
      </div>

      {/* MOBILE SIDEBAR (Drawer Style) */}
      <div className="md:hidden bg-white min-h-screen font-[Outfit]">
        <div className="bg-white px-4 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#33022F] uppercase tracking-wider">MY ACCOUNT</h2>
        </div>

        <ul className="bg-white">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`border-b border-gray-50 px-5 py-4 flex items-center justify-between cursor-pointer transition-colors
                 ${activeTab === item.id ? "bg-[#FFF5F5] text-[#800000]" : "text-gray-900 hover:bg-gray-50"}
               `}
            >
              <span className="text-sm font-semibold uppercase tracking-wide">{item.label}</span>
              <ChevronRight size={16} className={activeTab === item.id ? "text-[#800000]" : "text-gray-400"} />
            </li>
          ))}
        </ul>

        <div className="px-5 mt-8">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full bg-[#800000] text-white py-3.5 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide rounded hover:bg-[#660000] transition-colors"
          >
            <LogOut size={16} />
            LOGOUT
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999] font-[Outfit]">
          <div className="bg-white rounded-lg shadow-xl p-8 w-80 text-center mx-4">
            <h3 className="text-lg font-bold mb-6 text-[#33022F]">
              Are you sure you want to Log Out?
            </h3>
            <div className="flex justify-center gap-4">
              <button onClick={handleLogout} className="bg-[#800000] text-white px-8 py-2.5 rounded hover:bg-[#660000] transition font-medium">Yes</button>
              <button onClick={() => setShowLogoutModal(false)} className="bg-gray-200 text-gray-800 px-8 py-2.5 rounded hover:bg-gray-300 transition font-medium">No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
