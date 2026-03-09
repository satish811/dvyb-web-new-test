import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Heart, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

// ============================================
// ASSETS
import customize_ic from "../../../assets/TryOn/customize_ic.svg";
import t360 from "../../../assets/TryOn/t360_ic.svg";
import gallery_ic from "../../../assets/TryOn/gallery_ic.svg";

// ============================================
// REUSABLE COMPONENTS FROM WEB VIEW
// ============================================
import BackgroundGrid from "../TryOncomponents/TryonScenes/BackgroundGrid";
import BlouseCustomizer from "../TryOncomponents/TryOncustomization/BlouseCustomizer";
import NeckCustomizer from "../TryOncomponents/TryOncustomization/NeckCustomizer";

// ============================================
// CUSTOM HOOKS (Business Logic from Desktop)
// ============================================
import { useTryOnLogic } from "../../../hooks/useTryOnLogic";
import { useBackgroundChange } from "../../../hooks/useBackgroundChange";
import { useBlouseChange } from "../../../hooks/useBlouseChange";
import { useNeckChange } from "../../../hooks/useNeckChange";
import { useVideoGeneration } from "../../../hooks/useVideoGeneration";
import { useLoadingAnimation } from "../../../hooks/useLoadingAnimation";

// ============================================
// CONTEXTS & SERVICES
// ============================================
import { useAuth } from "../../../context/AuthContext";
import { useWishlist } from "../../../context/WishlistContext";
import LazyImageLoader from "../LazyImageLoader/LazyImageLoader";

// ============================================
// UTILS
// ============================================
import { parseColors, parseFabrics } from "../../../utils/tryOnHelpers";

const TryOnPreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tryOnData = location.state;
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // ============================================
  // UI STATE
  // ============================================
  const [selectedTab, setSelectedTab] = useState("colours");
  const [selectedColor, setSelectedColor] = useState(
    () => parseColors(tryOnData?.selectedColors)[0]?.name ?? ""
  );
  const [selectedFabric, setSelectedFabric] = useState("pure-silk");
  const [view360Enabled, setView360Enabled] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [activeSection, setActiveSection] = useState("scenes");

  // ============================================
  // CUSTOM HOOKS (All Business Logic)
  // ============================================

  // Core try-on logic
  const {
    tryOnResult,
    isProcessing,
    errorMsg,
    performTryOn,
  } = useTryOnLogic(tryOnData, true);

  // Background change logic
  const {
    backgroundChangedImage,
    isChangingBackground,
    selectedBackground,
    changeBackground,
    handleReset: resetBackground,
    setLatestBaseImage,
  } = useBackgroundChange(tryOnResult);

  // Use background-changed image as base if available, so blouse/neck edits apply on top of it
  const activeBaseImage = backgroundChangedImage || tryOnResult;

  // Blouse customization logic
  const {
    selectedBlouse,
    isChangingBlouse,
    changeBlouse,
  } = useBlouseChange(activeBaseImage);

  // Neck customization logic
  const {
    selectedNeck,
    isChangingNeck,
    changeNeck,
  } = useNeckChange(activeBaseImage);

  // 3D video generation logic - uses latest edited image (includes blouse/neck/background)
  const {
    videoUrl,
    isGeneratingVideo,
    videoProgress,
    videoError,
    generateVideo,
  } = useVideoGeneration(currentImage || backgroundChangedImage || tryOnResult);

  // Loading animation
  const { currentLoadingImage } = useLoadingAnimation(isProcessing);

  // ============================================
  // COMPUTED VALUES (Memoized)
  // ============================================
  const colors = useMemo(
    () => parseColors(tryOnData?.selectedColors),
    [tryOnData?.selectedColors]
  );

  const fabricTypes = useMemo(
    () => parseFabrics(tryOnData?.fabric),
    [tryOnData?.fabric]
  );

  // ============================================
  // CURRENT IMAGE TRACKING
  // ============================================
  useEffect(() => {
    if (tryOnResult) {
      setCurrentImage(tryOnResult);
    }
  }, [tryOnResult]);

  // ============================================
  // WISHLIST STATUS CHECK
  // ============================================
  useEffect(() => {
    if (tryOnData?.productId) {
      setIsInWishlistState(isInWishlist(tryOnData.productId));
    }
  }, [tryOnData?.productId]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================


  useEffect(() => {
    if (backgroundChangedImage) {
      setCurrentImage(backgroundChangedImage);
    }
  }, [backgroundChangedImage]);



  const getCurrentDisplayImage = () => {
    return currentImage || backgroundChangedImage || tryOnResult;
  };

  const handleReset = () => {
    resetBackground();
    setCurrentImage(tryOnResult);
    setView360Enabled(false);
    // Reset base image to original try-on result
    setLatestBaseImage(tryOnResult);
  };

  const handleBack = () => {
    navigate(`/products/${tryOnData?.productId}`);
  };

  const handleViewProduct = () => {
    navigate(`/products/${tryOnData?.productId}`);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error("Please log in to add to wishlist!");
      return;
    }

    if (!tryOnData?.productId) return;

    setWishlistLoading(true);
    setIsInWishlistState((prev) => !prev); // Optimistic UI

    try {
      await toggleWishlist(
        {
          id: tryOnData.productId,
          name: tryOnData.garmentName,
          price: tryOnData.price,
          image: tryOnData.garmentImage,
        },
        tryOnData?.selectedSize || "One Size",
        tryOnData?.selectedColors?.[0] || "Default"
      );
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      setIsInWishlistState((prev) => !prev); // Rollback
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handle360Toggle = () => {
    if (!view360Enabled) {
      if (!backgroundChangedImage) {
        toast.error("Please select a background first for 360° view");
        return;
      }
      if (!videoUrl && !isGeneratingVideo) {
        generateVideo();
      }
    }
    setView360Enabled(!view360Enabled);
  };

  // Handle blouse change with image update
  const handleBlouseChange = async (type) => {
    const newImg = await changeBlouse(type);
    if (newImg) {
      setCurrentImage(newImg);
      // Update base image for background changes
      setLatestBaseImage(newImg);
    }
  };

  // Handle neck change with image update
  const handleNeckChange = async (type) => {
    const newImg = await changeNeck(type);
    if (newImg) {
      setCurrentImage(newImg);
      // Update base image for background changes
      setLatestBaseImage(newImg);
    }
  };

  // ============================================
  // RENDER GUARDS
  // ============================================
  if (!tryOnData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-4 py-2 text-sm font-medium hover:bg-[#8B0000] hover:text-white transition-all"
        >
          <ArrowLeft size={16} />
          Back to Products
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Try-On Result Image */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 min-h-[60vh] flex items-center justify-center">
          {isProcessing || isChangingBackground ? (
            <div>
              <LazyImageLoader isProcessing={isProcessing || isChangingBackground} />
              <p className="text-xl text-center text-primary font-Outfit mt-4">
                {isChangingBackground ? "Changing scene..." : "Creating your Vibe"}
              </p>
            </div>
          ) : errorMsg ? (
            <div className="text-center p-6">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="font-semibold text-lg mb-2">{errorMsg}</p>
              <button
                onClick={performTryOn}
                className="mt-4 px-6 py-3 bg-[#8B0000] text-white"
              >
                Try Again
              </button>
            </div>
          ) : view360Enabled && videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="max-w-full max-h-[75vh] object-cover"
            />
          ) : (
            <>
              <img
                src={getCurrentDisplayImage()}
                alt="Try-on result"
                className="max-w-full max-h-[75vh] object-cover"
              />

              <button
                onClick={handleReset}
                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-medium"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </>
          )}
        </div>

        {/* Bottom Sheet Content */}
        <div className="bg-white">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300"></div>
          </div>

          {/* Customize Outfit */}
          <div className="px-4 py-4">
            <div className="flex gap-2.5">
              <img src={customize_ic} className="-mt-2" alt="" />
              <h3 className="text-md font-semibold text-gray-900 mb-3">Outfit Details</h3>
            </div>
            <p className="text-sm font-family-outfit text-gray-600">
              Try different colors, fabrics and Style. 
            </p>
            <div className="flex gap-2  w-1/2 mb-4 mt-5 bg-[#F0E0E0] p-1">
              <button
                onClick={() => setSelectedTab("colours")}
                className={`flex-1  py-2 text-sm font-medium transition-all ${selectedTab === "colours" ? "bg-white text-[#8B0000] shadow-sm" : "text-[#8B0000]"
                  }`}
              >
                Colours
              </button>
              {/* <button
                onClick={() => setSelectedTab("fabrics")}
                className={`flex-1 py-2 text-sm font-medium transition-all ${
                  selectedTab === "fabrics" ? "bg-white text-[#8B0000] shadow-sm" : "text-[#8B0000]"
                }`}
              >
                Fabrics
              </button> */}
            </div>

            {selectedTab === "colours" && (
              <div>
                {colors.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-2">No colour variants available for this product.</p>
                ) : (
                  <>
                    {selectedColor && (
                      <p className="text-sm text-gray-600 mb-3">
                        Colour: <span className="uppercase font-semibold">{selectedColor}</span>
                      </p>
                    )}
                    <div className="grid grid-cols-4 gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`aspect-square transition-all h-12 mt-1.5 rounded ${selectedColor === color.name
                              ? "ring-2 ring-gray-900 ring-offset-2"
                              : "ring-1 ring-gray-200"
                            }`}
                          style={{ backgroundColor: color.color }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedTab === "fabrics" && (
              <div className="space-y-2">
                {fabricTypes.map((fabric) => (
                  <button
                    key={fabric.name}
                    onClick={() => setSelectedFabric(fabric.name)}
                    className={`w-full p-3 text-left bg-gray-50 hover:bg-gray-100 border ${selectedFabric === fabric.name ? "border-[#8B0000]" : "border-gray-200"
                      }`}
                  >
                    <div className="text-sm font-medium">{fabric.name}</div>
                    <div className="text-xs text-gray-500">{fabric.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View in 360 Toggle */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <img src={t360} alt="" />
                <span className="text-sm  font-family-outfit font-medium text-black">
                  View Your Virtual Video
                </span>
              </div>
              <button
                onClick={handle360Toggle}
                disabled={isGeneratingVideo}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${view360Enabled ? "bg-[#8B0000]" : "bg-gray-300"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${view360Enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
            {isGeneratingVideo && (
              <p className="text-xs text-gray-500 mt-2">
                Generating 360° view... {videoProgress}%
              </p>
            )}
          </div>

          <div className="mt-3 h-2 bg-[#E1E1E1]"></div>

          {/* Scenes & Customizers with Toggles */}
          <div className="px-4 py-4">
            {/* <div className="flex gap-2 mb-3">
              <img src={gallery_ic} alt="" />
              <h3 className="text-md font-semibold">Customize & Scenes</h3>
            </div> */}

            {/* Toggle Buttons */}
            <div className="flex mb-4">
              <button
                onClick={() => setActiveSection("scenes")}
                className={`flex-1 py-2 px-3 text-sm font-medium border transition-all ${activeSection === "scenes"
                  ? "bg-[#8B0000] text-white border-[#8B0000]"
                  : "bg-white text-black border-gray-300"
                  }`}
              >
                Scenes
              </button>

              <button
                onClick={() => setActiveSection("blouse")}
                className={`flex-1 py-2 px-3 text-sm font-medium border transition-all ${activeSection === "blouse"
                  ? "bg-[#8B0000] text-white border-[#8B0000]"
                  : "bg-white text-gray-700 border-gray-300"
                  }`}
              >
                Blouse
              </button>

              <button
                onClick={() => setActiveSection("neck")}
                className={`flex-1 py-2 px-3 text-sm font-medium border transition-all ${activeSection === "neck"
                  ? "bg-[#8B0000] text-white border-[#8B0000]"
                  : "bg-white text-gray-700 border-gray-300"
                  }`}
              >
                Neck
              </button>
            </div>


            {/* Conditional Rendering */}
            {/* ===== DYNAMIC PANEL (ONE AT A TIME) ===== */}
            {activeSection === "scenes" && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Backgrounds</p>
                <BackgroundGrid
                  selectedBackground={selectedBackground}
                  changeBackground={changeBackground}
                  isChangingBackground={isChangingBackground}
                  tryOnResult={tryOnResult}
                />
              </div>
            )}

            {activeSection === "blouse" && (
              <BlouseCustomizer
                selectedBlouse={selectedBlouse}
                isChangingBlouse={isChangingBlouse}
                changeBlouse={handleBlouseChange}
                tryOnResult={tryOnResult}
              />
            )}

            {activeSection === "neck" && (
              <NeckCustomizer
                selectedNeck={selectedNeck}
                isChangingNeck={isChangingNeck}
                changeNeck={handleNeckChange}
                tryOnResult={tryOnResult}
              />
            )}

          </div>

          <div className="mt-3 h-2 bg-[#E1E1E1]"></div>

          {/* Quick Actions */}
          <div className="px-4 py-4 space-y-3 pb-6">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>

            <button
              onClick={() => performTryOn({ force: true })}
              disabled={isProcessing}
              className={`w-full border-2 border-[#8B0000] text-[#8B0000] py-3 font-medium flex items-center justify-center gap-2 transition-all ${isProcessing ? "opacity-60 cursor-not-allowed" : "hover:bg-[#8B0000] hover:text-white"
                }`}
            >
              Retry Try-On
            </button>

            <button
              onClick={handleViewProduct}
              className="w-full bg-[#8B0000] text-white py-3 font-medium hover:bg-[#A30000] flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} className="rotate-180" />
              VIEW PRODUCT
            </button>

            <button
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
              className={`py-3 w-full font-medium flex items-center justify-center gap-2 transition-all ${isInWishlistState
                ? " border border-red-500 text-red-500"
                : "border-2 border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white"
                }`}
            >
              <Heart size={19} className={isInWishlistState ? "fill-current" : ""} />
              {wishlistLoading ? "Processing..." : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryOnPreviewPage;