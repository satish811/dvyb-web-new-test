//  PURE UI COMPONENT - No business logic


import React from "react";
import { Loader2 } from "lucide-react";
import { UI_TEXT } from "../../../../utils/tryOnConstants";
import LazyImageLoader from "../../LazyImageLoader/LazyImageLoader";

/**
 * Center Stage Component - Main Preview Area
 * Displays the try-on result, loading state, errors, or video
 */
const TryOnStage = ({
  isProcessing,
  errorMsg,
  viewMode,
  tryOnResult,
  getCurrentDisplayImage,
  currentLoadingImage,
  isChangingBackground,
  videoUrl,
  isGeneratingVideo,
  videoProgress,
  videoError,
  performTryOn,
  generateVideo,
}) => {
  return (

    <div className="
  lg:absolute lg:inset-0 
  flex flex-col lg:items-center lg:justify-center 
  lg:pointer-events-none
  lg:px-[320px] xl:px-[360px] 2xl:px-[420px]
  relative w-full
">

      {/* ============================================ */}
      {/* PROCESSING STATE */}
      {/* ============================================ */}
      {isProcessing && (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src={currentLoadingImage}
              alt="loader"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                transition: "opacity 0.3s",
              }}
            />
          </div>
          <p className="text-xl text-center text-primary font-Outfit mt-4">
            {UI_TEXT.PROCESSING_MESSAGE}
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* ERROR STATE */}
      {/* ============================================ */}
      {!isProcessing && errorMsg && (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="font-semibold text-lg mb-2 text-gray-900">Try-on failed</p>
          <p className="text-sm text-gray-600 mb-6">{errorMsg}</p>
          <button
            onClick={performTryOn}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-lg font-medium"
          >
            {UI_TEXT.TRY_AGAIN}
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* 2D IMAGE VIEW */}
      {/* ============================================ */}
      {!isProcessing && !errorMsg && viewMode === "2D" && getCurrentDisplayImage() && (
        <div className="flex flex-col items-center h-full justify-center">
          <div className="bg-white p-1.5 sm:p-2 rounded-[36px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center mt-2">
            {/* Image */}
            <div className="relative rounded-[30px] border-[3.5px] border-[#009EE3] overflow-hidden w-full h-full flex items-center justify-center">
              <img
                src={getCurrentDisplayImage()}
                alt="Try-on result"
                className="
                  pointer-events-auto
                  w-[360px] sm:w-[420px] xl:w-[480px]
                  h-auto max-h-[82vh]
                  object-contain
                "
                draggable={false}
              />
            </div>
          </div>

          {/* AI Disclaimer — below the image box */}
          <div
            className="mt-2 w-[360px] sm:w-[400px] xl:w-[480px] px-3 rounded-lg flex items-center justify-center gap-2 mx-auto"
            style={{
              background: "transparent",
            }}
          >
            <span
              className="text-[10px] font-bold tracking-wider flex-shrink-0 flex items-center gap-0.5"
              style={{ color: "#74136C" }}
            >
              ✦ AI
            </span>
            <div className="w-px h-3 bg-gray-400 flex-shrink-0" />
            <p className="text-gray-500 text-[10px] leading-snug tracking-wide text-center">
              *Ai Generated preview. Results are for visualisation only and may not perfectly represent the actual product
            </p>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 3D VIDEO VIEW */}
      {/* ============================================ */}
      {!isProcessing && !errorMsg && viewMode === "3D" && (
        <div className="relative  h-full flex items-center justify-center">

          {/* Video Generating */}
          {isGeneratingVideo && (
            <div className="text-center max-w-md">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary mb-4" />
              <p className="text-xl font-semibold mb-2">{UI_TEXT.VIDEO_GENERATING}</p>
              <p className="text-sm text-gray-600 mb-4">
                {UI_TEXT.VIDEO_GENERATING_SUBTITLE}
              </p>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

              <p className="text-sm text-gray-600">{videoProgress}% Complete</p>
              <p className="text-lg font-semibold text-primary mt-2">
                {UI_TEXT.VIDEO_COMPLETE_TIME}
              </p>
            </div>
          )}

          {/* Video Success */}
          {!isGeneratingVideo && videoUrl && (
            <div className="relative max-w-[85vw] h-full">
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-cover shadow-2xl"
              />
            </div>
          )}

          {/* Video Error */}
          {!isGeneratingVideo && videoError && (
            <div className="text-center max-w-md">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="font-semibold text-lg mb-2">
                {UI_TEXT.VIDEO_GENERATION_FAILED}
              </p>
              <p className="text-sm text-gray-600 mb-6">{videoError}</p>

              <button
                onClick={generateVideo}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-hoverBg transition-all"
              >
                {UI_TEXT.TRY_AGAIN}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* EMPTY STATE */}
      {/* ============================================ */}
      {!isProcessing && !errorMsg && !viewMode && !tryOnResult && (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-4">👗</div>
            <p className="text-lg font-medium">Try-on result will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryOnStage;