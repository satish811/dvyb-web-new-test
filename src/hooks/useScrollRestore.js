import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollRestore(loading) {
  const location = useLocation();

  // Restore scroll when Home loads
  useEffect(() => {
    if (!loading && location.pathname === "/") {
      const scrollPosition = sessionStorage.getItem("homeScroll");

      if (scrollPosition) {
        window.scrollTo({
          top: parseInt(scrollPosition),
          behavior: "auto",
        });
      }
    }
  }, [loading, location.pathname]);

  // Save scroll before leaving Home
  useEffect(() => {
    return () => {
      if (location.pathname === "/") {
        sessionStorage.setItem("homeScroll", window.scrollY);
      }
    };
  }, [location.pathname]);
}