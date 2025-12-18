import React from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";

const TrendingProductsSection = () => {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">Loading trending products...</div>
    );
  }

  if (error || !products || products.length === 0) {
    return null;
  }

  // Sort by createdAt desc (or id desc if createdAt missing) to get "Latest"
  // Assuming higher ID = newer if no date
  const sortedProducts = [...products].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  const displayProducts = sortedProducts.slice(0, 6);

  return (
    <div className="mt-8 pt-6 flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-[Outfit,sans-serif] font-semibold text-xl uppercase text-black m-0">
          TRENDING PRODUCTS
        </h2>

        <button
          onClick={() => navigate("/womenwear")}
          className="font-[Outfit,sans-serif] font-medium text-sm text-primary hover:text-black hover:border-b border-primary transition-colors duration-200 pb-1 uppercase bg-transparent border-none cursor-pointer"
        >
          VIEW ALL
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayProducts.map((product) => (
          <article
            key={product.id}
            className="bg-white overflow-hidden shadow-sm transition flex flex-col cursor-pointer group"
            style={{ minHeight: 440 }}
            onClick={() => navigate(`/products/${product.id}`)}
          >
            {/* Image wrapper */}
            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96 overflow-hidden bg-gray-100">
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

export default TrendingProductsSection;