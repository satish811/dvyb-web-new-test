import React, { useState } from "react";
import LoginBanner from "@/assets/b2c/images/MainBlog/Banner.jpg";
import CloseModal from "@/assets/b2c/images/MainBlog/CloseModal.png";

const Login = () => {
  const [isOpen, setIsOpen] = useState(true);
  const closeModal = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center  bg-opacity-50 z-50">
      <div
        className="relative w-[90%] md:w-[900px] h-[450px] overflow-hidden shadow-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${LoginBanner})` }}
      >
        {/* Text Content */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center !text-white px-6 md:px-12 z-10">
          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "0",
              color: "white",
            }}
          >
            Limited time offer
          </p>
          <h1
            style={{
              fontFamily: '"Vast Shadow", cursive',
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "64px",
              lineHeight: "100%",
              letterSpacing: "2px",
              color: "white",
              marginBottom: "12px",
            }}
          >
            Get <span style={{ color: "white" }}>20% off</span>
          </h1>
          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "0",
              color: "white",
              marginBottom: "24px",
            }}
          >
            Thank you for visiting, save on your first order with code{" "}
            <span
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0",
              }}
            >
              GET20
            </span>
          </p>

          <button className="border border-white text-white px-6 py-2 hover:bg-white hover:text-black transition duration-300 text-sm md:text-base font-semibold w-fit">
            SHOP NOW
          </button>
        </div>

        {/* Close Button */}
        <img
          src={CloseModal}
          alt="Close"
          onClick={closeModal}
          className="absolute top-4 right-5 w-10 h-10 rounded-full cursor-pointer z-20 hover:opacity-80 transition"
        />
      </div>
    </div>
  );
};

export default Login;
