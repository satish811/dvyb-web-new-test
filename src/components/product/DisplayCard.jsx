import React from "react";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export default function DisplayCard({
  product,
  className,
  showDiscount = true,
  showShopNow = true,
}) {
  const navigate = useNavigate();
  return (
    <article
      className={cn(
        "group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300",
        className
      )}
    >
      {/* Image - Increased height significantly */}
      <div className="relative w-full h-[550px] sm:h-[500px] md:h-[550px] lg:h-[600px]">
        <img
          src={product.images[0]}
          alt={product.title}
          onClick={() => navigate(product.path)}
          className="w-full h-full object-cover transition-transform duration-500 cursor-pointer group-hover:scale-105"
        />

        {/* Text Overlay - Adjusted for better visibility */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent pt-10 pb-4 px-4">
          <p className="text-center xt-sm sm:text-base md:text-lg text-white font-semibold uppercase">
            {product.title}
          </p>
          {showDiscount && product.discountPercent && (
            <p
              className="mt-2 text-white uppercase text-center align-middle cursor-default"
              style={{
                fontFamily: "Outfit",
                fontWeight: 500,
                fontSize: "13px",
                lineHeight: "21.71px",
                letterSpacing: "0.36px",
              }}
            >
              upto {product.discountPercent}%
            </p>
          )}
          {showShopNow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(product.path);
              }}
              className="mt-2 text-white uppercase text-xs md:text-sm tracking-wider hover:underline block mx-auto"
            >
              Shop Now
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
