import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // ✨ Animation import
import { slideUp, staggerContainer } from "../../../utils/animations"; // ✨ Global animations

// Assets - Using existing tall images
import img1 from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import img2 from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import img3 from "../../../assets/b2c/landing/Landing-villy/indowestern.png";

export default function NewArrivalBanner() {
    const navigate = useNavigate();

    return (
        <section className="w-full py-10 md:py-16 2xl:py-24 px-4 md:px-8 2xl:px-16 bg-[#F3F4F6] flex justify-center">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="relative w-full max-w-[1218px] 2xl:max-w-[1600px] bg-gradient-to-r from-[rgba(255,251,254,0.8)] to-[rgba(232,215,228,0.8)] rounded-[10px] p-6 md:p-[18px] 2xl:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-9 2xl:gap-16 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
                {/* Left Side - 3 Images */}
                <div className="flex gap-2 md:gap-[15px] 2xl:gap-8 items-center justify-center w-full md:w-auto overflow-hidden">
                    {/* Image 1 */}
                    <div className="w-[100px] h-[180px] sm:w-[140px] sm:h-[240px] md:w-[177px] md:h-[309px] 2xl:w-[240px] 2xl:h-[420px] overflow-hidden rounded-sm flex-shrink-0">
                        <img src={img1} alt="New Arrival 1" className="w-full h-full object-cover" />
                    </div>

                    {/* Image 2 */}
                    <div className="w-[100px] h-[180px] sm:w-[140px] sm:h-[240px] md:w-[177px] md:h-[309px] 2xl:w-[240px] 2xl:h-[420px] overflow-hidden rounded-sm flex-shrink-0">
                        <img src={img2} alt="New Arrival 2" className="w-full h-full object-cover" />
                    </div>

                    {/* Image 3 */}
                    <div className="w-[100px] h-[180px] sm:w-[140px] sm:h-[240px] md:w-[177px] md:h-[309px] 2xl:w-[240px] 2xl:h-[420px] overflow-hidden rounded-sm flex-shrink-0">
                        <img src={img3} alt="New Arrival 3" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Right Side - Content */}
                <motion.div
                    variants={slideUp}
                    className="flex flex-col items-center md:items-start justify-center flex-1 text-center md:text-left w-full"
                >
                    <span className="text-gray-600 text-sm md:text-lg 2xl:text-xl font-medium tracking-wide mb-2 md:mb-2 2xl:mb-4 text-center md:text-left">
                        New Arrival
                    </span>

                    <h2
                        className="font-serif text-[#2F2F2F] mb-5 md:mb-5 2xl:mb-8 max-w-full md:max-w-[568px] 2xl:max-w-none text-xl sm:text-2xl md:text-[29px] 2xl:text-5xl leading-tight md:leading-[40px] 2xl:leading-[1.2]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Fabulous Blue and Grey Silk Fabric Embroidered Lehenga Choli
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/womenwear')}
                        className="w-[140px] h-[36px] md:w-[152px] md:h-[38px] 2xl:w-[200px] 2xl:h-[50px] bg-[#812B6A] border-[0.92px] border-[#812B6A] flex items-center justify-center text-white text-xs md:text-sm 2xl:text-lg font-medium rounded hover:bg-[#6b2358] transition-colors"
                    >
                        Shop Now
                    </motion.button>
                </motion.div>

            </motion.div>
        </section>
    );
}
