import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import black_warnIc from "../../../assets/TryOn/black_warnIc.svg";
import red_warnIc from "../../../assets/TryOn/red_warnIc.svg";
import { LOADING_FRAMES, FRAME_INTERVAL } from "../../../assets/lazyloading2";

const TryOnProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tryOnData = location.state;

  const [state, setState] = useState("uploading"); // 'uploading' | 'processing' | 'success' | 'error'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = LOADING_FRAMES;

  // Rotate loader images
  useEffect(() => {
    if (state === "uploading" || state === "processing") {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, FRAME_INTERVAL);
      return () => clearInterval(timer);
    }
  }, [state]);

  // Upload to Cloudinary
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

  // Validate image quality
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

  // Main processing effect
  useEffect(() => {
    const processImage = async () => {
      if (!tryOnData) {
        navigate("/products");
        return;
      }

      try {
        if (tryOnData.processingType === "upload" && tryOnData.uploadedFile) {
          // UPLOAD FLOW
          setState("uploading");

          const cloudinaryUrl = await uploadToCloudinary(tryOnData.uploadedFile);
          setUploadedImage(cloudinaryUrl);

          const isValid = await validateImage(cloudinaryUrl);

          if (isValid) {
            setState("success");
          } else {
            setUploadError("Image you uploaded was blurred or pixelated");
            setState("error");
          }
        } else if (tryOnData.processingType === "model" && tryOnData.modelImage) {
          // MODEL SELECTION FLOW
          setState("uploading");
          setUploadedImage(tryOnData.modelImage);

          // Simulate processing delay
          await new Promise((resolve) => setTimeout(resolve, 1500));

          setState("success");
        }
      } catch (error) {
        console.error("Processing error:", error);
        setUploadError(error.message || "Failed to process image");
        setState("error");
      }
    };

    processImage();
  }, [tryOnData, navigate]);

  const handleContinue = () => {
    if (!uploadedImage) return;

    // Navigate to preview with model image
    navigate("/tryon/preview", {
      state: {
        ...tryOnData,
        modelImage: uploadedImage,
        garmentImage: tryOnData.garmentImage,
      },
    });
  };

  const handleReupload = () => {
    navigate("/tryon/upload", {
      state: {
        ...tryOnData,
        selectModel: false,
      },
    });
  };

  if (!tryOnData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* === UPLOADING/PROCESSING STATE === */}
        {(state === "uploading" || state === "processing") && (
          <>
            <div className="flex flex-col items-center justify-center">
              <img
                src={images[currentIndex]}
                alt="loader"
                className="w-[150px] h-[150px] object-cover transition-opacity duration-300"
              />
              <p className="text-xl text-center text-primary font-Outfit mt-4">
                {state === "uploading" ? "Uploading your photo..." : "Creating your Vibe..."}
              </p>
            </div>

            <div className="bg-red-50 p-5 border border-red-200">
              <p className="font-semibold text-red-800 mb-3 text-sm">
                Please follow the below instructions
              </p>
              <ul className="text-sm text-red-700 space-y-2">
                <li>• Keep file size under 2MB</li>
                <li>• Ensure image is clear and not pixelated</li>
                <li>• Maintain good lighting and contrast</li>
                <li>• Keep background clean or neutral</li>
              </ul>
            </div>

            <button className="w-full bg-[#8B0000] text-white py-3  font-medium opacity-60 cursor-not-allowed">
              CONTINUE
            </button>
            <button className="w-full border border-gray-300 py-3 -mt-2 text-gray-700 opacity-60 cursor-not-allowed">
              RE-UPLOAD
            </button>
          </>
        )}

        {/* === SUCCESS STATE === */}
        {state === "success" && (
          <>
            <div className="relative  overflow-hidden shadow-lg">
              <img src={uploadedImage} alt="Success" className="w-full h-72 object-contain" />
            </div>

            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3  border border-green-200">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium text-sm">Image uploaded successfully</p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-[#8B0000] text-white py-3  font-medium hover:bg-[#A30000] active:bg-[#6B0000] transition-all"
            >
              CONTINUE
            </button>
            <button
              onClick={handleReupload}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 font-medium hover:border-[#8B0000] -mt-3 hover:text-[#8B0000] transition-all"
            >
              RE-UPLOAD
            </button>

            <p className="text-xs text-gray-600 text-center leading-relaxed">
              Your photos are never stored in our system. We respect your privacy and are committed
              to protecting your personal data.
            </p>
          </>
        )}

        {/* === ERROR STATE === */}
        {state === "error" && (
          <>
            <div className="relative  overflow-hidden">
              <img
                src={uploadedImage || tryOnData.garmentImage}
                alt="Error"
                className="w-full h-64 object-cover blur-lg opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={red_warnIc} className="h-16 w-16" alt="error" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <img src={red_warnIc} className="h-5 w-5 flex-shrink-0 mt-0.5" alt="error" />
                <p className="text-red-600 text-base font-medium">
                  {uploadError || "Image you uploaded was blurred or pixelated"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <img src={black_warnIc} className="h-6 w-6 flex-shrink-0" alt="warning" />
                <p className="font-semibold text-base text-gray-900">
                  Please follow the below instructions
                </p>
              </div>

              <ul className="text-sm text-gray-800 space-y-2 ml-2">
                <li>• Keep file size under 2MB</li>
                <li>• Ensure image is clear and not pixelated</li>
                <li>
                  • Maintain{" "}
                  <span className="text-[#8B0000] font-medium">good lighting and contrast</span>
                </li>
                <li>• Keep background clean or neutral</li>
              </ul>
            </div>

            <button
              onClick={handleReupload}
              className="w-full bg-[#8B0000] text-white py-3  font-medium hover:bg-[#A30000] active:bg-[#6B0000] transition-all mt-2"
            >
              RE-UPLOAD
            </button>

            <p className="text-xs text-gray-600 text-center leading-relaxed">
              Your photos are never stored in our system. We respect your privacy and are committed
              to protecting your personal data.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TryOnProcessingPage;
