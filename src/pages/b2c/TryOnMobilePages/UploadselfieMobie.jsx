import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, User, Upload, X, CheckCircle, AlertCircle, Camera, RefreshCcw } from "lucide-react";
import step1img from "../../../assets/TryOn/step1img.svg";
import Tickic from "../../../assets/TryOn/tick_ic.svg";
import black_warnIc from "../../../assets/TryOn/black_warnIc.svg";
import red_warnIc from "../../../assets/TryOn/red_warnIc.svg";

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

const UploadSelfieModalMobile = ({ onNext, garmentImage, garmentName, isSaree, is3D = false }) => {
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [firebaseImage, setFirebaseImage] = useState(null);
  const [loadingFirebaseImage, setLoadingFirebaseImage] = useState(true);
  const [imageSource, setImageSource] = useState("");
  const [uploadError, setUploadError] = useState("");
  
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  //   useEffect(() => {
  //     if (isOpen) {
  //       setStep(1);
  //       setSelectedImage(null);
  //       setImageSource("");
  //       setUploadError("");
  //       setIsUploading(false);
  //     }
  //   }, [isOpen]);

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
      setShowCamera(true);
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

  const handleContinue = () => {
    if (selectedImage && garmentImage) {
      onNext({ modelImage: selectedImage, garmentImage, is3D });
    }
  };

  const handleReupload = () => {
    setStep(2);
    setSelectedImage(null);
    setUploadError("");
  };

  //   if (!isOpen) return null;

  return (
    <div className="w-full min-h-screen mt-28 bg-white flex justify-center">
      <div className="w-full max-w-[838px] flex flex-col md:flex-row bg-white md:rounded-xl md:shadow-lg gap-6 md:gap-[26px] p-4 md:p-6">
        {/* LEFT IMAGE SECTION */}
        <div className="flex justify-center items-center w-full md:w-auto">
          <img
            src={step1img}
            alt="Garment"
            className="w-[260px] h-[300px] md:w-[400px] md:h-[532px] object-cover"
          />
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="flex flex-col w-full md:w-[400px] pt-4 md:pt-10">
          {/* Heading (Mobile Only) */}
          <div className="block md:hidden mb-4">
            <h2 className="text-[22px] font-bold text-black">Try-On</h2>
            <p className="text-gray-500 text-[13px] mt-0.5 font-semibold">Let's go shopping</p>
          </div>

          {/* Selected Dress Card */}
          <div className="w-[210px] rounded-lg shadow-sm border p-2.5 border-gray-200 mb-5 md:mb-0">
            <div className="flex justify-between items-center px-2.5 py-1.5 bg-[#EEF7F0] border border-[#B8E3C6] rounded-md">
              <p className="text-[9px] font-semibold text-[#15912C] tracking-wide">
                SELECTED DRESS
              </p>
              <img src={Tickic} className="h-3.5 w-3.5" alt="" />
            </div>
            <div className="flex gap-2.5 mt-2.5 items-center">
              <img src={garmentImage} className="h-11 w-11 rounded object-cover" alt="" />
              <p className="text-[11px] text-gray-700 line-clamp-2 leading-tight">{garmentName}</p>
            </div>
          </div>

          {/* Heading (Desktop Only) */}
          <div className="hidden md:block">
            <h2 className="text-3xl font-semibold mt-6 text-black">Try-On</h2>
            <p className="text-gray-600 text-sm mb-5 mt-2 font-medium">Let's go shopping</p>
          </div>

          {/* Buttons */}
          <button
            onClick={() => setStep(2)}
            className="w-full bg-[#8B0000] text-white h-[46px] text-[13px] font-medium hover:bg-[#A30000] transition rounded-md"
          >
            Upload a Picture
          </button>

          <button
            onClick={() => {}}
            className="w-full border border-[#8B0000] text-[#8B0000] h-[46px] text-[13px] font-medium mt-3 hover:bg-[#8B0000] hover:text-white transition rounded-md"
          >
            Select a model
          </button>

          {/* Note */}
          <p className="text-[12px] mt-6 text-gray-500 leading-[1.4] font-semibold">
            Hey! To use the 2D TRY ON feature, just upload or take a selfie or
            <br className="hidden md:inline" />
            Press <span className="text-[#8B0000] font-semibold">SKIP</span> to check out the models
            you can try on!
          </p>

          {/* Skip Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={() => {}}
              className="cursor-pointer text-gray-600 border border-gray-300 px-4 py-1.5 rounded text-[12px] font-medium flex items-center gap-1 hover:text-gray-800 hover:border-gray-400"
            >
              SKIP
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  );
};

export default UploadSelfieModalMobile;

//         {/* Step 2: Upload Instructions */}
//  {/* {step === 2 && (
//   <div className=" text-center w-full  ">
//     {/* Close Button */}
//     <button className=" text-gray-500 hover:text-gray-700">
//       {/* <X size={24} /> */}
//     </button>

//     <button
//       onClick={() => setStep(1)}
//       className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
//     >
//       {/* <ArrowLeft size={20} /> Back */}
//     </button>

//     <h2 className="text-base md:text-xl font-bold text-gray-900 max-w-full md:max-w-2xl pr-8 md:pr-0">
//       Upload your full photo for the best try-on experience
//     </h2>
// <p className='text-xl'>— we'll do the rest!</p>
//     <div className="    md:mt-6  text-center justify-center -ml-24 flex flex-col md:flex-row  md:gap-8 gap-0  md:items-start">
//       {/* Example Image */}
//       <div className="flex justify-center w-full h-[550px] md:w-[230px]  md:h-[369px] mb-4 md:mb-0">
//         <img
//           src="https://res.cloudinary.com/doiezptnn/image/upload/v1760530680/model2_eh2sqf.jpg"
//           alt="Example"
//           className="w-full md:max-w-none mt-44 md:w-full h-[550px] object-cover"
//         />
//       </div>

//       {/* Instructions + Upload */}
//       <div className="w-full md:w-[309px] px-0">
//         {/* Instruction Box */}
//         <div
//           className="rounded-lg p-4 md:p-5 w-full md:w-[388px] bg-[#FFF8F4]"
//           style={{
//             backgroundImage: `
//               repeating-linear-gradient(0deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px),
//               repeating-linear-gradient(90deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px),
//               repeating-linear-gradient(180deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px),
//               repeating-linear-gradient(270deg, #CFCFCF 0, #CFCFCF 12px, transparent 12px, transparent 24px)
//             `,
//             backgroundSize: '2px 100%, 100% 2px, 2px 100%, 100% 2px',
//             backgroundPosition: '0 0, 0 0, 100% 0, 0 100%',
//             backgroundRepeat: 'no-repeat'
//           }}
//         >
//           <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">INSTRUCTIONS:</h3>

//           <ul className="space-y-1.5 md:space-y-2 mt-3 md:mt-5 text-xs md:text-sm">
//             <li className="flex gap-2 text-[#7F6301]">
//               <span className="text-[#7F6301] ml-3 font-medium">• Stand straight and face forward</span>
//             </li>
//             <li className="flex gap-2 text-[#7F6301]">
//               <span className="text-[#7F6301] ml-3 font-medium">• Maintain good lighting and contrast</span>
//             </li>
//             <li className="flex gap-2 text-[#7F6301]">
//               <span className="text-[#7F6301] ml-3 font-medium">• Avoid filters or busy backgrounds</span>
//             </li>
//             <li className="flex gap-2 text-[#7F6301]">
//               <span className="text-[#7F6301] ml-3 font-medium">• Keep file size under 2MB</span>
//             </li>
//           </ul>
//         </div>

//         <p className="text-xs md:text-sm text-gray-700 font-medium mt-3 md:mt-4 w-full md:w-[388px] leading-relaxed">
//           Your photos are never stored in our system. We respect your privacy and are committed to protecting your personal data.
//         </p>

//         {/* Upload Button */}
//         <input
//           type="file"
//           accept="image/jpeg,image/png,image/jpg"
//           onChange={handleFileChange}
//           className="hidden"
//           id="uploadInput"
//         />
//         <label
//           htmlFor="uploadInput"
//           className="mt-3 md:mt-4 block w-full md:w-[388px] bg-primary hover:bg-hoverBg text-white py-3 text-center font-medium cursor-pointer transition-colors text-sm"
//         >
//           Click to upload
//         </label>

//         {/* Camera Button */}
//         <button
//           onClick={startCamera}
//           className="mt-3 w-full md:w-[388px] border border-[#8A0000] text-primary py-3 font-medium hover:bg-hoverBg hover:text-white cursor-pointer transition text-sm flex items-center justify-center gap-2"
//         >
//           <Camera size={18} />
//           Use camera
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//         {/* Step 3: Uploading */}
//         {step === 3 && (
//           <div className="p-8 flex flex-col items-center justify-center overflo text-center min-h-[400px]">
//             <div className="relative bg-gray-100 rounded-xl w-full max-w-sm overflow-hidden mb-6">
//               <img src={selectedImage} alt="Uploading" className="w-full h-64 object-contain opacity-50" />
//               <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/40">
//                 <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mb-3"></div>
//                 <p className="text-white font-semibold text-lg">Uploading</p>
//               </div>
//             </div>
//             <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-left w-full max-w-sm">
//               <p className="font-semibold text-red-800 mb-2">Please follow the below instructions</p>
//               <ul className="text-sm text-red-700 space-y-1">
//                 <li>• Keep file size under 2MB</li>
//                 <li>• Ensure image is clear and not pixelated</li>
//                 <li>• Maintain good lighting and contrast</li>
//                 <li>• Keep background clean or neutral</li>
//               </ul>
//             </div>
//             <button className="w-full max-w-sm bg-primary text-white py-3 rounded-lg font-medium mt-5 opacity-60 cursor-not-allowed">
//               CONTINUE
//             </button>
//             <button className="w-full max-w-sm border border-gray-300 py-3 rounded-lg mt-3 text-gray-700 opacity-60 cursor-not-allowed">
//               RE-UPLOAD
//             </button>
//           </div>
//         )}

//         {/* Step 4: Success */}
//         {step === 4 && (
//           <div className="p-8 flex flex-col items-center justify-center text-center">
//             <img src={selectedImage} alt="Success" className="w-full max-w-sm h-64 object-cover  shadow-md mb-4" />
//             <div className="flex items-center gap-2  px-4 py-3 rounded-lg mb-5">
//               {/* <CheckCircle className="text-green-600" size={22} /> */}
//               <p className="text-green-700 font-normal -ml-48  text-start text-sm">Image uploaded successfully</p>
//             </div>
//             <button onClick={handleContinue} className="w-full max-w-sm bg-primary text-white py-3  font-medium hover:bg-red-800">
//               CONTINUE
//             </button>
//             <button onClick={handleReupload} className="w-full max-w-sm border border-gray-300 text-gray-700 py-3  mt-3 hover:border-red-700">
//               RE-UPLOAD
//             </button>
//             <p className="text-xs text-gray-600 mt-4">Your photos are never stored in our system. We respect your privacy and are committed to protecting your personal data.</p>
//           </div>
//         )}

//         {/* Step 5: Error */}
//         {step === 5 && (
//           <div className="p-8 flex flex-col items-center justify-center text-center">
//         <div className=' w-full max-w-sm '>

//             <img src={selectedImage} alt="Error" className="w-full max-w-sm h-64 object-cover   backdrop-blur-3xl blur-xs  " />
//         </div>
//             <div className="  mt-3    text-left w-full max-w-lg ml-28  ">
//               <div className='flex items-center gap-4  '>

//               <img src={red_warnIc} className='h-5' alt="" />
//               <p className="text-red-600    text-lg ">
//                 {uploadError || "Image you uploaded was blurred or pixelated"}
//               </p>
//               </div>
//               <div className='flex  -ml-0.5 items-center mt-4 gap-3'>
// <img src={black_warnIc} className='h-6' alt="" />
//               <p className='font-semibold text-lg text-outfit '>  Please follow the below instructions </p>
//               </div>
//               <ul className="text-md ml-2 text-black  text-outfit  mt-3 space-y-1">
//                 <li >•  Keep file size under 2MB</li>
//                 <li>•  Ensure image is clear and not pixelated</li>
//                 <li>• Maintain <span className='text-primary'> good lighting and contrast </span> </li>
//                 <li>• Keep background clean or neutral</li>
//               </ul>
//             </div>
//             <button onClick={handleReupload} className="w-full max-w-sm bg-primary text-white py-3 rounded-lg font-medium mt-5 hover:bg-red-800">
//               RE-UPLOAD
//             </button>
//             <p className="text-xs text-gray-600 mt-4">Your photos are never stored in our system. We respect your privacy and are committed to protecting your personal data.</p>
//           </div>
//         )}
//
//         {/* CAMERA VIEW */}
//         {showCamera && (
//           <div className="fixed inset-0 z-50 bg-white flex flex-col items-center">
//             <div className="w-full max-w-lg flex flex-col items-center p-4">
//               <div className="w-full flex justify-between items-center mb-6">
//                 <button
//                   onClick={stopCamera}
//                   className="p-2 text-gray-600 hover:text-gray-900"
//                 >
//                   <ArrowLeft size={24} />
//                 </button>
//                 <h3 className="text-lg font-bold">Take a Selfie</h3>
//                 <div className="w-10" />
//               </div>
//
//               <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-2xl mb-8">
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full object-cover"
//                   style={{ transform: "scaleX(-1)" }}
//                 />
//               </div>
//
//               <div className="w-full flex gap-4">
//                 <button
//                   onClick={stopCamera}
//                   className="flex-1 border-2 border-gray-300 py-4 font-bold rounded-lg"
//                 >
//                   CANCEL
//                 </button>
//                 <button
//                   onClick={capturePhoto}
//                   className="flex-1 bg-[#8B0000] text-white py-4 font-bold rounded-lg flex items-center justify-center gap-2"
//                 >
//                   <Camera size={20} />
//                   CAPTURE
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
