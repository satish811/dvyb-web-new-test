// ProfilePage.js
import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "../../../components/b2c/ProfilePage/Sidebar";
// import Sidebar from '../../../components/B2C/ProfilePage/Sidebar';
import MyInfo from "../../../components/b2c/ProfilePage/MyInfo";
import MyOrders from "../../../components/b2c/ProfilePage/Orders";
import WishlistPage from "../WishlistPage/WishlistPage";
import TryOnGallery from "../../../components/b2c/ProfilePage/TryOnGallery";
import MyProfile from "../ProfileCreation/MyProfile";


const ProfilePage = () => {
  // const [activeTab, setActiveTab] = useState("menu");
  const userId = "USER_ID_HERE";
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isMobile = window.innerWidth < 768;

  const [activeTab, setActiveTab] = useState(window.innerWidth < 768 ? "menu" : "my-info");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      const validTabs = ["my-info", "my-orders", "wishlist", "my-tryon-gallery","profile-creation"];
      if (validTabs.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
      } else {
        setActiveTab("my-info");
      }
    }
  }, [location.search, searchParams]);

  const handleBackToMenu = () => {
    setActiveTab("menu");
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "my-info":
        return "User Details";
      case "my-orders":
        return "My Orders";
      case "wishlist":
        return "My Wishlist";
      case "my-tryon-gallery":
        return "My Try-On Gallery";
       case "profile-creation":
  return "Profile Creation";
      default:
        return "";
    }
  };

  return (
    <>
      {/* DESKTOP VIEW - Sidebar + Content */}
      <div className="hidden md:flex min-h-screen mt-0 bg-gray-50">
        {/* Fixed Sidebar */}
    {activeTab !== "profile-creation" && (
  <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
)}

        {/* Main Content Area - offset by sidebar width */}
      <div className={`flex-1 p-6 min-h-screen -mt-28 ${activeTab !== "profile-creation" ? "ml-64" : ""}`}>

          <div className="max-w-7xl mx-auto">
            {activeTab === "my-info" && <MyInfo userId={userId} />}
            {activeTab === "my-orders" && <MyOrders />}
            {activeTab === "wishlist" && <WishlistPage />}
            {activeTab === "my-tryon-gallery" && <TryOnGallery />}
          {activeTab === "profile-creation" &&  <MyProfile />}

          </div>
        </div>
      </div>

      {/* MOBILE VIEW - Full screen navigation */}
      <div className="md:hidden min-h-screen bg-white">
        {/* Show Menu when activeTab is "menu" */}
        {activeTab === "menu" ? (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          /* Show selected component content with back button */
          <div className="w-full">
            {/* Mobile Header with Back Button */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
              <button onClick={handleBackToMenu} className="text-gray-700 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">{getPageTitle()}</h2>
            </div>

            {/* Component Content */}
            <div className="p-4">
              {activeTab === "my-info" && <MyInfo userId={userId} />}
              {activeTab === "my-orders" && <MyOrders />}
              {activeTab === "wishlist" && <WishlistPage />}
              {activeTab === "my-tryon-gallery" && <TryOnGallery />}
              {activeTab === "profile-creation" && <MyProfile />}

            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
