// src/components/b2c/TryOn/hooks/useBlouseChange.js

import { useState } from "react";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../utils/tryOnConstants";
import { createBlouseFormData } from "../utils/tryOnHelpers";

/**
 * Blouse change logic hook
 * Handles changing blouse styles (half-sleeve, full-sleeve, sleeveless)
 */
export const useBlouseChange = (tryOnResult) => {
  const [selectedBlouse, setSelectedBlouse] = useState("regular");
  const [isChangingBlouse, setIsChangingBlouse] = useState(false);
  const [blouseChangedImage, setBlouseChangedImage] = useState(null);

  const changeBlouse = async (blouseType) => {
    // Use the previously modified image if available, otherwise use the original
    const baseImage = blouseChangedImage || tryOnResult;

    if (!baseImage) {
      toast.error("Please complete try-on first!");
      return;
    }

    setIsChangingBlouse(true);
    setSelectedBlouse(blouseType);

    try {
      console.log("👚 Starting blouse change...");

      const formData = await createBlouseFormData(baseImage, blouseType);

      console.log(`📤 Sending to backend with blouse: ${blouseType}`);

      const apiResponse = await fetch(API_ENDPOINTS.CHANGE_BLOUSE, {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || `Server error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();

      if (data.success && data.result) {
        console.log("✅ Blouse change successful!");
        // Update internal state with the modified image
        setBlouseChangedImage(data.result);
        toast.success(`Blouse changed to ${blouseType}! 👚`);
        return data.result; // Return the new image
      } else {
        throw new Error(data.error || "Blouse change failed");
      }
    } catch (error) {
      console.error("❌ Blouse change failed:", error);
      toast.error(error.message);
      return null;
    } finally {
      setIsChangingBlouse(false);
    }
  };

  return {
    selectedBlouse,
    isChangingBlouse,
    changeBlouse,
    setSelectedBlouse,
    blouseChangedImage,
  };
};