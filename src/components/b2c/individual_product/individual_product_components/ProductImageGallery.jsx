import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from "lucide-react";
import ReactDOM from "react-dom";

const ProductImageGallery = ({ images = [], product = {} }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [imageError, setImageError] = useState(false);
  const [isLensActive, setIsLensActive] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 });
  const scrollContainerRef = useRef(null);
  const mainImageRef = useRef(null);
  const lastScrollTop = useRef(0); // Store last scroll position

  const normalizedDressType = (product?.dressType || "").toLowerCase();
  const normalizedCategory = (product?.category || "").toLowerCase();
  const normalizedSubcategory = (product?.subcategory || "").toLowerCase();
  const isSareeProduct =
    normalizedDressType.includes("saree") ||
    normalizedCategory.includes("saree") ||
    normalizedSubcategory.includes("saree");

  const selectedIndex = images.findIndex((img) => img === selectedImage);
  const isLastTwoSareeImage =
    isSareeProduct &&
    images.length >= 2 &&
    selectedIndex >= images.length - 2;

  const handleImageError = () => setImageError(true);

  useEffect(() => {
    setSelectedImage(images[0] || "");
    setImageError(false);
    setIsLensActive(false);
  }, [product?.id, images.length]);

  const handleMainImageMouseMove = (e) => {
    if (!mainImageRef.current) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.min(100, Math.max(0, x));
    const clampedY = Math.min(100, Math.max(0, y));
    setLensPosition({ x: clampedX, y: clampedY });
  };

  // Save scroll position before interaction
  const saveScrollPosition = () => {
    if (scrollContainerRef.current) {
      lastScrollTop.current = scrollContainerRef.current.scrollTop;
    }
  };

  // Handle thumbnail click with scroll preservation
  const handleThumbnailClick = (img, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Save current scroll position
    saveScrollPosition();

    // Update selected image
    setSelectedImage(img);

    // Restore scroll position after a tiny delay
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = lastScrollTop.current;
      }
    }, 10);
  };

  // Scroll thumbnail functions
  const scrollThumbnailsUp = () => {
    if (scrollContainerRef.current) {
      lastScrollTop.current = scrollContainerRef.current.scrollTop - 106;
      scrollContainerRef.current.scrollBy({
        top: -106,
        behavior: 'smooth'
      });
    }
  };

  const scrollThumbnailsDown = () => {
    if (scrollContainerRef.current) {
      lastScrollTop.current = scrollContainerRef.current.scrollTop + 106;
      scrollContainerRef.current.scrollBy({
        top: 106,
        behavior: 'smooth'
      });
    }
  };

  // Mobile Slider
  const MobileImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const handlePrev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    const handleNext = () => setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));

    useEffect(() => {
      if (!isLightboxOpen) return;

      const previousBodyOverflow = document.body.style.overflow;
      const previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      };
    }, [isLightboxOpen]);

    if (!images.length) return null;

    return (
      <div className="relative w-full">
        <div className="relative overflow-hidden bg-gray-50">
          <img
            src={images[currentIndex]}
            alt={`Product ${currentIndex + 1}`}
            className="w-full h-auto max-h-[88vh] object-contain cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
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

        {isLightboxOpen && ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-9999 bg-white/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2"
              aria-label="Close image preview"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={images[currentIndex]}
              alt={`Product preview ${currentIndex + 1}`}
              className="max-w-[94vw] max-h-[88vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>,
          document.body
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
              onMouseDown={(e) => e.preventDefault()} // Prevent focus
              className="
                absolute top-0 -mt-1 z-10
                flex items-center justify-center
                bg-white hover:bg-gray-50
                shadow-sm border border-gray-300
                transition-all hover:scale-105 active:scale-95
                focus:outline-none
              "
              style={{
                width: "78px",
                height: "8px",
                left: 0
              }}
            >
              <ChevronUp className="w-4 h-4 text-gray-700" />
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
            onMouseDown={saveScrollPosition} // Save position on any interaction
            onTouchStart={saveScrollPosition}
          >
            {images.map((img, index) => (
              <button
                key={index}
                onClick={(e) => handleThumbnailClick(img, e)}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent focus loss
                  saveScrollPosition();
                }}
                className={`
                  overflow-hidden mb-1.5 last:mb-0 transition-all
                  ${selectedImage === img
                    ? 'ring-2 ring-[#573131] shadow-md'
                    : 'ring-1 ring-transparent hover:ring-gray-300 hover:shadow-sm'
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#573131]
                `}
                style={{
                  width: "78px",
                  height: "115px",
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
              onMouseDown={(e) => e.preventDefault()} // Prevent focus
              className="
                absolute bottom-0 -mb-1 z-10
                flex items-center justify-center
                bg-white hover:bg-gray-50
                shadow-sm border border-gray-300
                transition-all hover:scale-105 active:scale-95
                focus:outline-none
              "
              style={{
                width: "78px",
                height: "8px",
                left: 0
              }}
            >
              <ChevronDown className="w-4 h-4 text-gray-700" />
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
          ref={mainImageRef}
          onMouseMove={handleMainImageMouseMove}
          onMouseEnter={() => {
            if (selectedImage && !imageError && !isLastTwoSareeImage) setIsLensActive(true);
          }}
          onMouseLeave={() => setIsLensActive(false)}
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
              className={`w-full h-full ${isLastTwoSareeImage ? "object-contain" : "object-cover"}`}
              onError={handleImageError}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              Select an image
            </div>
          )}

          {isLensActive && selectedImage && !imageError && !isLastTwoSareeImage && (
            <div
              className="pointer-events-none absolute w-36 h-36 rounded-full shadow-2xl"
              style={{
                left: `calc(${lensPosition.x}% - 72px)`,
                top: `calc(${lensPosition.y}% - 72px)`,
                backgroundImage: `url(${selectedImage})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "800% 800%",
                backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
              }}
            />
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