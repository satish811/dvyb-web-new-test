import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { tryOnProductService } from "../../../services/tryOnProductService.js";import { useAuth } from "../../../context/AuthContext";

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
  const { userCollection } = useAuth();
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
  const [userProfilePhoto, setUserProfilePhoto] = useState(null); // ⭐ NEW: Raw profile photo
  const [useUserModel, setUseUserModel] = useState(false); // Toggle state
  const [availableUserModels, setAvailableUserModels] = useState([]); // Store all available user models

  useEffect(() => {
    const checkUserData = async () => {
      if (!isOpen) return;

      try {
        // 1. Fetch User Profile (Raw Selfie)
        const profile = await profileService.getProfile(userCollection);
        if (profile?.photoUrl) {
          console.log("✅ User profile photo found:", profile.photoUrl);
          setUserProfilePhoto(profile.photoUrl);
          setUseUserModel(true); // Default to user model
        }

        // 2. Fetch Previous Try-On (Optional, keep for backward compatibility if needed)
        if (tryOnData?.dressType) {
          const savedImage = await profileService.getTryOnByDressType(tryOnData.dressType, userCollection);
          if (savedImage) {
            setUserHasTryOn(true);
            setUserTryOnImage(savedImage);
            // If no profile photo, maybe default to this? But profile photo is preferred.
            if (!profile?.photoUrl) setUseUserModel(true);
          } else {
            setUserHasTryOn(false);
            setUserTryOnImage(null);
          }
        }
      } catch (error) {
        console.error("Error checking user data:", error);
      }
    };

    checkUserData();
  }, [isOpen, tryOnData]);

  const getModelsForDressType = (dressType) => {
    // Normalize dress type to lowercase and remove extra spaces
    const normalizedType = dressType?.toLowerCase().trim();





    // Define all model arrays
    const lehengamodels = [
      // {
      // modelName: "Model 1",
      // modelimg:
      //   "https://res.cloudinary.com/doiezptnn/image/upload/v1766055534/model10_cisbwy.jpg",
      // },
      {
        modelName: "Model",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1766055352/model12_nvdjir.jpg",
      },

      // {
      //      modelName: "Model 3",
      // modelimg:
      //   "https://res.cloudinary.com/doiezptnn/image/upload/v1766055352/model11_k09xmr.jpg",
      // },
      // {
      //      modelName: "Model 4",
      // modelimg:
      //   "https://res.cloudinary.com/doiezptnn/image/upload/v1766055352/model13_dvsv7d.jpg",
      // },


    ]
    const sareeModels = [
      // {
      //   modelName: "Model 1",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1765431989/model5_itixab.jpg",
      // },
      {
        modelName: "Model 2",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1765348065/model1_psruws.jpg",
      },
      // {
      //   modelName: "Model 3",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1765957672/1_Fair_Black_wavy_medium_average_i20rtx.png",
      // },
      // {
      //   modelName: "Model 4",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1765958038/model_1_mec4ki.png",
      // },
    ];

    const universalModels = [
      // {
      //   modelName: "Fair & Slim",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png",
      // },
      {
        modelName: "Dusky & Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1763188482/ChatGPT_Image_Nov_15_2025_12_04_25_PM_cyygt0.png",
      },
      // {
      //   modelName: "Wheatist & Athletic",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763188139/lehenga3_yksavv.jpg",
      // },
      // {
      //   modelName: "Medium",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763188139/lehenga2_sat3wm.jpg",
      // },
    ];

    const shararaModels = [
      // {
      //   modelName: "Fair & Slim",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763978924/sharara3_opiohp_12c9c7.jpg",
      // },
      {
        modelName: "Dusky & Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1763978942/bvfo12yqx2bwfjjbynop_e2f08a.jpg",
      },
      // {
      //   modelName: "Wheatist & Athletic",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763978969/dg36354daunzulny0vsk_593bdd.jpg",
      // },
      // {
      //   modelName: "Medium",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763978906/sharara4_pnw3fi_50fc1f.jpg",
      // },
    ];

    const anarkaliModels = [
      // {
      //   modelName: "Fair & Slim",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763971670/Anarkali1_tq8plw.png",
      // },
      {
        modelName: "Dusky & Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png",
      },
      // {
      //   modelName: "Wheatist & Athletic",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763971669/Anarkali2_ygpvg6.png",
      // },
      // {
      //   modelName: "Medium",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763971668/Anarkali4_mn8jpi.png",
      // },
    ];

    const pretModels = [
      // {
      //   modelName: "Fair & Slim",
      //   modelimg: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971710/pret1_m8ralt.png",
      // },
      {
        modelName: "Dusky & Curvy",
        modelimg: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971710/pret2_jbuvlf.png",
      },
      // {
      //   modelName: "Wheatist & Athletic",
      //   modelimg: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971711/pret3_baksin.png",
      // },
      // {
      //   modelName: "Medium",
      //   modelimg: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971712/pret4_gl6dky.png",
      // },
    ];

    const fusionModels = [
      // {
      //   modelName: "Fair & Slim",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763971758/fusion2_edimql.png",
      // },
      {
        modelName: "Dusky & Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1763971758/fusion1_rexxbx.png",
      },
      // {
      //   modelName: "Wheatist & Athletic",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763971758/fusion4_msdxrp.png",
      // },
      // {
      //   modelName: "Medium",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763971756/fusion3_nawkdm.png",
      // },
    ];

    const kurthaModels = [
      // {
      //   modelName: "Fair & Slim",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763978447/kurthaSet2_be2iq3_4dd5c3.jpg",
      // },
      {
        modelName: "Dusky & Curvy",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1763978550/kurthaSet3_mbst5j_f7e8e5.jpg",
      },
      // {
      //   modelName: "Wheatist & Athletic",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763978591/kurthaSet4_hi8i85_305553.jpg",
      // },
      // {
      //   modelName: "Medium",
      //   modelimg:
      //     "https://res.cloudinary.com/doiezptnn/image/upload/v1763978633/kurthaSet1_lejt7b_6509ef.jpg",
      // },
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
      {/* Step 1: Initial Selection */}
      {step === 1 && (
        <div className="flex flex-col md:flex-row bg-white md:rounded-xl md:gap-[26px] overflow-hidden md:shadow-lg  w-full md:w-[838px] h-auto md:h-[564px] relative">
          {/* CLOSE BUTTON - Top Right Corner */}
          <button
            onClick={onClose}
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

          {/* LEFT IMAGE SECTION */}
          <div className="flex justify-center items-center md:p-3">
            <img
              src={step1img}
              alt="Garment"
              className="w-full h-[240px] md:w-[400px] md:h-[532px] object-cover"
            />
          </div>

          {/* RIGHT SIDE CONTENT */}
          <div className="flex flex-col pt-4 px-4 md:pt-16 md:px-0 md:w-[400px] w-full pb-16 md:pb-0 relative">
            {/* HEADING - Shows first on mobile, after card on desktop */}
            <div className="block md:hidden">
              <h2 className="text-2xl text-start font-semibold text-black">Try-On</h2>
              <p className="text-gray-600 text-sm mb-4 mt-1 font-medium">Let's go shopping</p>
            </div>

            {/* SELECTED DRESS CARD */}
            <div className="w-full md:w-[180px] rounded-xl shadow-md border p-2 border-gray-200 mb-5 md:mb-0">
              <div className="flex justify-between items-center p-3 bg-[#EEF7F0] border border-[#B8E3C6] py-1 rounded-md">
                <p className="text-[10px] font-medium text-[#15912C]">SELECTED DRESS</p>
                <img src={Tickic} className="h-4" alt="" />
              </div>
              <div className="flex gap-3 mt-3 items-center">
                <img src={garmentImage} className="h-12 w-12 rounded-md object-cover" alt="" />
                <p className="text-xs text-gray-700 line-clamp-2">{garmentName}</p>
              </div>
            </div>

            {/* HEADING - Shows after card on desktop */}
            <div className="hidden md:block">
              <h2 className="text-3xl text-start font-semibold mt-6 text-black">Try-On</h2>
              <p className="text-gray-600 text-sm mb-5 mt-2 font-medium">Let's go shopping</p>
            </div>

            {/* BUTTONS */}
            <button
              onClick={() => setStep(2)}
              className="w-full md:w-[345px] text-white h-[44px] text-sm hover:opacity-90 transition rounded-md md:rounded-none"
              style={{ background: 'var(--villy-primary, #33022F)' }}
            >
              Upload a picture
            </button>

            <button
              onClick={() => {
                setShowModelSelector(true);
                setStep(null); // hide Step1
              }}
              className="w-full md:w-[345px] border mt-2 h-[44px] text-sm hover:text-white transition rounded-md md:rounded-none"
              style={{ borderColor: 'var(--villy-primary, #33022F)', color: 'var(--villy-primary, #33022F)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--villy-primary, #33022F)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Select a model
            </button>

            {/* FOOTNOTE */}
            <p className="text-[10px] mt-4 text-gray-600 leading-tight md:max-w-[320px] text-start">
              Hey! To use the 2D TRY ON feature, just upload or take a selfie or{" "}
              <br className="hidden md:inline" />
              Press <span className="text-primary text-xs font-medium">SKIP</span> to check out the
              models you can try on!
            </p>

            {/* SKIP BUTTON (BOTTOM-RIGHT) */}
            <button
              onClick={onClose}
              className="absolute bottom-4 right-4 cursor-pointer text-gray-600 border border-gray-300 px-4 py-1 rounded-md text-sm font-medium flex items-center gap-1 hover:text-gray-800"
            >
              SKIP
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Instructions */}
      {step === 2 && (
        <div className="p-4 items-center text-center bg-white justify-center w-full md:w-[818px] overflow-y-auto relative max-w-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-500 hover:text-gray-700"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={() => setStep(1)}
            className="mb-4 md:mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            {/* <ArrowLeft size={20} /> Back */}
          </button>

          <h2 className="text-base md:text-xl font-bold text-gray-900 max-w-full md:max-w-2xl pr-8 md:pr-0">
            Upload your full photo for the best try-on experience
          </h2>
          <p className="text-xl">— we'll do the rest!</p>
          <div className="mt-4 md:mt-6 text-center justify-center -ml-24 flex flex-col md:flex-row md:gap-8 gap-0 md:items-start">
            {/* Example Image */}
            <div className="flex justify-center w-full md:w-[230px] h-auto md:h-[369px] mb-4 md:mb-0">
              <img
                src="https://res.cloudinary.com/doiezptnn/image/upload/v1760530680/model2_eh2sqf.jpg"
                alt="Example"
                className="w-full max-w-[280px] md:max-w-none md:w-full h-auto object-cover"
              />
            </div>

            {/* Instructions + Upload */}
            <div className="w-full md:w-[309px] px-0">
              {/* Instruction Box */}
              <div
                className="rounded-lg p-4 md:p-5 w-full md:w-[388px] bg-[#FFF8F4]"
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
                <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">
                  INSTRUCTIONS:
                </h3>

                <ul className="space-y-1.5 md:space-y-2 mt-3 md:mt-5 text-xs md:text-sm">
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] ml-3 font-medium">
                      • Stand straight and face forward
                    </span>
                  </li>
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] ml-3 font-medium">
                      • Maintain good lighting and contrast
                    </span>
                  </li>
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] ml-3 font-medium">
                      • Avoid filters or busy backgrounds
                    </span>
                  </li>
                  <li className="flex gap-2 text-[#7F6301]">
                    <span className="text-[#7F6301] ml-3 font-medium">
                      • Keep file size under 2MB
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-xs md:text-sm text-gray-700 font-medium mt-3 md:mt-4 w-full md:w-[388px] leading-relaxed">
                Your photos are never stored in our system. We respect your privacy and are
                committed to protecting your personal data.
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
                className="mt-3 md:mt-4 block w-full md:w-[388px] bg-primary hover:bg-hoverBg text-white py-3 text-center font-medium cursor-pointer transition-colors text-sm"
              >
                Click to upload
              </label>

              {/* Camera Button */}
              <button
                onClick={startCamera}
                className="mt-3 w-full md:w-[388px] border border-[#8A0000] text-primary py-3 font-medium hover:bg-hoverBg hover:text-white cursor-pointer transition text-sm flex items-center justify-center gap-2"
              >
                <Camera size={18} />
                Use camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Uploading */}
      {step === 3 && (
        <div className="p-8 flex flex-col  bg-white items-center justify-center overflo text-center min-h-[400px]">
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
        <div className="p-8 flex flex-col items-center bg-white justify-center text-center">
          <img
            src={selectedImage}
            alt="Success"
            className="w-full max-w-sm h-64 object-contain shadow-md mb-4"
          />
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5">
            <p className="text-green-700 font-normal -ml-48 text-start text-sm">
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
        <div className="p-8 flex bg-white  flex-col items-center justify-center text-center">
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
        <div className="p-4 bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col items-center relative">
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
        <div className="bg-white w-full max-w-4xl relative shadow-lg">
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

          {/* Toggle Section at Top */}
          {(userProfilePhoto || userHasTryOn) && (
            <div className="bg-[#f5e6e6] border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between max-w-md">
                <span className="text-sm font-medium text-gray-700">Your model</span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!useUserModel}
                    onChange={(e) => {
                      setUseUserModel(!e.target.checked);
                      // Reset selection when toggling
                      setSelectedModel(null);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: 'var(--villy-primary, #33022F)' }}></div>
                </label>

                <span className="text-sm font-medium text-gray-700">Villy Models</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-base font-semibold mb-1">
                Select a model <span className="text-red-600">*</span>
              </h2>
              <p className="text-sm text-gray-600">You can only choose one model</p>
            </div>

            {/* USER'S MODEL - Display ONLY when toggle is OFF (wait, logic seems inverted in original code? "checked={!useUserModel}" means checked is "Villy Models"?) 
                Let's check the toggle logic in lines 995-996: checked={!useUserModel}. 
                So if useUserModel is true, checkbox is UNCHECKED (Your Model). 
                If useUserModel is false, checkbox is CHECKED (Villy Models).
                
                So we want to show this section when useUserModel is TRUE.
            */}
            {useUserModel && (
              <div className="mb-6">
                {availableUserModels.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {availableUserModels.map((model, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          console.log("Selected model:", model.name);
                          setSelectedModel({
                            image: model.image,
                            name: model.name,
                          });
                        }}
                        className={`cursor-pointer relative p-2 border rounded-lg transition-all ${selectedModel?.image === model.image
                            ? 'border-[var(--villy-primary)] bg-red-50'
                            : 'border-transparent hover:bg-gray-50'
                          }`}
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-md bg-gray-100">
                          <img
                            src={model.image}
                            alt={model.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-center mt-2 text-xs font-medium text-gray-700 truncate px-1">
                          {model.name}
                        </p>

                        {selectedModel?.image === model.image && (
                          <div className="absolute top-2 left-2 bg-white px-1.5 py-0.5 flex items-center gap-1 rounded shadow-sm border border-gray-100">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--villy-primary, #33022F)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No models found in your profile.</p>
                    <button
                      onClick={() => setStep(2)}
                      className="text-primary font-medium hover:underline"
                    >
                      Upload a photo to get started
                    </button>
                  </div>
                )}
                <div
                  onClick={() => {
                    // Prefer profile photo, fallback to try-on image
                    const imageToUse = userProfilePhoto || userTryOnImage;
                    if (imageToUse) {
                      setSelectedModel({
                        image: imageToUse,
                        name: "Your Model",
                      });
                    }
                  }}
                  className="cursor-pointer inline-block relative"
                >
                  <img
                    src={userProfilePhoto || userTryOnImage}
                    alt="Your Model"
                    className="w-[160px] h-[240px] object-cover rounded"
                  />
                  <p className="text-left mt-2 text-sm font-medium text-gray-700">Your Model</p>

                  {selectedModel?.name === "Your Model" && (
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
              </div>
            )}

            {/* DVYB STATIC MODELS - Display ONLY when toggle is FALSE (Villy Models) OR if user has no data */}
            {(!useUserModel) && (
              <div className="mb-6">
                <div className="grid grid-cols-4 gap-4">
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
                      <p className="text-left mt-2 text-sm font-medium text-gray-700">
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
            )}

            {/* Checkbox */}
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="mt-1 w-4 h-4"
                style={{ accentColor: 'var(--villy-primary, #33022F)' }}
              />
              <p className="text-sm text-gray-700">
                Make it default model for all future try ons (you can always change the model in the
                settings)
              </p>
            </div>

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
        <div className="p-6 sm:p-12 w-full bg-white md:max-w-[818px] mx-auto relative">
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
              <p className="text-sm text-gray-700">{selectedModel.name}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
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
          <div className="flex justify-end mt-8">
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
              className={`group flex items-center gap-2 px-4 py-2 bg-white border border-gray-700 text-gray-700 rounded text-sm font-medium hover:text-white transition-all ${isStoringData ? 'opacity-50 cursor-not-allowed' : ''}`}
              onMouseEnter={(e) => {
                if (!isStoringData) {
                  e.currentTarget.style.background = 'var(--villy-primary, #33022F)';
                  e.currentTarget.style.borderColor = 'var(--villy-primary, #33022F)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isStoringData) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#374151';
                }
              }}
            >
              {isStoringData ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                  Storing...
                </>
              ) : (
                <>
                  Continue
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
