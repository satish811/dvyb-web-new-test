import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import save from "@/assets/b2c/images/Popups/save.svg";
const Save = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => setIsOpen(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative  flex flex-col md:flex-row max-w-4xl w-full rounded-lg overflow-hidden shadow-2xl p-6 md:p-10">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-10  right-10 bg-brown-300 rounded-lg p-2 sm:top-14 sm:right-14 text-[#5A2E14] hover:text-[#7A3E1B] focus:outline-none z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg sm:text-xl" />
        </button>

        {/* Left Section - Image */}
        <div className="w-full md:w-1/2 bg-[#C88A61] flex items-center justify-center">
          <img src={save} alt="Woman in red dress" className="w-full h-full object-cover" />
        </div>

        {/* Right Section - Offer Content */}
        <div className="w-[100%] md:w-1/2 bg-[#FDF2EA] p-4 md:p-10 flex flex-col items-center justify-center text-center">
          {/* Heading */}
          <h2 className="text-[60px] sm:text-[64px] font-normal mb-2 ">
            <span
              style={{
                fontFamily: "Vujahday Script",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "64px",
                color: "#5A2E14",
              }}
            >
              Save
            </span>

            <span
              style={{
                fontFamily: '"Smooch", cursive',
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "100px",
                marginLeft: "8px",
                color: "#5A2E14",
              }}
            >
              20%
            </span>
          </h2>

          {/* Description */}
          <p className="text-base font-normal text-[#5A2E14] mb-2 max-w-sm">
            Thank you for visiting, save on your first order with code{" "}
            <span className="font-semibold text-black">WELCOME20</span>
          </p>

          {/* Shop & Save Button */}
          <button className="w-full max-w-xs py-3 border border-[#5A2E14] text-[#5A2E14] font-semibold tracking-wider text-sm hover:bg-[#5A2E14] hover:text-white transition duration-300 mb-4 cursor-pointer">
            SHOP AND SAVE
          </button>

          {/* No Thanks */}
          <button
            onClick={closeModal}
            className="text-[#5A2E14] text-xs font-medium tracking-wide hover:underline cursor-pointer"
          >
            NO THANKS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Save;
