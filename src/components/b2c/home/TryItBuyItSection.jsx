import React, { useRef } from "react";
import { useUI } from "../../../context/UIContext";
import { motion } from "framer-motion";

// Background Pattern
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
    const scrollContainerRef = useRef(null);

    return (
        <section className="relative w-full bg-[#800576] py-10 md:py-16 overflow-hidden">

            {/* White Background for the Pattern Area - Restores the original look for the bottom strip */}
            <div className="absolute inset-x-0 bottom-0 h-[200px] md:h-[320px] 2xl:h-[450px] bg-white z-0" />

            {/* Background Texture - Mobile & Desktop */}
            <div
                className="absolute inset-x-0 bottom-0 h-[200px] md:h-[320px] 2xl:h-[450px] pointer-events-none z-0 opacity-50 md:opacity-100"
                style={{
                    backgroundImage: `url(${bgPattern})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "bottom",
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-16">

                {/* Heading */}
                <h2 className="text-3xl md:text-5xl 2xl:text-7xl font-serif text-white mb-8 md:mb-12 2xl:mb-20 text-left tracking-wide">
                    TRY IT & BUY IT
                </h2>

                {/* Mobile: Horizontal Draggable Scroll | Desktop: Grid */}
                <div
                    ref={scrollContainerRef}
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 2xl:gap-10 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar justify-items-center"
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl overflow-hidden shadow-lg md:shadow-none md:bg-transparent relative flex-shrink-0 w-[85vw] sm:w-[80vw] md:w-full aspect-[4/5] md:aspect-[3/4] 2xl:h-[650px] snap-center group"
                        >
                            {/* Full Height Image */}
                            <div className="w-full h-full relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-top transition-transform duration-700 md:group-hover:scale-105"
                                />
                                {/* Overlay Gradient for readability if needed, mostly handled by card below */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                            </div>

                            {/* Floating Details Box */}
                            <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 xl:right-auto md:w-auto xl:w-[274px] 2xl:w-[350px] bg-white/95 backdrop-blur-sm md:backdrop-blur-none md:bg-white p-4 2xl:p-6 rounded-xl shadow-lg transition-all duration-300 md:group-hover:-translate-y-2">

                                <div className="flex justify-between items-start mb-3 2xl:mb-5">
                                    <div className="flex-1 mr-2">
                                        <h3 className="text-sm 2xl:text-lg font-semibold text-gray-900 mb-1 truncate">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs 2xl:text-sm">
                                            <span className="line-through text-gray-400">
                                                {product.oldPrice}
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {product.newPrice}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Avatar/Thumbnail Stack */}
                                    <div className="flex -space-x-2">
                                        {product.avatars.map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                alt="variant"
                                                className="w-6 h-6 2xl:w-8 2xl:h-8 rounded-full border-2 border-white object-cover"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Try-On Button */}
                                <button
                                    onClick={() => setTryOnModalOpen(true)}
                                    className="w-full bg-[#8B4789] hover:bg-[#753775] text-white py-2.5 2xl:py-3.5 rounded-lg text-xs 2xl:text-sm font-medium flex justify-center items-center gap-2 transition-colors shadow-md"
                                >
                                    <img src={TryOnIcon} alt="try on" className="w-5 h-5 2xl:w-6 2xl:h-6 bg-white/20 rounded-full p-0.5" />
                                    Virtual try on
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
