import React from "react";
import { Loader } from "lucide-react";

/**
 * Processing Loading Popup Component
 * Shows during background change or apply changes operations
 */
const ProcessingLoadingPopup = ({ isProcessing, processingType = "changes" }) => {
  if (!isProcessing) return null;

  const messageText = processingType === "background" 
    ? "Changing background..." 
    : "Applying changes...";

  const warningText = processingType === "background"
    ? "This takes 20-30 seconds. Please wait, don't hit the back button."
    : "This takes 20-30 seconds. Please wait, don't hit the back button.";

  return (
    <div className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="flex items-center justify-center">
          <Loader className="w-12 h-12 text-[#74136C] animate-spin" />
        </div>

        {/* Main Message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {messageText}
          </h3>

          {/* Warning Text */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {warningText}
          </p>
        </div>

        {/* Time Indicator */}
        <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
          <div className="bg-[#74136C] h-full animate-pulse"></div>
        </div>

        {/* Secondary Message */}
        <p className="text-xs text-gray-500 text-center">
          Processing your request...
        </p>
      </div>
    </div>
  );
};

export default ProcessingLoadingPopup;
