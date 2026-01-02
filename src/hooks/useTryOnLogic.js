
import { useState, useEffect, useRef } from "react";
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

  const performTryOn = async () => {
    console.log("🎯 performTryOn called");

    const { modelImage, garmentImage, garmentName } = tryOnData || {};
    if (!modelImage || !garmentImage || !garmentName) {
      console.log("⏸️ Missing required data");
      return;
    }

    if (isProcessing) {
      console.log("⏸️ Already processing - BLOCKING");
      return;
    }

    if (tryOnResult) {
      console.log("⏸️ Already have result - BLOCKING");
      return;
    }

    if (hasStartedRef.current) {
      console.log("⏸️ Already started once - BLOCKING");
      return;
    }

    console.log("🚀 performTryOn EXECUTING");

    hasStartedRef.current = true;
    setIsProcessing(true);
    setErrorMsg("");
    setTryOnResult(null);

    try {
      const formData = await createTryOnFormData(
        modelImage,
        garmentImage,
        tryOnData?.dressType || tryOnData?.outfitType
      );

      console.log("🚀 Sending to /api/garnment-swap");

      const response = await fetch(API_ENDPOINTS.GARMENT_SWAP, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || "No result");
      }

      const resultUrl = data.result;
      setTryOnResult(resultUrl);

      console.log("✅ Try-on complete");
    } catch (err) {
      console.error("❌ Error:", err);
      setErrorMsg(err.message);
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