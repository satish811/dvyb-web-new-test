import React, { createContext, useContext, useState, useCallback } from "react";

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popups, setPopups] = useState([]);

  const showPopup = useCallback((type, product) => {
    const id = Date.now();
    setPopups((prev) => [...prev, { id, type, product }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  }, []);

  const removePopup = (id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      {/* Toast container UI */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-[90%] max-w-sm sm:max-w-md ">
        {popups.map(({ id, type, product }) => (
          <div
            key={id}
            className="bg-[ #FFFFFF]
] rounded-2xl shadow-lg p-3 flex items-center gap-3 animate-slideIn"
          >
            <img
              src={product?.image || product?.img || product?.imageUrl}
              alt={product?.title || "Product"}
              className="w-16 h-16  object-cover"
            />

            <div className="flex-1 ">
              <p className="text-[14px] bg-[#A83232] w-[151px] h-[100%] text-white px-3 py-1 rounded-md font-semibold inline-block mb-1 tracking-wide">
                {type === "wishlist" && "Added to Wishlist "}
                {type === "wishlistRemove" && "Removed from Wishlist "}
                {type === "cart" && "Added to Cart "}
                {type === "cartremove" && "Removed from Cart"}
                {type === "cartExists" && "Already in Cart "}
              </p>
              <p className="w-[240px] h-[31px] text-[14px] font-semibold text-gray-800 leading-tight px-2 py-2 overflow-hidden">
                {product?.title || product?.name || "Product Name"}
              </p>
            </div>

            <button
              onClick={() => removePopup(id)}
              className="text-gray-500 hover:text-gray-800 text-lg font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);
