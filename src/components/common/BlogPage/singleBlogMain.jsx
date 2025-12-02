import React from "react";
import SinglePageBanner from "@/assets/b2c/images/MainBlog/SinglePageBanner.svg";

import GreenSaree from "@/assets/b2c/images/MainBlog/Green.png";
import RedSaree from "@/assets/b2c/images/MainBlog/RedSaree.png";
import Blue from "@/assets/b2c/images/SingleBlog/Blue.svg";
import Green from "@/assets/b2c/images/SingleBlog/Green.svg";
import red from "@/assets/b2c/images/SingleBlog/red.svg";
import orange from "@/assets/b2c/images/SingleBlog/Orange.svg";
import red2 from "@/assets/b2c/images/SingleBlog/red2.svg";

const SingleMainBlog = () => {
  // hero + after-paragraph images
  const heroImage = SinglePageBanner;
  const subImages = [GreenSaree, RedSaree];

  // suggestion images
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
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ---- Space for Navbar ---- */}

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-0 py-10 mt-30">
        {/* ---- Main Hero Image ---- */}
        <div className="flex justify-center mb-6">
          <img
            src={heroImage}
            alt="Main Saree"
            style={{
              width: "100%",
              height: "500px",
              objectFit: "cover",
              opacity: 1,
            }}
            className="rounded-lg"
          />
        </div>

        <div className="flex justify-between text-gray-500 text-sm mb-8">
          <p>21 October, 25</p>
          <p>5 Min read</p>
        </div>

        {/* ---- Main Heading ---- */}
        <h1
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 500,
            fontSize: "36px",
            lineHeight: "42px",
            letterSpacing: "0.02em",
          }}
          className="mb-6 text-gray-900 text-center md:text-left"
        >
          The Ultimate Guide to Choosing the Perfect Diwali Saree
        </h1>

        {/* ---- Intro Paragraph ---- */}
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 400,
            fontSize: "20px",
            lineHeight: "36px",
            letterSpacing: "0%",
          }}
          className="text-gray-700 mb-12"
        >
          Diwali, also known as the Festival of Lights, is one of the most celebrated festivals in
          India and among Indian communities worldwide. It symbolises the victory of good over evil,
          commemorating Lord Rama's triumph over Ravana. Beyond its spiritual significance, Diwali
          is a time for joyous reunions with family and friends, filled with love, laughter, and, of
          course, festive attire. As with every celebration, Diwali provides the perfect occasion to
          embrace stunning traditional wear. This season, DVYB offers a curated collection of sarees
          designed to make you shine. Here’s what to consider when choosing the perfect Diwali
          saree. Diwali, also known as the Festival of Lights, is one of the most celebrated
          festivals in India and among Indian communities worldwide. It symbolises the victory of
          good over evil, commemorating Lord Rama's triumph over Ravana. Beyond its spiritual
          significance, Diwali is a time for joyous reunions with family and friends, filled with
          love, laughter, and, of course, festive attire. As with every celebration, Diwali provides
          the perfect occasion to embrace stunning traditional wear. This season, DVYB offers a
          curated collection of sarees designed to make you shine. Here’s what to consider when
          choosing the perfect Diwali saree.
        </p>

        {/* ---- Two Images After Paragraph ---- */}
        <div className="flex flex-wrap justify-center gap-5 mb-16">
          {subImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`sub-${index}`}
              style={{
                width: "566px",
                height: "377px",
                objectFit: "cover",
                opacity: 3,
              }}
              className="rounded-md"
            />
          ))}
        </div>

        {/* ---- The Right Fabric Section ---- */}
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "36px",
            letterSpacing: "0%",
          }}
          className="mb-4 text-gray-900"
        >
          The Right Fabric for the Occasion
        </h2>

        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 400,
            fontSize: "20px",
            lineHeight: "36px",
            letterSpacing: "0%",
          }}
          className="text-gray-700 mb-12"
        >
          The fabric of your saree is crucial for both comfort and style. Depending on the type of
          Diwali event—be it a casual gathering or a grand celebration— different fabrics will suit
          different moods. For intimate family get-togethers, breathable fabrics like cotton or
          linen offer relaxed elegance. For more festive, elaborate occasions, luxurious fabrics
          like silk, organza, or tissue add a touch of opulence. Consider the climate too; for
          warmer weather, lightweight georgette or chiffon sarees offer a flowing, graceful drape,
          while organza provides a more structured and regal look. The perfect fabric strikes a
          balance between elegance and ease, ensuring you feel both comfortable and chic. The fabric
          of your saree is crucial for both comfort and style. Depending on the type of Diwali
          event—be it a casual gathering or a grand celebration— different fabrics will suit
          different moods. For intimate family get-togethers, breathable fabrics like cotton or
          linen offer relaxed elegance. For more festive, elaborate occasions, luxurious fabrics
          like silk, organza, or tissue add a touch of opulence. Consider the climate too; for
          warmer weather, lightweight georgette or chiffon sarees offer a flowing, graceful drape,
          while organza provides a more structured and regal look. The perfect fabric strikes a
          balance between elegance and ease, ensuring you feel both comfortable and chic.
        </p>

        {/* ---- Designs That Dazzle Section ---- */}
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "36px",
            letterSpacing: "0%",
          }}
          className="mb-4 text-gray-900"
        >
          Designs That Dazzle
        </h2>

        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 400,
            fontSize: "20px",
            lineHeight: "36px",
            letterSpacing: "0%",
          }}
          className="text-gray-700 mb-12"
        >
          Diwali is the perfect time to showcase your individual style, and sarees offer endless
          options to express it. From regionally inspired weaves to contemporary designs, there’s a
          saree for every festive occasion. For grand celebrations, opt for a stunning Kanjivaram or
          a heavily embroidered Banarasi saree to make a bold statement. For smaller, casual events,
          a silk-cotton blend or lightweight georgette saree offers understated charm. Whether you
          prefer traditional designs or modern silhouettes, choose a saree that resonates with your
          personal aesthetic and enhances your Diwali look. Diwali is the perfect time to showcase
          your individual style, and sarees offer endless options to express it. From regionally
          inspired weaves to contemporary designs, there’s a saree for every festive occasion. For
          grand celebrations, opt for a stunning Kanjivaram or a heavily embroidered Banarasi saree
          to make a bold statement. For smaller, casual events, a silk-cotton blend or lightweight
          georgette saree offers understated charm. Whether you prefer traditional designs or modern
          silhouettes, choose a saree that resonates with your personal aesthetic and enhances your
          Diwali look.
        </p>

        {/* ---- Suggestions Section ---- */}
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
      </main>

      {/* ---- Space for Footer ---- */}
      <div className="h-[100px]"></div>
    </div>
  );
};

export default SingleMainBlog;
