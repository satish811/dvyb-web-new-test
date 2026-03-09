import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ArrowLeft, Check, Camera, RefreshCcw } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { profileService } from "../../../services/profileService";

const TryOnUploadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tryOnData = location.state;

  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [showComparison, setShowComparison] = useState(false); // ⭐ NEW

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // ⭐ NEW: User Profile Logic
  const { userCollection } = useAuth();
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [useUserModel, setUseUserModel] = useState(false);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const profile = await profileService.getProfile(userCollection);
        if (profile?.photoUrl) {
          console.log("✅ Mobile: User profile photo found:", profile.photoUrl);
          setUserProfilePhoto(profile.photoUrl);
          setUseUserModel(true); // Default to user model
        }
      } catch (error) {
        console.error("Error fetching profile for mobile:", error);
      }
    };
    fetchProfilePhoto();
  }, []);

  const isModelSelection = tryOnData?.selectModel;

  const getModelsForDressType = (dressType) => {
    const normalizedType = dressType?.toLowerCase().trim();

    const sareeModels = [
      {
        modelName: "Model 1",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1773051219/model2_iaq2pq.png",
      },
      {
        modelName: "Model 2",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1773050764/model_d1mnwa.png",
      },
      {
        modelName: "Model 3",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1772001465/Gemini_Generated_Image_csi0f2csi0f2csi0_ol5dip.png",
      },
      {
        modelName: "Model 4",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1773045046/saree_model_4_pthksx.png",
      },
    ];

    const universalModels = [
      {
        modelName: "Model 1",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1771998877/32_bymabn.png",
      },
      {
        modelName: "Model 2",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1773051997/model5_l9a1bb.png",
      },
      {
        modelName: "Model 3",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1773052366/model10_tgcal7.png",
      },
      {
        modelName: "Model 4",
        modelimg:
          "https://res.cloudinary.com/doiezptnn/image/upload/v1771998877/51_gfhrgs.png",
      },
    ];

    switch (normalizedType) {
      case "saree":
        return sareeModels;
      case "lehenga":
      case "wedding":
        return universalModels;
      default:
        return universalModels;
    }
  };

  const models = getModelsForDressType(tryOnData?.dressType || "lehenga");

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError("");

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setUploadError("Please select a valid image (JPEG, PNG, JPG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size exceeds 2MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("✅ Image selected:", file.name);

      navigate("/tryon/processing", {
        state: {
          ...tryOnData,
          uploadedFile: file,
          uploadedImagePreview: reader.result,
          processingType: "upload",
        },
      });
    };
    reader.readAsDataURL(file);
  };

  // ⭐ FIXED: Show comparison when model selected
  const handleModelSelect = (model) => {
    setSelectedModel({ image: model.modelimg, name: model.modelName });
    setShowComparison(true); // ⭐ Show comparison view
  };

  const handleModelNext = () => {
    if (!selectedModel) {
      alert("Please select a model to continue");
      return;
    }

    navigate("/tryon/preview", {
      state: {
        ...tryOnData,
        modelImage: selectedModel.image,
        processingType: "model",
      },
    });
  };

  const handleBack = () => {
    if (showComparison) {
      setShowComparison(false); // ⭐ Go back to model selection
      setSelectedModel(null);
    } else {
      navigate(-1);
    }
  };

  const startCamera = async () => {
    setUploadError("");

    // Check if browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = window.isSecureContext
        ? "Your browser does not support camera access."
        : "Camera access requires a secure connection (HTTPS). Please try using HTTPS or localhost.";
      setUploadError(errorMsg);
      console.error("Camera access not supported:", errorMsg);
      return;
    }

    try {
      // Try with ideal constraints first
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
      setShowCamera(true);

      // Use onLoadedMetadata to ensure stream is ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setUploadError("Could not access camera. Please ensure you have granted permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const reader = new FileReader();
      reader.onloadend = () => {
        stopCamera();
        navigate("/tryon/processing", {
          state: {
            ...tryOnData,
            uploadedFile: file,
            uploadedImagePreview: reader.result,
            processingType: "upload",
          },
        });
      };
      reader.readAsDataURL(file);
    }, "image/jpeg");
  };

  const handleClose = () => {
    navigate(`/products/${tryOnData?.productId}`);
  };

  const exampleImage =
    "https://res.cloudinary.com/doiezptnn/image/upload/v1760530680/model2_eh2sqf.jpg";

  if (!tryOnData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ⭐ COMPARISON VIEW (After model selected)
  if (isModelSelection && showComparison && selectedModel) {
    return (
      <div className="min-h-screen bg-white relative overflow-auto pb-24">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
        >
          {/* <X size={24} /> */}
        </button>

        <div className="max-w-4xl mx-auto px-4 pt-8 pb-8">
          {/* Comparison Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
            {/* Left: Garment */}
            <div className="border-4 border-primary overflow-hidden bg-white">
              <div className="relative">
                <img
                  src={tryOnData?.garmentImage || tryOnData?.productImage}
                  alt="Selected Dress"
                  className="w-full aspect-[3/4] object-cover"
                />
                {/* <div className="absolute top-3 right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div> */}
              </div>
              <div className="bg-white p-3">
                <p className="text-xs font-semibold text-gray-700 uppercase">SELECTED DRESS</p>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  {tryOnData?.productName || "Rice With Silver Party Wear Designer Saree"}
                </p>
              </div>
            </div>

            {/* Right: Model */}
            <div className="border-4 border-primary  overflow-hidden bg-white">
              <div className="relative">
                <img
                  src={selectedModel.image}
                  alt="Selected Model"
                  className="w-full aspect-[3/4] object-cover"
                />
                {/* <div className="absolute top-3 right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div> */}
              </div>
              <div className="bg-white p-3">
                <p className="text-xs font-semibold text-gray-700 uppercase">SELECTED MODEL</p>
                <p className="text-sm text-gray-900 font-medium mt-1">{selectedModel.name}</p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className=" text-black p-4  mb-6">
            <p className="text-sm leading-relaxed">
              <span className="font-bold">Note:</span> Virtual try-on results depend on your photo
              quality.
              <span className="text-primary">
                {" "}
                (cut-off head, missing hands/face/Dress etc.)
              </span>{" "}
              are not our responsibility.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 text-gray-700 border-2 border-gray-300 px-6 py-3 font-medium hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={18} />
              SELECT ANOTHER MODEL
            </button>

            <button
              onClick={handleModelNext}
              className="flex-1 bg-[#8B0000] text-white px-6 py-3  font-medium hover:bg-[#A30000] transition-all flex items-center justify-center gap-2"
            >
              CONTINUE
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-auto pb-20">
      {/* <button 
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
      >
        <X size={24} />
      </button> */}

      {/* MODEL SELECTION VIEW */}
      {isModelSelection ? (
        <div className="px-4 pt-6 pb-8">
          <h2 className="text-lg font-semibold mb-1">Select a model:</h2>
          <p className="text-xs text-gray-600 mb-6">You can only choose one model</p>

          {/* Toggle Section */}
          {userProfilePhoto && (
            <div className="bg-[#f5e6e6] border-b border-gray-200 px-4 py-3 -mx-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Your model</span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!useUserModel}
                    onChange={(e) => {
                      setUseUserModel(!e.target.checked);
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

          {/* USER'S MODEL - Display ONLY when toggle is OFF (useUserModel is TRUE) */}
          {useUserModel && userProfilePhoto && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div
                onClick={() => {
                  setSelectedModel({
                    image: userProfilePhoto,
                    name: "Your Model",
                  });
                }}
                className="cursor-pointer relative p-2.5 overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-[#8B0000] transition-all"
              >
                <img
                  src={userProfilePhoto}
                  alt="Your Model"
                  className="w-full aspect-[3/4] object-cover"
                />
                <p className="text-center mt-2 text-sm font-medium">Your Model</p>
              </div>
            </div>
          )}

          {/* DVYB STATIC MODELS */}
          {!useUserModel && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {models.map((model, index) => (
                <div
                  key={index}
                  onClick={() => handleModelSelect(model)}
                  className="cursor-pointer relative p-2.5 overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-[#8B0000] transition-all"
                >
                  <img
                    src={model.modelimg}
                    alt={model.modelName}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <p className="text-center mt-2 text-sm font-medium">{model.modelName}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-9">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 border border-gray-300 px-4 py-2"
            >
              <ArrowLeft size={16} /> BACK
            </button>
          </div>
        </div>
      ) : (
        /* UPLOAD VIEW */
        <div className="px-4 pt-6 pb-8 max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <p className="text-xl md:text-2xl text-gray-900 leading-tight">
              <span className="font-bold">
                Upload your full photo for the best try-on experience —
              </span>
              <span className="text-lg md:text-xl text-gray-700 ml-2">we'll do the rest!</span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Example Image */}
            <div className="flex-shrink-0 w-full md:w-[280px]">
              <img src={exampleImage} alt="Example" className="w-full h-auto shadow-lg " />
            </div>

            {/* Instructions & Upload */}
            <div className="flex-1 space-y-5">
              <div
                className=" p-6 bg-[#FFF8F4]"
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
                <h3 className="font-bold text-gray-900 mb-4 text-base">INSTRUCTIONS:</h3>
                <ul className="space-y-2 pl-1 text-sm text-[#7F6301]">
                  <li className="font-medium">• Stand straight and face forward</li>
                  <li className="font-medium">• Maintain good lighting and contrast</li>
                  <li className="font-medium">• Avoid filters or busy backgrounds</li>
                  <li className="font-medium">• Keep file size under 2MB</li>
                </ul>
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 text-sm">
                  {uploadError}
                </div>
              )}

              <p className="text-sm text-gray-600 leading-relaxed">
                Your photos are never stored in our system. We respect your privacy and are
                committed to protecting your personal data.
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                id="uploadInput"
                disabled={isUploading}
              />

              <label
                htmlFor="uploadInput"
                className={`block w-full bg-[#8B0000] hover:bg-[#A30000] text-white py-3.5 text-center font-semibold cursor-pointer transition-all  ${isUploading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                {isUploading ? "Uploading..." : "CLICK TO UPLOAD"}
              </label>

              <button
                onClick={startCamera}
                disabled={isUploading}
                className="w-full border-2 border-[#8B0000] text-[#8B0000] py-3.5 font-semibold hover:bg-[#8B0000] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Camera size={18} />
                USE CAMERA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA VIEW */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center">
          <div className="w-full max-w-lg flex flex-col items-center p-4">
            <div className="w-full flex justify-between items-center mb-6">
              <button
                onClick={stopCamera}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
              </button>
              <h3 className="text-lg font-bold">Take a Selfie</h3>
              <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-2xl mb-8">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>

            <div className="w-full flex gap-4">
              <button
                onClick={stopCamera}
                className="flex-1 border-2 border-gray-300 py-4 font-bold rounded-lg"
              >
                CANCEL
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 bg-[#8B0000] text-white py-4 font-bold rounded-lg flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                CAPTURE
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center px-4">
              Position your face clearly for the best try-on accuracy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryOnUploadPage;
