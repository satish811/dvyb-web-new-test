import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Diwali from "@/assets/b2c/images/SingleBlog/Diwali.svg";
import { useProducts } from "../../../hooks/useProducts";
import { isProductOutOfStock, isProductPublishedByBoth } from "../../../utils/productVisibility";

const capitalizeWords = (input) => {
  if (input === undefined || input === null) return "";
  const value = String(input).trim();
  if (!value) return "";

  return value
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
};

export default function SingleBlog() {
  const { products } = useProducts();
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    const availableTrendingProducts = (products || [])
      .filter((product) => isProductPublishedByBoth(product) && !isProductOutOfStock(product))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return availableTrendingProducts.slice(0, 5);
  }, [products]);

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
            <button onClick={() => navigate('/womenwear')} className="text-sm underline">VIEW ALL</button>
          </div>

          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-hidden">
              {suggestions.map((item) => (
                <div key={item.id} className="flex flex-col cursor-pointer" onClick={() => navigate(`/products/${item.id}`)}>
                  <div className="bg-gray-100 aspect-3/4 mb-3 rounded overflow-hidden">
                    <img
                      src={item.imageUrls?.[0] || ""}
                      alt={item.name || item.title || `Product ${item.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-600 mb-2 leading-tight">
                      {(item.name || item.title || item.description || "").replace(/(^|\s)\S/g, l => l.toUpperCase())}
                    </p>
                    <p className="font-medium">₹{item.price?.toLocaleString("en-IN") || "0"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
