import Navbar from "../components/common/navbar/navbar";
import Footer from "../components/common/footer/footer";
import { useLocation } from "react-router-dom";

export default function MainLayout({ children }) {
  const location = useLocation();

  const hideHeaderOnMobile = location.pathname.startsWith("/products")
    || location.pathname.startsWith("/womenwear");

  return (
    <div className="flex flex-col min-h-screen hide-scrollbar">
      
      {/* Fixed Header - Hidden on mobile for product pages */}
      <header className={`${hideHeaderOnMobile ? "hidden md:block" : "block"} fixed top-0 left-0 right-0 z-50`}>
        <Navbar />
      </header>

      {/* Main content with proper margin */}
      <main className={`flex-grow overflow-y-auto ${hideHeaderOnMobile ? "md:mt-24" : "mt-20 sm:mt-24 md:mt-24 lg:mt-38"}`}>
        {children}
      </main>

      <footer className="footer">
        <Footer />
      </footer>
    </div>
  );
}