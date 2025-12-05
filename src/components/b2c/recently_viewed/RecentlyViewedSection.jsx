import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentlyViewed } from "../../utils/recentlyViewedUtils";

const RecentlyViewedSection = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const recent = getRecentlyViewed();
    setProducts(recent.slice(0, 6)); // Limit to 6 products
  }, []);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-[Outfit,sans-serif] font-semibold text-xl uppercase text-black m-0">
          RECENTLY VIEWED
        </h2>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="bg-white border border-slate-100 overflow-hidden shadow-sm transition flex flex-col cursor-pointer group"
            style={{ minHeight: 360, zIndex: 10 }}
            onClick={() => {
              navigate(`/products/${product.id}`);
              window.scrollTo(0, 0);
            }}
          >
            {/* Image wrapper */}
            <div className="w-full h-48 sm:h-56 md:h-48 lg:h-56 overflow-hidden bg-gray-100">
              <img
                src={product.imageUrls?.[0] || ""}
                alt={product.name}
                className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-1 line-clamp-2 font-[Outfit,sans-serif]">
                {product.name}
              </h3>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2 font-[Outfit,sans-serif]">
                {product.description}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <div className="text-lg font-semibold text-rose-700 font-[Outfit,sans-serif]">
                  ₹{product.price ? product.price.toLocaleString("en-IN") : "—"}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedSection;
