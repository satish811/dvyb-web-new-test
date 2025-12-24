import React, { useState, useEffect, useMemo , useRef} from "react";
import colorUtils from "../../utils/colorUtils";
import {
  ArrowLeft,
  RotateCcw,
  Image,
  Palette,
  Shirt,
  ChevronDown,
  Loader2,
  Video,
} from "lucide-react";
import bg1 from "../../../assets/ProductsPage/bg1.svg";
import bg2 from "../../../assets/ProductsPage/bg2.svg";
import bg3 from "../../../assets/ProductsPage/bg3.svg";
import bg4 from "../../../assets/ProductsPage/bg4.svg";

import beach from '../../../assets/TryOn/beach2.jpg'
import temple from '../../../assets/TryOn/temple3.jpg'
import wed from '../../../assets/TryOn/wed4.jpg'

import img1 from '../../../assets/lazyloading/logoimg1.svg'
import img2 from '../../../assets/lazyloading/logoimg2.svg'
import img3 from '../../../assets/lazyloading/logoimg3.svg'
import img4 from '../../../assets/lazyloading/logoimg4.svg'
import img5 from '../../../assets/lazyloading/logoimg5.svg'
import img6 from '../../../assets/lazyloading/logoimg6.svg'

import { usePopup } from "../../../context/ToastPopupContext";
import { wishlistService } from "../../../services/wishlistService";
import { cartService } from "../../../services/cartService";
import { useAuth } from "../../../context/AuthContext";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { saveTryOnResult } from "../../../services/tryOnService";
import { useNavigate } from "react-router-dom";
import "../../../styles/index.css";
import share_ic from "../../../assets/TryOn/share_ic.svg";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../../../config/firebaseConfig"; // Adjust path if needed


const API_BASE_URL = "/api/kling";

const TryOnPreviewModal = ({ isOpen, onClose, tryOnData }) => {
  const [tryOnResult, setTryOnResult] = useState(null);
  const hasStartedRef = useRef(false);
  // const [tryOnResultNoBg, setTryOnResultNoBg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); 
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedTab, setSelectedTab] = useState("colours");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedFabric, setSelectedFabric] = useState("pure-silk");
  const [selectedBlouse, setSelectedBlouse] = useState("regular");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [backgroundChangedImage, setBackgroundChangedImage] = useState(null);
  const [isChangingBackground, setIsChangingBackground] = useState(false);
  // const [isRemovingBg, setIsRemovingBg] = useState(false);
  // const [bgError, setBgError] = useState("");
  const [viewMode, setViewMode] = useState("2D");
  const [expandedPanel, setExpandedPanel] = useState(null);
  // Add this with your other useState declarations at the top
