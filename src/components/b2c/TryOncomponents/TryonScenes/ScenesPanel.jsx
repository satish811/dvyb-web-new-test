
import React, { useRef, useState } from "react";
import { Image, Camera } from "lucide-react";
import BackgroundGrid from "./BackgroundGrid";
import QuickActions from "./QuickActions";
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
  right-6 xl:right-24 2xl:right-52
  z-20 hidden lg:block
  w-[320px]
  scrollbar-none bg-white shadow-lg p-5
  max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar
">

      {/* ============================================ */}
      {/* SCENES SECTION - Only visible in 2D mode */}
      {/* ============================================ */}
      {viewMode === "2D" && (
        <div className="mb-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Image className="w-5 h-5 text-gray-600" />
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
              <span className="text-xs text-gray-500 flex-1">Add your scenes</span>
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
              <div className="grid grid-cols-2 gap-2 mt-3">
                {customScenes.map((scene) => (
                  <div key={scene.id}>
                    <button
                      onClick={() => handleCustomBgSelect(scene)}
                      disabled={!tryOnResult || isChangingBackground}
                      className={`relative cursor-pointer p-1 overflow-hidden transition-all w-full ${
                        selectedCustomBg === scene.id
                          ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
                          : "hover:scale-105 border border-gray-200"
                      } ${
                        !tryOnResult || isChangingBackground
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <div className="aspect-square">
                        <img
                          src={scene.image}
                          alt={scene.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                    </button>
                    <p className="text-xs font-medium text-center pt-1 text-gray-600 truncate">
                      {scene.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* QUICK ACTIONS SECTION */}
      {/* ============================================ */}
      <QuickActions
        tryOnData={tryOnData}
        navigate={navigate}
        onClose={onClose}
        isProcessing={isProcessing}
        performTryOn={performTryOn}
        isInWishlistState={isInWishlistState}
        wishlistLoading={wishlistLoading}
        handleToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
};

export default ScenesPanel;