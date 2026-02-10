// src/utils/animations.js
/**
 * Global Animation Configuration
 * Optimized for 144Hz displays with GPU-accelerated properties
 */

// "Buttery" smooth easing curve
export const EASE_MAPPING = [0.25, 0.1, 0.25, 1];

// Standard fade in for layout elements
export const fadeIn = {
    hidden: { opacity: 0, willChange: "opacity" },
    visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: EASE_MAPPING }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3, ease: EASE_MAPPING }
    }
};

// Smooth slide up for content sections
export const slideUp = {
    hidden: { y: 20, opacity: 0, willChange: "transform, opacity" },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: EASE_MAPPING }
    }
};

// Stagger container for lists/grids
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    }
};

// Page transition variants - smooth fade & slight scale
export const pageTransition = {
    initial: { opacity: 0, scale: 0.98, willChange: "transform, opacity" },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: EASE_MAPPING }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.3, ease: EASE_MAPPING }
    }
};

// Interactive Element Animations
export const hoverScale = {
    scale: 1.03,
    transition: { duration: 0.2, ease: EASE_MAPPING }
};

export const tapScale = {
    scale: 0.97,
    transition: { duration: 0.1, ease: EASE_MAPPING }
};

export const hoverButton = {
    scale: 1.02,
    y: -1,
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    transition: { duration: 0.2, ease: EASE_MAPPING }
};
