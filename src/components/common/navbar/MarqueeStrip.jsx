import { motion } from "framer-motion";

const MarqueeStrip = () => {
    const textUnit = "VIRTUAL TRY-ON • CONFIDENT SHOPPING •";

    // Create an array of text items to ensure we fill the screen width multiple times
    const items = Array(12).fill(textUnit);

    return (
        <div className="w-full bg-gray-100 overflow-hidden py-3 relative z-30 flex items-center border-t border-gray-200">
            <div className="flex whitespace-nowrap min-w-full">
                <motion.div
                    className="flex shrink-0 items-center"
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {items.map((text, index) => (
                        <span
                            key={`marquee-1-${index}`}
                            className="text-xs md:text-sm font-medium tracking-[0.2em] text-gray-900 uppercase inline-block"
                            style={{ paddingRight: '4rem' }}
                        >
                            {text}
                        </span>
                    ))}
                </motion.div>
                {/* Duplicate for seamless loop */}
                <motion.div
                    className="flex shrink-0 items-center"
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {items.map((text, index) => (
                        <span
                            key={`marquee-2-${index}`}
                            className="text-xs md:text-sm font-medium tracking-[0.2em] text-gray-900 uppercase inline-block"
                            style={{ paddingRight: '4rem' }}
                        >
                            {text}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default MarqueeStrip;
