
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { tryOnProductService } from "../../../services/tryOnProductService.js";
import { ArrowLeft, User, Upload, X, CheckCircle, AlertCircle, Camera, RefreshCcw } from "lucide-react";
import step1img from "../../../assets/TryOn/step1img.svg";
import Tickic from "../../../assets/TryOn/tick_ic.svg";
import black_warnIc from "../../../assets/TryOn/black_warnIc.svg";
import red_warnIc from "../../../assets/TryOn/red_warnIc.svg";
import right_ic from "../../../assets/TryOn/right_ic.svg";
import rightHoverArrow from "../../../assets/TryOn/rightHoverArrow.svg";
import { auth } from "../../../config";
import { profileService } from "../../../services/profileService.js";
// models

import model1 from "../../../assets/TryOn/model1.png";
import model2 from "../../../assets/TryOn/model2.png";
import model3 from "../../../assets/TryOn/young.jpg";
import model4 from "../../../assets/TryOn/model4.jpg";

const ProfilePhotoSelector = ({ onSelect }) => {
  const [firebaseImage, setFirebaseImage] = useState(
    "https://res.cloudinary.com/doiezptnn/image/upload/v1760530680/model2_eh2sqf.jpg"
  );
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-b-red-700 rounded-full"></div>
      </div>
    );
  }

  if (!firebaseImage) return null;

  return (
    <button
      onClick={() => onSelect(firebaseImage)}
      className="w-full border border-gray-200 rounded-xl p-4 hover:border-primary transition-all bg-white hover:bg-red-50"
    >
      <div className="flex items-center gap-4">
        <img
          src={firebaseImage}
          alt="Saved model"
          className="w-16 h-20 object-cover rounded-md border border-gray-200"
        />
        <div className="text-left flex-1">
          <div className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            <span className="font-medium text-gray-800">Use My Saved Photo</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Use your uploaded model photo</p>
          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-2">
            ✓ Ready to use
          </span>
        </div>
      </div>
    </button>
  );
};

