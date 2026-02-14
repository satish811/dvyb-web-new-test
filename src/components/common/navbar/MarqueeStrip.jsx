import React from "react";
import { motion } from "framer-motion";

const MarqueeStrip = () => {
    // Array of repeated items for seamless loop
    const items = new Array(10).fill("VIRTUAL TRY-ON • CONFIDENT SHOPPING • ");

    return (
        <div className="w-full bg-[#FAFAFA] py-3 2xl:py-5 relative z-30 overflow-hidden flex items-center border-b border-gray-100">
            {/* Smooth Infinite Marquee - Right to Left */}
            <motion.div
                className="whitespace-nowrap flex items-center"
                initial={{ x: "0" }}
                animate={{ x: "-50%" }}
                transition={{
                    repeat: Infinity,
                    duration: 30, // Standard speed
                    ease: "linear"
                }}
                style={{ width: "fit-content" }}
            >
                {/* Duplicate the content inside so we have enough width for the loop */}
                {[...items, ...items].map((text, index) => (
                    <span
                        key={index}
                        // Increased font size as requested ("some big")
                        className="text-xs md:text-sm 2xl:text-lg font-semibold tracking-[0.2em] 2xl:tracking-[0.25em] text-gray-800 uppercase px-4 2xl:px-8 inline-block opacity-80"
                    >
                        {text}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export default MarqueeStrip;
