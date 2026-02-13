import React from "react";
import { useUI } from "../../../context/UIContext";

import bgPattern from "../../../assets/b2c/landing/Landing-villy/tryitbuyitframe.png";

// Product Images
import imgSaree from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import imgLehenga from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import imgKurta from "../../../assets/b2c/landing/Landing-villy/Kurtas.jpg";
import imgSharara from "../../../assets/b2c/landing/Landing-villy/Shararas.jpg";

// Correct Try-On Icon
import TryOnIcon from "../../../assets/b2c/landing/Landing-villy/tryonrotate.png";

const products = [
    {
        id: 1,
        name: "Chunky Knit Cardigan",
        oldPrice: "₹6,500.00",
        newPrice: "₹3,200.00",
        image: imgSaree,
        avatars: [imgSaree, imgLehenga, imgKurta, imgSharara],
    },
    {
        id: 2,
        name: "Floral Midi Dress",
        oldPrice: "₹9,000.00",
        newPrice: "₹5,200.00",
        image: imgLehenga,
        avatars: [imgLehenga, imgKurta, imgSharara, imgSaree],
    },
    {
        id: 3,
        name: "High Rise Leg Pants",
        oldPrice: "₹7,500.00",
        newPrice: "₹4,000.00",
        image: imgKurta,
        avatars: [imgKurta, imgSharara, imgSaree, imgLehenga],
    },
    {
        id: 4,
        name: "Belted Trench Coat",
        oldPrice: "₹12,000.00",
        newPrice: "₹7,500.00",
        image: imgSharara,
        avatars: [imgSharara, imgSaree, imgLehenga, imgKurta],
    },
];

export default function TryItBuyItSection() {
    const { setTryOnModalOpen } = useUI();

    return (
        <section className="relative w-full bg-white pt-0 pb-16 mt-0 overflow-visible">
            {/* Main container - Full Width to touch edges */}
            <div className="w-full px-0 relative z-20">
                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-serif text-black mb-12 tracking-wide p-8">
                    TRY IT & BUY IT
                </h2>

                {/* Cards */}
                <div className="flex flex-wrap justify-center gap-[14.77px]">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="relative group shrink-0"
                            style={{ width: "323.07px", height: "484.61px" }}
                        >
                            {/* Main Image */}
                            <div className="w-full h-full overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* Floating Details Box */}
                            <div
                                className="absolute bg-white transition-all duration-300 group-hover:-translate-y-1"
                                style={{
                                    width: "274.15px",
                                    height: "117.92px",
                                    top: "367.14px",
                                    left: "24.92px",
                                    padding: "18px",
                                }}
                            >
                                {/* Name & Avatars */}
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-gray-900 mb-1">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px]">
                                            <span className="line-through text-gray-400">
                                                {product.oldPrice}
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {product.newPrice}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex -space-x-1">
                                        {product.avatars.map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                className="w-5 h-5 rounded-full border border-white"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Try-On Button */}
                                <button
                                    onClick={() => setTryOnModalOpen(true)}
                                    className="w-full bg-[#8B4789] hover:bg-[#753775] text-white py-2 rounded-full text-[11px] font-semibold flex justify-center items-center gap-2 mt-1"
                                >
                                    <img src={TryOnIcon} alt="try on" className="w-6 h-6" />
                                    Virtual try on
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Decorative Background */}
            <div
                className="absolute left-0 right-0 bottom-0 pointer-events-none"
                style={{
                    height: "318.53px",
                    backgroundImage: `url(${bgPattern})`,
                    backgroundSize: "100% 100%", // Fixed to stretch
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "bottom",
                    opacity: 1, // Fixed opacity
                }}
            />
        </section>
    );
}

