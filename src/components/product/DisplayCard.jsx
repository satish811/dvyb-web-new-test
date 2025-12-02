import React from "react";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export default function DisplayCard({ product, className }) {
  const navigate = useNavigate();
  return (
    <article
      className={cn(
        "group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative w-full h-80 sm:h-96 md:h-[500px]">
        <img
          src={product.images[0]}
          alt={product.title}
          onClick={() => navigate(product.path)}
          className="w-full h-full object-cover transition-transform duration-500 cursor-pointer group-hover:scale-105"
        />

        {/* Text Overlay */}
        <div className="absolute bottom-10 w-full text-center text-white px-4">
          <p className="text-sm sm:text-xs md:text-base text-white font-semibold uppercase ">
            {product.title}
          </p>
          {product.discountPercent && (
            <p
              className="mt-3 text-white uppercase text-center align-middle cursor-default"
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
        </div>
      </div>
    </article>
  );
}
