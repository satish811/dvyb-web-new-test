import React from "react";
import { Scan } from "lucide-react";
import { useUI } from "../../../context/UIContext";

import bgPattern from "../../../assets/b2c/landing/Landing-villy/tryitbuyitframe.png";

// Product Images
import imgSaree from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import imgLehenga from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import imgKurta from "../../../assets/b2c/landing/Landing-villy/Kurtas.jpg";
import imgSharara from "../../../assets/b2c/landing/Landing-villy/Shararas.jpg";

const products = [
    {
        id: 1,
        name: "Chunky Knit Cardigan",
        oldPrice: "₹6,500.00",
        newPrice: "₹3,200.00",
        image: imgSaree,
        avatars: [imgSaree, imgLehenga, imgKurta, imgSharara]
    },
    {
        id: 2,
        name: "Floral Midi Dress",
        oldPrice: "₹9,000.00",
        newPrice: "₹5,200.00",
        image: imgLehenga,
        avatars: [imgLehenga, imgKurta, imgSharara, imgSaree]
    },
    {
        id: 3,
        name: "High Rise Leg Pants",
        oldPrice: "₹7,500.00",
        newPrice: "₹4,000.00",
        image: imgKurta,
        avatars: [imgKurta, imgSharara, imgSaree, imgLehenga]
    },
    {
        id: 4,
        name: "Belted Trench Coat",
        oldPrice: "₹12,000.00",
        newPrice: "₹7,500.00",
        image: imgSharara,
        avatars: [imgSharara, imgSaree, imgLehenga, imgKurta]
    }
];

export default function TryItBuyItSection() {
    const { setTryOnModalOpen } = useUI();

    return (
        <section className="relative w-full bg-[#E8E1E6] pt-32 pb-40 mt-16 overflow-visible">

            {/* Main Container */}
            <div className="max-w-[1500px] mx-auto px-6 md:px-10 relative z-10">

                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-serif text-black mb-16 tracking-wide">
                    TRY IT & BUY IT
                </h2>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {products.map((product) => (
                        <div key={product.id} className="relative group">

                            {/* Main Image */}
                            <div className="w-full h-[460px] md:h-[520px] overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* Floating Card */}
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-20 bg-white w-[88%] rounded-xl shadow-xl p-4 transition-all duration-300 group-hover:-translate-y-1">

                                {/* Top row: Name + Avatars */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[11px]">
                                            <span className="line-through text-gray-400">{product.oldPrice}</span>
                                            <span className="font-bold text-gray-900">{product.newPrice}</span>
                                        </div>
                                    </div>

                                    {/* Avatar group */}
                                    <div className="flex -space-x-1">
                                        {product.avatars.map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                className="w-6 h-6 rounded-full border border-white"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => setTryOnModalOpen(true)}
                                    className="w-full bg-[#8B4789] hover:bg-[#753775] text-white py-2.5 rounded-lg text-xs font-semibold flex justify-center items-center gap-2"
                                >
                                    <Scan className="w-4 h-4" />
                                    Virtual try on
                                </button>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* Decorative Frame */}
            <div
                className="absolute left-0 right-0 bottom-0 h-[330px] pointer-events-none"
                style={{
                    backgroundImage: `url(${bgPattern})`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "bottom"
                }}
            />
        </section>
    );
}
