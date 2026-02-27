import React, { useRef, useState } from "react";
import { Image, Plus } from "lucide-react";
import BackgroundGrid from "./BackgroundGrid";
import { UI_TEXT } from "../../../../utils/tryOnConstants";

/**
 * Right Sidebar - Scenes Panel (Desktop Only)
 * Displays background options and custom scene upload
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

  const handlePlusClick = () => {
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
    if (changeBackground) {
      changeBackground(scene.id, scene.image);
    }
  };

  return (
    <div className="
      absolute top-[90px]
      right-6 xl:right-24 2xl:right-52
      z-20 hidden lg:block
      w-[320px]
      bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] p-5
      max-h-[calc(100vh-100px)] overflow-y-auto hide-scrollbar
    ">

      {/* ============================================ */}
      {/* SCENES SECTION - Only visible in 2D mode */}
      {/* ============================================ */}
      {viewMode === "2D" && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-4 text-gray-900">
            <Image className="w-5 h-5" strokeWidth={2} />
            <h3 className="text-[15px] font-bold">
              Backgrounds
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
            {/* Upload Pill */}
            <button
              onClick={handlePlusClick}
              title="Add your backgrounds"
              className="w-full flex items-center justify-center gap-2 bg-[#f9edfe] text-[#4b1464] font-medium py-3 rounded-full hover:bg-purple-100 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span className="text-[13px]">Add your backgrounds</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Custom Scenes Grid */}
            {customScenes.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {customScenes.map((scene) => (
                  <div key={scene.id}>
                    <button
                      onClick={() => handleCustomBgSelect(scene)}
                      disabled={!tryOnResult || isChangingBackground}
                      className={`relative cursor-pointer p-1 overflow-hidden transition-all w-full ${selectedCustomBg === scene.id
                          ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
                          : "hover:scale-105 border border-gray-200"
                        } ${!tryOnResult || isChangingBackground
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
    </div>
  );
};

export default ScenesPanel;