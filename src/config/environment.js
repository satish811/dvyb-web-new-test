/**
 * Environment Configuration Service
 * Validates and provides type-safe access to environment variables
 * Prevents accidental exposure of secrets to client-side code
 */

const requiredClientVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

const requiredServerVars = [
    'CLOUDINARY_API_SECRET',
    'RAZORPAY_KEY_SECRET',
    'GEMINI_API_KEY',
];

class EnvironmentConfig {
    constructor() {
        this.isServer = typeof window === 'undefined';
        this.validateEnvironment();
    }

    validateEnvironment() {
        const missing = [];
        const varsToCheck = this.isServer
            ? [...requiredClientVars, ...requiredServerVars]
            : requiredClientVars;

        varsToCheck.forEach(varName => {
            const value = this.isServer
                ? process.env[varName]
                : import.meta.env[varName];

            if (!value) {
                missing.push(varName);
            }
        });

        if (missing.length > 0) {
            console.error(
                `❌ Missing required environment variables:\n${missing.join('\n')}\n\n` +
                `Please check your .env file against .env.example`
            );
            // Don't throw in production, just log
            if (process.env.NODE_ENV !== 'production') {
                throw new Error(`Missing environment variables: ${missing.join(', ')}`);
            }
        }
    }

    /**
     * Get environment variable value
     * @param {string} key - Variable name
     * @param {*} defaultValue - Default value if not found
     * @returns {string|null}
     */
    get(key, defaultValue = null) {
        if (this.isServer) {
            return process.env[key] || defaultValue;
        }
        return import.meta.env[key] || defaultValue;
    }

    /**
     * Get required environment variable (throws if missing)
     * @param {string} key - Variable name
     * @returns {string}
     */
    getRequired(key) {
        const value = this.get(key);
        if (!value) {
            throw new Error(`Required environment variable ${key} is not set`);
        }
        return value;
    }

    /**
     * Check if running in production
     * @returns {boolean}
     */
    isProduction() {
        return this.get('NODE_ENV') === 'production' ||
            this.get('VITE_MODE') === 'production';
    }

    /**
     * Check if running in development
     * @returns {boolean}
     */
    isDevelopment() {
        return this.get('NODE_ENV') === 'development' ||
            this.get('VITE_MODE') === 'development';
    }

    /**
     * Get Firebase configuration (client-safe)
     * @returns {object}
     */
    getFirebaseConfig() {
        return {
            apiKey: this.getRequired('VITE_FIREBASE_API_KEY'),
            authDomain: this.getRequired('VITE_FIREBASE_AUTH_DOMAIN'),
            projectId: this.getRequired('VITE_FIREBASE_PROJECT_ID'),
            storageBucket: this.getRequired('VITE_FIREBASE_STORAGE_BUCKET'),
            messagingSenderId: this.getRequired('VITE_FIREBASE_MESSAGING_SENDER_ID'),
            appId: this.getRequired('VITE_FIREBASE_APP_ID'),
            measurementId: this.get('VITE_FIREBASE_MEASUREMENT_ID'),
        };
    }

    /**
     * Get Cloudinary configuration (public keys only for client)
     * @returns {object}
     */
    getCloudinaryConfig() {
        const config = {
            cloudName: this.get('VITE_CLOUDINARY_CLOUD_NAME'),
            apiKey: this.get('VITE_CLOUDINARY_API_KEY'),
        };

        // Only include secret on server-side
        if (this.isServer) {
            config.apiSecret = this.getRequired('VITE_CLOUDINARY_API_SECRET');
        }

        return config;
    }

    /**
     * Get API base URL
     * @returns {string}
     */
    getApiUrl() {
        if (this.isProduction()) {
            return this.get('VITE_BASE_PRODUCTION_URL', 'https://api.yourdomain.com');
        }
        return this.get('VITE_BASE_DEVELOPMENT_URL', 'http://localhost:3010');
    }
}

// Export singleton instance
export const env = new EnvironmentConfig();

// Export for testing
export { EnvironmentConfig };
