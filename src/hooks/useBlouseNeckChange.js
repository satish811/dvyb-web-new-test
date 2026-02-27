// src/hooks/useBlouseNeckChange.js
// Combined blouse + neck change – sends ONE final image with both applied.

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../utils/tryOnConstants";
import { createBlouseFormData, createNeckFormData } from "../utils/tryOnHelpers";

/**
 * Stores pending blouse/neck selections locally (no API call on click).
 * applyChanges() chains both API calls and returns 1 final image.
 */
export const useBlouseNeckChange = (tryOnResult) => {
  const [pendingBlouse, setPendingBlouse] = useState(null);
  const [pendingNeck, setPendingNeck]     = useState(null);
  const [isApplying, setIsApplying]       = useState(false);
  const [combinedImage, setCombinedImage] = useState(null);

  // Reset when the base try-on result changes
  useEffect(() => {
    setCombinedImage(null);
  }, [tryOnResult]);

  const applyChanges = async () => {
    const baseImage = combinedImage || tryOnResult;

    if (!baseImage) {
      toast.error("Please complete the try-on first!");
      return null;
    }

    if (!pendingBlouse && !pendingNeck) {
      toast.error("Please select at least a sleeve or neck style.");
      return null;
    }

    setIsApplying(true);
    let currentImg = baseImage;

    try {
      // ── Step 1: apply blouse change if selected ──────────────────────────
      if (pendingBlouse) {
        console.log("👚 Applying blouse change:", pendingBlouse);
        const formData = await createBlouseFormData(currentImg, pendingBlouse);
        const res = await fetch(API_ENDPOINTS.CHANGE_BLOUSE, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.error || "Blouse change failed");
        currentImg = data.result;
        console.log("✅ Blouse applied");
      }

      // ── Step 2: apply neck change on top of blouse result ────────────────
      if (pendingNeck) {
        console.log("👗 Applying neck change:", pendingNeck);
        const formData = await createNeckFormData(currentImg, pendingNeck);
        const res = await fetch(API_ENDPOINTS.CHANGE_NECK, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.error || "Neck change failed");
        currentImg = data.result;
        console.log("✅ Neck applied");
      }

      setCombinedImage(currentImg);
      toast.success("Blouse & neck updated! ✨");
      return currentImg;
    } catch (err) {
      console.error("❌ Blouse/neck change failed:", err);
      toast.error(err.message);
      return null;
    } finally {
      setIsApplying(false);
    }
  };

  return {
    pendingBlouse,
    setPendingBlouse,
    pendingNeck,
    setPendingNeck,
    isApplying,
    applyChanges,
    combinedImage,
  };
};
