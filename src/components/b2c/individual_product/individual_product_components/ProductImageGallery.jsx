import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductImageGallery = ({ images = [], product = {} }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);
  useEffect(() => {
    setSelectedImage(images[0] || null);
    setImageError(false);
  }, [product?.id, images.length, images.join?.("|")]);

  // ✅ Helper for mobile version
  const MobileImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goPrev = () => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goNext = () => {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    if (!images.length) return null;

    return (
      <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
        {/* Main image */}
        <img
          src={images[currentIndex]}
          alt={`Product ${currentIndex}`}
          className="w-full h-full object-cover transition-transform duration-300 border"
          onError={handleImageError}
        />

        {/* Left arrow */}
        <button
          onClick={goPrev}
          className="absolute left-3 bg-white/70 p-2 rounded-full hover:bg-white shadow-md border"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right arrow */}
        <button
          onClick={goNext}
          className="absolute right-3 bg-white/70 p-2 rounded-full hover:bg-white shadow-md border"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 flex gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full border ${
                i === currentIndex ? "bg-gray-800" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // ✅ Main desktop layout (original)
  // ✅ Main desktop layout (updated)
  const DesktopGallery = () => (
    <div className="hidden md:flex relative" style={{ width: "438px", height: "505px" }}>
      {/* Thumbnail Column */}
      <div className="flex flex-col absolute left-0" style={{ width: "128px" }}>
        {/* Thumbnail 1 */}
        <button
          onClick={() => setSelectedImage(images[0])}
          className="overflow-hidden"
          style={{
            width: "128px",
            height: "148px",
            marginBottom: "11px",
          }}
        >
          <img
            src={images[0]}
            alt="Thumbnail 1"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </button>

        {/* Thumbnail 2 */}
        <button
          onClick={() => setSelectedImage(images[1])}
          className="overflow-hidden"
          style={{
            width: "128px",
            height: "147px",
            marginBottom: "11px",
          }}
        >
          <img
            src={images[1]}
            alt="Thumbnail 2"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </button>

        {/* Thumbnail 3 */}
        <button
          onClick={() => setSelectedImage(images[2])}
          className="overflow-hidden"
          style={{
            width: "128px",
            height: "191px",
          }}
        >
          <img
            src={images[2]}
            alt="Thumbnail 3"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </button>
      </div>

      {/* Main Image */}
      <div
        className="absolute"
        style={{
          left: "138px", // space from left
          top: "1px", // as required
          width: "301px",
          height: "463px",
        }}
      >
        {imageError ? (
          <div className="text-gray-400 text-sm">Image not available</div>
        ) : (
          <img
            src={selectedImage}
            alt="Product"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
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
