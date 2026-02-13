import HomeFooter from "../components/b2c/home/HomeFooter";
import { useLocation } from "react-router-dom";
import MarqueeStrip from "../components/common/navbar/MarqueeStrip";

export default function MainLayout({ children }) {
  const location = useLocation();

  const hideHeaderOnMobile =
    location.pathname.startsWith("/products") || location.pathname.startsWith("/womenwear");

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Main content - top padding for fixed header */}
        <main
          className={`flex-grow overflow-x-hidden ${hideHeaderOnMobile ? "md:mt-[73px]" : "mt-[73px]"}`}
        >
          {/* Marquee Strip - Scrolls with content */}
          {(location.pathname === "/" || location.pathname.includes("/usertype=b2b")) && <MarqueeStrip />}
          {children}
        </main>

        <footer>
          <HomeFooter />
        </footer>
      </div >
    </>
  );
}
