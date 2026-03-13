import React, { useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../../context/UIContext";
import { useProducts } from "../../../hooks/useProducts";
import { motion } from "framer-motion";

// Background Pattern
import bgPattern from "../../../assets/b2c/landing/Landing-villy/tryitbuyitframe.png";

/**
 * TryItBuyItSection — Dynamic product cards from Firestore.
 * Shows the first 4 products (sorted by newest).
 * Clicking the card navigates to the individual product page.
 * "Virtual try on" button opens the Try-On modal.
 */
export default function TryItBuyItSection() {
    const { setTryOnModalOpen } = useUI();
    const { products: allProducts, loading } = useProducts();
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    // Filter out Bride/Bridal products, then pick 4 random ones on each mount/refresh
    const displayProducts = useMemo(() => {
        if (!allProducts || allProducts.length === 0) return [];

        // Exclude any product whose name, title, category, or dressType contains "bride" or "bridal"
        const brideRegex = /bride|bridal/i;
        const filtered = allProducts.filter((p) => {
            const fields = [p.name, p.title, p.category, p.dressType].filter(Boolean);
            return !fields.some((f) => brideRegex.test(f));
        });

        // Shuffle using Fisher-Yates algorithm for true randomness on every refresh
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, 4);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allProducts]);

    /**
     * Format a numeric price into ₹X,XXX.XX string
     */
    const formatPrice = (value) => {
        const num = Number(String(value || "0").replace(/[^0-9.]/g, ""));
        if (!num) return "₹0.00";
        return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Don't render the section at all if still loading or no products
    if (loading || displayProducts.length === 0) return null;

    return (
        <section className="relative w-full bg-gradient-to-b from-[#6D0063] via-[#800576] to-[#8B4789] py-10 md:py-16 overflow-hidden">

            {/* White Background for the Pattern Area */}
            <div className="absolute inset-x-0 bottom-0 h-[200px] md:h-[320px] 2xl:h-[450px] bg-white z-0" />

            {/* Background Texture */}
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
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-10 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar justify-items-center"
                >
                    {displayProducts.map((product) => {
                        const mainImage = product.imageUrls?.[0];
                        const name = product.name || product.title || "Untitled Product";
                        const price = product.price;
                        const originalPrice = product.originalPrice;
                        const hasDiscount = originalPrice && Number(originalPrice) > Number(price);

                        // Collect up to 4 thumbnail images from imageUrls for avatars
                        const avatars = (product.imageUrls || []).slice(0, 4);

                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-xl overflow-hidden shadow-lg md:shadow-none md:bg-transparent relative flex-shrink-0 w-[85vw] sm:w-[80vw] md:w-full snap-center group cursor-pointer"
                                style={{ height: 'auto' }}
                                onClick={() => navigate(`/products/${product.id}`)}
                            >
                                {/* Full Height Image */}
                                <div className="w-full relative" style={{ aspectRatio: '3/4' }}>
                                    <img
                                        src={mainImage || ""}
                                        alt={name}
                                        className="w-full h-full object-cover object-top transition-transform duration-700 md:group-hover:scale-105"
                                        onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                                </div>

                                {/* Floating Details Box */}
                                <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-3 md:right-3 lg:left-3 lg:right-3 lg:bottom-4 xl:left-4 xl:right-4 xl:bottom-5 2xl:bottom-6 2xl:left-6 2xl:right-6 bg-white/95 backdrop-blur-sm md:backdrop-blur-none md:bg-white p-3 md:p-3 lg:p-3 xl:p-4 2xl:p-5 rounded-xl shadow-lg transition-all duration-300 md:group-hover:-translate-y-2">

                                    <div className="flex justify-between items-start mb-3 2xl:mb-5">
                                        <div className="flex-1 mr-2">
                                            <h3 className="text-sm 2xl:text-lg font-semibold text-gray-900 mb-1 truncate">
                                                {name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs 2xl:text-sm">
                                                {hasDiscount && (
                                                    <span className="line-through text-gray-400">
                                                        {formatPrice(originalPrice)}
                                                    </span>
                                                )}
                                                <span className="font-bold text-gray-900">
                                                    {formatPrice(price)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Avatar/Thumbnail Stack */}
                                        {avatars.length > 0 && (
                                            <div className="flex -space-x-2">
                                                {avatars.map((src, i) => (
                                                    <img
                                                        key={i}
                                                        src={src}
                                                        alt="variant"
                                                        className="w-6 h-6 2xl:w-8 2xl:h-8 rounded-full border-2 border-white object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Try-On Button — navigates to the individual product page */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/products/${product.id}`);
                                        }}
                                        className="w-full bg-[#8B4789] hover:bg-[#753775] text-white py-2.5 2xl:py-3.5 rounded-lg text-sm md:text-[15px] 2xl:text-lg font-semibold flex justify-center items-center gap-2 transition-colors shadow-md"
                                    >
                                        Virtual try on
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