const UploadSelfieModal = ({
  isOpen,
  onClose,
  onNext,
  garmentImage,
  garmentName,
  isSaree,
  is3D = false,
  tryOnData,
}) => {
  const currentUser = auth.currentUser;
  console.log("######### User details:", currentUser);
  console.log("############ User ID:", currentUser?.uid);

  console.log("Product ID:", tryOnData?.productId);
  console.log("Full tryOnData:", tryOnData);

  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [firebaseImage, setFirebaseImage] = useState(null);
  const [loadingFirebaseImage, setLoadingFirebaseImage] = useState(true);
  const [imageSource, setImageSource] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showModelPreview, setShowModelPreview] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);
  const [isStoringData, setIsStoringData] = useState(false);

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const navigate = useNavigate();
  // ⭐ Conditional based on garment type

  const [userHasTryOn, setUserHasTryOn] = useState(false);
  const [userTryOnImage, setUserTryOnImage] = useState(null);

  const resolveMyModelType = () => {
    // Combine all available signals so a weak dressType does not override a strong garment title.
    const rawType = [
      tryOnData?.dressType,
      tryOnData?.outfitType,
      garmentName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .trim();

    if (/\bsaree\b|\bsarees\b|\bsari\b/.test(rawType)) return "saree";
    if (/\blehenga\b|\blehengas\b|\blehanga\b/.test(rawType)) return "lehenga";
    if (/\banarkali\b|\banarkalis\b/.test(rawType)) return "anarkali";
    if (/\bsharara\b|\bshararas\b/.test(rawType)) return "sharara";

    // Profile currently stores one topwear model bucket for kurti/kurta style products.
    return "kurti";
  };

  const mappedMyModelType = resolveMyModelType();

  useEffect(() => {
    const checkUserTryOn = async () => {
      if (!isOpen) return;

      try {
        const savedImage = await profileService.getTryOnByDressType(mappedMyModelType);
        if (savedImage) {
          setUserHasTryOn(true);
          setUserTryOnImage(savedImage);
        } else {
          setUserHasTryOn(false);
          setUserTryOnImage(null);
        }
      } catch (error) {
        console.error("Error checking user try-on:", error);
      }
    };

    checkUserTryOn();
  }, [isOpen, mappedMyModelType]);

  const handleUseMyModel = () => {
    if (!currentUser) {
      alert("Please log in to continue");
      return;
    }

    if (!userTryOnImage) {
      alert(`No saved ${mappedMyModelType} model found. Please create it in My Models.`);
      return;
    }

    setSelectedModel({
      image: userTryOnImage,
      name: `My Model (${mappedMyModelType.charAt(0).toUpperCase() + mappedMyModelType.slice(1)})`,
    });

    // Open the same preview page used by manual model selection.
    setStep(null);
    setShowModelSelector(false);
    setShowModelPreview(true);
  };

  const getModelsForDressType = (dressType) => {
    // Normalize dress type to lowercase and remove extra spaces
    const normalizedType = dressType?.toLowerCase().trim();





    // Define all model arrays
    const lehengamodels = [
      {
        modelName: "Tan Petite Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774811392/Tan_petite_curvy_no8gp9.png",
      },
      {
        modelName: "Dusky Mid-height Fit",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774811395/Dusky_mid-height_fit_ihazii.png",
      },

      {
        modelName: "Light-skinned Tall Athletic",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774811402/Light-skinned_tall_athletic_or2kyh.png",
      },
      {
        modelName: "Fair Tall Slim",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774811407/Fair_tall_slim_qs9zs7.png",
      },


    ]
    const sareeModels = [
      {
        modelName: "Tan Petite Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774807971/Tan_petite_curvy_o8vqjp.png",
      },
      {
        modelName: "Light-skinned Mid-height Fit",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774807978/Light-skinned_mid-height_fit_g0njuy.png",
      },
      {
        modelName: "Fair Tall Slender",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774807970/Fair_tall_slender_j039ez.png",
      },
      {
        modelName: "Dusky Tall Lean",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774807970/Dusky_tall_lean_ruqqfe.png",
      },
    ];

    const universalModels = [
      {
        modelName: "Tan Tall Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809383/Tan_tall_curvy_puye9d.png",
      },
      {
        modelName: "Dusky Petite Lean",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809381/Dusky_petite_lean_jwtujk.png",
      },
      {
        modelName: "Fair Tall Athletic",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809377/Fair_tall_athletic_tuzlck.png",
      },
      {
        modelName: "Olive Mid-height Slim",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809371/Olive_mid-height_slim_aqvijk.png",
      },
    ];

    const shararaModels = [
      {
        modelName: "Tan Tall Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809383/Tan_tall_curvy_puye9d.png",
      },
      {
        modelName: "Dusky Petite Lean",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809381/Dusky_petite_lean_jwtujk.png",
      },
      {
        modelName: "Fair Tall Athletic",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809377/Fair_tall_athletic_tuzlck.png",
      },
      {
        modelName: "Olive Mid-height Slim",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809371/Olive_mid-height_slim_aqvijk.png",
      },
    ];

    const anarkaliModels = [
      {
        modelName: "Tan Tall Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809383/Tan_tall_curvy_puye9d.png",
      },
      {
        modelName: "Dusky Petite Lean",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809381/Dusky_petite_lean_jwtujk.png",
      },
      {
        modelName: "Fair Tall Athletic",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809377/Fair_tall_athletic_tuzlck.png",
      },
      {
        modelName: "Olive Mid-height Slim",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809371/Olive_mid-height_slim_aqvijk.png",
      },
    ];

    const pretModels = [
      {
        modelName: "Dusky & Curvy",
        modelimg: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971710/pret2_jbuvlf.png",
      },
    ];

    const fusionModels = [
      {
        modelName: "Dusky & Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1763971758/fusion1_rexxbx.png",
      },
    ];

    const kurthaModels = [
      {
        modelName: "Tan Tall Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809383/Tan_tall_curvy_puye9d.png",
      },
      {
        modelName: "Dusky Petite Lean",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809381/Dusky_petite_lean_jwtujk.png",
      },
      {
        modelName: "Fair Tall Athletic",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809377/Fair_tall_athletic_tuzlck.png",
      },
      {
        modelName: "Olive Mid-height Slim",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1774809371/Olive_mid-height_slim_aqvijk.png",
      },

    ];

    // Map dress types to their corresponding models
    switch (normalizedType) {
      case "saree":
        return sareeModels;

      case "sharara":
      case "shararas":
        return shararaModels;

      case "anarkali":
      case "anarkalis":
        return anarkaliModels;

      case "pret":
      case "prêt":
        return pretModels;

      case "fusion":
        return fusionModels;

      case "kurta":
      case "kurta set":
      case "kurta sets":
      case "kurta-sets":
      case "kurtaset":
        return kurthaModels;

      case "lehenga":
        return lehengamodels
      case "wedding": // Wedding uses lehenga models
        return universalModels;

      // Default for other dress types (kurta sets, etc.)
      default:
        return universalModels;
    }
  };

  const models = getModelsForDressType(tryOnData?.dressType || "lehenga");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedImage(null);
      setImageSource("");
      setUploadError("");
      setIsUploading(false);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const startCamera = async () => {
    setUploadError("");

    // Check if browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = window.isSecureContext
        ? "Your browser does not support camera access."
        : "Camera access requires a secure connection (HTTPS). Please try using HTTPS or localhost.";
      setUploadError(errorMsg);
      console.error("Camera access not supported:", errorMsg);
      setStep(5);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1024 },
          height: { ideal: 1024 },
          aspectRatio: { ideal: 0.75 }
        }
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn("Retrying with simple constraints...");
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(mediaStream);
      setStep(6);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setUploadError("Could not access camera. Please ensure you have granted permission.");
      setStep(5);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Mirror if using front camera usually
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      stopCamera();

      setStep(3);
      setIsUploading(true);
      setUploadError("");

      try {
        const cloudinaryUrl = await uploadToCloudinary(file);
        setSelectedImage(cloudinaryUrl);
        setImageSource("camera");

        const isValid = await validateImage(cloudinaryUrl);
        setStep(isValid ? 4 : 5);
      } catch {
        setUploadError("Failed to upload captured image.");
        setStep(5);
      } finally {
        setIsUploading(false);
      }
    }, "image/jpeg");
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "tryon_unsigned");
    data.append("cloud_name", "doiezptnn");

    const res = await fetch("https://api.cloudinary.com/v1_1/doiezptnn/image/upload", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    if (!json.secure_url) throw new Error("Cloudinary upload failed");
    return json.secure_url;
  };

  const validateImage = async (imageUrl) => {
    try {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      return img.width >= 400 && img.height >= 600;
    } catch {
      return false;
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setUploadError("Please select a valid image (JPEG, PNG, JPG).");
      setStep(5);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size exceeds 2MB. Please choose a smaller image.");
      setStep(5);
      return;
    }

    setStep(3);
    setIsUploading(true);
    setUploadError("");

    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      setSelectedImage(cloudinaryUrl);
      setImageSource("upload");

      const isValid = await validateImage(cloudinaryUrl);
      setStep(isValid ? 4 : 5);
    } catch {
      setUploadError("Failed to upload image. Please try again.");
      setStep(5);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = async () => {
    console.log("🔘 Upload Continue clicked");

    if (!currentUser) {
      alert("Please log in to continue");
      return;
    }

    if (selectedImage && garmentImage) {
      console.log("✅ Passing uploaded image to parent");

      setIsStoringData(true);
      try {

        await tryOnProductService.storeTryOnData({
          userId: currentUser.uid,
          tryOnData: tryOnData,
          productId: tryOnData?.productId,
          modelImage: selectedImage,
          garmentImage: garmentImage,
          is3D: is3D,
          modelName: "Uploaded Selfie"
        });
        console.log("✅ Try-on data stored successfully");
      } catch (error) {
        console.error("❌ Failed to store try-on data:", error);
      } finally {
        setIsStoringData(false);
      }
      onNext({
        modelImage: selectedImage,
        garmentImage,
        is3D
      });
    }
  };

  const handleReupload = () => {
    setStep(2);
    setSelectedImage(null);
    setUploadError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center  p-4">
      <button
        onClick={() => {
          if (showModelSelector || showModelPreview) {
            setShowModelSelector(false);
            setShowModelPreview(false);
            setSelectedModel(null);
          }
          onClose();
        }}
        className="absolute top-13 right-12 text-gray-600 hover:text-gray-800  p-1 shadow-sm"
      >
        <X size={22} />
      </button>

      {/* Step 1: Initial Selection */}
      {step === 1 && (
        <div className="flex flex-col md:flex-row bg-white w-full md:w-[838px] md:h-[564px] max-h-[90vh] overflow-y-auto md:overflow-hidden rounded-[20px] shadow-2xl relative">

          {/* CLOSE BUTTON (Over Image on Mobile) */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/20 rounded-full transition-all"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* TOP IMAGE SECTION (Mobile) / LEFT (Desktop) */}
          <div className="w-full md:w-[400px] shrink-0">
            <img
              src={step1img}
              alt="Model Preview"
              className="w-full h-[280px] md:h-full object-cover md:rounded-l-[20px]"
            />
          </div>

          {/* CONTENT SECTION */}
          <div className="flex flex-col p-6 w-full relative h-full">

            {/* HEADINGS */}
            <h2 className="text-[28px] font-bold text-gray-900 leading-tight">Try-On</h2>
            <p className="text-gray-600 text-[15px] font-semibold mb-6 mt-1 opacity-80">Let's go shopping</p>

            {/* SELECTED DRESS CARD */}
            <div className="w-full rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100 p-3 mb-8">
              <div className="flex justify-between items-center bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-2 rounded-lg mb-4">
                <p className="text-[11px] font-bold tracking-wide text-[#16A34A]">SELECTED DRESS</p>
                <div className="bg-[#16A34A] rounded-full text-white w-[18px] h-[18px] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div className="flex gap-4 items-center px-1 pb-1">
                <img src={garmentImage} className="h-[52px] w-[52px] rounded-lg object-cover shadow-sm bg-gray-50" alt="Garment" />
                <p className="text-[14px] font-medium text-gray-800 line-clamp-2 pr-2">{garmentName}</p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-3.5 mt-auto mb-4">
              <button
                onClick={() => setStep(2)}
                className="w-full text-white py-[14px] rounded-[10px] font-medium text-[15px] hover:opacity-95 transition-all shadow-sm"
                style={{ background: 'var(--villy-primary, #33022F)' }}
              >
                Upload a picture
              </button>

              <button
                onClick={() => {
                  setShowModelSelector(true);
                  setStep(null);
                }}
                className="w-full bg-white py-[14px] rounded-[10px] font-medium text-[15px] transition-all"
                style={{ border: '1.5px solid var(--villy-primary, #33022F)', color: 'var(--villy-primary, #33022F)' }}
              >
                Select a model
              </button>

              <button
                onClick={handleUseMyModel}
                disabled={!userHasTryOn || isStoringData}
                className="w-full bg-white py-[14px] rounded-[10px] font-medium text-[15px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ border: '1.5px solid var(--villy-primary, #33022F)', color: 'var(--villy-primary, #33022F)' }}
              >
                {isStoringData
                  ? 'Loading My Model...'
                  : `My Model (${mappedMyModelType.charAt(0).toUpperCase() + mappedMyModelType.slice(1)})`}
              </button>
            </div>

            {/* FOOTNOTE */}
            <p className="text-[11.5px] text-gray-500 leading-snug px-1">
              Hey! To use the 2D TRY ON feature, just upload or take a selfie or <br />
              Press <button onClick={onClose} className="font-bold cursor-pointer inline" style={{ color: 'var(--villy-primary, #33022F)' }}>SKIP</button> to check out the models you can try on!
            </p>

          </div>
        </div>
      )}

      {/* Step 2: Upload Instructions */}
      {step === 2 && (
        <div className="p-5 md:p-8 flex flex-col items-center bg-white w-full md:w-[818px] max-w-[95vw] md:max-w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto relative rounded-[20px] shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors duration-200"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <h2 className="text-[17px] md:text-xl font-bold text-gray-900 mt-2 text-center max-w-[280px] md:max-w-none px-4">
            Upload your full photo for the best try-on experience
          </h2>
          <p className="text-[16px] md:text-xl text-gray-700 font-medium mt-1 mb-5 text-center">— we'll do the rest!</p>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-start w-full gap-5 md:gap-8 pb-4">
            {/* Example Image */}
            <div className="w-full max-w-[220px] md:max-w-[240px] shrink-0">
              <img
                src="https://res.cloudinary.com/doiezptnn/image/upload/v1760530680/model2_eh2sqf.jpg"
                alt="Example"
                className="w-full h-[320px] md:h-[400px] object-cover rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100"
              />
            </div>

            {/* Instructions + Upload */}
            <div className="flex flex-col w-full max-w-[340px] md:max-w-[360px] shrink-0 px-2 md:px-0 mt-2 md:mt-0">
              {/* Instruction Box */}
              <div
                className="rounded-xl p-5 w-full bg-[#FFF8F4] mb-3"
                style={{
                  backgroundImage: `
              repeating-linear-gradient(0deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px),
              repeating-linear-gradient(90deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px),
              repeating-linear-gradient(180deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px),
              repeating-linear-gradient(270deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px)
            `,
                  backgroundSize: "2px 100%, 100% 2px, 2px 100%, 100% 2px",
                  backgroundPosition: "0 0, 0 0, 100% 0, 0 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <h3 className="font-bold text-gray-900 mb-3 text-sm md:text-base">
                  INSTRUCTIONS:
                </h3>

                <ul className="space-y-2 mt-2 text-[12.5px] md:text-sm">
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] font-medium leading-snug">
                      • Stand straight and face forward
                    </span>
                  </li>
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] font-medium leading-snug">
                      • Maintain good lighting and contrast
                    </span>
                  </li>
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] font-medium leading-snug">
                      • Avoid filters or busy backgrounds
                    </span>
                  </li>
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] font-medium leading-snug">
                      • Keep file size under 2MB
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-[11px] md:text-sm text-gray-500 font-medium mb-5 px-1 leading-snug text-center md:text-left">
                Your photos are never stored in our system. We respect your privacy and are committed to protecting your personal data.
              </p>

              {/* Upload Button */}
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="uploadInput"
              />
              <label
                htmlFor="uploadInput"
                className="w-full text-white py-3.5 text-center font-semibold rounded-lg cursor-pointer transition-all shadow-sm mb-3 text-[14px]"
                style={{ background: 'var(--villy-primary, #33022F)' }}
              >
                Click to upload
              </label>

              {/* Camera Button */}
              <button
                onClick={startCamera}
                className="w-full border-2 py-3 font-semibold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 text-[14px]"
                style={{ borderColor: 'var(--villy-primary, #33022F)', color: 'var(--villy-primary, #33022F)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--villy-primary, #33022F)'; e.currentTarget.style.color = '#FFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--villy-primary, #33022F)'; }}
              >
                <Camera size={18} strokeWidth={2.5} />
                Use camera
              </button>

              <button
                onClick={() => {
                  setUploadError("");
                  setStep(1);
                }}
                className="w-fit mt-4 border border-gray-300 text-gray-700 py-2.5 px-5 rounded-md font-medium transition-colors hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft size={16} />
                  BACK
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Uploading */}
      {step === 3 && (
        <div className="p-6 md:p-8 flex flex-col w-full max-w-md rounded-xl shadow-lg bg-white items-center justify-center overflow-y-auto max-h-[90vh] md:max-h-[85vh] text-center min-h-[400px]">
          <div className="relative bg-gray-100 rounded-xl w-full max-w-sm overflow-hidden mb-6">
            <img
              src={selectedImage}
              alt="Uploading"
              className="w-full h-64 object-contain opacity-50"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/40">
              <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mb-3"></div>
              <p className="text-white font-semibold text-lg">Uploading</p>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-left w-full max-w-sm">
            <p className="font-semibold text-red-800 mb-2">Please follow the below instructions</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Keep file size under 2MB</li>
              <li>• Ensure image is clear and not pixelated</li>
              <li>• Maintain good lighting and contrast</li>
              <li>• Keep background clean or neutral</li>
            </ul>
          </div>
          <button className="w-full max-w-sm bg-primary text-white py-3 rounded-lg font-medium mt-5 opacity-60 cursor-not-allowed">
            CONTINUE
          </button>
          <button className="w-full max-w-sm border border-gray-300 py-3 rounded-lg mt-3 text-gray-700 opacity-60 cursor-not-allowed">
            RE-UPLOAD
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="p-6 md:p-8 flex flex-col w-full max-w-md rounded-xl shadow-lg bg-white items-center justify-center overflow-y-auto max-h-[90vh] md:max-h-[85vh] text-center">
          <img
            src={selectedImage}
            alt="Success"
            className="w-full max-w-sm h-64 object-contain shadow-md mb-4"
          />
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg mb-5 w-full">
            <p className="text-green-700 font-normal text-center text-sm">
              Image uploaded successfully
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="w-full max-w-sm bg-primary text-white py-3  font-medium hover:bg-red-800"
          >
            CONTINUE
          </button>
          <button
            onClick={handleReupload}
            className="w-full max-w-sm border border-gray-300 text-gray-700 py-3  mt-3 hover:border-red-700"
          >
            RE-UPLOAD
          </button>
          <p className="text-xs text-gray-600 mt-4">
            Your photos are never stored in our system. We respect your privacy and are committed to
            protecting your personal data.
          </p>
        </div>
      )}

      {/* Step 5: Error */}
      {step === 5 && (
        <div className="p-6 md:p-8 flex flex-col w-full max-w-md rounded-xl shadow-lg bg-white items-center justify-center overflow-y-auto max-h-[90vh] md:max-h-[85vh] text-center">
          <div className=" w-full max-w-sm ">
            <img
              src={selectedImage}
              alt="Error"
              className="w-full max-w-sm h-64 object-cover   backdrop-blur-3xl blur-xs  "
            />
          </div>
          <div className="  mt-3    text-left w-full max-w-lg ml-28  ">
            <div className="flex items-center gap-4  ">
              <img src={red_warnIc} className="h-5" alt="" />
              <p className="text-red-600    text-lg ">
                {uploadError || "Image you uploaded was blurred or pixelated"}
              </p>
            </div>
            <div className="flex  -ml-0.5 items-center mt-4 gap-3">
              <img src={black_warnIc} className="h-6" alt="" />
              <p className="font-semibold text-lg text-outfit ">
                {" "}
                Please follow the below instructions{" "}
              </p>
            </div>
            <ul className="text-md ml-2 text-black  text-outfit  mt-3 space-y-1">
              <li>• Keep file size under 2MB</li>
              <li>• Ensure image is clear and not pixelated</li>
              <li>
                • Maintain <span className="text-primary"> good lighting and contrast </span>{" "}
              </li>
              <li>• Keep background clean or neutral</li>
            </ul>
          </div>
          <button
            onClick={handleReupload}
            className="w-full max-w-sm bg-primary text-white py-3 rounded-lg font-medium mt-5 hover:bg-red-800"
          >
            RE-UPLOAD
          </button>
          <p className="text-xs text-gray-600 mt-4">
            Your photos are never stored in our system. We respect your privacy and are committed to
            protecting your personal data.
          </p>
        </div>
      )}

      {/* Step 6: Camera Interface */}
      {step === 6 && (
        <div className="p-4 bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col items-center relative overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
          <button
            onClick={() => {
              stopCamera();
              setStep(2);
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <X size={24} />
          </button>

          <h3 className="text-lg font-bold mb-4">Take a Selfie</h3>

          <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }} // Mirror effect for selfie
            />
            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none rounded-lg" />
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => {
                stopCamera();
                setStep(2);
              }}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-800 transition flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Capture
            </button>
          </div>

          <p className="text-[10px] text-gray-500 mt-4 text-center">
            Position your face within the frame and ensure good lighting for the best results.
          </p>
        </div>
      )}

      {/* Model Selector - Image 1 UI */}
      {showModelSelector && !showModelPreview && (
        <div className="bg-white w-full max-w-4xl relative shadow-lg overflow-y-auto max-h-[90vh] md:max-h-[85vh] rounded-xl">
          {/* Close Button */}
          <button
            onClick={() => {
              setShowModelSelector(false);
              setStep(1);
            }}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors duration-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-base font-semibold mb-1">
                Select a model <span className="text-red-600">*</span>
              </h2>
              <p className="text-sm text-gray-600">You can only choose one model</p>
            </div>

            {/* VILLY STATIC MODELS */}
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {models.map((model, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedModel({
                        image: model.modelimg,
                        name: model.modelName,
                      });
                    }}
                    className="cursor-pointer relative"
                  >
                    <img
                      src={model.modelimg}
                      alt={model.modelName}
                      className="w-full h-[240px] object-contain rounded"
                    />
                    <p className="text-center mt-2 text-sm font-medium text-gray-700">
                      {model.modelName}
                    </p>

                    {selectedModel?.name === model.modelName && (
                      <div className="absolute top-0 left-0 w-full h-[240px] border-[3px] pointer-events-none rounded" style={{ borderColor: 'var(--villy-primary, #33022F)' }}>
                        <div className="absolute top-2 left-2 bg-white px-2 py-1 flex items-center gap-1 rounded">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--villy-primary, #33022F)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span className="text-xs font-medium" style={{ color: 'var(--villy-primary, #33022F)' }}>SELECTED</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Checkbox */}
            {/* <div className="flex items-start gap-3 mb-6"> */}
              {/* <input */}
                {/* type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="mt-1 w-4 h-4" */}
                {/* style={{ accentColor: 'var(--villy-primary, #33022F)' }} */}
              {/* /> */}
              {/* <p className="text-sm text-gray-700">
                Make it default model for all future try ons (you can always change the model in the
                settings)
              </p> */}
            {/* </div> */}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setShowModelSelector(false);
                  setStep(1);
                }}
                className="flex items-center gap-2 text-gray-700 border border-gray-300 px-6 py-2 rounded hover:bg-gray-50 transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--villy-primary, #33022F)'; e.currentTarget.style.color = 'var(--villy-primary, #33022F)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}
              >
                <ArrowLeft size={16} /> BACK
              </button>

              <button
                onClick={() => {
                  if (!selectedModel) {
                    alert("Please select a model to continue");
                    return;
                  }
                  setShowModelPreview(true);
                  setShowModelSelector(false);
                }}
                disabled={!selectedModel}
                className={`px-8 py-2 rounded font-medium transition-colors ${selectedModel
                  ? "text-white hover:opacity-90"
                  : "bg-[#E5E5E5] text-gray-400 cursor-not-allowed"
                  }`}
                style={selectedModel ? { background: 'var(--villy-primary, #33022F)' } : {}}
              >
                NEXT →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Preview - Image 2 UI */}

      {showModelPreview && selectedModel && (
        <div className="p-6 sm:p-12 w-full bg-white md:max-w-[818px] mx-auto relative overflow-y-auto max-h-[90vh] md:max-h-[85vh] rounded-xl shadow-lg">
          {/* Close Button */}
          <button
            onClick={() => {
              setShowModelPreview(false);
              setShowModelSelector(true);
            }}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors duration-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* ---------- Two cards side-by-side (mobile stacks) ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* ---------- Garment Card ---------- */}
            <div className="border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="h-64 md:h-72 flex items-center justify-center bg-gray-50 rounded-md mb-3 overflow-hidden">
                <img
                  src={garmentImage}
                  alt="Selected dress"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-[#EEF7F0] border border-[#B8E3C6] px-3 py-2 flex items-center justify-between mb-3 rounded">
                <span className="text-sm font-semibold text-[#15912C]">SELECTED DRESS</span>
                <img src={Tickic} className="h-4 w-4" alt="check" />
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{garmentName}</p>
            </div>

            {/* ---------- Model Card ---------- */}
            <div className="border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="h-64 md:h-72 flex items-center justify-center bg-gray-50 rounded-md mb-3 overflow-hidden">
                <img
                  src={selectedModel.image}
                  alt="Selected model"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-[#EEF7F0] border border-[#B8E3C6] px-3 py-2 flex items-center justify-between mb-3 rounded">
                <span className="text-sm font-semibold text-[#15912C]">SELECTED MODEL</span>
                <img src={Tickic} className="h-4 w-4" alt="check" />
              </div>
              <p className="text-sm text-gray-700 text-center">{selectedModel.name}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4">
            {/* Select Another Dress */}
            <button
              onClick={() => {
                onClose();
                navigate(`/products/${tryOnData?.productId}`);
              }}
              className="w-full text-white py-2.5 text-sm font-medium hover:opacity-90 transition rounded-md"
              style={{ background: 'var(--villy-primary, #33022F)' }}
            >
              Select Another Dress
            </button>

            {/* Select Another Model */}
            <button
              onClick={() => {
                setShowModelPreview(false);
                setShowModelSelector(true);
              }}
              className="w-full text-white py-2.5 text-sm font-medium hover:opacity-90 transition rounded-md"
              style={{ background: 'var(--villy-primary, #33022F)' }}
            >
              Select Another Model
            </button>
          </div>

          {/* ---------- Continue button (bottom-right) ---------- */}
          <div className="flex justify-center md:justify-end mt-6 md:mt-8">
            <button
              onClick={async () => {
                console.log("🔘 Model Preview Continue clicked");

                if (!selectedModel) {
                  alert("Please select a model to continue");
                  return;
                }

                console.log("✅ Passing model to parent:", selectedModel.name);

                // Store try-on data in Firestore
                if (currentUser?.uid) {
                  setIsStoringData(true);
                  try {
                    await tryOnProductService.storeTryOnData({
                      userId: currentUser.uid,
                      tryOnData: tryOnData,
                      productId: tryOnData?.productId,
                      modelImage: selectedModel.image,
                      garmentImage: garmentImage,
                      is3D: is3D,
                      modelName: selectedModel.name
                    });
                    console.log("✅ Try-on data stored successfully");
                  } catch (error) {
                    console.error("❌ Failed to store try-on data:", error);
                  } finally {
                    setIsStoringData(false);
                  }
                }

                // ✅ Call onNext ONCE
                onNext({
                  modelImage: selectedModel.image,
                  garmentImage,
                  is3D,
                  modelName: selectedModel.name,
                });
              }}
              disabled={isStoringData}
              className={`group flex items-center justify-center gap-2 px-4 py-3 md:py-2 w-full md:w-auto bg-white border border-gray-700 text-gray-700 rounded text-sm font-medium transition-all ${isStoringData
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#33022F] hover:border-[#33022F] hover:text-white'
                }`}
            >
              {isStoringData ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                  Storing...
                </>
              ) : (
                <>
                  CONTINUE
                  <img src={right_ic} alt="" className="h-4 w-4 group-hover:hidden" />
                  <img src={rightHoverArrow} alt="" className="h-4 w-4 hidden group-hover:inline" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
    // </div>
  );
};

export default UploadSelfieModal;