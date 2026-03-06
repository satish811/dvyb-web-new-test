import React, { useState } from "react";
import {
  Share2,
  ShoppingCart,
  Download,
  X,
  Loader2,
  Trash2,
  MessageCircle,
  Linkedin,
  Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserTryons } from "../../../hooks/useUserTryons";
import { cartService } from "../../../services/cartService";
import { deleteTryOn } from "../../../services/tryOnService";
import { tryOnProductService } from "../../../services/tryOnProductService";
import { usePopup } from "../../../context/ToastPopupContext";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

// --- Helper Components ---

const TryOnGalleryCard = ({ item, onShare, onAddToCart, onDelete }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = item.createdAt
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "Unknown date";

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this try-on?")) {
      setIsDeleting(true);
      try {
        await onDelete(item.id);
        // Success toast will be shown in parent
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete try-on");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative group">
      {/* Delete Button (Visible on Hover) */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1.5 rounded-full hover:bg-red-50 text-red-500 disabled:opacity-50"
        title="Delete try-on"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      {/* Rest of your card component... */}
      <div className="relative bg-[#D4B89C] aspect-[3/4] overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <p className="text-xs text-red-500">Failed to load image</p>
          </div>
        )}

        <img
          src={item.tryOnImage || item.garmentImage || "https://via.placeholder.com/400x600?text=No+Image"}
          alt={item.productName}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={(e) => {
            setImageError(true);
            setImageLoaded(true);
            if (item.garmentImage && e.target.src !== item.garmentImage) {
              e.target.src = item.garmentImage;
            } else {
              e.target.src = "https://via.placeholder.com/400x600?text=Image+Not+Available";
            }
          }}
          crossOrigin="anonymous"
        />

        {item.videoUrl && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            🎥 Video
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {item.garmentName && (
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
            {item.garmentName}
          </p>
        )}

        <h3 className="font-normal text-gray-900 text-sm mb-2 line-clamp-2 leading-snug">
          {item.productName || "Product"}
        </h3>

        <p className="text-xs text-gray-500 mb-4">Tried On {formattedDate}</p>

        <div className="space-y-2">
          <button
            onClick={() => onAddToCart(item)}
            className="w-full bg-white border border-[#33022F] text-[#33022F] cursor-pointer font-medium py-2.5 text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            ADD TO CART
          </button>
          <button
            onClick={() => onShare(item)}
            className="w-full bg-[#8B1A1A] cursor-pointer hover:bg-[#6d1515] text-white font-medium py-2.5 text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            SHARE YOUR LOOK
          </button>
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ isOpen, onClose, item }) => {
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !item) return null;

  // Helper: Fetch image from URL and convert to File object
  const urlToFile = async (url, filename, mimeType) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const buf = await response.arrayBuffer();
      return new File([buf], filename, { type: mimeType });
    } catch (error) {
      console.error("Error converting URL to file:", error);
      throw error;
    }
  };

  const handleShare = async (platform) => {
    setIsSharing(true);

    // Construct the product link
    const productLink = `${window.location.origin}/products/${item.productId}`;
    const shareText = `Check out my virtual try-on for ${item.productName}!`;

    try {
      // 1. Handle "Save" (Download) separately
      if (platform === "Save") {
        const link = document.createElement("a");
        link.href = item.tryOnImage;
        link.download = `tryon-${item.productName || "look"}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Image downloaded!");
        setIsSharing(false);
        return;
      }

      // 2. Prepare File for Native Sharing
      let file = null;
      try {
        // Attempt to convert the hosted image URL to a File object
        file = await urlToFile(item.tryOnImage, "my-tryon.jpg", "image/jpeg");
      } catch (e) {
        console.warn("Could not load image file for sharing, falling back to link.");
      }

      // 3. Try Native Share (Mobile)
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Try-On Look",
          text: `${shareText}\n\nShop here: `,
          url: productLink,
        });
      } else {
        // 4. Fallback for Desktop / Unsupported Browsers
        handleFallbackShare(platform, shareText, productLink);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
        // If native share crashes, try fallback
        handleFallbackShare(platform, shareText, productLink);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleFallbackShare = (platform, text, url) => {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case "WhatsApp":
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank");
        break;
      case "LinkedIn":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank");
        break;
      case "Messages":
        window.location.href = `mailto:?subject=My Try On&body=${encodedText} ${encodedUrl}`;
        break;
      default:
        // Generic fallback copy
        navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Link copied! (Image sharing not supported on this device)");
    }
  };

  const shareOptions = [
    { name: "Save", icon: Download, color: "bg-gray-600" },
    { name: "Messages", icon: MessageCircle, color: "bg-blue-500" },
    { name: "WhatsApp", icon: Share2, color: "bg-green-500" },
    { name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-6">Share Look</h3>

        <div className="mb-6 relative">
          <img
            src={item.tryOnImage}
            alt={item.productName}
            className="w-32 h-44 mx-auto object-cover rounded-lg shadow-md"
          />
          {isSharing && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {shareOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleShare(option.name)}
              disabled={isSharing}
              className="flex flex-col items-center gap-2 group disabled:opacity-50"
            >
              <div
                className={`${option.color} text-white p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-lg flex items-center justify-center`}
              >
                <option.icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-700 font-medium">{option.name}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          On mobile, this will share the image & link directly to apps.
        </p>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function TryOnGallery() {
  const navigate = useNavigate();
  const { tryons, loading, error, setTryons } = useUserTryons();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useAuth();

  // Safe access to usePopup - fallback if not available
  let showPopup = null;
  try {
    const popupContext = usePopup();
    showPopup = popupContext?.showPopup;
  } catch (err) {
    // console.warn("usePopup context not available");
  }

  const handleShare = (item) => {
    setSelectedItem(item);
    setShareModalOpen(true);
  };

  const handleAddToCart = async (item) => {
    if (!user) {
      toast.error("Please log in to add items to cart!");
      return;
    }

    try {
      const productData = {
        name: item.productName,
        title: item.productName,
        price: parseFloat(item.price) || 0,
        size: item.selectedSizes?.[0] || "Free Size",
        color: item.selectedColors?.[0] || "",
        image: item.garmentImage,
        imageUrls: [item.garmentImage, item.tryOnImage].filter(Boolean),
        selectedColors: item.selectedColors || [],
        selectedSizes: item.selectedSizes || [],
        fabric: item.fabric || "",
        description: "",
        subtotal: parseFloat(item.price) || 0,
        discount: item.discount || 0,
        fromTryOnGallery: true,
        tryOnData: {
          tryOnImage: item.tryOnImage,
          originalImage: item.garmentImage,
          viewMode: item.viewMode,
          videoUrl: item.videoUrl,
        },
      };

      await cartService.addToCart(item.productId, productData, 1);

      if (showPopup) {
        showPopup("cart", {
          title: item.productName,
          image: item.garmentImage,
        });
      } else {
        toast.success(`${item.productName} added to cart!`);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  const handleDelete = async (tryOnId) => {
    try {
      await tryOnProductService.deleteTryOnEntry(user.uid, tryOnId);
      setTryons(prevTryons => prevTryons.filter(item => item.id !== tryOnId));

      toast.success("Try-on deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete try-on");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your try-ons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!tryons || tryons.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">👗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Try-Ons Yet</h2>
          <p className="text-gray-600 mb-6">Start trying on outfits to see them here!</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-family-outfit font-bold text-gray-900 mb-2">My Tryon Gallery</h1>
          <p className="text-gray-600">
            All your virtual try-ons in one place ({tryons.length}{" "}
            {tryons.length === 1 ? "item" : "items"})
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {tryons.map((item) => (
            <TryOnGalleryCard
              key={item.id}
              item={item}
              onShare={handleShare}
              onAddToCart={handleAddToCart}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}