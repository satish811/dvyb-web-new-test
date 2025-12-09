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

  // ✅ Helper for mobile version
  const MobileImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartXRef = useRef(0);
    const touchEndXRef = useRef(0);

    const handleTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      touchEndXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const deltaX = touchEndXRef.current - touchStartXRef.current;

      if (deltaX < -40) {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (deltaX > 40) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
    };

    if (!images.length) return null;

    return (
      <div className="w-full flex flex-col items-center">
        {/* FULL-WIDTH mobile image */}
        <div
          className="relative w-full bg-gray-50 overflow-hidden flex items-center justify-center"
          style={{
            height: "auto",
            minHeight: "350px", // adjusts based on mobile height
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[currentIndex]}
            alt={`Product ${currentIndex}`}
            className="w-full h-auto object-contain max-h-[90vh] transition-all duration-300"
          />
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentIndex ? "bg-[#573131]" : "bg-[#573131]/30"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // ✅ Main desktop layout (fixed)
  const DesktopGallery = () => (
    <div className="hidden md:flex relative" style={{ width: "438px", height: "505px" }}>
      {/* Thumbnail Column */}
      <div className="flex flex-col absolute left-0" style={{ width: "128px" }}>
        {images.slice(0, 3).map((img, index) => (
          <button
            key={index}
            onClick={() => {
              console.log(`Clicked thumbnail ${index}:`, img);
              setSelectedImage(img);
            }}
            className="overflow-hidden mb-[11px] last:mb-0"
            style={{
              width: "128px",
              height: index === 2 ? "191px" : index === 1 ? "147px" : "148px",
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

      {/* Main Image */}
      <div
        className="absolute"
        style={{
          left: "138px",
          top: "1px",
          width: "301px",
          height: "463px",
        }}
      >
        {imageError ? (
          <div className="text-gray-400 text-sm">Image not available</div>
        ) : selectedImage ? (
          <img
            key={selectedImage} // Add key to force re-render when image changes
            src={selectedImage}
            alt="Product"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="text-gray-400 text-sm">Select an image</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile layout */}
      <div className="block md:hidden w-full">
        <MobileImageSlider />
      </div>

      {/* Desktop layout */}
      <DesktopGallery />
    </>
  );
};

export default ProductImageGallery;
