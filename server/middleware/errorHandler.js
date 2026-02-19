/**
 * Global Error Handler Middleware
 * Centralized error handling for all routes
 */

import { logger } from '../utils/logger.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Error handler middleware
 * Must be registered LAST in middleware chain
 */
export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Default to 500 if no status code
    statusCode = statusCode || 500;

    // Log error
    if (statusCode >= 500) {
        logger.error('Server Error:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip
        });
    } else {
        logger.warn('Client Error:', {
            message: err.message,
            url: req.originalUrl,
            method: req.method,
            statusCode
        });
    }

    // Don't leak error details in production
    const response = {
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    };

    res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
