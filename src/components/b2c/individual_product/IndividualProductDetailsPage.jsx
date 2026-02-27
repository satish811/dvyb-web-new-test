import React, { Suspense, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";
import { cartService } from "../../../services/cartService";
import { useWishlist } from "../../../context/WishlistContext";
import { auth } from "../../../config";
import B2BAuthService from "../../../services/b2bAuthService";
import { motion, AnimatePresence } from "framer-motion";

import ProductImageGallery from "./individual_product_components/ProductImageGallery";
import ProductTitleSection from "./individual_product_components/ProductTitleSection";
import ProductColorSelector from "./individual_product_components/ProductColorSelector";
import ProductPriceSection from "./individual_product_components/ProductPriceSection";
import ProductSizeSelector from "./individual_product_components/ProductSizeSelector";
import ProductActionButtons from "./individual_product_components/ProductActionButtons";
import MemberPricingSection from "./individual_product_components/MemberPricingSection";
import OfferAndShippingInfo from "./individual_product_components/OfferAndShippingInfo";
import ProductDescriptionSection from "./individual_product_components/ProductDescriptionSection";
import MaterialsSection from "./individual_product_components/MaterialsSection";
import CareGuideSection from "./individual_product_components/CareGuideSection";
import DeliveryReturnsSection from "./individual_product_components/DeliveryReturnsSection";
import ProductDetailsSection from "./individual_product_components/ProductDetailsSection";
import DisclaimerSection from "./individual_product_components/DisclaimerSection";
import HelpAndTryonSection from "./individual_product_components/HelpAndTryonSection";
import ProductReviewsSection from "./individual_product_components/ProductReviewsSection";
import ProductStockAndShipping from "./individual_product_components/ProductStockAndShipping";
import ProductStarRatingSection from "./individual_product_components/ProductStarRatingSection";
import AvailColorsPopup from "../../b2b/common/AvailColorsPopup";
import MobileProductHeader from "./individual_product_components/MobileProductHeader";

import { LOADING_FRAMES, FRAME_INTERVAL } from "../../../assets/lazyloading2";

const UploadSelfieModal = React.lazy(() => import("../TryOn/UploadSelfieModal"));
const TryOnPreviewModal = React.lazy(() => import("../TryOn/TryOnPreviewModal"));

// Portal Component for Try-On Modal
const TryOnModalContainer = ({ children, onClose }) => {
  useEffect(() => {
    // 1. Block background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // 2. Cleanup on unmount
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // 3. Render outside normal flow (Portal)
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
      }}
      onClick={onClose} // Allow clicking backdrop to close
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
      >
        <div className="pointer-events-auto relative" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const IndividualProductDetailsPage = () => {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const { toggleWishlist, loading: wishlistLoading, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showUploadSelfieModal, setShowUploadSelfieModal] = useState(false);
  const [showTryOnPreviewModal, setShowTryOnPreviewModal] = useState(false);
  const [tryOnData, setTryOnData] = useState({});
  const [averageRating, setAverageRating] = useState(0);

  const [showAddToBagPopup, setShowAddToBagPopup] = useState(false);
  const [showAddToWishlistPopup, setShowAddToWishlistPopup] = useState(false);

  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeError, setShowSizeError] = useState(false);
  const [shakeSizeSelector, setShakeSizeSelector] = useState(false);

  const [showB2BPopup, setShowB2BPopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [showPage, setShowPage] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const isMobile = () => window.innerWidth <= 768;

  const images = LOADING_FRAMES;

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const userData = await B2BAuthService.getUserById(currentUser.uid);
          const email = userData?.data?.email;
          const role = userData?.data?.role;
          const userId = userData?.data?.userId;

          setUserId(userId);
          setUserRole(role);
          setUserEmail(email);
        } catch (error) {
          setUserRole("B2C");
          setUserId(currentUser.uid);
          setUserEmail(currentUser.email);
        }
      } else {
        setUserRole("guest");
      }
      setIsLoadingUser(false);
    };

    fetchUserData();

    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchUserData();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const editingCartItem = sessionStorage.getItem("editingCartItem");

    if (editingCartItem) {
      const item = JSON.parse(editingCartItem);
      setEditingItem(item);

      if (userRole === "B2B") {
        setShowB2BPopup(true);
      }

      sessionStorage.removeItem("editingCartItem");
    }
  }, [userRole]);

  const handleAverageRatingChange = React.useCallback((val) => {
    setAverageRating((prev) => {
      if (prev === val) return prev;
      return val;
    });
  }, []);

  // Determine if we're in any loading state
  const isPageLoading = !showPage || loading || isLoadingUser;

  useEffect(() => {
    if (!isPageLoading) return;

    const imgTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, FRAME_INTERVAL);

    return () => clearTimeout(imgTimer);
  }, [isPageLoading, currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true);
    }, 30);

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <img
          src={images[currentIndex]}
          alt="loader"
          style={{
            width: "300px",
            height: "300px",
            objectFit: "cover",
          }}
        />
      </div>
    );
  }
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  const product = products.find((p) => String(p.id) === String(id));
  console.log("🛍️ [Product Details] Full product data:", product);

  if (!product) return <div className="text-center py-10 text-gray-500">Product not found.</div>;

  const isWishlisted = isInWishlist(product.id);

  const imageUrls = product.imageUrls?.length ? product.imageUrls : ["/placeholder.jpg"];

  const isSaree = product?.dressType?.toLowerCase() === "saree";
  const requiresSizeSelection = !isSaree;
  const isB2BUser = userRole === "B2B";

  const validateSizeSelection = () => {
    if (requiresSizeSelection && !selectedSize && !isB2BUser) {
      setShowSizeError(true);
      setShakeSizeSelector(true);

      setTimeout(() => {
        setShakeSizeSelector(false);
      }, 500);

      return false;
    }
    return true;
  };

  const showBagPopup = () => {
    setShowAddToBagPopup(true);
    setTimeout(() => {
      setShowAddToBagPopup(false);
    }, 3000);
  };

  const showWishlistPopup = () => {
    setShowAddToWishlistPopup(true);
    setTimeout(() => {
      setShowAddToWishlistPopup(false);
    }, 3000);
  };

  const handleAddToWishlist = async () => {
    try {
      if (requiresSizeSelection && !validateSizeSelection()) {
        return;
      }

      const result = await toggleWishlist(
        product,
        requiresSizeSelection ? selectedSize : "One Size",
        product.selectedColors?.[0] || "Default"
      );

      if (result.success) {
        if (result.inWishlist) {
          setShowAddToWishlistPopup(true);
          setTimeout(() => setShowAddToWishlistPopup(false), 3000);
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const handleTryOnClick = () => {
    if (userRole === "B2B") {
      alert("Virtual Try-On is not available for your account");
      return;
    }

    if (requiresSizeSelection && !validateSizeSelection()) {
      return;
    }

    const garmentImage = product.imageUrls?.[0];
    if (!garmentImage) {
      alert("No image available for try-on");
      return;
    }

    const tryOnPayload = {
      garmentImage,
      garmentName: product.title || product.name,
      productId: product.id,
      selectedColors: product.selectedColors || [],
      selectedSizes: product.selectedSizes || [],
      fabric: product.fabric || "",
      price: parseFloat(product.price) || 0,
      discount: product.discount || 0,
      imageUrls: product.imageUrls || [garmentImage],
      selectedSize: requiresSizeSelection ? selectedSize : "One Size",
      dressType: product.dressType?.toLowerCase() || "lehenga",
      outfitType: product.dressType?.toLowerCase() || "lehenga",
    };

    if (isMobile()) {
      navigate(`/tryon/start/${product.id}`, {
        state: tryOnPayload,
      });
    } else {
      setTryOnData(tryOnPayload);
      setShowUploadSelfieModal(true);
      // ✅ DO NOT call performTryOn here
    }
  };


  const handleUploadSelfieNext = (data) => {
    console.log("📥 Received data from UploadSelfieModal:", data);

    setShowUploadSelfieModal(false);

    // ✅ Merge data properly
    setTryOnData((prev) => {
      const merged = { ...prev, ...data };
      console.log("🔄 Merged tryOnData:", merged);
      return merged;
    });

    // ✅ Small delay to ensure state updates
    setTimeout(() => {
      setShowTryOnPreviewModal(true);
    }, 100);
  };

  const handleModalClose = () => {
    setShowUploadSelfieModal(false);
    setShowTryOnPreviewModal(false);
    setTryOnData({});
  };

  const handleBuyNow = async (event) => {
    if (event) {
      event.stopPropagation();
    }

    if (userRole === "B2B") {
      alert("B2B accounts cannot purchase directly. Please contact sales.");
      return;
    }

    if (requiresSizeSelection && !validateSizeSelection()) {
      return;
    }

    setAddingToCart(true);

    try {
      const user = auth.currentUser;

      const cartItem = {
        id: product.id,
        name: product.name,
        description: product.description || product.shortDescription || "",
        price: product.price,
        image: imageUrls[0],
        color: product.selectedColors?.[0] || "Default",
        size: requiresSizeSelection ? selectedSize : "One Size",
        quantity: 1,
      };

      if (user) {
        navigate("/checkout", {
          state: {
            user: {
              uid: user.uid,
              email: user.email,
              role: userRole,
            },
            cartItems: [cartItem],
          },
        });
        return;
      }

      const guestCart = JSON.parse(sessionStorage.getItem("guest_cart")) || [];
      const updatedCart = [...guestCart, cartItem];
      sessionStorage.setItem("guest_cart", JSON.stringify(updatedCart));

      navigate("/checkout", {
        state: {
          user: null,
          cartItems: [cartItem],
        },
      });
    } catch (error) {
      console.error("Error during Buy Now:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToBag = async (event) => {
    event.stopPropagation();

    if (userRole === "B2B") {
      setShowB2BPopup(true);
      return;
    }

    if (requiresSizeSelection && !validateSizeSelection()) {
      return;
    }

    // Prevent duplicate cart additions
    const existingGuestCart = JSON.parse(sessionStorage.getItem("guest_cart")) || [];
    const alreadyInCart = existingGuestCart.some((item) => item.id === product.id);
    if (alreadyInCart && !auth.currentUser) {
      showBagPopup(); // Still show feedback – item is already there
      return;
    }

    setAddingToCart(true);

    try {
      const newItem = {
        id: product.id,
        name: product.name,
        description: product.description || product.shortDescription || "",
        price: product.price,
        image: imageUrls[0],
        color: product.selectedColors?.[0] || "Default",
        size: requiresSizeSelection ? selectedSize : "One Size",
        quantity: 1,
        addedAt: new Date().toISOString(),
      };

      const user = auth.currentUser;

      if (user) {
        try {
          await cartService.addToCart(product.id, newItem);
          showBagPopup();
          return;
        } catch (error) {
          const guestCart = JSON.parse(sessionStorage.getItem("guest_cart")) || [];
          const existingItemIndex = guestCart.findIndex((item) => item.id === product.id);

          if (existingItemIndex !== -1) {
            guestCart[existingItemIndex].quantity += 1;
          } else {
            guestCart.push(newItem);
          }

          sessionStorage.setItem("guest_cart", JSON.stringify(guestCart));
          showBagPopup();
          return;
        }
      }

      const guestCart = JSON.parse(sessionStorage.getItem("guest_cart")) || [];
      const existingItemIndex = guestCart.findIndex((item) => item.id === product.id);

      if (existingItemIndex !== -1) {
        guestCart[existingItemIndex].quantity += 1;
      } else {
        guestCart.push(newItem);
      }

      sessionStorage.setItem("guest_cart", JSON.stringify(guestCart));
      showBagPopup();
    } catch (error) {
      console.error("Error adding to bag:", error);
      alert("Something went wrong while adding the item to your bag.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleB2BCartConfirm = async (variantsArray) => {
    try {
      console.log("🛒 [B2B Cart] Starting handleB2BCartConfirm");
      console.log("🛒 [B2B Cart] Received variantsArray:", variantsArray);
      console.log("🛒 [B2B Cart] Product ID:", product.id);
      console.log("🛒 [B2B Cart] User Role:", userRole);

      if (!Array.isArray(variantsArray)) {
        console.error("🛒 [B2B Cart] variantsArray is not an array:", variantsArray);
        throw new Error("Variants data is not in expected format");
      }

      if (variantsArray.length === 0) {
        console.error("🛒 [B2B Cart] Empty variants array");
        throw new Error("No variants provided");
      }

      const user = auth.currentUser;

      if (user) {
        // 🟢 USER IS LOGGED IN - SAVE TO FIRESTORE
        console.log("🛒 [B2B Cart] User is logged in, saving to Firestore");

        try {
          await cartService.addToCart(
            product.id,
            {
              name: product.name,
              price: product.price,
              image: imageUrls[0],
              description: product.description || "",
            },
            variantsArray
          );

          console.log("🛒 [B2B Cart] Successfully saved to Firestore");

          const totalItems = variantsArray.reduce((sum, v) => sum + (v.quantity || 1), 0);
          alert(`${totalItems} item${totalItems > 1 ? "s" : ""} added to your cart!`);

          setShowB2BPopup(false);
          navigate("/cart");
          return;
        } catch (firestoreError) {
          console.error("🛒 [B2B Cart] Firestore save failed:", firestoreError);
          // Fallback to sessionStorage if Firestore fails
          console.log("🛒 [B2B Cart] Falling back to sessionStorage");
        }
      }

      // 🔴 USER NOT LOGGED IN OR FIRESTORE FAILED - USE SESSIONSTORAGE
      console.log("🛒 [B2B Cart] Using sessionStorage (guest cart)");

      const guestCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
      console.log("🛒 [B2B Cart] Current guest cart before:", guestCart);

      // Remove ANY existing items with this product ID
      const filteredCart = guestCart.filter(
        (item) => !(item.productId === product.id || item.id === product.id)
      );

      // Create B2B item with proper structure
      const b2bItem = {
        productId: product.id,
        id: product.id,
        isB2BVariant: true,
        b2bItem: true,
        name: product.name,
        price: Number(product.price) || 0,
        image: imageUrls[0],
        description: product.description || "",
        variants: variantsArray.map((v) => ({
          color: v.color,
          size: v.size,
          quantity: v.quantity || 1,
          availableQuantity: v.availableQuantity || 999,
        })),
        totalQuantity: variantsArray.reduce((sum, v) => sum + (v.quantity || 1), 0),
        subtotal:
          (Number(product.price) || 0) *
          variantsArray.reduce((sum, v) => sum + (v.quantity || 1), 0),
        userId: user?.uid || null,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCart = [...filteredCart, b2bItem];
      sessionStorage.setItem("guest_cart", JSON.stringify(updatedCart));

      // Verify storage
      const verifyCart = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
      const b2bItemsInCart = verifyCart.filter((item) => item.isB2BVariant === true);
      console.log("🛒 [B2B Cart] B2B items in stored cart:", b2bItemsInCart.length);

      setShowB2BPopup(false);

      const totalItems = b2bItem.totalQuantity;
      console.log("🛒 [B2B Cart] Success! Added", totalItems, "B2B items");
      alert(`${totalItems} item${totalItems > 1 ? "s" : ""} added to your cart!`);

      navigate("/cart");
    } catch (error) {
      console.error("❌ [B2B Cart] Error adding B2B items to cart:", error);
      alert("Something went wrong while adding items to your cart.");
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setShowSizeError(false);
  };

  const handleB2BWishlist = async (variantsArray) => {
    try {
      console.log("💖 [B2B Wishlist] Starting B2B wishlist handler");
      console.log("💖 [B2B Wishlist] Variants:", variantsArray);

      const user = auth.currentUser;

      if (!user) {
        alert("Please login to save items to wishlist");
        return false;
      }

      const wishlistItem = {
        productId: product.id,
        id: product.id,
        isB2BVariant: true,
        name: product.name,
        price: Number(product.price) || 0,
        image: imageUrls[0],
        description: product.description || "",
        variants: variantsArray.map((v) => ({
          color: v.color,
          size: v.size,
          quantity: v.quantity || 1,
          selected: true,
        })),
        totalQuantity: variantsArray.reduce((sum, v) => sum + (v.quantity || 1), 0),
        addedAt: new Date().toISOString(),
      };

      const result = await toggleWishlist(wishlistItem, "B2B_VARIANT", "B2B_MULTI_COLOR");

      if (result.success) {
        const totalItems = wishlistItem.totalQuantity;
        alert(`${totalItems} item${totalItems > 1 ? "s" : ""} added to your wishlist!`);
        return true;
      } else {
        throw new Error(result.error || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("❌ [B2B Wishlist] Error:", error);
      alert("Failed to add items to wishlist. Please try again.");
      return false;
    }
  };



  return (
    <div className="mx-auto flex flex-col w-full max-w-none px-4 lg:px-0 xl:px-8 2xl:px-16">

      {/* Mobile Header */}
      <MobileProductHeader productName={product?.dressType || "PRODUCT"} />

      {showAddToBagPopup && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Item added to your bag!</span>
          </div>
        </div>
      )}

      {showAddToWishlistPopup && (
        <div className="fixed top-20 right-4 bg-pink-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span>Item added to wishlist!</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-20 xl:gap-24 2xl:gap-32">

        <div className="lg:w-[35rem] sticky top-20 z-10">
          <ProductImageGallery images={imageUrls} product={product} />
        </div>

        <div className="w-full lg:w-1/2 space-y-6">
          <ProductTitleSection
            user={auth.currentUser}
            userRole={userRole}
            product={product}
            onAddToWishlist={handleAddToWishlist}
            onAddToB2BWishlist={handleB2BWishlist}
            addingToWishlist={wishlistLoading}
            isWishlisted={isWishlisted}
          />

          <ProductPriceSection product={product} />

          {/* Dynamic Color Variants (like Myntra/Ajio) */}
          {(() => {
            // Extract current product's color name
            const currentColorRaw = product.selectedColors?.[0] || "";
            const currentColorName = currentColorRaw.includes("_")
              ? currentColorRaw.split("_")[0]
              : currentColorRaw;

            // Find similar products: same name but different product IDs
            // This mimics Myntra/Ajio's "more colors" feature
            const similarProducts = products
              .filter((p) => {
                // Match by product name (same product in different colors)
                const sameName = p.name && product.name &&
                  p.name.toLowerCase().trim() === product.name.toLowerCase().trim();
                return sameName;
              })
              .map((p) => {
                const colorRaw = p.selectedColors?.[0] || "";
                const colorName = colorRaw.includes("_")
                  ? colorRaw.split("_")[0]
                  : colorRaw;
                return {
                  id: p.id,
                  imageUrls: p.imageUrls || [],
                  colorName: colorName,
                };
              });

            // Only show if there are similar products (at least the current one)
            if (similarProducts.length <= 0) return null;

            return (
              <ProductColorSelector
                similarProducts={similarProducts}
                currentProductId={product.id}
                currentColorName={currentColorName}
              />
            );
          })()}

          {requiresSizeSelection && (
            <ProductSizeSelector
              selectedSizes={product?.selectedSizes}
              units={product?.units}
              onSizeSelect={handleSizeSelect}
              selectedSize={selectedSize}
              showError={showSizeError}
              shake={shakeSizeSelector}
            />
          )}

          <ProductActionButtons
            user={auth.currentUser}
            userRole={userRole}
            onAddToBag={handleAddToBag}
            onBuyNow={handleBuyNow}
            onVirtualTryOn={handleTryOnClick}
            onAddToWishlist={handleAddToWishlist}
            onB2BBuyNow={handleB2BCartConfirm}
            addingToCart={addingToCart}
            addingToWishlist={addingToWishlist}
            isB2BUser={isB2BUser}
            product={product}
            selectedSize={selectedSize}
            selectedColor={product.selectedColors?.[0]}
          />

          {showB2BPopup && (
            <AvailColorsPopup
              colors={product?.selectedColors}
              product={product}
              onClose={() => {
                setShowB2BPopup(false);
                setEditingItem(null);
              }}
              editingItem={editingItem}
              onConfirm={handleB2BCartConfirm}
            />
          )}

          <MemberPricingSection />

          <div className="pt-4">
            <ProductReviewsSection
              productId={product?.id}
              vendorReviews={product?.vendorReviews}
              onAverageRatingChange={handleAverageRatingChange}
            />
            <ProductDescriptionSection product={product} />
            <MaterialsSection product={product} />
            <CareGuideSection product={product} />
            <DeliveryReturnsSection />
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="p-10 text-center">Loading Try-On...</div>}>
        {showUploadSelfieModal && (
          <TryOnModalContainer onClose={handleModalClose}>
            <UploadSelfieModal
              isOpen={showUploadSelfieModal}
              onClose={handleModalClose}
              onNext={handleUploadSelfieNext}
              garmentImage={tryOnData.garmentImage}
              garmentName={tryOnData.garmentName}
              tryOnData={tryOnData}
              isSaree={isSaree}
            />
          </TryOnModalContainer>
        )}
        {showTryOnPreviewModal && (
          <TryOnModalContainer onClose={handleModalClose}>
            <TryOnPreviewModal
              isOpen={showTryOnPreviewModal}
              onClose={handleModalClose}
              tryOnData={tryOnData}
              product={product}
            />
          </TryOnModalContainer>
        )}
      </Suspense>
    </div>
  );
};

export default IndividualProductDetailsPage;
