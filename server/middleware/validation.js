/**
 * Input Validation Middleware
 * Provides reusable validation chains and sanitization
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

/**
 * Validate image file upload
 */
export const validateImageUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded'
        });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
        });
    }

    if (req.file.size > maxSize) {
        return res.status(400).json({
            success: false,
            error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
        });
    }

    next();
};

/**
 * Validate try-on request from URLs
 */
export const validateTryOnRequest = [
    body('modelUrl')
        .optional()
        .isURL()
        .withMessage('Invalid model URL'),
    body('garmentUrl')
        .optional()
        .isURL()
        .withMessage('Invalid garment URL'),
    body('outfitType')
        .optional()
        .isIn(['saree', 'lehenga', 'kurti', 'anarkali', 'sharara', 'kurta set', 'background-swap'])
        .withMessage('Invalid outfit type'),
    handleValidationErrors
];

/**
 * Validate background change request
 */
export const validateBackgroundChange = [
    body('background')
        .notEmpty()
        .isString()
        .isIn(['hallway', 'pool', 'wedding', 'trees'])
        .withMessage('Invalid background selection'),
    handleValidationErrors
];

/**
 * Validate video creation request
 */
export const validateVideoCreation = [
    // File validation is handled by validateImageUpload middleware
    handleValidationErrors
];

/**
 * Validate task ID parameter
 */
export const validateTaskId = [
    param('taskId')
        .notEmpty()
        .isString()
        .trim()
        .withMessage('Valid task ID required'),
    handleValidationErrors
];

/**
 * Validate file ID parameter
 */
export const validateFileId = [
    param('fileId')
        .notEmpty()
        .isString()
        .trim()
        .withMessage('Valid file ID required'),
    handleValidationErrors
];

/**
 * Validate order creation
 */
export const validateOrderCreation = [
    body('userId')
        .notEmpty()
        .isString()
        .trim()
        .withMessage('User ID required'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    body('items.*.productId')
        .notEmpty()
        .withMessage('Product ID required for each item'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100'),
    body('totalAmount')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be positive'),
    handleValidationErrors
];

/**
 * Validate Cloudinary upload request
 */
export const validateCloudinaryUpload = [
    body('images')
        .isArray({ min: 1 })
        .withMessage('Images array required'),
    body('images.*.outfitType')
        .notEmpty()
        .isString()
        .withMessage('Outfit type required for each image'),
    body('images.*.base64Image')
        .notEmpty()
        .isString()
        .withMessage('Base64 image data required'),
    handleValidationErrors
];

/**
 * Sanitization helpers
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .substring(0, 1000); // Limit length
};

export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
};

export const sanitizeUrl = (url) => {
    if (typeof url !== 'string') return '';
    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return url;
    } catch {
        return '';
    }
};
