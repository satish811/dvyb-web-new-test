
import { useState, useEffect, useRef } from "react";
import { API_ENDPOINTS } from "../utils/tryOnConstants";
import { createTryOnFormData } from "../utils/tryOnHelpers";
import { saveTryOnResult } from "../services/tryOnService";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const { user } = useAuth();

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

        console.error("❌ Server Error Detail:", errorMsg);
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

        console.error("❌ Server Error Detail:", errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || "No result");
      }

      const resultUrl = data.result;
      setTryOnResult(resultUrl);

      console.log("✅ Try-on complete");

      // Auto-save to gallery
      if (user) {
        try {
          await saveTryOnResult({
            ...tryOnData,
            tryOnResult: resultUrl,
            tryOnImage: resultUrl,
            is3D: false
          });
        } catch (saveErr) {
          console.error("Failed to auto-save try-on:", saveErr);
          // Don't block the UI if save fails
        }
      }

    } catch (err) {
      console.error("❌ Server Error Detail:", err);
      console.error("❌ Server Error Detail:", err);
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