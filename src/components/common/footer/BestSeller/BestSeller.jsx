import React from "react";
import BestSellerImage from "../../../../assets/BestSellers/BestSellers.svg";
import SpotlightCollections from "../../../b2c/home/SpotlightCollections";
import Blue from "@/assets/b2c/images/SingleBlog/Blue.svg";
import Green from "@/assets/b2c/images/SingleBlog/Green.svg";
import red from "@/assets/b2c/images/SingleBlog/red.svg";
import orange from "@/assets/b2c/images/SingleBlog/Orange.svg";
import red2 from "@/assets/b2c/images/SingleBlog/red2.svg";
import { useLocation } from "react-router-dom";

const BestSeller = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");

  const displayText = type === "exclusives" ? "EXCLUSIVE COLLECTIONS" : "BEST SELLERS";

  const suggestionProducts = [
    {
      id: 1,
      image: red,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 2,
      image: Green,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 3,
      image: orange,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 4,
      image: red2,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 5,
      image: Blue,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 6,
      image: red,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 7,
      image: Green,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 8,
      image: orange,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 9,
      image: red2,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
    {
      id: 10,
      image: Blue,
      title: "Ivory Tissue Mirror & Zari Embroidered Lehenga Set",
      price: "₹94,900",
    },
  ];

  return (
    <div>
      <div className="relative">
        <img src={BestSellerImage} alt="BestSeller" className="w-[100%] h-[80vh] object-cover" />
        <div
          className="absolute bottom-10 left-4 md:bottom-20 md:left-10 text-white text-center"
          style={{
            fontFamily: '"Old Standard TT", serif',
            fontWeight: 700,
            fontSize: "clamp(32px, 5vw, 68.27px)", // Responsive font size
            lineHeight: "100%",
            letterSpacing: "-0.02em",
            width: "100%",
            maxWidth: "580px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {displayText}
        </div>
      </div>
      <div className="pt-12">
        <SpotlightCollections />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "36px",
            }}
            className="text-gray-900"
          >
            SUGGESTIONS
          </h2>
          <button className="text-sm underline hover:text-gray-600">VIEW ALL</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {suggestionProducts.map((product) => (
            <div key={product.id} className="cursor-pointer">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-[340px] object-cover rounded-md mb-3"
              />
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: "28px",
                }}
                className="mb-1 text-gray-800"
              >
                SUHINO
              </p>
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "28px",
                }}
                className="text-gray-600 mb-1"
              >
                {product.title}
              </p>
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: "28px",
                }}
                className="text-gray-800"
              >
                {product.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BestSeller;
