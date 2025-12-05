import DisplayCard from "./DisplayCard";
import { useState, useEffect, useRef } from "react";

export default function ProductGrid({
  products,
  columns = 4,
  scroll = false,
  showDiscount = true,
  showShopNow = true
}) {

  // ---------------------- FIXED STATES ----------------------
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Auto-slide for mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (isMobile && products.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) =>
          prev === products.length - 1 ? 0 : prev + 1
        );
      }, 3000);
    }

    return () => clearInterval(intervalRef.current);
  }, [products.length]);

  // Scroll variant (unchanged)
  if (scroll) {
    return (
      <div className="overflow-x-auto sm:overflow-x-auto scrollbar-none hide-scrollbar scroll-smooth md:overflow-hidden">
        <div className="flex gap-4 px-2 sm:px-4 md:px-10 min-w-max">
          {products.map((p) => (
            <div key={p.id} className="w-72 sm:w-80 md:w-95 flex-shrink-0">
              <DisplayCard
                product={p}
                showDiscount={showDiscount}
                showShopNow={showShopNow}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop grid col mapping
  const colMap = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5"
  };

  return (
    <>
      {/* ---------------------- MOBILE CAROUSEL ---------------------- */}
      <div className="md:hidden relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {products.map((p) => (
            <div key={p.id} className="w-full flex-shrink-0 px-2">
              <DisplayCard
                product={p}
                showDiscount={showDiscount}
                showShopNow={showShopNow}
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        {products.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {products.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-black scale-125"
                    : "bg-gray-300"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------------- DESKTOP GRID ---------------------- */}
      <div
        className={`hidden md:grid grid-cols-2 ${colMap[columns]} gap-2 md:gap-4 px-2 sm:px-3 md:px-3 lg:px-10 mt-4`}
      >
        {products.map((p) => (
          <DisplayCard
            key={p.id}
            product={p}
            showDiscount={showDiscount}
            showShopNow={showShopNow}
          />
        ))}
      </div>
    </>
  );
}
