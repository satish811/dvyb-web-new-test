import React, { useRef, useState } from "react";
import { Image, Camera, Heart, ArrowRight, X } from "lucide-react";
import BackgroundGrid from "./BackgroundGrid";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * Right Sidebar - Scenes & Actions Panel (Desktop Only)
 * Displays background options, custom scene upload, and quick action buttons
 */
const ScenesPanel = ({
  viewMode,
  selectedBackground,
  changeBackground,
  isChangingBackground,
  tryOnResult,
  tryOnData,
  isProcessing,
  performTryOn,
  onClose,
  isInWishlistState,
  wishlistLoading,
  handleToggleWishlist,
  navigate,
}) => {
  const fileInputRef = useRef(null);
  const [customScenes, setCustomScenes] = useState([]);
  const [selectedCustomBg, setSelectedCustomBg] = useState(null);

  const handleRemoveCustomScene = (e, idToRemove) => {
    e.stopPropagation();
    setCustomScenes((prev) => prev.filter(scene => scene.id !== idToRemove));
    if (selectedCustomBg === idToRemove) {
      setSelectedCustomBg(null);
      // Optional: If you want removing the active bg to reset to default/2D view,
      // you could call changeBackground(null, null) or similar here.
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newScene = {
          id: `custom-${Date.now()}-${Math.random()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          image: event.target.result,
          isCustom: true,
        };
        setCustomScenes((prev) => [...prev, newScene]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-added
    e.target.value = "";
  };

  const handleCustomBgSelect = (scene) => {
    setSelectedCustomBg(scene.id);
    // Pass the base64 image to the changeBackground handler if possible
    if (changeBackground) {
      changeBackground(scene.id, scene.image);
    }
  };

  return (
    <div className="
      absolute top-20
      right-4 lg:right-6 xl:right-10 2xl:right-20
      z-20 hidden lg:flex flex-col gap-4
      w-[260px] lg:w-[280px] xl:w-[308px]
      max-h-[calc(100vh-90px)] overflow-y-auto hide-scrollbar
    ">
      {/* ── BACKGROUNDS CARD ─────────────────────────────────── */}
      {viewMode === "2D" && (
        <div className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[24px] overflow-y-auto hide-scrollbar p-5 max-h-[calc(100vh-100px)]">

          {/* ============================================ */}
          {/* SCENES SECTION - Only visible in 2D mode */}
          {/* ============================================ */}
          <div className="mb-5">
            <div className="flex items-center justify-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {UI_TEXT.SCENES}
              </h3>
            </div>

            {/* Background Grid Component */}
            <BackgroundGrid
              selectedBackground={selectedBackground}
              changeBackground={changeBackground}
              isChangingBackground={isChangingBackground}
              tryOnResult={tryOnResult}
            />

            {/* ============================================ */}
            {/* CUSTOM SCENE UPLOAD */}
            {/* ============================================ */}
            <div className="mt-4">
              {/* Upload Row */}
              <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2.5">
                <button
                  onClick={handleCameraClick}
                  title="Add your own scene"
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-hoverBg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 flex-1">Add your screen</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Custom Scenes Grid */}
              {customScenes.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3 mb-6">
                  {customScenes.map((scene) => (
                    <div key={scene.id} className="relative group">
                      <button
                        onClick={(e) => handleRemoveCustomScene(e, scene.id)}
                        className="absolute top-1 right-1 z-10 w-5 h-5 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove screen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleCustomBgSelect(scene)}
                        disabled={!tryOnResult || isChangingBackground}
                        className={`relative cursor-pointer p-1 overflow-hidden w-full transition-all ${selectedCustomBg === scene.id
                          ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
                          : "border border-gray-200 hover:border-gray-400"
                          } ${!tryOnResult || isChangingBackground
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                          }`}
                      >
                        <div className="aspect-square rounded-sm overflow-hidden flex items-center justify-center">
                          <img
                            src={scene.image}
                            alt={scene.name}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                      </button>
                      <p className="text-[10px] font-medium text-center pt-1 text-gray-500 truncate px-1">
                        {scene.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS CARD ─────────────────────────────────── */}
      <div className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[24px] overflow-hidden p-5 flex flex-col gap-3">
        <button
          onClick={() => {
            if (onClose) onClose();
          }}
          className="w-full bg-[#74136C] hover:bg-[#5a0f54] text-white py-3 rounded-full text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all uppercase"
        >
          VIEW PRODUCT <ArrowRight className="w-4 h-4 ml-1" />
        </button>
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className={`w-full py-3 flex items-center justify-center gap-2 text-[13px] font-semibold transition-colors border border-[#74136C] rounded-full ${isInWishlistState ? "text-red-500 border-red-500" : "text-[#74136C] hover:bg-[#74136C] hover:text-white"
            } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {wishlistLoading ? (
            <span className="animate-spin h-5 w-5 border-2 border-[#74136C] border-t-transparent rounded-full" />
          ) : (
            <Heart className={`w-[18px] h-[18px] ${isInWishlistState ? "fill-current" : ""}`} />
          )}
          <span>{isInWishlistState ? "Added to Wishlist" : "Add to Wishlist"}</span>
        </button>
      </div>
    </div>
  );
};

export default ScenesPanel;