// const [selectedBlouse, setSelectedBlouse] = useState("regular");
const [isChangingBlouse, setIsChangingBlouse] = useState(false);

  // 3D Video States
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoTaskId, setVideoTaskId] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState('');
  const [showBgWarning, setShowBgWarning] = useState(false);

  const [videoStatus, setVideoStatus] = useState("");

  const auth = useAuth();
  const user = auth?.user || null;




  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [img1, img2, img3, img4, img5, img6];

  useEffect(() => {
    const imgTimer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 200); // Change this to make rotation faster/slower

    return () => clearTimeout(imgTimer);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {

    }, 30000); // Change from 35000 to 30000 (30 seconds)

    return () => clearTimeout(timer);
  }, []);


  // const { user } = useAuth();
  // const { showPopup } = usePopup();

  useEffect(() => {
    if (!user) {
      console.log("🔐 No user logged in, but continuing with try-on functionality");
    }
  }, [user]);

  const popup = usePopup();
  const showPopup =
    popup?.showPopup ||
    (() => {
      console.log("Popup context not available");
    });

  useEffect(() => {
    if (!user) {
      console.log("🔐 No user logged in, but continuing with try-on functionality");
    }
  }, [user]);

  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const [cartIds, setCartIds] = useState(new Set());
  const [inFlightAdd, setInFlightAdd] = useState(false);
  const navigate = useNavigate();

  // Check if this is a 3D try-on request
  const is3DMode = tryOnData?.is3D || false;

  // === REAL-TIME CART SUBSCRIPTION ===
  useEffect(() => {
    // if (!user) {
    //   setCartIds(new Set());
    //   return;
    // }

    let unsubscribeFn = null; // to store actual function

    (async () => {
      try {
        const unsub = await cartService.subscribeToCart((cartItems) => {
          const ids = new Set(cartItems.map((item) => item.productId || item.id));
          setCartIds(ids);
        });
        unsubscribeFn = unsub;
      } catch (error) {
        console.error("Error subscribing to cart:", error);
      }
    })();

    // cleanup
    return () => {
      if (typeof unsubscribeFn === "function") {
        unsubscribeFn();
      }
    };
  }, [user]);

  useEffect(() => {
    const checkStatus = async () => {
      if (tryOnData?.productId && user) {
        // Only check wishlist if user exists
        try {
          const inWishlist = await isInWishlist(tryOnData.productId);
          setIsInWishlistState(inWishlist);
        } catch (error) {
          console.error("Error checking wishlist:", error);
        }
      }
    };
    checkStatus();
  }, [tryOnData?.productId, user]); // Add user to dependencies // Add user to dependencies



  const handleconsole = async () => {
    console.log("🔍 handleconsole called");

  };
  const handleToggleWishlist = async () => {
    console.log("🔍 handleToggleWishlist called");
    console.log("🔍 user:", user);
    console.log("🔍 tryOnData:", tryOnData);
    console.log("🔍 tryOnData.productId:", tryOnData?.productId);

    if (!user) {
      toast.error("Please log in to continue!");
      return;
    }

    const wasInWishlist = isInWishlistState;
    setIsInWishlistState(!wasInWishlist);
    setIsLoading(true);

    try {
      if (wasInWishlist) {
        console.log("🗑️ Removing from wishlist:", tryOnData.productId);
        await removeFromWishlist(tryOnData.productId);
        showPopup("wishlistRemove", {
          title: tryOnData.garmentName || "Product",
          image: tryOnData.garmentImage,
        });
        console.log("✅ Removed successfully");
      } else {
        const productData = {
          name: tryOnData.garmentName,
          price: tryOnData.price || 0,
          image: tryOnData.garmentImage,
          fabric: tryOnData.fabric || "",
          craft: tryOnData.craft || "",
          selectedColors: tryOnData.selectedColors || [],
          discount: tryOnData.discount || 0,
        };

        console.log("➕ Adding to wishlist:", tryOnData.productId);
        console.log("📦 Product data:", productData);

        await addToWishlist(tryOnData.productId, productData);
        showPopup("wishlist", {
          title: productData.name,
          image: productData.image,
        });
        console.log("✅ Added successfully");
      }
    } catch (err) {
      console.error("❌ Wishlist error:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      setIsInWishlistState(wasInWishlist);
      toast.error("Failed to update wishlist!");
    } finally {
      setIsLoading(false);
    }
  };


  const saveToGallery = async (resultUrl, videoUrl = null) => {
    try {
      console.log("💾 Uploading to Firebase storage...");

      const user = auth.currentUser;
      if (!user) {
        toast.error("Login required to save try-on!");
        return null;
      }

      if (!resultUrl) {
        toast.error("No try-on image to save!");
        return null;
      }

      // ✅ Changed: Don't upload here, let saveTryOnResult handle it
      const payload = {
        userId: user.uid,
        productId: tryOnData?.productId || "unknown",
        productName: tryOnData?.productName || tryOnData?.garmentName || "Try-On Product",
        garmentName: tryOnData?.garmentName || "",
        tryOnImage: resultUrl, // Pass the URL, saveTryOnResult will handle uploading
        modelImage: tryOnData?.modelImage || "",
        garmentImage: tryOnData?.garmentImage || "",
        selectedColors: tryOnData?.selectedColors || [],
        selectedSizes: tryOnData?.selectedSizes || [],
        fabric: tryOnData?.fabric || "",
        price: tryOnData?.price || 0,
        discount: tryOnData?.discount || 0,
        viewMode: videoUrl ? "3D" : "2D",
        videoUrl: videoUrl || null,
        createdAt: new Date().toISOString(),
      };

      const savedId = await saveTryOnResult(payload);

      if (savedId) {
        toast.success("Saved to gallery!");
        console.log("🎯 Saved Try-On with ID:", savedId);
      } else {
        toast.error("Failed to save to gallery!");
      }

      return savedId;
    } catch (error) {
      console.error("❌ Save to gallery failed:", error);
      toast.error("Failed to save try-on");
      return null;
    }
  };
  const handleAddToCart = async () => {
    // if (!user) {
    //   toast.error("Please log in to add items to cart!");
    //   return;
    // }

    const productId = tryOnData?.productId;
    if (!productId) {
      toast.error("Product information missing!");
      return;
    }

    // Already in cart → Go to cart
    if (cartIds.has(productId)) {
      navigate("/mycart");
      return;
    }

    // Prevent double add
    if (inFlightAdd) return;

    // Optimistic UI
    setInFlightAdd(true);
    setCartIds((prev) => new Set(prev).add(productId));

    try {
      const productData = {
        name: tryOnData.garmentName || "Product",
        title: tryOnData.garmentName || "Product",
        price: parseFloat(tryOnData.price) || 0,
        imageUrls: tryOnData.imageUrls || [tryOnData.garmentImage],
        selectedColors: tryOnData.selectedColors || [selectedColor],
        selectedSizes: tryOnData.selectedSizes || [],
        fabric: tryOnData.fabric || selectedFabric,
        craft: tryOnData.craft || "",
        description: tryOnData.description || "",
      };

      await cartService.addToCart(productId, productData, 1);

      showPopup("cart", {
        title: productData.name,
        image: productData.imageUrls[0],
      });

      // No need to update cartIds — subscription will confirm
    } catch (err) {
      // Rollback optimistic update
      setCartIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      toast.error("Failed to add to cart. Please try again.");
      console.error("Add to cart failed:", err);
    } finally {
      setInFlightAdd(false);
    }
  };

  const { productId, selectedColors, selectedSizes, fabric, price, discount } = tryOnData || {};

  const colors = useMemo(() => {
    if (!selectedColors || selectedColors.length === 0) {
      return [{ name: "blue", color: "#2C5F7F", image: "..." }];
    }

    return selectedColors.map((colorString) => {
      const { name, hex } = colorUtils.parseColor(colorString);
      return {
        name: name,
        color: hex,
        image: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="${encodeURIComponent(hex)}" width="100" height="100"/%3E%3C/svg%3E`,
      };
    });
  }, [selectedColors]);

  const fabricTypes = useMemo(() => {
    if (fabric) {
      return [
        {
          id: "fabric-1",
          name: fabric,
          category: "Selected",
          style: "Current",
          properties: { drape: "Medium", shine: "Medium", texture: "Smooth" },
        },
      ];
    }
    return [
      {
        id: "pure-silk",
        name: "Pure Silk",
        category: "Premium",
        style: "Traditional",
        properties: { drape: "Light", shine: "Medium", texture: "Soft" },
      },
      {
        id: "zari-work",
        name: "Zari Work",
        category: "Lightweight",
        style: "Modern",
        properties: { drape: "Medium", shine: "High", texture: "Smooth" },
      },
      {
        id: "heavy-silk",
        name: "Heavy Silk",
        category: "Premium",
        style: "Traditional",
        properties: { drape: "Heavy", shine: "Low", texture: "Rich" },
      },
    ];
  }, [fabric]);

  const blouseDesigns = [
    {
      id: "traditional",
      name: "Traditional",
      image:
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3ETraditional%3C/text%3E%3C/svg%3E',
    },
    {
      id: "modern-cut",
      name: "Modern Cut",
      image:
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EModern%3C/text%3E%3C/svg%3E',
    },
    {
      id: "designer",
      name: "Designer",
      image:
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EDesigner%3C/text%3E%3C/svg%3E',
    },
    {
      id: "sleeveless",
      name: "Sleeveless",
      image:
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3ESleeveless%3C/text%3E%3C/svg%3E',
    },
    {
      id: "halternek",
      name: "Halternek",
      image:
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EHalternek%3C/text%3E%3C/svg%3E',
    },
    {
      id: "backless",
      name: "Backless",
      image:
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3EBackless%3C/text%3E%3C/svg%3E',
    },
  ];

  const backgroundOptions = [
    {
      id: "hallway",
      name: "Temple Hall",
      image:
        'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background4_gqcvpg.jpg',
    },

    { id: "pool", name: "Grand Hall", image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background6_cmouwo.jpg' },
    { id: "wedding", name: "Archway", image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background5_a9sfuo.jpg'},
    { id: "trees", name: "Floral lights", image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background11_lctohz.jpg' },

  ];

 const performTryOn = async () => {

    console.log("🎯 performTryOn called");
  console.log("🎯 Call stack:", new Error().stack);
  

  const { modelImage, garmentImage, garmentName } = tryOnData || {};
  if (!modelImage || !garmentImage || !garmentName){

    console.log("⏸️ Missing required data");
  return;
  }
  
 if (isProcessing) {
    console.log("⏸️ Already processing - BLOCKING");
    return;
  }

  if (tryOnResult) {
    console.log("⏸️ Already have result - BLOCKING");
    return;
  }

  if (hasStartedRef.current) {
    console.log("⏸️ Already started once - BLOCKING");
    return;
  }

  console.log("🚀 performTryOn EXECUTING");

  hasStartedRef.current = true;
  setIsProcessing(true);
  setErrorMsg("");
  setTryOnResult(null);

  try {
    const formData = new FormData();

    // Handle model image
    let modelBlob;
    if (modelImage.startsWith("data:")) {
      const base64 = modelImage.split(",")[1];
      const byteCharacters = atob(base64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      modelBlob = new Blob([byteArray], { type: "image/jpeg" });
    } else {
      modelBlob = await fetch(modelImage).then(r => r.blob());
    }

    formData.append("model", modelBlob, "user.jpg");

    // Handle garment image
    const garmentBlob = await fetch(garmentImage).then(r => r.blob());
    formData.append("garment", garmentBlob, "garment.png");

    formData.append("outfitType", tryOnData?.dressType?.toLowerCase() || tryOnData?.outfitType || "lehenga");

    console.log("🚀 Sending to /api/garnment-swap");

    const response = await fetch("/api/garnment-swap", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();

    if (!data.success || !data.result) {
      throw new Error(data.error || "No result");
    }

    const resultUrl = data.result;
    setTryOnResult(resultUrl);

    console.log("✅ Try-on complete");

  } catch (err) {
    console.error("❌ Error:", err);
    setErrorMsg(err.message);
  } finally {
    setIsProcessing(false);
  }
};


  //it worked last time
  // const performTryOn = async () => {
  //   const { modelImage, garmentImage, garmentName } = tryOnData || {};
  //   if (!modelImage || !garmentImage) return;

  //   setIsProcessing(true);
  //   setErrorMsg("");
  //   setTryOnResult(null);
  //   setTryOnResultNoBg(null);

  //   try {
  //     // Convert data URLs to blobs
  //     const modelBlob = await fetch(modelImage).then(r => r.blob());
  //     const garmentBlob = await fetch(garmentImage).then(r => r.blob());

  //     const formData = new FormData();
  //     formData.append("model", modelBlob, "model.png");
  //     formData.append("garmentUrl", garmentImage); // Send as URL instead of file
  //     formData.append("outfitType", garmentName || "saree");

  //     console.log("Calling Gemini Try-On API...");
  //     const response = await fetch("/api/single-tryon", { // Use relative URL
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       const err = await response.text();
  //       throw new Error(`Server error: ${err}`);
  //     }

  //     const data = await response.json();

  //     if (data.success && data.result) {
  //       const resultUrl = data.result;
  //       setTryOnResult(resultUrl);

  //       // Auto-remove background
  //       setTimeout(() => removeBackgroundFromResult(resultUrl), 800);

  //       // Save to gallery
  //       try {
  //         await saveTryOnResult({
  //           ...tryOnData,
  //           tryOnResult: resultUrl,
  //           is3D: false,
  //         });
  //         toast.success("Try-on saved to your gallery!");
  //       } catch (error) {
  //         console.error("Failed to save try-on:", error);
  //       }

  //       // Auto-trigger 3D if needed
  //       if (is3DMode && resultUrl) {
  //         setTimeout(() => generateVideo(resultUrl), 1500);
  //       }
  //     } else {
  //       throw new Error(data.error || "No result from server");
  //     }
  //   } catch (error) {
  //     console.error("Try-On failed:", error);
  //     setErrorMsg(error.message || "AI try-on failed. Please try again.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };











  // const performTryOn = async () => {
  //   const { modelImage, garmentImage, garmentName } = tryOnData || {};
  //   if (!modelImage || !garmentImage) return;

  //   setIsProcessing(true);
  //   setErrorMsg("");
  //   setTryOnResult(null);
  //   setTryOnResultNoBg(null);

  //   try {
  //     console.log("📸 Starting try-on process...");
  //     console.log("Model URL:", modelImage?.substring(0, 80));
  //     console.log("Garment URL:", garmentImage?.substring(0, 80));

  //     const requestBody = {
  //       modelUrl: modelImage,
  //       garmentUrl: garmentImage,
  //       outfitType: garmentName || "saree"
  //     };

  //     console.log("🚀 Calling backend API...");

  //     const response = await fetch("/api/tryon-from-urls", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify(requestBody)
  //     });

  //     console.log("📡 Response status:", response.status);

  //     // ⭐ FIX: Read response body only ONCE
  //     const contentType = response.headers.get("content-type");
  //     let data;

  //     if (contentType && contentType.includes("application/json")) {
  //       data = await response.json();
  //     } else {
  //       const text = await response.text();
  //       console.error("❌ Non-JSON response:", text);
  //       throw new Error(text || `Server error: ${response.status}`);
  //     }

  //     if (!response.ok) {
  //       console.error("❌ Server error:", data);
  //       const errorMessage = data.details || data.error || `Server error: ${response.status}`;
  //       throw new Error(errorMessage);
  //     }

  //     console.log("📦 Response:", data.success ? "Success!" : "Failed");

  //     if (data.success && data.result) {
  //       const resultUrl = data.result;
  //       setTryOnResult(resultUrl);

  //       // Auto-remove background
  //       setTimeout(() => removeBackgroundFromResult(resultUrl), 800);

  //       // Save to gallery
  //       try {
  //         await saveTryOnResult({
  //           ...tryOnData,
  //           tryOnResult: resultUrl,
  //           is3D: false,
  //         });
  //         toast.success("Try-on saved to your gallery!");
  //       } catch (error) {
  //         console.error("Failed to save try-on:", error);
  //       }

  //       // Auto-trigger 3D if needed
  //       if (is3DMode && resultUrl) {
  //         setTimeout(() => generateVideo(resultUrl), 1500);
  //       }
  //     } else {
  //       throw new Error(data.error || "No result from server");
  //     }
  //   } catch (error) {
  //     console.error("❌ Try-On failed:", error);
  //     setErrorMsg(error.message || "AI try-on failed. Please try again.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };



  // const removeBackgroundFromResult = async (imageUrl) => {
  //   setIsRemovingBg(true);
  //   console.log("🖼️ Starting background removal for:", imageUrl);

  //   try {
  //     console.log("📥 Fetching image...");
  //     const response = await fetch(imageUrl);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch image: ${response.status}`);
  //     }
  //     const blob = await response.blob();
  //     console.log("✅ Image fetched, size:", blob.size, "bytes");

  //     const formData = new FormData();
  //     formData.append("image_file", blob);
  //     formData.append("size", "auto");

  //     console.log("🔑 Using API Key:", "kLvaXzn7KaA3CJBbNFAxiwqu".substring(0, 10) + "...");
  //     console.log("📤 Sending to Remove.bg...");

  //     const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
  //       method: "POST",
  //       headers: {
  //         "X-Api-Key": "45iFVGTnxxaakQJLzrRszmGT",
  //       },
  //       body: formData,
  //     });

  //     console.log("📥 Remove.bg response status:", removeBgResponse.status);
  //     console.log("📥 Response headers:", Object.fromEntries(removeBgResponse.headers.entries()));

  //     if (!removeBgResponse.ok) {
  //       const errorText = await removeBgResponse.text();
  //       console.error("❌ Remove.bg error response:", errorText);

  //       try {
  //         const errorJson = JSON.parse(errorText);
  //         console.error("❌ Parsed error:", errorJson);
  //         throw new Error(
  //           `Remove.bg failed: ${errorJson.errors?.[0]?.title || removeBgResponse.status}`
  //         );
  //       } catch (e) {
  //         throw new Error(`Remove.bg failed: ${removeBgResponse.status} - ${errorText}`);
  //       }
  //     }

  //     const removedBgBlob = await removeBgResponse.blob();
  //     console.log("✅ Background removed, new size:", removedBgBlob.size, "bytes");

  //     const noBgUrl = URL.createObjectURL(removedBgBlob);
  //     setTryOnResultNoBg(noBgUrl);
  //     console.log("✅ Background removal complete!");
  //   } catch (error) {
  //     console.error("❌ Background removal failed:", error);
  //     console.error("❌ Error details:", error.message);
  //     setBgError(`Background removal failed: ${error.message}`);
  //   } finally {
  //     setIsRemovingBg(false);
  //   }
  // };

  // 3D Video Generation Functions
const generateVideo = async () => {
    console.log('🎬 Starting video generation...');
    setIsGeneratingVideo(true);
    setVideoError('');
    setVideoProgress(0);

    try {
      // Convert backgroundChangedImage to blob
      const response = await fetch(backgroundChangedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('tryOnImage', blob, 'tryon-bg-changed.jpg');
      formData.append('prompt', 'Professional fashion model standing elegantly, gentle camera movement, cinematic lighting, high quality');

      console.log('📤 Sending to video API...');

      // Create video task
      const createResponse = await fetch('/api/video/create', {
        method: 'POST',
        body: formData,
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create video task');
      }

      const taskId = createData.taskId;
      setVideoTaskId(taskId);
      console.log('✅ Task created:', taskId);

      // Start polling for completion
      pollVideoStatus(taskId);

    } catch (err) {
      console.error('❌ Video generation error:', err);
      setVideoError(err.message || 'Failed to generate video');
      setIsGeneratingVideo(false);
    }
  };

  // ========================================
  // 3. ADD THIS POLLING FUNCTION
  // ========================================
  const pollVideoStatus = async (taskId) => {
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/video/status/${taskId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        setVideoProgress(result.progress || 0);

        if (result.status === 'Success') {
          // Get download URL
          const downloadResponse = await fetch(`/api/video/download/${result.file_id}`);
          const downloadData = await downloadResponse.json();

          if (downloadData.success) {
            setVideoUrl(downloadData.videoUrl);
            setIsGeneratingVideo(false);
            console.log('✅ Video generated successfully!');
          }
          return;
        } else if (result.status === 'Fail') {
          setVideoError('Video generation failed');
          setIsGeneratingVideo(false);
          return;
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 5000); // Poll every 5 seconds
        } else {
          setVideoError('Video generation timed out');
          setIsGeneratingVideo(false);
        }
      } catch (err) {
        console.error('Status check error:', err);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 5000);
        } else {
          setVideoError('Failed to check video status');
          setIsGeneratingVideo(false);
        }
      }
    };

    checkStatus();
  };

useEffect(() => {
  const { modelImage, garmentImage } = tryOnData || {};
  
  // ✅ STRICT SINGLE EXECUTION CHECK
  if (
    isOpen && 
    modelImage && 
    garmentImage && 
    !hasStarted && 
    !tryOnResult && 
    !isProcessing
  ) {
    console.log("🎬 Starting try-on (FIRST TIME ONLY)");
    console.log("📸 Model:", modelImage.substring(0, 50));
    console.log("👗 Garment:", garmentImage.substring(0, 50));
    
    setHasStarted(true);
    performTryOn();
  }
  
  // ✅ Reset when modal closes
  if (!isOpen) {
    setHasStarted(false);
  }
}, [isOpen]); // ✅ ONLY depend on isOpen

  if (!isOpen) return null;

const changeBackground = async (backgroundType) => {
  if (!tryOnResult) {
    toast.error("Please complete try-on first!");
    return;
  }

  setIsChangingBackground(true);
  setSelectedBackground(backgroundType);

  try {
    console.log("🎨 Starting background change...");

    // Convert try-on result (data URL) to blob
    console.log("📥 Converting try-on result to blob...");
    const response = await fetch(tryOnResult);
    const tryOnBlob = await response.blob();
    
    console.log(`✅ Blob created: ${(tryOnBlob.size / 1024).toFixed(2)} KB`);

    // Create form data
    const formData = new FormData();
    formData.append('tryOnImage', tryOnBlob, 'tryon-result.png');
    formData.append('background', backgroundType);

    console.log(`📤 Sending to backend with background: ${backgroundType}`);

    // Call backend API
    const apiResponse = await fetch(`/api/change-tryon-background`, {
      method: 'POST',
      body: formData,
    });

    console.log("📡 Response status:", apiResponse.status);

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.details || errorData.error || `Server error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data.success && data.result) {
      console.log("✅ Background change successful!");
      setBackgroundChangedImage(data.result);
      toast.success(`Background changed to ${data.background}! 🎉`);
    } else {
      throw new Error(data.error || "Background change failed");
    }
    
  } catch (error) {
    console.error("❌ Background change failed:", error);
    
    let errorMsg = error.message;
    if (errorMsg.includes('Failed to fetch')) {
      errorMsg = '🔌 Cannot connect to server. Make sure backend is running on port 3004.';
    } else if (errorMsg.includes('timeout')) {
      errorMsg = '⏳ Request timed out. Please try again.';
    }
    
    toast.error(errorMsg);
  } finally {
    setIsChangingBackground(false);
  }
};



const changeBlouse = async (blouseType) => {
  if (!tryOnResult) {
    toast.error("Please complete try-on first!");
    return;
  }

  setIsChangingBlouse(true);
  setSelectedBlouse(blouseType);

  try {
    console.log("👚 Starting blouse change...");

    // Convert try-on result to blob
    const response = await fetch(tryOnResult);
    const tryOnBlob = await response.blob();
    
    // Create form data
    const formData = new FormData();
    formData.append('tryOnImage', tryOnBlob, 'tryon-result.png');
    formData.append('blouseType', blouseType); // e.g., "half-sleeve", "full-sleeve"

    console.log(`📤 Sending to backend with blouse: ${blouseType}`);

    // Call backend API
    const apiResponse = await fetch(`/api/change-blouse`, {
      method: 'POST',
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error || `Server error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data.success && data.result) {
      console.log("✅ Blouse change successful!");
      setTryOnResult(data.result); // Update the main try-on result
      toast.success(`Blouse changed to ${blouseType}! 👚`);
    }
    
  } catch (error) {
    console.error("❌ Blouse change failed:", error);
    toast.error(error.message);
  } finally {
    setIsChangingBlouse(false);
  }
};





  const getCurrentDisplayImage = () => {
    return backgroundChangedImage || tryOnResult;
  };

  const handleReset = () => {
    setSelectedBackground("");
    setBackgroundChangedImage(null);
    setBgError("");
    setVideoUrl(null);
    setVideoError("");
    setViewMode("2D");
  };

  const handleViewModeSwitch = (mode) => {
    if (mode === '3D') {
      // ✅ CHECK: Has background been changed?
      if (!backgroundChangedImage) {
        setShowBgWarning(true);
        return;
      }

      // ✅ CHECK: Video already generated?
      if (!videoUrl && !isGeneratingVideo) {
        generateVideo();
      }
    }
    setViewMode(mode);
  };

  return (
    <div className="fixed inset-0  z-50 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* STAGE: centered preview area - FIXED: Added padding bottom for mobile */}


        {showBgWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Background Required</h3>
            <p className="text-gray-600 mb-4">
              Please select a background scene first before generating 3D video.
            </p>
            <button
              onClick={() => setShowBgWarning(false)}
              className="w-full bg-primary text-white py-2 rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}


      <div className="absolute inset-0 w-full h-full flex items-center justify-center pb-[60vh] lg:pb-0 pointer-events-none">

        {isProcessing ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src={images[currentIndex]}
                alt="loader"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  transition: "opacity 0.3s",
                }}
              />
            </div>
            <p className="text-xl text-center text-primary font-Outfit mt-4">Creating your Vibe</p>
          </div>
        ) : errorMsg ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="font-semibold text-lg mb-2 text-gray-900">Try-on failed</p>
            <p className="text-sm text-gray-600 mb-6">{errorMsg}</p>
            <button
              onClick={performTryOn}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-lg font-medium"
            >
              Try Again
            </button>
          </div>
        ) : viewMode === "2D" && getCurrentDisplayImage() ? (
          /* 2D IMAGE VIEW */   
          <div
            className="relative flex items-center  h-full justify-center shadow-2xl overflow-hidden"
            // style={{
            //   background:
            //     selectedBackground && viewMode === "2D"
            //       ? `url(${backgroundOptions.find((bg) => bg.id === selectedBackground)?.image})`
            //       : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            //   backgroundSize: "contain",
            //   backgroundPosition: "center",
            // }}
          >
            <img
              src={getCurrentDisplayImage()}
              alt="Try-on result"
              className={` 'mt-48' : 'mt-4' pointer-events-auto w-[440px] h-[656px] mt-4 object-contain`}

              // "w-[500px] h-[656px] mt-4 object-contain"
              draggable={false}
            />

            {/* {(isChangingBackground || isRemovingBg) && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-2 mx-auto"></div>
                  <p className="text-sm font-medium">
                    {isRemovingBg ? "Preparing image..." : "Changing background..."}
                  </p>
                </div>
              </div>
            )} */}
          </div>
        ) : viewMode === "3D" ? (
  <div className="relative w-1/4 h-full flex items-center justify-center">
    
    {/* Generating */}
    {isGeneratingVideo && (
      <div className="text-center max-w-md">
        <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary mb-4" />
        <p className="text-xl font-semibold mb-2">Generating 3D Video...</p>
        <p className="text-sm text-gray-600 mb-4">
          Creating your 6-second video
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${videoProgress}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">{videoProgress}% Complete</p>
        <p className="text-lg font-semibold text-primary mt-2">
          This usually takes 45–90 seconds
        </p>
      </div>
    )}

    {/* Video Success */}
    {!isGeneratingVideo && videoUrl && (
      <div className="relative max-w-[85vw] h-full ">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-cover  shadow-2xl"
        />
      </div>
    )}

    {/* Video Error */}
    {!isGeneratingVideo && videoError && (
      <div className="text-center max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="font-semibold text-lg mb-2">
          Video Generation Failed
        </p>
        <p className="text-sm text-gray-600 mb-6">{videoError}</p>

        <button
          onClick={generateVideo}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-hoverBg transition-all"
        >
          Try Again
        </button>
      </div>
    )}

  </div>
) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">👗</div>
              <p className="text-lg font-medium">Try-on result will appear here</p>
            </div>
          </div>
        )}
      </div>



 



      {/* TOP HEAh-DER - Back to Products Button */}
      <div className="absolute md:top-16 md:left-52   z-20">
        <button
          onClick={()=>{

            onClose();
    window.location.reload();
          } 
}
          className="flex items-center gap-2 px-4 py-2  shadow-sm hover:shadow-md transition-all text-sm font-medium text-primary border border-primary"
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>
      </div>

      {/* LEFT SIDEBAR - Customize Outfit (Desktop) */}
      <div className="absolute top-32 left-52 z-20 hidden lg:block w-[294px] bg-white  shadow-lg p-5 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Customize Outfit</h3>
          </div>
          <p className="text-sm line-clamp-1 font-medium  text-gray-500">
            Try different colors, fabrics, and styles
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-5  border-b p-1 bg-[#F0E0E0] border-gray-200">
          <button
            onClick={() => setSelectedTab("colours")}
            className={`pb-2 text-sm w-[128px]  p-1 text-center  font-medium transition-all relative ${selectedTab === "colours"
              ? "text-primary  bg-white border-gray-900"
              : "text-primary hover:text-hoverBg"
              }`}
          >
            Colours
          </button>
          <button
            onClick={() => setSelectedTab("fabrics")}
            className={`pb-2 text-sm w-[128px] p-1 text-primary font-medium transition-all relative ${selectedTab === "fabrics"
              ? "text-gray-900  bg-white border-gray-900"
              : "text-gray-500 hover:text-hoverBg"
              }`}
          >
            Fabrics
          </button>
        </div>

        {/* Colors Tab */}
        {selectedTab === "colours" && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">
              Colour: <span className="uppercase text-gray-900">{selectedColor}</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => viewMode === "2D" && setSelectedColor(color.name)}
                  disabled={viewMode === "3D"}
                  className={`aspect-square rounded-lg transition-all ${selectedColor === color.name
                    ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
                    : "hover:scale-105 border border-gray-200"
                    } ${viewMode === "3D" ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{ backgroundColor: color.color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fabrics Tab */}
        {selectedTab === "fabrics" && (
          <div className="space-y-2">
            {fabricTypes.map((fabric) => (
              <button
                key={fabric.id}
                onClick={() => viewMode === "2D" && setSelectedFabric(fabric.id)}
                disabled={viewMode === "3D"}
                className={`w-full p-3 rounded-lg text-left transition-all ${selectedFabric === fabric.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
                  } ${viewMode === "3D" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="font-medium text-sm mb-1">{fabric.name}</div>
                <div
                  className={`text-xs ${selectedFabric === fabric.id ? "text-gray-300" : "text-gray-500"}`}
                >
                  {fabric.category} • {fabric.style}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="   pt-5 border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">View in 360</span>
            <button
              onClick={() => handleViewModeSwitch(viewMode === "2D" ? "3D" : "2D")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${viewMode === "3D" ? "bg-primary" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewMode === "3D" ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>

     


      </div>



<div className="bg-white  ml-52 shadow-sm border border-gray-200 p-4 w-[300px] grid grid-cols-2 gap-4 max-h-[calc(100vh-120px)] translate-y-[470px]">
  {/* Half Sleeve */}
  <div className="flex flex-col items-center">
    <img
      src="https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/halfsleeve_ldww1b.jpg"
      alt="Half sleeve blouse"
      className="w-28 h-28 object-cover rounded-lg mb-2 shadow-sm"
    />
    <button
      onClick={() => changeBlouse("half-sleeve")}
      disabled={!tryOnResult || isChangingBlouse}
      className={`
        w-full py-2 px-3 text-sm font-medium rounded-lg transition-all
        border border-gray-300
        ${selectedBlouse === "half-sleeve" ? "bg-primary text-white border-primary" : "bg-white text-gray-800 hover:bg-gray-50"}
        ${(!tryOnResult || isChangingBlouse) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        flex items-center justify-center gap-2
      `}
    >
      {isChangingBlouse && selectedBlouse === "half-sleeve" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        "Half Sleeve"
      )}
    </button>
  </div>

  {/* Full Sleeve */}
  <div className="flex flex-col items-center">
    <img
      src="https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/full_sleeve_harpuk.jpg"
      alt="Full sleeve blouse"
      className="w-28 h-28 object-cover rounded-lg mb-2 shadow-sm"
    />
    <button
      onClick={() => changeBlouse("full-sleeve")}
      disabled={!tryOnResult || isChangingBlouse}
      className={`
        w-full py-2 px-3 text-sm font-medium rounded-lg transition-all
        border border-gray-300
        ${selectedBlouse === "full-sleeve" ? "bg-primary text-white border-primary" : "bg-white text-gray-800 hover:bg-gray-50"}
        ${(!tryOnResult || isChangingBlouse) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        flex items-center justify-center
      `}
    >
      Full Sleeve
    </button>
  </div>

  {/* Sleeveless */}
  <div className="flex flex-col items-center">
    <img
      src="https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/sleeveless_zdraop.jpg"
      alt="Sleeveless blouse"
      className="w-28 h-28 object-cover rounded-lg mb-2 shadow-sm"
    />
    <button
      onClick={() => changeBlouse("sleeveless")}
      disabled={!tryOnResult || isChangingBlouse}
      className={`
        w-full py-2 px-3 text-sm font-medium rounded-lg transition-all
        border border-gray-300
        ${selectedBlouse === "sleeveless" ? "bg-primary text-white border-primary" : "bg-white text-gray-800 hover:bg-gray-50"}
        ${(!tryOnResult || isChangingBlouse) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        flex items-center justify-center
      `}
    >
      Sleeveless
    </button>
  </div>

  {/* Regular */}
  <div className="flex flex-col items-center">
    <img
      src="https://res.cloudinary.com/doiezptnn/image/upload/v1766411578/regular_iyn9zb.jpg"
      alt="Regular blouse"
      className="w-28 h-28 object-cover rounded-lg mb-2 shadow-sm"
    />
    <button
      onClick={() => changeBlouse("regular")}
      disabled={!tryOnResult || isChangingBlouse}
      className={`
        w-full py-2 px-3 text-sm font-medium rounded-lg transition-all
        border border-gray-300
        ${selectedBlouse === "regular" ? "bg-primary text-white border-primary" : "bg-white text-gray-800 hover:bg-gray-50"}
        ${(!tryOnResult || isChangingBlouse) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        flex items-center justify-center
      `}
    >
      Regular
    </button>
  </div>
</div>


      {/* RIGHT SIDEBAR - Scenes & Actions (Desktop) */}
      <div className="absolute top-32 right-52 z-20 hidden  lg:block w-[290px] scrollbar-none bg-white  shadow-lg p-5 max-h-[calc(100vh-120px)] overflow-y-auto">
        {/* Scenes Section */}
        {viewMode === "2D" && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-800">Scenes</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Backgrounds</p>

            <div className="grid  grid-cols-2 gap-2">
       {backgroundOptions.map((bg) => (
  <div key={bg.id}>
    <button
      onClick={() => changeBackground(bg.id)} // ✅ Make sure this is correct
      disabled={!tryOnResult || isChangingBackground}
      className={`relative cursor-pointer p-1  overflow-hidden transition-all ${
        selectedBackground === bg.id
          ? "ring-2 ring-gray-800 ring-offset-2 scale-105"
          : "hover:scale-105 border border-gray-200"
      } ${(!tryOnResult || isChangingBackground) ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="aspect-square">
        <img
          src={bg.image}
          alt={bg.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {isChangingBackground && selectedBackground === bg.id && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        </div>
      )}
    </button>
    
    {/* Label below image */}
    <p className="text-xs  font-medium text-center pt-1  text-gray-600">{bg.name}</p>
  </div>
))}

            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 ">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/products/${tryOnData?.productId}`);
              }}
              className="w-full bg-primary hover:bg-hoverBg text-white py-2.5 transition-all font-medium flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft size={16} className="rotate-180 " />
              VIEW PRODUCT
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={isLoading}
              className={`w-full py-2.5 cursor-pointer   transition-all font-medium flex  gap-4 text-sm ${isInWishlistState
                ? " text-primary pl-3 "
                : "bg-white border-2 justify-center border-primary text-primary"
                }`}
            >
              <Heart
                className={`w-5 h-5 ${isInWishlistState ? "fill-current text-red-600" : ""}`}
              />
              {isInWishlistState ? "Added to Wishlist" : " Add to Wishlist"}
            </button>

            <button
              onClick={() => toast.info("Share feature coming soon!")}
              className="w-full bg-white  text-primary  py-2.5  transition-all font-medium flex items-center pl-3 gap-2 text-sm"
            >
              <img src={share_ic} alt="" />
              <span className="pl-3">Share my look</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE RESPONSIVE - Bottom Sheet - FIXED */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl max-h-[60vh] overflow-y-auto">
        {/* Mobile Handle */}
        <div className="sticky top-0 bg-white pt-2 pb-3 flex justify-center border-b border-gray-200 z-10">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* View 360 Toggle */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">View in 360</span>
            <button
              onClick={() => handleViewModeSwitch(viewMode === "2D" ? "3D" : "2D")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${viewMode === "3D" ? "bg-primary" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewMode === "3D" ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Customize Section */}
        <div className="px-4 py-4">
          <h3 className="text-sm font-semibold mb-3">Customize Outfit</h3>

          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab("colours")}
              className={`pb-2 text-sm font-medium ${selectedTab === "colours"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
                }`}
            >
              Colours
            </button>
            <button
              onClick={() => setSelectedTab("fabrics")}
              className={`pb-2 text-sm font-medium ${selectedTab === "fabrics"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
                }`}
            >
              Fabrics
            </button>
          </div>

          {/* Colors */}
          {selectedTab === "colours" && (
            <div>
              <p className="text-xs text-gray-600 mb-2">
                Colour: <span className="uppercase font-medium">{selectedColor}</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`aspect-square rounded-lg ${selectedColor === color.name
                      ? "ring-2 ring-gray-800 ring-offset-2"
                      : "border border-gray-200"
                      }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fabrics */}
          {selectedTab === "fabrics" && (
            <div className="space-y-2">
              {fabricTypes.map((fabric) => (
                <button
                  key={fabric.id}
                  onClick={() => setSelectedFabric(fabric.id)}
                  className={`w-full p-3 rounded-lg text-left ${selectedFabric === fabric.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 border border-gray-200"
                    }`}
                >
                  <div className="text-sm font-medium">{fabric.name}</div>
                  <div
                    className={`text-xs ${selectedFabric === fabric.id ? "text-gray-300" : "text-gray-500"}`}
                  >
                    {fabric.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scenes Section - Only in 2D */}
        {viewMode === "2D" && (
          <div className="px-4 py-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3">Scenes</h3>
            <div className="grid grid-cols-2 gap-2">
              {backgroundOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => changeBackground(bg.id)}
                  disabled={!tryOnResult || isChangingBackground}
                  className={`relative rounded-lg overflow-hidden ${selectedBackground === bg.id
                    ? "ring-2 ring-gray-800 ring-offset-2"
                    : "border border-gray-200"
                    } ${(!tryOnResult || isChangingBackground) ? "opacity-50" : ""}`}
                >
                  <div className="aspect-square">
                    <img src={bg.image} alt={bg.name} className="w-full h-full object-cover" />
                  </div>
                  {isChangingBackground && selectedBackground === bg.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-2 pb-6">
          <button
            onClick={() => navigate(`/product/${tryOnData?.productId}`)}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium text-sm"
          >
            VIEW PRODUCT
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleToggleWishlist}
              disabled={isLoading}
              className={`py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${isInWishlistState
                ? "bg-red-50 border-2 border-red-500 text-red-500"
                : "border-2 border-gray-300 text-gray-700"
                }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlistState ? "fill-current" : ""}`} />
              Wishlist
            </button>

            <button
              onClick={() => toast.info("Share feature coming soon!")}
              className="py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default TryOnPreviewModal;


