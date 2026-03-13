
// ============================================
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import TryonBackground from "../../../assets/b2c/landing/Landing-villy/TryonBackground.png";

// ============================================
// CUSTOM HOOKS (Business Logic)
// ============================================
import { useTryOnLogic } from "../../../hooks/useTryOnLogic";
import { useBackgroundChange } from "../../../hooks/useBackgroundChange";
import { useBlouseNeckChange } from "../../../hooks/useBlouseNeckChange";
import { useVideoGeneration } from "../../../hooks/useVideoGeneration";
// import { useWishlistCart } from "../../../hooks/useWishlistCart";
import { useLoadingAnimation } from "../../../hooks/useLoadingAnimation";

// ============================================
// LAYOUT COMPONENTS
// ============================================
import TryOnHeader from "../TryOncomponents/TryonLayout/TryOnHeader";
import TryOnStage from "../TryOncomponents/TryonLayout/TryOnStage";
import TryOnMobileSheet from "../TryOncomponents/TryonLayout/TryOnMobileSheet";

// ============================================
// CUSTOMIZATION COMPONENTS
// ============================================
import CustomizationPanel from "../TryOncomponents/TryOncustomization/CustomizationPanel";

// ============================================
// SCENES & ACTIONS COMPONENTS
// ============================================
import ScenesPanel from "../TryOncomponents/TryonScenes/ScenesPanel";
import { saveTryOnResult } from "../../../services/tryOnService";


// WISHLIST
import { useWishlist } from "../../../context/WishlistContext";
import { useAuth } from "../../../context/AuthContext";

// ============================================
// UTILS & CONSTANTS
// ============================================
import { parseColors, parseFabrics } from "../../../utils/tryOnHelpers";
import { UI_TEXT } from "../../../utils/tryOnConstants";

/**
 * Main Try-On Preview Modal Component
 * ✅ Separated into clean sections with custom hooks
 */
