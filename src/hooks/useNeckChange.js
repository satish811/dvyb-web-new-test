// src/hooks/useNeckChange.js
import { useState } from "react";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../utils/tryOnConstants";
import { createNeckFormData } from "../utils/tryOnHelpers";

export const useNeckChange = (tryOnResult) => {
  const [selectedNeck, setSelectedNeck] = useState(null);
  const [isChangingNeck, setIsChangingNeck] = useState(false);

  const changeNeck = async (neckType) => {
    if (!tryOnResult) {
      toast.error("Please complete try-on first!");
      return;
    }

    setIsChangingNeck(true);
    setSelectedNeck(neckType);

    try {
      console.log("👗 Starting neck change...");

      const formData = await createNeckFormData(tryOnResult, neckType);

      console.log(`📤 Sending to backend with neck: ${neckType}`);

      const apiResponse = await fetch(API_ENDPOINTS.CHANGE_NECK, {
        method: "POST",
        body: formData,
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || "Neck change failed");
      }

      console.log("✅ Neck change successful!");
      toast.success(`Neck changed to ${neckType}! 👗`);
      return data.result;
    } catch (err) {
      console.error("❌ Neck change failed:", err);
      toast.error(err.message);
      return null;
    } finally {
      setIsChangingNeck(false);
    }
  };

  return {
    selectedNeck,
    isChangingNeck,
    changeNeck,
    setSelectedNeck,
  };
};