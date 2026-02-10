// src/components/common/MotionButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale, tapScale } from '../../utils/animations';

/**
 * MotionButton Component
 * Enhances standard buttons with "buttery" hover and tap effects.
 * Preserves all original props and styles.
 */
const MotionButton = ({ children, onClick, className = "", type = "button", disabled = false, ...props }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={!disabled ? hoverScale : {}}
            whileTap={!disabled ? tapScale : {}}
            layout // Smooth layout transitions if size changes
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default MotionButton;
