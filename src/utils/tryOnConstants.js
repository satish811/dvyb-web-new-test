
import img1 from '../assets/lazyloading/logoimg1.svg';
import img2 from '../assets/lazyloading/logoimg2.svg';
import img3 from '../assets/lazyloading/logoimg3.svg';
import img4 from '../assets/lazyloading/logoimg4.svg';
import img5 from '../assets/lazyloading/logoimg5.svg';
import img6 from '../assets/lazyloading/logoimg6.svg';

// =============================================
// LOADING ANIMATION IMAGES
// ============================================
export const LOADING_IMAGES = [img1, img2, img3, img4, img5, img6];

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
];

// ============================================
// BLOUSE SLEEVE TYPES (for API calls)
// ============================================
export const BLOUSE_SLEEVE_OPTIONS = [
  {
    id: "half-sleeve",
    name: "Elbow",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/halfsleeve_ldww1b.jpg",
  },
  {
    id: "full-sleeve",
    name: "Full Sleeve",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/full_sleeve_harpuk.jpg",
  },
  {
    id: "sleeveless",
    name: "Sleeveless",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/sleeveless_zdraop.jpg",
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
  IMAGE_ROTATION: 200,           // ms between loading image rotation
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
  SCENES: "Scenes",
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