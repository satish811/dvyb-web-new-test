import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // ✨ Animation import
import { fadeIn, slideUp, hoverScale, staggerContainer } from "../../../utils/animations"; // ✨ Global animations

// Assets - Using existing tall images
import img1 from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import img2 from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import img3 from "../../../assets/b2c/landing/Landing-villy/indowestern.png";

export default function NewArrivalBanner() {
    const navigate = useNavigate();

    return (
        <section className="w-full py-16 px-4 md:px-8 bg-[#F3F4F6]">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="max-w-[1400px] mx-auto"
            >
                <div className="w-full rounded-[30px] overflow-hidden bg-gradient-to-r from-[#EEEAF4] to-[#F1E1EB] p-6 md:p-12 flex flex-col lg:flex-row items-center gap-10">

                    {/* Left Side - 3 Images */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-start gap-4 h-[300px] md:h-[400px]">
                        <motion.div variants={fadeIn} className="w-1/3 h-full rounded-xl overflow-hidden shadow-md">
                            <motion.img
                                whileHover={hoverScale}
                                transition={{ duration: 0.5 }}
                                src={img1} alt="New Arrival 1" className="w-full h-full object-cover"
                            />
                        </motion.div>
                        <motion.div variants={fadeIn} className="w-1/3 h-full rounded-xl overflow-hidden shadow-md">
                            <motion.img
                                whileHover={hoverScale}
                                transition={{ duration: 0.5 }}
                                src={img2} alt="New Arrival 2" className="w-full h-full object-cover"
                            />
                        </motion.div>
                        <motion.div variants={fadeIn} className="w-1/3 h-full rounded-xl overflow-hidden shadow-md">
                            <motion.img
                                whileHover={hoverScale}
                                transition={{ duration: 0.5 }}
                                src={img3} alt="New Arrival 3" className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>

                    {/* Right Side - Content */}
                    <motion.div
                        variants={slideUp}
                        className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
                    >
                        <span className="text-gray-600 text-lg md:text-xl font-medium tracking-wide">
                            New Arrival
                        </span>

                        <h2 className="text-3xl md:text-5xl text-[#2F2F2F] font-serif leading-tight max-w-xl" style={{ fontFamily: 'Antiga, serif' }}>
                            Fabulous Blue and Grey Silk Fabric Embroidered Lehenga Choli
                        </h2>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/womenwear')}
                            className="bg-[#7E356B] hover:bg-[#6a2c5a] text-white px-10 py-3.5 rounded text-sm font-semibold tracking-wide transition-colors shadow-lg mt-4"
                        >
                            Shop Now
                        </motion.button>
                    </motion.div>

                </div>
            </motion.div>
        </section>
    );
}
