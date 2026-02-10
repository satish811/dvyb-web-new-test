// src/components/common/MotionImage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../../utils/animations';

/**
 * MotionImage Component
 * Handles smooth image loading to prevent visual jank.
 * Fades in image only when fully loaded.
 */
const MotionImage = ({ src, alt, className = "", ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Placeholder / Skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}

            <motion.img
                src={src}
                alt={alt}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                variants={fadeIn}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover ${className}`}
                {...props}
            />
        </div>
    );
};

export default MotionImage;
