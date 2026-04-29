import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";
import { isProductPublishedByBoth } from "../../../utils/productVisibility";

const SimilarProductsSection = ({ dressType }) => {
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  const similarProducts = useMemo(() => {
    if (!products || !dressType) return [];

    return products
      .filter((p) => {
        return (
          isProductPublishedByBoth(p) &&
          p.dressType &&
          p.dressType.toLowerCase() === dressType.toLowerCase()
        );
      })
      .filter(p => p.id !== products.find(p => p.dressType === dressType)?.id)
      .slice(0, 6);
  }, [products, dressType]);

  if (loading || similarProducts.length === 0) return null;

  return (
    <div className="mt-8 pt-6 flex flex-col w-full gap-6">
      <div className="flex justify-between items-center px-1 sm:px-0">
        
        {/* Updated Header with count */}
        <div className="flex items-baseline gap-2">
          <h3 className="font-[Outfit,sans-serif] font-semibold text-lg sm:text-xl uppercase text-black m-0">
            Similar Products
          </h3>
          <span className="text-sm sm:text-base font-normal text-gray-600">
            ({similarProducts.length} {similarProducts.length === 1 ? "product" : "products"})
          </span>
        </div>

        {/* View All Button */}
        <button
          onClick={() => navigate("/womenwear")}
          className="font-[Outfit,sans-serif] font-medium text-xs sm:text-sm text-primary 
    hover:text-black hover:border-b border-primary transition pb-1 uppercase"
        >
          View All
        </button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {similarProducts.map((product) => (
          <article
            key={product.id}
            className="bg-white border border-slate-100 overflow-hidden shadow-sm 
            transition flex flex-col cursor-pointer group"
            style={{ minHeight: 420 }}
            onClick={() => {
              navigate(`/products/${product.id}`);
              window.scrollTo(0, 0);
            }}
          >
            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96 overflow-hidden bg-gray-100">
              <img
                src={product.imageUrls?.[0] || ""}
                alt={product.name}
                className="w-full h-full object-cover block group-hover:scale-105 
                transition-transform duration-300"
              />
            </div>

            <div className="p-2 sm:p-3 flex-1 flex flex-col">
              <h3 className="text-xs sm:text-sm md:text-base font-medium text-slate-800 mb-1 line-clamp-2 font-[Outfit,sans-serif]">
                {product.name}
              </h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mb-3 line-clamp-2 font-[Outfit,sans-serif]">
                {product.description}
              </p>
              <div className="mt-auto">
                <div className="text-base sm:text-lg font-semibold text-rose-700 font-[Outfit,sans-serif]">
                  ₹{product.price?.toLocaleString("en-IN") || "—"}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default SimilarProductsSection;