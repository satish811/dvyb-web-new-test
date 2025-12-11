import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";

const SimilarProductsSection = () => {
  const { products, loading, error } = useProducts();
  const { id } = useParams();
  const navigate = useNavigate();

  const similarProducts = useMemo(() => {
    if (!products || !id) return [];

    const currentProduct = products.find((p) => p.id === id);
    if (!currentProduct) return [];

    return products
      .filter(
        (p) =>
          p.id !== id &&
          p.category &&
          currentProduct.category &&
          p.category.toLowerCase() === currentProduct.category.toLowerCase()
      )
      .slice(0, 6);
  }, [products, id]);

  const currentCategory = products?.find((p) => p.id === id)?.category;

  if (loading) return null;
  if (error || similarProducts.length === 0) return null;

  return (
    <div className="mt-8 pt-6 flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex justify-between items-center px-1 sm:px-0">
        <h2 className="font-[Outfit,sans-serif] font-semibold text-lg sm:text-xl uppercase text-black m-0">
          Similar Products
        </h2>

        <button
          onClick={() => {
            if (currentCategory) {
              const catParam = currentCategory.toLowerCase().replace(/\s+/g, "-");
              navigate(`/womenwear?category=${catParam}`);
            } else {
              navigate("/womenwear");
            }
          }}
          className="font-[Outfit,sans-serif] font-medium text-xs sm:text-sm text-primary 
          hover:text-black hover:border-b border-primary transition pb-1 uppercase"
        >
          View All
        </button>
      </div>

      {/* Mobile Responsive Product Grid */}
      <div
        className="
          grid gap-3 sm:gap-4 
          grid-cols-2           /* Mobile */ 
          sm:grid-cols-3        /* Small Devices */
          md:grid-cols-4        /* Tablets */
          lg:grid-cols-6        /* Desktop */
        "
      >
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
            {/* Responsive Image Wrapper */}
            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96 overflow-hidden bg-gray-100">
              <img
                src={product.imageUrls?.[0] || ""}
                alt={product.name}
                className="w-full h-full object-cover block group-hover:scale-105 
                transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="p-2 sm:p-3 flex-1 flex flex-col">
              <h3
                className="text-xs sm:text-sm md:text-base 
              font-medium text-slate-800 mb-1 line-clamp-2 
              font-[Outfit,sans-serif]"
              >
                {product.name}
              </h3>

              <p
                className="text-[11px] sm:text-xs md:text-sm 
              text-slate-500 mb-3 line-clamp-2 font-[Outfit,sans-serif]"
              >
                {product.description}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <div
                  className="text-base sm:text-lg font-semibold text-rose-700 
                font-[Outfit,sans-serif]"
                >
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

export default SimilarProductsSection;
