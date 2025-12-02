import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ path, image, title, size = "normal", buttonText = "Shop Now" }) => {
  const navigate = useNavigate();
  const isFooterSection = buttonText !== "Shop Now";

  return (
    <div className="relative group overflow-hidden">
      <img
        src={image}
        alt={title}
        onClick={() => navigate(path)}
        className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer ${
          size === "large" ? "h-[500px] md:h-[600px]" : "h-[300px] md:h-[350px]"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 py-6 text-center text-white pointer-events-none">
        <p
          className={`uppercase mb-2 cursor-default pointer-events-auto ${isFooterSection ? "text-sm sm:text-xs md:text-base font-semibold" : "sm:text-[8px] md:text-sm lg:text-lg sm:font-thin font-bold"}`}
        >
          {title}
        </p>
        <button
          onClick={() => !isFooterSection && navigate(path)}
          className={`uppercase tracking-widest px-4 sm:px-2 py-2 transition-all duration-300 pointer-events-auto ${isFooterSection ? "mt-3 align-middle cursor-default" : "sm:text-xs md:text-sm lg:text-lg cursor-pointer"}`}
          style={
            isFooterSection
              ? {
                  fontFamily: "Outfit",
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "21.71px",
                  letterSpacing: "0.36px",
                }
              : {}
          }
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const BestProducts = ({ products, columns, buttonText }) => {
  return (
    <section className="bg-white mt-4">
      <div className="container mx-auto px-3 sm:px-3 md:px-6 lg:px-10">
        {/* Desktop/Tablet Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-2 md:gap-4">
          {/* Large left image */}
          <div className={`md:col-span-${columns === 2 ? 2 : 4}`}>
            <ProductCard
              path={products[0].path}
              image={columns === 2 ? products[0].images : products[3].images}
              title={products[0].title}
              size="large"
              buttonText={buttonText}
            />
          </div>

          {/* Right column with 2x2 grid */}
          <div
            className={`md:col-span-${columns === 2 ? 4 : 2} grid grid-cols-${columns === 2 ? 1 : 2} gap-4`}
          >
            {products.slice(columns === 2 ? 1 : 4, columns === 2 ? 2 : 6).map((product) => (
              <ProductCard
                path={product.path}
                key={product.id}
                image={product.images}
                title={product.title}
                size="large"
                buttonText={buttonText}
              />
            ))}
          </div>
        </div>

        {/* Mobile Layout - Responsive 1 or 2 column grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 md:hidden">
          {products.slice(0, 2).map((product) => (
            <ProductCard
              key={product.id}
              image={product.images}
              title={product.title}
              size="normal"
              buttonText={buttonText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestProducts;
