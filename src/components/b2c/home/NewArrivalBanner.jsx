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
        <section className="w-full py-16 px-4 md:px-8 bg-[#F3F4F6] flex justify-center">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="relative"
                style={{
                    width: '1218.44px',
                    height: '346.15px',
                    maxWidth: '100%', // Ensure responsiveness
                    borderRadius: '10px',
                    padding: '18.46px',
                    background: 'linear-gradient(90.22deg, rgba(255, 251, 254, 0.8) 0.19%, rgba(232, 215, 228, 0.8) 115.79%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '36.92px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
            >
                {/* Left Side - 3 Images */}
                <div className="flex gap-[15px] h-full items-center">
                    {/* Image 1 */}
                    <div className="overflow-hidden relative"
                        style={{ width: '177.23px', height: '309.22px', borderRadius: '0px' }}>
                        <img src={img1} alt="New Arrival 1" className="w-full h-full object-cover" />
                    </div>

                    {/* Image 2 - No Border */}
                    <div className="overflow-hidden relative"
                        style={{ width: '177.23px', height: '309.22px', borderRadius: '0px' }}>
                        <img src={img2} alt="New Arrival 2" className="w-full h-full object-cover" />

                        {/* Removed dotted line connection */}
                    </div>

                    {/* Image 3 */}
                    <div className="overflow-hidden relative"
                        style={{ width: '177.23px', height: '309.22px', borderRadius: '0px' }}>
                        <img src={img3} alt="New Arrival 3" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Right Side - Content */}
                <motion.div
                    variants={slideUp}
                    className="flex flex-col items-start justify-center h-full"
                    style={{ flex: 1 }}
                >
                    <span className="text-gray-600 text-lg font-medium tracking-wide mb-2">
                        New Arrival
                    </span>

                    <h2 style={{
                        width: '568.60px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '29.54px',
                        lineHeight: '40.61px',
                        letterSpacing: '0%',
                        color: '#2F2F2F', // Default dark color
                        marginBottom: '20px',
                        maxWidth: '100%'
                    }}>
                        Fabulous Blue and Grey Silk Fabric Embroidered Lehenga Choli
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/womenwear')}
                        style={{
                            width: '152.30px',
                            height: '38.77px',
                            background: '#812B6A',
                            borderWidth: '0.92px', // From specs (though usually border is separate from width)
                            padding: '0', // Reset to center text with flex or exact padding
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            borderRadius: '4px', // Slight rounding standard
                            cursor: 'pointer'
                        }}
                    >
                        Shop Now
                    </motion.button>
                </motion.div>

            </motion.div>
        </section>
    );
}
