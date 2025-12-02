import React from "react";
import SingleBanner from "@/assets/b2c/images/MainBlog/SingleBanner.png";
import Bride from "@/assets/b2c/images/MainBlog/BrideImageMain.svg";
import GreenSaree from "@/assets/b2c/images/MainBlog/Green.png";
import bride from "@/assets/b2c/images/MainBlog/Bride.svg";
import RedSaree from "@/assets/b2c/images/MainBlog/RedSaree.png";
import Blue from "@/assets/b2c/images/SingleBlog/Blue.svg";
import Green from "@/assets/b2c/images/SingleBlog/Green.svg";
import red from "@/assets/b2c/images/SingleBlog/red.svg";
import orange from "@/assets/b2c/images/SingleBlog/Orange.svg";
import red2 from "@/assets/b2c/images/SingleBlog/red2.svg";
const MainBlog = () => {
  // Array of images - you can replace these URLs with your actual image links
  const heroImages = [Bride, GreenSaree, bride, RedSaree];

  const bannerImage = SingleBanner;

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
  ];

  return (
    <div className="min-h-screen bg-white mt-30">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Main Image */}
          <div>
            <img
              src={heroImages[0]}
              alt="Diwali Saree"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">21 october, 25</p>
              <p className="text-sm text-gray-600">5 Min read</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <h1
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 500,
                fontSize: "36px",
                lineHeight: "42px",
                letterSpacing: "0.02em",
              }}
              className="mb-6"
            >
              The Ultimate Guide to Choosing the Perfect Diwali Saree
            </h1>

            <p
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "36px",
                letterSpacing: "0%",
              }}
              className="mb-8 text-gray-700"
            >
              Diwali, also known as the Festival of Lights, is one of the most celebrated festivals
              in India and among Indian communities worldwide. It symbolises the victory of good
              over evil, commemorating Lord Rama's triumph over Ravana. Beyond its spiritual
              significance, Diwali is a time for joyous reunions with family and friends, filled
              with love, laughter, and, of course, festive attire. As with every celebration, Diwali
              provides the perfect occasion to embrace stunning traditional wear. This season,
              Taneira offers a curated collection of sarees designed to make you shine. Here's what
              to consider when choosing the perfect Diwali saree.
            </p>

            {/* Small Images Grid */}
            <div className="grid grid-cols-3 gap-4">
              {heroImages.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Diwali Saree ${index + 2}`}
                  className="w-full h-32 object-cover rounded-lg shadow"
                />
              ))}
            </div>

            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                lineHeight: "36px",
                letterSpacing: "0%",
              }}
              className="mt-8 mb-4"
            >
              The Significance of Colour
            </h2>

            <p
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "36px",
                letterSpacing: "0%",
              }}
              className="text-gray-700"
            >
              When selecting a saree for Diwali, the choice of colour plays a key role in setting
              the mood and creating a visual impact. Each colour has its own symbolism—red embodies
              strength and courage, yellow radiates joy and positivity, and white represents purity.
              For evening events, deeper tones like maroon, emerald, or navy lend a sense of
              grandeur, while pastels such as blush pink, mint green or sunshine yellow are perfect
              for daytime festivities. Consider not just the occasion but also what resonates with
              your personal taste and complements your complexion, allowing your saree to truly
              reflect your unique style.
            </p>
          </div>
        </div>

        {/* Banner */}
        <div className="mb-12">
          <img
            src={bannerImage}
            alt="New Year Sale Banner"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* The Right Fabric Section */}
        <section className="mb-12">
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "36px",
              letterSpacing: "0%",
            }}
            className="mb-6"
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
            className="text-gray-700 mb-6"
          >
            The fabric of your saree is crucial for both comfort and style. Depending on the type of
            Diwali event—be it a casual gathering or a grand celebration—different fabrics will suit
            different moods. For intimate family get-togethers, breathable fabrics like cotton or
            linen offer relaxed elegance. For more festive, elaborate occasions, luxurious fabrics
            like silk, organza, or tissue add a touch of opulence. Consider the climate too: for
            warmer weather, lightweight georgette or chiffon sarees offer a flowing, graceful drape,
            while organza provides a more structured and regal look. The perfect fabric strikes a
            balance between elegance and ease, ensuring you feel both comfortable and chic.
          </p>
        </section>

        {/* Designs That Dazzle Section */}
        <section className="mb-12">
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "36px",
              letterSpacing: "0%",
            }}
            className="mb-6"
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
            className="text-gray-700 mb-6"
          >
            Diwali is the perfect time to showcase your individual style, and sarees offer endless
            options to express it. From regionally inspired weaves to contemporary designs, there's
            a saree for every festive occasion. For grand celebrations, opt for a stunning
            Kanjivaram or a heavily embroidered Banarasi saree to make a bold statement. For
            smaller, more casual events, a silk-cotton blend or a lightweight georgette saree offers
            understated luxury. Whether you prefer traditional designs or modern silhouettes, choose
            a saree that resonates with your personal aesthetic and enhances your Diwali look.
          </p>

          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "36px",
              letterSpacing: "0%",
            }}
            className="text-gray-700"
          >
            Diwali is a celebration of light, joy, and tradition, and the saree you wear is an
            integral part of embracing the festive spirit. Whether you gravitate towards bold,
            vibrant colours or prefer subtle, elegant shades, Taneira's diverse range of sarees
            cater to every style and occasion. From rich silks that exude grandeur to lighter
            fabrics that provide comfort, the perfect Diwali saree reflects not only the occasion
            but also your unique personality.
          </p>
        </section>

        {/* Suggestions Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                lineHeight: "36px",
                letterSpacing: "0%",
              }}
            >
              SUGGESTIONS
            </h2>
            <button className="text-sm underline hover:text-gray-600">VIEW ALL</button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {suggestionProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs font-semibold mb-1">SUHINO</p>
                  <h3 className="text-sm mb-2 line-clamp-2">{product.title}</h3>
                  <p className="font-bold">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
    </div>
  );
};

export default MainBlog;
