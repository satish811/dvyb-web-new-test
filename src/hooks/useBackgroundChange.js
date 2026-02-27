

import { useState } from "react";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../utils/tryOnConstants";
import { createBackgroundFormData, getBackgroundErrorMessage } from "../utils/tryOnHelpers";

/**
 * Background change logic hook
 */
export const useBackgroundChange = (tryOnResult) => {
  const [backgroundChangedImage, setBackgroundChangedImage] = useState(null);
  const [isChangingBackground, setIsChangingBackground] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("");

  const changeBackground = async (backgroundType, customBgImage = null) => {
    if (!tryOnResult) {
      toast.error("Please complete try-on first!");
      return;
    }

    setIsChangingBackground(true);
    setSelectedBackground(backgroundType);

    try {
      console.log("🎨 Starting background change...");

      const formData = await createBackgroundFormData(tryOnResult, backgroundType, customBgImage);

      console.log(`📤 Sending to backend with background: ${backgroundType}`);

      const apiResponse = await fetch(API_ENDPOINTS.CHANGE_BACKGROUND, {
        method: 'POST',
        body: formData,
      });

      console.log("📡 Response status:", apiResponse.status);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.details || errorData.error || `Server error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();

      if (data.success && data.result) {
        console.log("✅ Background change successful!");
        setBackgroundChangedImage(data.result);
        toast.success(`Background changed to ${data.background}! 🎉`);
      } else {
        throw new Error(data.error || "Background change failed");
      }
    } catch (error) {
      console.error("❌ Background change failed:", error);
      const errorMsg = getBackgroundErrorMessage(error.message);
      toast.error(errorMsg);
    } finally {
      setIsChangingBackground(false);
    }
  };

  const handleReset = () => {
    setSelectedBackground("");
    setBackgroundChangedImage(null);
  };

  return {
    backgroundChangedImage,
    isChangingBackground,
    selectedBackground,
    changeBackground,
    handleReset,
  };
};