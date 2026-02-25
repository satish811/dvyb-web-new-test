import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Disable browser's native scroll restoration globally — runs once on mount.
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Reset ALL scroll positions on every route change
  React.useLayoutEffect(() => {
    // 1. Reset window scroll
    window.scrollTo({ top: 0, behavior: "instant" });

    // 2. Reset html + body scroll (covers Safari edge cases)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 3. Reset #root if it has become a scroll container
    const root = document.getElementById("root");
    if (root) root.scrollTop = 0;

    // 4. Reset any inner scrollable layout containers (e.g. main, .layout-scroll)
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;
