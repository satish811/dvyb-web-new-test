// src/components/common/PageTransition.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../utils/animations';

/**
 * PageTransition Component
 * Wraps page content to provide smooth enter/exit animations.
 * Uses GPU-accelerated properties (transform, opacity) for 144Hz smoothness.
 */
const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            className={`w-full ${className}`}
            style={{ willChange: "transform, opacity" }} // Hardware acceleration hint
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
