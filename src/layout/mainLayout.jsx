import Navbar from "../components/common/navbar/navbar";
import Footer from "../components/common/footer/footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen hide-scrollbar">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        
      </header>

      
      <main className="flex-grow overflow-y-auto mt-26 sm:mt-24 md:mt-10">{children}</main>

      
      <footer className="footer">
        <Footer />
        
      </footer>
    </div>
  );
}

