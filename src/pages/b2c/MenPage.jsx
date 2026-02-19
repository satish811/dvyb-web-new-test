import React from "react";
import { motion } from "framer-motion";

const MenPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                    MEN'S COLLECTION
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 font-light tracking-wide">
                    COMING SOON
                </p>
                <div className="mt-8 w-16 h-1 bg-gray-900 mx-auto rounded-full"></div>
            </motion.div>
        </div>
    );
};

export default MenPage;
