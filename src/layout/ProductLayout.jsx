// components/layouts/ProductLayout.jsx
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/b2c/sidebar/Sidebar";
import { ArrowLeft } from "lucide-react";

export default function ProductLayout({ children, products }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");

  // Format: "kurta-sets" → "KURTA SETS", fallback "All Products"
  const displayTitle = category
    ? category
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .toUpperCase()
    : "ALL PRODUCTS";

  return (
    <>
      {/* Mobile-Only Fixed Header with Back to Home */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Back Arrow → Go to Home */}
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Category Title */}
          <h1 className="text-lg font-bold tracking-wider">
            {displayTitle}
          </h1>

          {/* Empty space for balance */}
          <div className="w-10" />
        </div>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-4 pt-20 md:pt-24 lg:pt-8 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-80 xl:w-72 lg:sticky lg:top-20 lg:self-start lg:h-fit">
            <Sidebar products={products} />
          </aside>

          {/* Main Content */}
          <section className="flex-1 w-full pb-20 lg:pb-0">
            {/* Mobile Sidebar (with filter drawer) */}
            <div className="block lg:hidden">
              <Sidebar products={products} />
            </div>

            {/* Product Grid */}
            <div className="mt-4 lg:mt-0">
              {children}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}