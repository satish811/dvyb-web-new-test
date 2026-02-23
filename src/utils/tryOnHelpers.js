
import colorUtils  from "../components/utils/colorUtils.jsx";
import { DEFAULT_FABRIC_TYPES } from "./tryOnConstants";

/**
 * Load image with promise
 */
export const loadImg = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Convert data URL or regular URL to Blob
 */
export const urlToBlob = async (url) => {
  if (url.startsWith("data:")) {
    // Extract mime type from the data URL header (e.g. "data:image/png;base64,...")
    const mimeMatch = url.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const base64 = url.split(",")[1];
    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteArray], { type: mimeType });
  }
  return await fetch(url).then(r => r.blob());
};

/**
 * Parse colors from selectedColors array
 */
export const parseColors = (selectedColors) => {
  if (!selectedColors || selectedColors.length === 0) {
    return [];
  }

  return selectedColors.map((colorString) => {
    const { name, hex } = colorUtils.parseColor(colorString);
    return {
      name: name,
      color: hex,
      image: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="${encodeURIComponent(hex)}" width="100" height="100"/%3E%3C/svg%3E`,
    };
  });
};

/**
 * Parse fabrics from product fabric data
 */
export const parseFabrics = (fabric) => {
  if (fabric) {
    return [
      {
        id: "fabric-1",
        name: fabric,
        category: "Selected",
        style: "Current",
        properties: { drape: "Medium", shine: "Medium", texture: "Smooth" },
      },
    ];
  }
  return DEFAULT_FABRIC_TYPES;
};

/**
 * Build product data object for cart/wishlist
 */
export const buildProductData = (tryOnData, selectedColor, selectedFabric) => {
  return {
    name: tryOnData.garmentName || "Product",
    title: tryOnData.garmentName || "Product",
    price: parseFloat(tryOnData.price) || 0,
    imageUrls: tryOnData.imageUrls || [tryOnData.garmentImage],
    selectedColors: tryOnData.selectedColors || [selectedColor],
    selectedSizes: tryOnData.selectedSizes || [],
    fabric: tryOnData.fabric || selectedFabric,
    craft: tryOnData.craft || "",
    description: tryOnData.description || "",
  };
};

/**
 * Build try-on save payload
 */
export const buildTryOnPayload = (tryOnData, resultUrl, videoUrl, userId) => {
  return {
    userId: userId,
    productId: tryOnData?.productId || "unknown",
    productName: tryOnData?.productName || tryOnData?.garmentName || "Try-On Product",
    garmentName: tryOnData?.garmentName || "",
    tryOnImage: resultUrl,
    modelImage: tryOnData?.modelImage || "",
    garmentImage: tryOnData?.garmentImage || "",
    selectedColors: tryOnData?.selectedColors || [],
    selectedSizes: tryOnData?.selectedSizes || [],
    fabric: tryOnData?.fabric || "",
    price: tryOnData?.price || 0,
    discount: tryOnData?.discount || 0,
    viewMode: videoUrl ? "3D" : "2D",
    videoUrl: videoUrl || null,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Get error message for background change
 */
export const getBackgroundErrorMessage = (errorMsg) => {
  if (errorMsg.includes('Failed to fetch')) {
    return '🔌 Cannot connect to server. Make sure backend is running on port 3004.';
  } else if (errorMsg.includes('timeout')) {
    return '⏳ Request timed out. Please try again.';
  }
  return errorMsg;
};

/**
 * Create FormData for try-on API call
 */
export const createTryOnFormData = async (modelImage, garmentImage, outfitType) => {
  const formData = new FormData();

  // Handle model image
  const modelBlob = await urlToBlob(modelImage);
  formData.append("model", modelBlob, "user.jpg");

  // Handle garment image
  const garmentBlob = await urlToBlob(garmentImage);
  formData.append("garment", garmentBlob, "garment.png");

  formData.append("outfitType", outfitType.toLowerCase() || "lehenga");

  return formData;
};

/**
 * Create FormData for background change
 */
export const createBackgroundFormData = async (tryOnImage, backgroundType, customBgImage = null) => {
  const blob = await urlToBlob(tryOnImage);
  
  const formData = new FormData();
  formData.append('tryOnImage', blob, 'tryon-result.png');

  if (customBgImage) {
    const bgBlob = await urlToBlob(customBgImage);
    formData.append('backgroundImage', bgBlob, 'background.png');
    formData.append('backgroundName', backgroundType);
  } else {
    formData.append('background', backgroundType);
  }

  return formData;
};

/**
 * Create FormData for blouse change
 */
export const createBlouseFormData = async (tryOnImage, blouseType) => {
  const blob = await urlToBlob(tryOnImage);
  
  const formData = new FormData();
  formData.append('tryOnImage', blob, 'tryon-result.png');
  formData.append('blouseType', blouseType);

  return formData;
};

/**
 * Create FormData for neck change
 */
export const createNeckFormData = async (tryOnImage, neckType) => {
  const blob = await urlToBlob(tryOnImage);
  
  const formData = new FormData();
  formData.append("tryOnImage", blob, "tryon.png");
  formData.append("neckType", neckType);

  return formData;
};

/**
 * Create FormData for video generation
 */
export const createVideoFormData = async (tryOnImage) => {
  const blob = await urlToBlob(tryOnImage);
  
  const formData = new FormData();
  formData.append('tryOnImage', blob, 'tryon-bg-changed.jpg');
  formData.append('prompt', 'Professional fashion model standing elegantly, gentle camera movement, cinematic lighting, high quality');

  return formData;
};