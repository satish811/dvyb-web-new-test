import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

const ProductImageGallery = ({ images = [], product = {} }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [imageError, setImageError] = useState(false);
  const scrollContainerRef = useRef(null);

  const handleImageError = () => setImageError(true);

  useEffect(() => {
    setSelectedImage(images[0] || "");
    setImageError(false);
  }, [product?.id, images.length]);

  // Scroll thumbnail functions
  const scrollThumbnailsUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: -132, // 121px thumbnail height + 11px margin
        behavior: 'smooth'
      });
    }
  };

  const scrollThumbnailsDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: 132, // 121px thumbnail height + 11px margin
        behavior: 'smooth'
      });
    }
  };

  // Handle thumbnail click
  const handleThumbnailClick = (img) => {
    setSelectedImage(img);
  };

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
   * Desktop Gallery - Scrollable thumbnails with navigation arrows
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
        {/* Thumbnail Column Container */}
        <div className="absolute left-0">
          
          {/* Top Scroll Arrow - Only show if there are more than 4 thumbnails */}
          {images.length > 4 && (
            <button
              onClick={scrollThumbnailsUp}
              className="absolute left-1/2 -translate-x-1/2 top-0 -mt-6 z-10 
                bg-white hover:bg-gray-50 p-1 rounded-full 
                shadow-sm border border-gray-300 
                transition-all hover:scale-110 active:scale-95"
              style={{ width: "24px", height: "24px" }}
            >
              <ChevronUp className="w-3 h-3 text-gray-600 mx-auto" />
            </button>
          )}

          {/* Thumbnail Column - Scrollable with all images */}
          <div
            ref={scrollContainerRef}
            className="
              flex flex-col overflow-y-auto
              [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-none
              [-ms-overflow-style:none] [scrollbar-width:none]
            "
            style={{
              width: "78px",
              height: "505px",
              maxHeight: "505px",
            }}
          >
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(img)}
                className={`
                  overflow-hidden mb-[11px] last:mb-0 transition-all 
                  ${selectedImage === img
                    ? 'ring-2 ring-[#573131] shadow-md'
                    : 'ring-1 ring-transparent hover:ring-gray-300 hover:shadow-sm'
                  }
                  focus:outline-none
                `}
                style={{
                  width: "78px",
                  height: "121px",
                  flexShrink: 0,
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </button>
            ))}
          </div>

          {/* Bottom Scroll Arrow - Only show if there are more than 4 thumbnails */}
          {images.length > 4 && (
            <button
              onClick={scrollThumbnailsDown}
              className="absolute left-1/2 -translate-x-1/2 bottom-0 -mb-6 z-10 
                bg-white hover:bg-gray-50 p-1 rounded-full 
                shadow-sm border border-gray-300 
                transition-all hover:scale-110 active:scale-95"
              style={{ width: "24px", height: "24px" }}
            >
              <ChevronDown className="w-3 h-3 text-gray-600 mx-auto" />
            </button>
          )}
        </div>

        {/* Main Image */}
        <div
          className="absolute overflow-hidden bg-gray-50"
          style={{
            left: "89px",
            top: "0px",
            width: "349px",
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