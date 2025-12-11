import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductImageGallery = ({ images = [], product = {} }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);

  useEffect(() => {
    setSelectedImage(images[0] || "");
    setImageError(false);
  }, [product?.id, images.length]);

  // Mobile Slider
  const MobileImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    const handleNext = () => setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));

    if (!images.length) return null;

    return (
      <div className="relative w-full">
        <div className="relative overflow-hidden bg-gray-50">
          <img
            src={images[currentIndex]}
            alt={`Product ${currentIndex + 1}`}
            className="w-full h-auto max-h-[88vh] object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-[#573131] w-8" : "bg-[#573131]/30"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Desktop Gallery - All thumbnails now same large size
   */
  const DesktopGallery = () => (
    <div className="hidden md:block">
      <div
        className="
        relative origin-top-left
        md:scale-100
        lg:scale-110
        xl:scale-125
        2xl:scale-140
        3xl:scale-155
      "
        style={{ width: "438px", height: "505px" }}
      >
        {/* Thumbnail Column - Uniform size, perfectly aligned */}
        <div className="flex flex-col absolute left-0" style={{ width: "78px" }}>
          {images.slice(0, 3).map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(img)}
              className="overflow-hidden mb-[11px] last:mb-0"
              style={{
                width: "78px",
                height: "121px",
              }}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                onError={handleImageError}
              />
            </button>
          ))}
        </div>

        {/* Main Image - Perfectly aligned with new thumbnail width */}
        <div
          className="absolute overflow-hidden bg-gray-50"
          style={{
            left: "89px",   // 78px thumb + 11px gap
            top: "0px",
            width: "349px", // 301 + 48 (to compensate reduced thumb width)
            height: "505px",
          }}
        >
          {imageError ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg font-medium">
              Image not available
            </div>
          ) : selectedImage ? (
            <img
              key={selectedImage}
              src={selectedImage}
              alt="Selected product"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              Select an image
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="block md:hidden">
        <MobileImageSlider />
      </div>

      {/* Desktop - scales beautifully up to 3xl+ */}
      <DesktopGallery />
    </>
  );
};

export default ProductImageGallery;
