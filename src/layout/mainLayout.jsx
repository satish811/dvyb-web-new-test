import React, { useLayoutEffect } from "react";
import HomeFooter from "../components/b2c/home/HomeFooter";
import { useLocation } from "react-router-dom";


export default function MainLayout({ children }) {
  const location = useLocation();

  // Synchronous scroll reset for every page using this layout
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/* Main content - top padding for fixed header */}
        <main className="flex-grow overflow-x-hidden relative z-10 mt-[73px]">

          {children}
        </main>

        <HomeFooter />
      </div >
    </>
  );
}
