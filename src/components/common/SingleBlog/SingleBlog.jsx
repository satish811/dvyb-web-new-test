import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Diwali from "@/assets/b2c/images/SingleBlog/Diwali.svg";
import Blue from "@/assets/b2c/images/SingleBlog/Blue.svg";
import Green from "@/assets/b2c/images/SingleBlog/Green.svg";
import red from "@/assets/b2c/images/SingleBlog/red.svg";
import orange from "@/assets/b2c/images/SingleBlog/Orange.svg";
import red2 from "@/assets/b2c/images/SingleBlog/red2.svg";

export default function SingleBlog() {
  const suggestions = [
    { id: 1, img: Blue },
    { id: 2, img: Green },
    { id: 3, img: red },
    { id: 4, img: orange },
    { id: 5, img: red2 },
  ];

  return (
    <div className="min-h-screen bg-white mt-25">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="mb-8">
          <img src={Diwali} alt="Diwali celebration" className="w-full h-auto rounded-lg" />
        </div>

        {/* Title Section */}
        <div className="text-center mb-6">
          <h3 className="text-4xl font-medium tracking-[2%] mb-4">
            The Ultimate Guide to Choosing the Perfect Diwali Saree
          </h3>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>21 october, 25</span>
            <span>5 Min read</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="mb-8 text-gray-700 leading-relaxed">
          <p>
            Diwali, also known as the Festival of Lights, is one of the most celebrated festivals in
            India and among Indian communities worldwide. It symbolises the victory of good over
            evil, commemorating Lord Rama's triumph over Ravana. Beyond its spiritual significance,
            Diwali is a time for joyous reunions with family and friends, filled with love,
            laughter, and, of course, festive attire. As with every celebration, Diwali provides the
            perfect occasion to embrace stunning traditional wear. This season, Taneira offers a
            curated collection of sarees designed to make you shine. Here's what to consider when
            choosing the perfect Diwali saree.
          </p>
        </div>

        {/* The Significance of Colour */}
        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">The Significance of Colour</h2>
          <p className="text-gray-700 leading-relaxed">
            When selecting a saree for Diwali, the choice of colour plays a key role in setting the
            mood and creating a visual impact. Each colour has its own symbolism—red embodies
            strength and courage, yellow radiates joy and positivity, and white represents purity.
            For evening events, deeper tones like maroon, emerald, or navy lend a sense of grandeur,
            while pastels such as blush pink, mint green or sunshine yellow are perfect for daytime
            festivities. Consider not just the occasion but also what resonates with your personal
            taste and complements your complexion, allowing your saree to truly reflect your unique
            style.
          </p>
        </section>

        {/* The Right Fabric for the Occasion */}
        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">The Right Fabric for the Occasion</h2>
          <p className="text-gray-700 leading-relaxed">
            The fabric of your saree is crucial for both comfort and style. Depending on the type of
            Diwali event—be it a casual gathering or a grand celebration—different fabrics will suit
            different moods. For intimate family get-togethers, breathable fabrics like cotton or
            linen offer relaxed elegance. For more festive, elaborate occasions, luxurious fabrics
            like silk, organza, or tissue add a touch of opulence. Consider the climate too; for
            warmer weather, lightweight georgette or chiffon sarees offer a flowing, graceful drape,
            while organza provides a more structured and regal look. The perfect fabric strikes a
            balance between elegance and ease, ensuring you feel both comfortable and chic.
          </p>
        </section>

        {/* Designs That Dazzle */}
        <section className="mb-12">
          <h2 className="text-xl font-normal mb-4">Designs That Dazzle</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Diwali is the perfect time to showcase your individual style, and sarees offer endless
            options to express it. From regionally inspired weaves to contemporary designs, there's
            a saree for every festive occasion. For grand celebrations, opt for a stunning
            Kanjivaram or a heavily embroidered Banarasi saree to make a bold statement. For
            smaller, more casual events, a silk-cotton blend or a lightweight georgette saree offers
            understated charm. Whether you prefer traditional designs or modern silhouettes, choose
            a saree that resonates with your personal aesthetic and enhances your Diwali look.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Diwali is a celebration of light, joy, and tradition, and the saree you wear is an
            integral part of embracing the festive spirit. Whether you gravitate towards bold,
            vibrant colours or prefer subtle, elegant shades, Taneira offers a diverse range of
            sarees that cater to every style and occasion. From rich silks that exude grandeur to
            lighter fabrics that provide comfort, the perfect Diwali saree reflects not only the
            occasion but also your unique personality.
          </p>
        </section>

        {/* Suggestions Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-normal">SUGGESTIONS</h2>
            <button className="text-sm underline">VIEW ALL</button>
          </div>

          <div className="relative">
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-yellow-400 rounded-full p-2 z-10 hidden lg:block">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-hidden">
              {suggestions.map((item) => (
                <div key={item.id} className="flex flex-col">
                  <div className="bg-gray-100 aspect-[3/4] mb-3 rounded overflow-hidden">
                    <img
                      src={item.img}
                      alt={`Saree ${item.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-medium mb-1">SUHINO</p>
                    <p className="text-gray-600 mb-2 leading-tight">
                      Ivory Tissue Mirror & Zari Embroidered Lehenga Set
                    </p>
                    <p className="font-medium">₹94,900</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-yellow-400 rounded-full p-2 z-10 hidden lg:block">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
