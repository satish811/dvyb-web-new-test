
import { useState, useEffect, useRef } from "react";
import { auth } from "../config/firebaseConfig";
import { API_ENDPOINTS } from "../utils/tryOnConstants";
import { createTryOnFormData } from "../utils/tryOnHelpers";

/**
 * Main try-on logic hook
 * Handles the core AI try-on processing
 */
export const useTryOnLogic = (tryOnData, isOpen) => {
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const hasStartedRef = useRef(false);

  const performTryOn = async (options = {}) => {
    console.log("🎯 performTryOn called");

    const force = options?.force === true;

    const { modelImage, garmentImage, garmentName } = tryOnData || {};
    if (!modelImage || !garmentImage || !garmentName) {
      console.log("⏸️ Missing required data");
      return;
    }

    if (isProcessing) {
      console.log("⏸️ Already processing - BLOCKING");
      return;
    }

    if (tryOnResult && !force) {
      console.log("⏸️ Already have result - BLOCKING");
      return;
    }

    // Note: hasStartedRef is mainly to guard the auto-start useEffect.
    // If there's an error (or if forced), we allow manual retry even if it started once.
    if (hasStartedRef.current && !errorMsg && !force) {
      console.log("⏸️ Already started once - BLOCKING");
      return;
    }

    console.log("🚀 performTryOn EXECUTING");

    if (force) {
      hasStartedRef.current = false;
    }

    hasStartedRef.current = true;
    setIsProcessing(true);
    setErrorMsg("");
    setTryOnResult(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Please log in to use Virtual Try-On.");
      }

      const token = await currentUser.getIdToken();
      const formData = await createTryOnFormData(
        modelImage,
        garmentImage,
        tryOnData?.dressType || tryOnData?.outfitType
      );

      console.log("🚀 Sending to /api/garnment-swap");

      const response = await fetch(API_ENDPOINTS.GARMENT_SWAP, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMsg = errorData.error || errorData.details || errorData.message || errorText;
          } catch (jsonError) {
            // If it's not JSON, just use the text
            errorMsg = errorText || errorMsg;
          }
        } catch (e) {
          console.error("Error reading error response:", e);
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || "No result");
      }

      const resultUrl = data.result;
      setTryOnResult(resultUrl);

      console.log("✅ Try-on complete");

    } catch (err) {
      console.error("❌ Server Error Detail:", err);
      setErrorMsg(err.message);

      // Allow manual retry after a failure.
      hasStartedRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-start try-on when modal opens
  useEffect(() => {
    if (hasStartedRef.current) return;

    const { modelImage, garmentImage } = tryOnData || {};

    if (
      isOpen &&
      modelImage &&
      garmentImage &&
      !hasStarted &&
      !tryOnResult &&
      !isProcessing
    ) {
      console.log("🎬 Starting try-on (FIRST TIME ONLY)");
      setHasStarted(true);
      performTryOn();
    }

    if (!isOpen) {
      setHasStarted(false);
    }
  }, [isOpen, tryOnData, hasStarted, tryOnResult, isProcessing]);

  return {
    tryOnResult,
    isProcessing,
    errorMsg,
    performTryOn,
  };
};