const TryOnPreviewModal = ({ isOpen, onClose, tryOnData, product }) => {
  const navigate = useNavigate();

  // ============================================
  // STATE MANAGEMENT (UI State Only)
  // ============================================
  const [selectedTab, setSelectedTab] = useState("colours");

  const [selectedColor, setSelectedColor] = useState(
    () => parseColors(tryOnData?.selectedColors)[0]?.name ?? ""
  );
  const [selectedFabric, setSelectedFabric] = useState("pure-silk");
  const [viewMode, setViewMode] = useState("2D");
  const [showBgWarning, setShowBgWarning] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLookSaved, setIsLookSaved] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  // ============================================
  // CUSTOM HOOKS (All Business Logic)
  // ============================================

  // Core try-on logic
  const {
    tryOnResult,
    isProcessing,
    errorMsg,
    performTryOn,
  } = useTryOnLogic(tryOnData, isOpen);

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

  // Combined blouse + neck customization logic (saree only)
  const {
    pendingBlouse,
    setPendingBlouse,
    pendingNeck,
    setPendingNeck,
    isApplying,
    applyChanges,
    combinedImage,
  } = useBlouseNeckChange(activeBaseImage);

  // Sync combined blouse+neck result → currentImage AND update base for background changes
  useEffect(() => {
    if (combinedImage) {
      setCurrentImage(combinedImage);
      // Update the base image for background changes so it uses the edited image
      setLatestBaseImage(combinedImage);
    }
  }, [combinedImage, setLatestBaseImage]);

  // 3D video generation logic - uses latest edited image (includes blouse/neck/background)
  const {
    videoUrl,
    isGeneratingVideo,
    videoProgress,
    videoError,
    generateVideo,
  } = useVideoGeneration(currentImage || tryOnResult);


  // WISHLIST 
  useEffect(() => {
    if (!isOpen || !product?.id) return;
    setIsInWishlistState(isInWishlist(product.id));
  }, [isOpen, product?.id]);



  // Sync tryOnResult → currentImage when a new try-on is generated
  useEffect(() => {
    if (tryOnResult) {
      setCurrentImage(tryOnResult);
    }
  }, [tryOnResult]);

  // Sync backgroundChangedImage → currentImage so downstream edits (blouse/neck)
  // operate on and display the background-changed image
  useEffect(() => {
    if (backgroundChangedImage) {
      setCurrentImage(backgroundChangedImage);
    }
  }, [backgroundChangedImage]);

  // Reset save-state when user gets a new/updated try-on image
  useEffect(() => {
    if (currentImage || tryOnResult) {
      setIsLookSaved(false);
    }
  }, [currentImage, tryOnResult]);



  // Wishlist & Cart logic
  // const {
  //   isInWishlistState,
  //   isLoading: wishlistLoading,
  //   cartIds,
  //   handleToggleWishlist,
  //   handleAddToCart,
  //   saveToGallery,
  // } = useWishlistCart(tryOnData, tryOnResult, videoUrl);

  // Loading animation for processing state
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

  // currentImage is always the latest (try-on → background → blouse/neck edits)
  const getCurrentDisplayImage = () => {
    return currentImage || tryOnResult;
  };


  // ============================================
  // VIEW MODE HANDLERS
  // ============================================
  const handleViewModeSwitch = (mode) => {
    if (mode === "3D") {
      if (!backgroundChangedImage) {
        setShowBgWarning(true);
        return;
      }
      if (!videoUrl && !isGeneratingVideo) {
        generateVideo();
      }
    }
    setViewMode(mode);
  };

  const handleReset = () => {
    resetBackground();
    setCurrentImage(null);
    setIsLookSaved(false);
    setViewMode("2D");
    performTryOn({ force: true });
  };

  const handleClose = () => {
    onClose();
    window.location.reload();
  };



  // Save my look handler
  const handleSaveLook = async () => {
    if (!user?.uid) {
      toast.error("Please log in to save your look.");
      return;
    }

    const imageToSave = getCurrentDisplayImage();
    if (!imageToSave) {
      toast.error("No try-on image to save yet!");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/save-look", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageToSave,
          productName: tryOnData?.garmentName || tryOnData?.productName || "",
        }),
      });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { success: false, error: `HTTP ${response.status}` };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Persist saved look metadata in Firestore under user_tryons
      await saveTryOnResult({
        productId: tryOnData?.productId || product?.id || "unknown",
        productName: tryOnData?.productName || tryOnData?.garmentName || product?.title || product?.name || "Product",
        garmentName: tryOnData?.garmentName || product?.title || product?.name || "",
        tryOnImage: data.url, // Cloudinary URL returned by /api/save-look
        modelImage: tryOnData?.modelImage || "",
        garmentImage: tryOnData?.garmentImage || "",
        selectedColors: tryOnData?.selectedColors || [],
        selectedSizes: tryOnData?.selectedSizes || [],
        fabric: tryOnData?.fabric || "",
        price: parseFloat(tryOnData?.price || product?.price || 0) || 0,
        discount: tryOnData?.discount || product?.discount || 0,
        videoUrl: videoUrl || null,
        is3D: viewMode === "3D",
      });

      setIsLookSaved(true);
      toast.success("Look saved to your gallery!");
    } catch (err) {
      console.error("Save look failed:", err);
      toast.error("Failed to save look. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  //  wishlist handler
  const handleToggleWishlist = async () => {
    if (!product?.id) return;

    setWishlistLoading(true);

    // optimistic UI
    setIsInWishlistState((prev) => !prev);

    try {
      await toggleWishlist(
        product, // ✅ REAL PRODUCT OBJECT
        tryOnData?.selectedSize || "One Size",
        tryOnData?.selectedColors?.[0] || "Default"
      );
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      // rollback UI
      setIsInWishlistState((prev) => !prev);
    } finally {
      setWishlistLoading(false);
    }
  };



  // ============================================
  // RENDER - Don't render if not open
  // ============================================
  if (!isOpen) return null;

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div
      className="fixed inset-0 overflow-y-auto z-50 hide-scrollbar"
      style={{
        backgroundImage: `url(${TryonBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <TryOnHeader />

      {/* ============================================ */}
      {/* CENTER STAGE - Main Preview Area */}
      {/* ============================================ */}
      <TryOnStage
        isProcessing={isProcessing}
        errorMsg={errorMsg}
        viewMode={viewMode}
        tryOnResult={tryOnResult}
        getCurrentDisplayImage={getCurrentDisplayImage}
        currentLoadingImage={currentLoadingImage}
        isChangingBackground={isChangingBackground}
        videoUrl={videoUrl}
        isGeneratingVideo={isGeneratingVideo}
        videoProgress={videoProgress}
        videoError={videoError}
        performTryOn={performTryOn}
        generateVideo={generateVideo}
      />

      {/* ============================================ */}
      {/* LEFT SIDEBAR - Customization (Desktop) */}
      {/* ============================================ */}
      <CustomizationPanel
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedFabric={selectedFabric}
        setSelectedFabric={setSelectedFabric}
        colors={colors}
        fabricTypes={fabricTypes}
        viewMode={viewMode}
        handleViewModeSwitch={handleViewModeSwitch}
        outfitType={tryOnData?.outfitType}
        tryOnResult={tryOnResult}
        pendingBlouse={pendingBlouse}
        setPendingBlouse={setPendingBlouse}
        pendingNeck={pendingNeck}
        setPendingNeck={setPendingNeck}
        isApplying={isApplying}
        applyChanges={applyChanges}
        handleReset={handleReset}
      />

      {/* ============================================ */}
      {/* RIGHT SIDEBAR - Scenes & Actions (Desktop) */}
      {/* ============================================ */}
      <ScenesPanel
        viewMode={viewMode}
        selectedBackground={selectedBackground}
        changeBackground={changeBackground}
        isChangingBackground={isChangingBackground}
        tryOnResult={tryOnResult}
        tryOnData={tryOnData}
        isProcessing={isProcessing}
        performTryOn={performTryOn}
        isInWishlistState={isInWishlistState}
        onClose={handleClose}
        wishlistLoading={wishlistLoading}
        handleToggleWishlist={handleToggleWishlist}
        navigate={navigate}
        handleSaveLook={handleSaveLook}
        isSaving={isSaving}
        isLookSaved={isLookSaved}
      />

      {/* ============================================ */}
      {/* MOBILE BOTTOM SHEET */}
      {/* ============================================ */}
      <TryOnMobileSheet
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        viewMode={viewMode}
        handleViewModeSwitch={handleViewModeSwitch}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        colors={colors}
        selectedFabric={selectedFabric}
        setSelectedFabric={setSelectedFabric}
        fabricTypes={fabricTypes}
        selectedBackground={selectedBackground}
        changeBackground={changeBackground}
        isChangingBackground={isChangingBackground}
        tryOnResult={tryOnResult}
        tryOnData={tryOnData}
        pendingBlouse={pendingBlouse}
        setPendingBlouse={setPendingBlouse}
        pendingNeck={pendingNeck}
        setPendingNeck={setPendingNeck}
        isApplying={isApplying}
        applyChanges={applyChanges}
        performTryOn={performTryOn}
        isProcessing={isProcessing}
        // handleToggleWishlist={handleToggleWishlist}
        // wishlistLoading={wishlistLoading}
        // isInWishlistState={isInWishlistState}
        navigate={navigate}
        handleSaveLook={handleSaveLook}
        isSaving={isSaving}
        isLookSaved={isLookSaved}
      />

      {/* ============================================ */}
      {/* WARNING MODAL - Background Required */}
      {/* ============================================ */}
      {showBgWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">
              {UI_TEXT.BACKGROUND_REQUIRED_TITLE}
            </h3>
            <p className="text-gray-600 mb-4">
              {UI_TEXT.BACKGROUND_REQUIRED_MSG}
            </p>
            <button
              onClick={() => setShowBgWarning(false)}
              className="w-full bg-primary text-white py-2 rounded-lg"
            >
              Got itt
            </button>
          </div>
        </div>
      )}
      {/* ============================================ */}
      {/* BOTTOM ACTION BAR (Floating) */}
      {/* ============================================ */}
      {/* <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 hidden lg:flex">
        <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-3 flex items-center gap-6">
          <button
            onClick={() => {
              onClose();
            }}
            className="bg-[#74136C] hover:bg-[#5a0f54] text-white px-8 py-3 rounded-full text-[13px] font-bold tracking-wide flex items-center gap-2 transition-all uppercase"
          >
            VIEW PRODUCT <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`flex items-center gap-2 text-[13px] font-semibold pr-4 transition-colors ${isInWishlistState ? "text-red-500" : "text-gray-700 hover:text-gray-900"
              } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {wishlistLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full" />
            ) : (
              <Heart className={`w-[18px] h-[18px] ${isInWishlistState ? "fill-current" : ""}`} />
            )}
            <span>{isInWishlistState ? "Added to Wishlist" : "Add to Wishlist"}</span>
          </button>
        </div>
      </div> */}



    </div>
  );
};

export default TryOnPreviewModal;