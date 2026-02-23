
import { LOADING_FRAMES, FRAME_INTERVAL } from '../assets/lazyloading2';

// =============================================
// LOADING ANIMATION IMAGES
// ============================================
export const LOADING_IMAGES = LOADING_FRAMES;

// ============================================
// BLOUSE DESIGNS
// ============================================
export const BLOUSE_DESIGNS = [
  {
    id: "traditional",
    name: "Traditional",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3ETraditional%3C/text%3E%3C/svg%3E',
  },
  {
    id: "modern-cut",
    name: "Modern Cut",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EModern%3C/text%3E%3C/svg%3E',
  },
  {
    id: "designer",
    name: "Designer",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EDesigner%3C/text%3E%3C/svg%3E',
  },
  {
    id: "sleeveless",
    name: "Sleeveless",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3ESleeveless%3C/text%3E%3C/svg%3E',
  },
  {
    id: "halternek",
    name: "Halternek",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EHalternek%3C/text%3E%3C/svg%3E',
  },
  {
    id: "backless",
    name: "Backless",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EBackless%3C/text%3E%3C/svg%3E',
  },
];

// ============================================
// BACKGROUND OPTIONS
// ============================================
export const BACKGROUND_OPTIONS = [
  {
    id: "hallway",
    name: "Temple Hall",
    image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background4_gqcvpg.jpg',
  },
  {
    id: "pool",
    name: "Grand Hall",
    image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background6_cmouwo.jpg'
  },
  {
    id: "wedding",
    name: "Archway",
    image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background5_a9sfuo.jpg'
  },
  {
    id: "trees",
    name: "Floral lights",
    image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background11_lctohz.jpg'
  },
];

// ============================================
// NECK OPTIONS
// ============================================
export const NECK_OPTIONS = [
  {
    id: "collar",
    label: "Collar",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1767595811/Gemini_Generated_Image_gtmddsgtmddsgtmd_kwxsta.png",
  },
  {
    id: "regular",
    label: "Regular",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1767595811/Gemini_Generated_Image_y8utf4y8utf4y8ut_d3ektd.png",
  },
  {
    id: "v-neck",
    label: "V-Neck",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ECFDF5" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23059669" font-size="12"%3EV-Neck%3C/text%3E%3C/svg%3E',
  },
  {
    id: "sweetheart",
    label: "Sweetheart",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23FFF1F2" width="100" height="100"/%3E%3Ctext x="50" y="45" text-anchor="middle" dy=".3em" fill="%23E11D48" font-size="9"%3ESweet%3C/text%3E%3Ctext x="50" y="62" text-anchor="middle" dy=".3em" fill="%23E11D48" font-size="9"%3Eheart%3C/text%3E%3C/svg%3E',
  },
];

// ============================================
// BLOUSE SLEEVE TYPES (for API calls)
// ============================================
export const BLOUSE_SLEEVE_OPTIONS = [
  {
    id: "sleeveless",
    name: "Sleeveless",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/sleeveless_zdraop.jpg",
  },
  {
    id: "short-sleeve",
    name: "Short Sleeve",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23F0FDF4" width="100" height="100"/%3E%3Ctext x="50" y="45" text-anchor="middle" dy=".3em" fill="%2316A34A" font-size="9"%3EShort%3C/text%3E%3Ctext x="50" y="62" text-anchor="middle" dy=".3em" fill="%2316A34A" font-size="9"%3ESleeve%3C/text%3E%3C/svg%3E',
  },
  {
    id: "puff-sleeve",
    name: "Puff",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23F3E8FF" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%238B5CF6" font-size="12"%3EPuff%3C/text%3E%3C/svg%3E',
  },
  {
    id: "half-sleeve",
    name: "Elbow",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/halfsleeve_ldww1b.jpg",
  },
  {
    id: "three-quarter",
    name: "3/4 Sleeve",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23FFF7ED" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23EA580C" font-size="14" font-weight="bold"%3E3%2F4%3C/text%3E%3C/svg%3E',
  },
  {
    id: "full-sleeve",
    name: "Full",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/full_sleeve_harpuk.jpg",
  },
];

// ============================================
// SAREE STYLE OPTIONS
// ============================================
export const SAREE_STYLE_OPTIONS = [
  {
    id: "nivi",
    name: "Nivi",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23FDF4FF" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239333EA" font-size="12"%3ENivi%3C/text%3E%3C/svg%3E',
  },
  {
    id: "gujarati",
    name: "Gujarati",
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23FFF1F2" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23E11D48" font-size="10"%3EGujarati%3C/text%3E%3C/svg%3E',
  },
];

// ============================================
// DEFAULT FABRIC TYPES (when no fabric provided)
// ============================================
export const DEFAULT_FABRIC_TYPES = [
  {
    id: "pure-silk",
    name: "Pure Silk",
    category: "Premium",
    style: "Traditional",
    properties: { drape: "Light", shine: "Medium", texture: "Soft" },
  },
  {
    id: "zari-work",
    name: "Zari Work",
    category: "Lightweight",
    style: "Modern",
    properties: { drape: "Medium", shine: "High", texture: "Smooth" },
  },
  {
    id: "heavy-silk",
    name: "Heavy Silk",
    category: "Premium",
    style: "Traditional",
    properties: { drape: "Heavy", shine: "Low", texture: "Rich" },
  },
];

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  GARMENT_SWAP: '/api/garnment-swap',
  CHANGE_BACKGROUND: '/api/change-tryon-background',
  CHANGE_BLOUSE: '/api/change-blouse',
  CHANGE_NECK: '/api/change-neck',
  VIDEO_CREATE: '/api/video/create',
  VIDEO_STATUS: '/api/video/status',
  VIDEO_DOWNLOAD: '/api/video/download',
};

// ============================================
// TIMING CONSTANTS
// ============================================
export const TIMINGS = {
  IMAGE_ROTATION: FRAME_INTERVAL,     // ms between loading image rotation
  AUTO_BG_REMOVE_DELAY: 800,     // ms before auto background removal
  AUTO_3D_TRIGGER_DELAY: 1500,   // ms before auto 3D video generation
  VIDEO_POLL_INTERVAL: 5000,     // ms between video status checks
  MAX_VIDEO_ATTEMPTS: 60,        // max polling attempts (5 minutes)
};

// ============================================
// UI TEXT CONSTANTS
// ============================================
export const UI_TEXT = {
  PROCESSING_MESSAGE: "Creating your Vibe",
  TRY_AGAIN: "Try Again",
  VIEW_PRODUCT: "VIEW PRODUCT",
  ADD_TO_WISHLIST: "Add to Wishlist",
  ADDED_TO_WISHLIST: "Added to Wishlist",
  SHARE_MY_LOOK: "Share my look",
  CUSTOMIZE_OUTFIT: "Outfit Details",
  CUSTOMIZE_SUBTITLE: "Try different colors, fabrics, and styles",
  SCENES: "Background",
  BACKGROUNDS: "Backgrounds",
  QUICK_ACTIONS: "Quick Actions",
  VIEW_IN_360: "View Virtual Video",
  VIDEO_GENERATING: "Generating 3D Video...",
  VIDEO_GENERATING_SUBTITLE: "Creating your 6-second video",
  VIDEO_COMPLETE_TIME: "This usually takes 45–90 seconds",
  VIDEO_GENERATION_FAILED: "Video Generation Failed",
  BACKGROUND_REQUIRED_TITLE: "Background Required",
  BACKGROUND_REQUIRED_MSG: "Please select a background scene first before generating 3D video.",
};