import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Check, ChevronRight, ChevronLeft, Edit2, Loader2, Save, RefreshCw, Trash2 } from 'lucide-react';
import women_ic from '../../../assets/ProfileCreation/women_ic.svg';
import pink_star from '../../../assets/ProfileCreation/pink_star.svg';
import yellow_star from '../../../assets/ProfileCreation/yellow_star.svg';
import cornerLogo from '../../../assets/ProfileCreation/cornerLogo.svg'
import tick from '../../../assets/ProfileCreation/tick.svg'
import success_mark from '../../../assets/ProfileCreation/success_mark.svg'

import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';

const MyProfile = () => {
  const MAX_MODEL_IMAGE_BYTES = 3.5 * 1024 * 1024;
  const DEFAULT_PROFILE_BACKGROUND_URL = "https://res.cloudinary.com/doiezptnn/image/upload/v1776421637/Gemini_Generated_Image_tga4sxtga4sxtga4_k0gpfo.png";

  const { user, userCollection, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    height: 178,
    unit: 'cm',
    bodyShape: '',
    skinTone: '',
    hairType: '',
    hairLength: '',
    hairColor: '',
    photoUrl: '',
  });
  const [modelName, setModelName] = useState('');

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [loadingTryOn, setLoadingTryOn] = useState(false);
  const [tryOnResults, setTryOnResults] = useState({});

  // States for saved models persistence
  const [hasSavedModels, setHasSavedModels] = useState(false);
  const [savedModels, setSavedModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [previewModel, setPreviewModel] = useState(null);
  const [savedResults, setSavedResults] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  // State for gallery modal
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // State for save-in-progress spinner
  const [savingProfile, setSavingProfile] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  // State for delete-in-progress spinner
  const [deletingProfile, setDeletingProfile] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [generatingOutfit, setGeneratingOutfit] = useState(null);
  const [generatedResults, setGeneratedResults] = useState({});
  const [centerImage, setCenterImage] = useState(null);

  const totalSteps = 8;
  const getModelKey = (model) => model?.id || model?.name || "";
  const normalizeModelName = (value) => {
    const lettersOnly = String(value || "")
      .replace(/[^A-Za-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!lettersOnly) return "";

    return lettersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Body shapes, skin tones, hair configs (same as yours) - kept exactly
  const bodyShapes = [
    { id: 'straight', label: 'Straight' },
    { id: 'pear', label: 'Fit/Athletic' },
    { id: 'apple', label: 'Average' },
    { id: 'curvy', label: 'Curvy' },
    { id: 'athletic', label: 'Chubby' },
    { id: 'Plus Size', label: 'Plus Size' }
  ];

  const skinTones = [
    { id: 'fair', label: 'Fair', color: '#FFDFC4' },
    { id: 'light', label: 'Light', color: '#F0C09A' },
    { id: 'medium-light', label: 'Medium Light', color: '#D6A27C' },
    { id: 'medium', label: 'Medium', color: '#C68C5B' },
    { id: 'tan', label: 'Tan', color: '#9E6B4D' },
    { id: 'warm-brown', label: 'Warm Brown', color: '#826144' }, ,
    { id: 'brown', label: 'Brown', color: '#6F4E37' },
    { id: 'deep', label: 'Deep', color: '#4A3728' }
  ];

  const hairTypes = [{ id: 'straight', label: 'Straight' }, { id: 'wavy', label: 'Wavy' }, { id: 'curly', label: 'Curly' }];
  const hairLengths = [{ id: 'short', label: 'Short' }, { id: 'medium', label: 'Medium' }, { id: 'long', label: 'Long' }];
  const hairColors = [
    { id: 'black', label: 'Black', color: '#1A1A1A' },
    { id: 'dark-brown', label: 'Dark Brown', color: '#4A2511' },
    { id: 'light-brown', label: 'Light Brown', color: '#8B6B47' },
    { id: 'blonde', label: 'Blonde', color: '#E6C28B' },
    { id: 'red', label: 'Red', color: '#A0522D' },
    { id: 'grey', label: 'Grey', color: '#9B9B9B' }
  ];

  // CAMERA FUNCTIONS (FIXED)
  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCurrentStep(6);
    } catch (err) {
      setCameraError(true);
    }
  };




  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const blobToDataUrl = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const loadImageFromBlob = (blob) => {
    return new Promise((resolve, reject) => {
      const imageUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(img);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(imageUrl);
        reject(err);
      };
      img.src = imageUrl;
    });
  };

  const canvasToBlob = (canvas, mimeType, quality) => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to convert canvas to blob"));
            return;
          }
          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  };

  const compressImageBlobToMaxBytes = async (blob, maxBytes = MAX_MODEL_IMAGE_BYTES) => {
    if (!blob || blob.size <= maxBytes) return blob;

    const img = await loadImageFromBlob(blob);

    const MAX_START_DIMENSION = 2200;
    const scale = Math.min(1, MAX_START_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    let width = Math.max(1, Math.floor(img.naturalWidth * scale));
    let height = Math.max(1, Math.floor(img.naturalHeight * scale));

    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext("2d", { alpha: false });
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.9;
    let compressed = await canvasToBlob(canvas, "image/jpeg", quality);

    for (let attempt = 0; attempt < 14 && compressed.size > maxBytes; attempt++) {
      if (quality > 0.45) {
        quality = Math.max(0.45, quality - 0.1);
      } else {
        width = Math.max(640, Math.floor(width * 0.85));
        height = Math.max(640, Math.floor(height * 0.85));

        const resizedCanvas = document.createElement("canvas");
        resizedCanvas.width = width;
        resizedCanvas.height = height;
        const resizedCtx = resizedCanvas.getContext("2d", { alpha: false });
        resizedCtx.drawImage(canvas, 0, 0, width, height);

        canvas = resizedCanvas;
        ctx = resizedCtx;
        quality = 0.8;
      }

      compressed = await canvasToBlob(canvas, "image/jpeg", quality);
    }

    return compressed;
  };

  const setProcessedImage = async (sourceBlob, advanceToPreview = false) => {
    setProcessingImage(true);
    try {
      const compressedBlob = await compressImageBlobToMaxBytes(sourceBlob, MAX_MODEL_IMAGE_BYTES);

      if (compressedBlob.size > MAX_MODEL_IMAGE_BYTES) {
        throw new Error("Could not compress this image to 3.5 MB. Please choose a smaller image.");
      }

      const base64 = await blobToDataUrl(compressedBlob);
      let processedImage = base64;

      try {
        processedImage = await applyDefaultBackgroundToModelImage(base64);
      } catch (backgroundError) {
        console.warn('Background enhancement failed, falling back to the uploaded image.', backgroundError);
      }

      setCapturedImage(processedImage);
      setProfileData((prev) => ({ ...prev, photoUrl: processedImage }));
      if (advanceToPreview) setCurrentStep(7);
    } finally {
      setProcessingImage(false);
    }
  };

  const applyDefaultBackgroundToModelImage = async (imageSource) => {
    if (!imageSource) {
      throw new Error("No image found for background processing.");
    }

    const sourceResponse = await fetch(imageSource);
    if (!sourceResponse.ok) {
      throw new Error("Failed to read model image for background processing.");
    }

    const sourceBlob = await sourceResponse.blob();

    const formData = new FormData();
    formData.append("tryOnImage", sourceBlob, "profile-model.jpg");
    formData.append("backgroundUrl", DEFAULT_PROFILE_BACKGROUND_URL);
    formData.append("backgroundName", "Default Profile");

    const response = await fetch('/api/change-tryon-background', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let message = `Background processing failed (${response.status})`;
      try {
        const errorData = await response.json();
        message = errorData?.details || errorData?.error || message;
      } catch (_error) {
        const text = await response.text();
        if (text) message = text;
      }
      throw new Error(message);
    }

    const data = await response.json();
    if (!data?.success || !data?.result) {
      throw new Error(data?.error || "Background processing did not return an image.");
    }

    return data.result;
  };

  const capturePhoto = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    stopCamera();
    const capturedBlob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
    await setProcessedImage(capturedBlob, true);
  };

  const handleFileUpload = async (e, advanceToPreview = currentStep >= 5) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await setProcessedImage(file, advanceToPreview);
    } catch (error) {
      alert(error.message || 'Failed to process image. Please try another one.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveModel = async () => {
    const trimmedModelName = normalizeModelName(modelName);

    if (!trimmedModelName) {
      alert('Please enter a model name using alphabets only.');
      return;
    }

    if (!capturedImage && !profileData.photoUrl) {
      alert('Please upload a photo for your model.');
      return;
    }

    if (savedModels.length >= 4 && !savedModels.some((item) => item.name.toLowerCase() === trimmedModelName.toLowerCase())) {
      alert('You can save up to 4 models. Delete one before adding a new model.');
      return;
    }

    const sourceImage = capturedImage || profileData.photoUrl;

    setSavingProfile(true);
    try {
      const dataToSave = {
        ...profileData,
        modelName: trimmedModelName,
        photoUrl: sourceImage,
      };

      const savedProfile = await profileService.saveProfile(dataToSave, userCollection);
      const nextSavedModels = Array.isArray(savedProfile?.savedModels) ? savedProfile.savedModels : [];
      const persistedPhotoUrl = savedProfile?.photoUrl || dataToSave.photoUrl;

      setSavedModels(nextSavedModels);
      setSelectedModelId(null);
      setHasSavedModels(nextSavedModels.length > 0);
      setProfileData(prev => ({ ...prev, photoUrl: persistedPhotoUrl }));
      setCapturedImage(persistedPhotoUrl);
      setModelName(trimmedModelName);
      setCurrentStep(9);
    } catch (error) {
      console.error('❌ Save error:', error);
      alert(`Error saving model: ${error.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Automatically adjust garment scaling based on image dimensions
  const handleImageFit = (e) => {
    const img = e.target;
    const ratio = img.naturalWidth / img.naturalHeight;

    // If image wider than tall → garment type like Kurti → zoom slightly
    if (ratio > 0.75) {
      img.style.objectFit = "cover";
      img.style.transform = "scale(1.15)";
    }
    // If image tall like Saree → fit naturally
    else {
      img.style.objectFit = "cover";
      img.style.transform = "scale(1.05)";
    }
  };


  // TRIGGER AI TRY-ON (Step 7 → Step 8)
  // TRIGGER AI TRY-ON (Step 7 → Step 8)

  const generateVirtualTryOns = async () => {
    if (!profileData.photoUrl) {
      console.error("❌ No user photo available");
      return;
    }

    setLoadingTryOn(true);
    console.log("🚀 Starting multi try-on generation...");

    try {
      const formData = new FormData();
      formData.append("model", dataURLtoFile(profileData.photoUrl, "user.jpg"));

      // ⭐ CHANGED: Use /api/tryon?mode=multi instead of /api/myprofile-multi-tryon
      console.log("📤 Sending request to /api/tryon?mode=multi...");

      const res = await fetch('/api/multi-tryon', {
        method: 'POST',
        body: formData
      });

      console.log(`📡 Server responded with status: ${res.status}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("📥 Received data:", data);

      if (data.success && data.results) {
        console.log("✅ Multi try-on successful!");
        console.log("Results:", Object.keys(data.results));

        setGeneratedResults(data.results);

        const firstResult = Object.values(data.results).find((r) => r !== null);
        setCenterImage(firstResult || capturedImage);
      } else {
        throw new Error(data.error || "No results from server");
      }
    } catch (err) {
      console.error("❌ Multi try-on failed:", err);
      alert(`Try-on failed: ${err.message}`);
    } finally {
      setLoadingTryOn(false);
    }
  };
  //  last worked
  // const generateVirtualTryOns = async () => {
  //   if (!profileData.photoUrl) {
  //     console.error("❌ No user photo available");
  //     return;
  //   }

  //   setLoadingTryOn(true);
  //   console.log("🚀 Starting multi try-on generation...");

  //   try {
  //     const formData = new FormData();
  //     formData.append('model', dataURLtoFile(profileData.photoUrl, 'user.jpg'));

  //     console.log("📤 Sending request to /api/multi-tryon...");

  //     const res = await fetch('/api/multi-tryon', {
  //       method: 'POST',
  //       body: formData
  //     });

  //     console.log(`📡 Server responded with status: ${res.status}`);

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.details || `Server error: ${res.status}`);
  //     }

  //     const data = await res.json();
  //     console.log("📥 Received data:", data);

  //     if (data.success && data.results) {
  //       console.log("✅ Multi try-on successful!");
  //       console.log("Results:", Object.keys(data.results));

  //       // Set results for all outfits
  //       setGeneratedResults(data.results);

  //       // Set center image to first available result
  //       const firstResult = Object.values(data.results).find(r => r !== null);
  //       if (firstResult) {
  //         setCenterImage(firstResult);
  //       } else {
  //         setCenterImage(capturedImage);
  //       }

  //     } else {
  //       throw new Error(data.error || "No results from server");
  //     }

  //   } catch (err) {
  //     console.error("❌ Multi try-on failed:", err);
  //     alert(`Try-on failed: ${err.message}`);
  //   } finally {
  //     setLoadingTryOn(false);
  //   }
  // };

  // Helper: convert base64 to File
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };


  useEffect(() => () => stopCamera(), []);

  // Load existing saved models on mount
  useEffect(() => {
    const loadExistingModels = async () => {
      // ⏳ Wait for AuthContext to finish loading & determine user role
      if (loading || !user) {
        if (!loading && !user) setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        console.log(`🔍 Checking for existing models in ${userCollection}...`);

        const [existingResults, userProfile] = await Promise.all([
          profileService.getTryOnResults(userCollection),
          profileService.getProfile(userCollection)
        ]);

        const hasResults = existingResults && Object.keys(existingResults).length > 0;
        const hasProfilePhoto = userProfile && userProfile.photoUrl;

        if (hasResults || hasProfilePhoto) {
          if (existingResults) setSavedResults(existingResults);

          const existingSavedModels = Array.isArray(userProfile?.savedModels) ? userProfile.savedModels : [];
          const legacySavedModels = !existingSavedModels.length && hasProfilePhoto
            ? [{
                id: userProfile?.modelName || 'legacy-model',
                name: userProfile?.modelName || 'Model 1',
                photoUrl: userProfile.photoUrl,
                updatedAt: userProfile.updatedAt || new Date(),
              }]
            : existingSavedModels;

          if (legacySavedModels.length > 0) {
            setSavedModels(legacySavedModels);
            setSelectedModelId(null);
            setModelName(normalizeModelName(legacySavedModels[0]?.name || ''));
            setCapturedImage(legacySavedModels[0]?.photoUrl || userProfile?.photoUrl || null);
            setProfileData(prev => ({ ...prev, ...userProfile, photoUrl: legacySavedModels[0]?.photoUrl || userProfile?.photoUrl || '' }));
          } else if (hasProfilePhoto) {
            console.log("✅ Found existing profile photo");
            setProfileData(prev => ({ ...prev, ...userProfile }));
            setCapturedImage(userProfile.photoUrl);
          }

          setHasSavedModels(legacySavedModels.length > 0 || hasProfilePhoto);
          console.log('✅ Found existing saved models/profile');
        }
      } catch (error) {
        console.error('❌ Error loading existing models:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadExistingModels();
  }, [user]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);


  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const getDisplayedStep = () => {
    if (currentStep >= totalSteps) return totalSteps;
    return currentStep + 1;
  };

  const handleBack = () => {
    if (currentStep === 8) setCurrentStep(7);
    else if ([6, 7, 8].includes(currentStep)) setCurrentStep(5);
    else setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    navigate("/womenwear")
    // redirect or whatever
  };

  const getHeightInFeet = () => {
    const inches = profileData.height / 2.54;
    const feet = Math.floor(inches / 12);
    const remaining = Math.round(inches % 12);
    return `${feet}'${remaining}"`;
  };



  const generateSingleTryOn = async (outfitType, garmentUrl) => {
    if (!profileData.photoUrl) {
      console.error("❌ No user photo available");
      return;
    }

    setGeneratingOutfit(outfitType);
    console.log(`🚀 Starting try-on for: ${outfitType}`);

    try {
      const formData = new FormData();
      formData.append("model", dataURLtoFile(profileData.photoUrl, "user.jpg"));
      formData.append("garmentUrl", garmentUrl); // ← Keep as URL (backend now handles it)
      formData.append("outfitType", outfitType);

      console.log(`📤 Sending request to server...`);

      const res = await fetch("/api/single-tryon", { // ← CHANGED: Use query param
        method: "POST",
        body: formData
      });

      console.log(`📡 Server responded with status: ${res.status}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log(`✅ Try-on successful for ${outfitType}`);

      if (data.success && data.result) {
        setGeneratedResults(prev => ({
          ...prev,
          [outfitType]: data.result
        }));

        setCenterImage(data.result);
        setSelectedOutfit(outfitType);
      } else {
        throw new Error(data.error || "No result image returned");
      }
    } catch (err) {
      console.error(`❌ Try-on failed for ${outfitType}:`, err);
      alert(`Try-on failed for ${outfitType}: ${err.message}`);
    } finally {
      setGeneratingOutfit(null);
    }
  };





  // const generateSingleTryOn = async (outfitType, garmentUrl) => {
  //   if (!profileData.photoUrl) return;

  //   setGeneratingOutfit(outfitType);

  //   try {
  //     const formData = new FormData();
  //     formData.append("model", dataURLtoFile(profileData.photoUrl, "user.jpg"));
  //     formData.append("garmentUrl", garmentUrl);
  //     formData.append("outfitType", outfitType);

  //     const res = await fetch("/api/single-tryon", {
  //       method: "POST",
  //       headers: {
  //         "Accept": "application/json"
  //       },
  //       body: formData
  //     });

  //     if (!res.ok) throw new Error(`Server error: ${res.status}`);

  //     const data = await res.json();

  //     if (data.result) {
  //       setGeneratedResults(prev => ({
  //         ...prev,
  //         [outfitType]: data.result
  //       }));

  //       setCenterImage(data.result);
  //       setSelectedOutfit(outfitType);
  //     }
  //   } catch (err) {
  //     console.error("❌ Try-on failed:", err);
  //     alert(`Try-on failed: ${outfitType}`);
  //   } finally {
  //     setGeneratingOutfit(null);
  //   }
  // };


  const outfitOptions = [
    {
      id: 'saree',
      label: 'Saree',
      subtitle: 'Elegant drape',
      staticImage: 'https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg',
      garmentUrl: 'https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg'  // ← REAL URL
    },
    {
      id: 'kurti',
      label: 'Kurti',
      subtitle: 'Casual comfort',
      staticImage: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765374582/kurti_dwohtr.avif',
      garmentUrl: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765374582/kurti_dwohtr.avif'  // ← REAL URL
    },
    {
      id: 'lehenga',
      label: 'Lehenga',
      subtitle: 'Festive charm',
      staticImage: 'https://res.cloudinary.com/doiezptnn/image/upload/v1764941074/ChatGPT_Image_Nov_15_2025_11_58_37_AM_idf3zl.png',
      garmentUrl: 'https://res.cloudinary.com/doiezptnn/image/upload/v1764941074/ChatGPT_Image_Nov_15_2025_11_58_37_AM_idf3zl.png'  // ← REAL URL
    },
    {
      id: 'anarkali',
      label: 'Anarkali',
      subtitle: 'Regal flow',
      staticImage: 'https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png',
      garmentUrl: 'https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png'  // ← REAL URL
    },
  ];


  const ModelGalleryModal = () => {
    if (!showGalleryModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative shadow-2xl">

          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between shrink-0">
            <h3 className="text-xl font-semibold text-gray-900">Saved Models</h3>
            <button
              onClick={() => setShowGalleryModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center text-gray-500 text-2xl">×</div>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {Object.keys(savedResults).length === 0 && !profileData.photoUrl ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No saved models found.</p>
                <button
                  onClick={() => {
                    setShowGalleryModal(false);
                    // Reset to the save screen to create a new model
                    setHasSavedModels(false);
                    setCurrentStep(0);
                  }}
                  className="mt-4 text-[#33022F] font-medium hover:underline"
                >
                  Save your model
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Original Photo */}
                {profileData.photoUrl && (
                  <div className="space-y-2">
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                      <img
                        src={profileData.photoUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                        ORIGINAL
                      </div>
                    </div>
                    <p className="text-center font-medium text-sm">Your Photo</p>
                  </div>
                )}

                {/* Generated Results */}
                {Object.entries(savedResults).map(([outfitType, imageUrl]) => {
                  if (!imageUrl) return null;
                  return (
                    <div key={outfitType} className="space-y-2">
                      <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={outfitType}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <p className="text-center font-medium text-sm capitalize">
                        {outfitType}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SavedModelPreviewModal = () => {
    if (!previewModel) return null;

    return (
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setPreviewModel(null)}
      >
        <div
          className="relative bg-white rounded-lg p-3 sm:p-4 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setPreviewModel(null)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white text-lg leading-none hover:bg-black/75"
            aria-label="Close preview"
          >
            ×
          </button>

          <img
            src={previewModel.photoUrl}
            alt={previewModel.name}
            className="w-full max-h-[75vh] object-contain bg-[#F6F4F1]"
          />

          <p className="text-center text-sm sm:text-base font-semibold text-gray-900 mt-3">
            {previewModel.name}
          </p>
        </div>
      </div>
    );
  };


  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center min-h-[520px] px-4 sm:px-6 py-8 sm:py-10 md:py-6 lg:py-8">
            <div className="relative mb-6 xs:mb-7 sm:mb-8">
              <div className="w-20 h-20 xs:w-22 xs:h-22 sm:w-24 sm:h-24 bg-[#BE4949] flex items-center justify-center shadow-lg">
                <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                  <img src={women_ic} alt="" className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10" />
                </div>

                <div className="absolute -top-1 -right-3 sm:-right-4">
                  <img src={yellow_star} className="w-5 h-5 sm:w-6 sm:h-6" alt="" />
                </div>
              </div>

              <div className="absolute bottom-3 xs:bottom-3 sm:bottom-4 -left-5 sm:-left-6">
                <img src={pink_star} className="w-5 h-5 sm:w-6 sm:h-6" alt="" />
              </div>
            </div>

            <h2 className="text-xl xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-2 text-center px-2 leading-tight">
              Create Your Tryon Profile
            </h2>

            <p className="text-sm xs:text-sm sm:text-base text-[#45556C] text-center max-w-md mb-6 px-4 leading-relaxed">
              Tell us your height, body shape, skin tone, and hair details before we create your model.
            </p>

            <div className="w-full max-w-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Model name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(normalizeModelName(e.target.value))}
                  placeholder="Enter model name"
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#33022F]"
                />
              </div>

              <div className="border border-dashed border-gray-300 bg-white p-5 sm:p-6 text-center">
                <p className="text-gray-700 font-medium">You’ll answer a few quick questions next.</p>
                <p className="text-sm text-gray-500 mt-1">Your profile is created after the questionnaire and photo upload.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    if (!normalizeModelName(modelName)) {
                      alert('Please enter a model name using alphabets only.');
                      return;
                    }
                    setCurrentStep(1);
                  }}
                  disabled={!normalizeModelName(modelName)}
                  className="flex-1 h-12 text-white text-sm font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--villy-primary, #33022F)' }}
                >
                  START CREATING
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                {savedModels.length} / 4 models saved
              </div>
            </div>
          </div>
        );


      case 1:
        return (
          <div className="max-w-2xl mx-auto px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 py-4 xs:py-5 sm:py-6 md:py-3 lg:py-0">
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1.5 xs:mb-2 sm:mb-2 md:mb-1.5 lg:mb-2 text-center sm:text-left">
              How tall are you?
            </h2>
            <p className="text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#45556C] font-family-outfit mb-6 xs:mb-7 sm:mb-8 md:mb-5 lg:mb-8 text-center sm:text-left">
              We'll use this to scale your virtual try-on accurately.
            </p>

            <div className="flex gap-2 justify-center mt-8 xs:mt-9 sm:mt-12 md:mt-6 lg:mt-12 mb-6 xs:mb-7 sm:mb-8 md:mb-5 lg:mb-8">
              <button
                onClick={() => setProfileData({ ...profileData, unit: 'cm' })}
                className={`px-5 xs:px-5 sm:px-6 md:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2 md:py-1.5 lg:py-2 text-sm xs:text-sm sm:text-base md:text-sm lg:text-base font-medium transition-all ${profileData.unit === 'cm'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={profileData.unit === 'cm' ? { background: 'var(--DVYB-P-900, #200000)' } : undefined}
              >
                cm
              </button>
              <button
                onClick={() => setProfileData({ ...profileData, unit: 'ft' })}
                className={`px-5 xs:px-5 sm:px-6 md:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2 md:py-1.5 lg:py-2 text-sm xs:text-sm sm:text-base md:text-sm lg:text-base font-medium transition-all ${profileData.unit === 'ft'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ft
              </button>
            </div>

            <div className="text-center items-center justify-center flex gap-3 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-4 mb-6 xs:mb-7 sm:mb-8 md:mb-5 lg:mb-8">
              <div className="text-4xl xs:text-5xl sm:text-6xl md:text-5xl lg:text-6xl font-semibold text-gray-900">
                {profileData.unit === 'cm' ? profileData.height : getHeightInFeet()}
              </div>
              <div className="text-xl xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-normal text-gray-500">
                {profileData.unit === 'cm' ? 'cm' : ''}
              </div>
            </div>

            <div className="px-2 xs:px-2 sm:px-0 md:px-2 lg:px-0">
              <input
                type="range"
                min={profileData.unit === 'cm' ? 140 : 55}
                max={profileData.unit === 'cm' ? 220 : 86}
                value={profileData.unit === 'cm' ? profileData.height : Math.round(profileData.height / 2.54)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setProfileData({
                    ...profileData,
                    height: profileData.unit === 'cm' ? val : Math.round(val * 2.54)
                  });
                }}
                className="w-full h-[0.6px] bg-[#8B8680] rounded-lg appearance-none cursor-pointer accent-[#200000]"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
            </div>

            <p className="text-center text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm mt-6 xs:mt-7 sm:mt-9 md:mt-5 lg:mt-9 font-medium text-gray-600 tracking-wide">
              DRAG THIS TO SET YOUR HEIGHT
            </p>

            <div className={`max-w-4xl mx-auto mt-12  w-full items-center justify-center md:relative flex px-6`}>
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !profileData.bodyShape) ||
                  (currentStep === 3 && !profileData.skinTone) ||
                  (currentStep === 4 && (!profileData.hairType || !profileData.hairLength || !profileData.hairColor))
                }
                className="w-4xl h-14 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'var(--villy-primary, #33022F)' }}
              >
                CONTINUE
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );


      case 2:
        return (
          <div className="max-w-2xl mx-auto px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 py-4 xs:py-5 sm:py-8 md:py-3 lg:py-8">
            {/* Header Section */}
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1.5 xs:mb-2 sm:mb-2 md:mb-1.5 lg:mb-2 text-center sm:text-left">
              Which body shape describes you best?
            </h2>
            <p className="text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#45556C] mb-5 xs:mb-6 sm:mb-8 md:mb-4 lg:mb-8 text-center sm:text-left">
              This helps us show you how clothes will fit your unique silhouette.
            </p>

            {/* Body Shape Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-4 mb-5 xs:mb-6 sm:mb-8 md:mb-4 lg:mb-8">
              {bodyShapes.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => setProfileData({ ...profileData, bodyShape: shape.id })}
                  className={`p-5 xs:p-6 sm:p-8 md:p-6 lg:p-12 border-2 transition-all text-center ${profileData.bodyShape === shape.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="font-semibold text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-gray-900">
                    {shape.label}
                  </div>
                </button>
              ))}
            </div>


            <div className={`max-w-4xl  mt-6  items-center justify-center md:relative   flex   `}>
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !profileData.bodyShape) ||
                  (currentStep === 3 && !profileData.skinTone) ||
                  (currentStep === 4 && (!profileData.hairType || !profileData.hairLength || !profileData.hairColor))
                }
                className="w-4xl h-14 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'var(--villy-primary, #33022F)' }}
              >
                CONTINUE
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        );


      case 3:
        return (
          <div className="max-w-2xl mx-auto mt-12 px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 py-4 xs:py-5 sm:py-6 md:py-3 lg:py-0">
            {/* Header Section */}
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1.5 xs:mb-2 sm:mb-2 md:mb-1.5 lg:mb-2 text-center sm:text-left">
              Which skin tone is closest to yours?
            </h2>
            <p className="text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#45556C] mb-5 xs:mb-6 sm:mb-8 md:mb-4 lg:mb-8 text-center sm:text-left">
              This ensures your virtual avatar represents you authentically.
            </p>

            {/* Skin Tone Grid */}
            <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-4">
              {skinTones.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => setProfileData({ ...profileData, skinTone: tone.id })}
                  className={`flex flex-col items-center gap-2 xs:gap-2 sm:gap-3 md:gap-2 lg:gap-3 p-2.5 xs:p-3 sm:p-4 md:p-3 lg:p-4 border-2 transition-all ${profileData.skinTone === tone.id
                    ? 'border-primary'
                    : 'border-transparent hover:border-gray-300'
                    }`}
                >
                  {/* Color Circle */}
                  <div
                    className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-12 md:h-12 lg:w-16 lg:h-16"
                    style={{ backgroundColor: tone.color }}
                  />

                  {/* Label */}
                  <span className="text-[10px] xs:text-xs sm:text-sm md:text-xs lg:text-sm font-medium text-gray-700 text-center leading-tight">
                    {tone.label}
                  </span>
                </button>
              ))}
            </div>

            <div className={`max-w-4xl  mt-12  items-center justify-center md:relative   flex   `}>
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !profileData.bodyShape) ||
                  (currentStep === 3 && !profileData.skinTone) ||
                  (currentStep === 4 && (!profileData.hairType || !profileData.hairLength || !profileData.hairColor))
                }
                className="w-4xl h-14 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'var(--villy-primary, #33022F)' }}
              >
                CONTINUE
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );


      case 4:
        return (
          <div className="max-w-2xl mx-auto px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 py-4 mt-22 xs:py-5 sm:py-10 md:py-3 lg:py-10">
            {/* Header */}
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1.5 xs:mb-2 sm:mb-2 md:mb-1.5 lg:mb-2 text-center sm:text-left">
              Tell us about your hair
            </h2>
            <p className="text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#45556C] mb-5 xs:mb-6 sm:mb-8 md:mb-4 lg:mb-8 text-center sm:text-left">
              These details help personalize your virtual avatar.
            </p>

            <div className="space-y-5 xs:space-y-5 sm:space-y-8 md:space-y-4 lg:space-y-8">
              {/* Hair Color Section */}
              <div>
                <label className="block text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm font-medium text-gray-700 mb-2.5 xs:mb-3 sm:mb-4 md:mb-2.5 lg:mb-4">
                  Hair Color
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 xs:gap-2 sm:gap-3 md:gap-2 lg:gap-3">
                  {hairColors.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setProfileData({ ...profileData, hairColor: color.id })}
                      className={`flex items-center gap-2 xs:gap-2 sm:gap-3 md:gap-2 lg:gap-6 p-2 xs:p-2 sm:p-3 md:p-2 lg:p-3 border-2 transition-all ${profileData.hairColor === color.id
                        ? 'border-[#2C2826] bg-gray-50'
                        : 'border-[#E5E1DB] bg-white hover:border-gray-300'
                        }`}
                    >
                      <div
                        className="w-6 h-6 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.color }}
                      ></div>
                      <span className="text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm font-medium truncate">
                        {color.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Type Section */}
              <div>
                <label className="block text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm font-medium text-gray-700 mb-2.5 xs:mb-3 sm:mb-4 md:mb-2.5 lg:mb-4">
                  Hair Type
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2 xs:gap-2 sm:gap-3 md:gap-2 lg:gap-3">
                  {hairTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setProfileData({ ...profileData, hairType: type.id })}
                      className={`p-2.5 xs:p-3 sm:p-4 md:p-3 lg:p-4 border-2 transition-all ${profileData.hairType === type.id
                        ? 'border-[#2C2826] bg-gray-50'
                        : 'border-[#E5E1DB] bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className="text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm font-medium">
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Length Section */}
              <div>
                <label className="block text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm font-medium text-gray-700 mb-2.5 xs:mb-3 sm:mb-4 md:mb-2.5 lg:mb-4">
                  Hair Length
                </label>
                <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 xs:gap-2 sm:gap-3 md:gap-2 lg:gap-3">
                  {hairLengths.map(length => (
                    <button
                      key={length.id}
                      onClick={() => setProfileData({ ...profileData, hairLength: length.id })}
                      className={`py-2 xs:py-2.5 sm:py-3 md:py-2.5 lg:py-3 px-3 xs:px-4 sm:px-6 md:px-4 lg:px-6 border-2 text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm font-medium transition-all ${profileData.hairLength === length.id
                        ? 'border-[#2C2826] bg-gray-50'
                        : 'border-[#E5E1DB] bg-white hover:border-gray-300'
                        }`}
                    >
                      {length.label}
                    </button>
                  ))}



                </div>


              </div>

            </div>
            <div className={`max-w-4xl  mt-8  items-center justify-center md:relative   flex   `}>
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !profileData.bodyShape) ||
                  (currentStep === 3 && !profileData.skinTone) ||
                  (currentStep === 4 && (!profileData.hairType || !profileData.hairLength || !profileData.hairColor))
                }
                className="w-4xl h-14 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'var(--villy-primary, #33022F)' }}
              >
                CONTINUE
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );



      case 5:
        return (
          <div className="max-w-2xl mt-22  mx-auto px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 py-4 xs:py-5 sm:py-10 md:py-3 lg:py-10">
            {/* Header */}
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1 xs:mb-1 sm:mb-2 md:mb-1 lg:mb-2 text-center sm:text-left">
              Take your photo
            </h2>
            <p className="text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#45556C] mb-3 xs:mb-3 sm:mb-4 md:mb-2 lg:mb-2 text-center sm:text-left">
              This helps us create a more accurate virtual avatar of you.
            </p>

            {/* Tips Card */}
            <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-4 lg:mb-6 p-4 xs:p-5 sm:p-6 md:p-4 lg:p-6 bg-[#E3C9E1]">
              <div className="font-medium text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#400000] mb-3 xs:mb-3 sm:mb-4 md:mb-3 lg:mb-4">
                For best results:
              </div>
              <ul className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-1.5 lg:space-y-2 text-xs xs:text-sm sm:text-sm md:text-xs lg:text-sm text-[#4A2D47] font-semibold">
                <li>• Stand straight facing the camera with your arms at your sides.</li>
                <li>• Full-body frame: Ensure you are visible from head to toe.</li>
                <li>• Lighting &amp; Background: Use bright light and a plain, neutral background.</li>
                <li>• Wear fitted clothing: This allows the AI to map the outfit to your body shape accurately.</li>
                <li>• Photo Quality: Avoid blurry, dark, filtered, or cropped images.</li>
                <li>• Single Subject: Make sure you are the only person in the photo.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 xs:space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4">
              {/* Take Photo Button */}
              <button
                onClick={startCamera}
                disabled={cameraError || processingImage}
                className="w-full p-4 xs:p-5 sm:p-6 md:p-4 lg:p-6 border-2 border-[#200000] hover:bg-gray-50 transition-all flex items-center gap-3 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-[#400000] flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-gray-900">
                    Take a Photo
                  </div>
                  <div className="text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm text-gray-500">
                    Use your camera to capture a selfie
                  </div>
                </div>
              </button>

              {/* Upload Photo Button */}
              <button
                onClick={() => {
                  if (processingImage) return;
                  fileInputRef.current?.click();
                }}
                disabled={processingImage}
                className="w-full p-4 xs:p-5 sm:p-6 md:p-4 lg:p-6 border-2 border-[#4000003D] hover:border-gray-300 transition-all flex items-center gap-3 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-[#F0EDE8] flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-gray-900">
                    Upload a Photo
                  </div>
                  <div className="text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm text-gray-500">
                    Choose an existing photo from your device
                  </div>
                </div>
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Camera Error Message */}
              {cameraError && (
                <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-4 lg:mt-6 p-3 xs:p-3 sm:p-4 md:p-3 lg:p-4 bg-gray-900 text-white text-center">
                  <p className="font-medium text-xs xs:text-sm sm:text-sm md:text-xs lg:text-sm mb-2">
                    Unable to access camera. Please check permissions.
                  </p>
                  <button onClick={startCamera} className="text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm underline">
                    Try Again
                  </button>
                </div>
              )}

              {processingImage && (
                <div className="mt-4 p-3 bg-[#33022F]/10 border border-[#33022F]/20 text-[#33022F] text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enhancing your background, please wait...
                </div>
              )}

            </div>
          </div>
        );




      case 6:
        return (
          <div className="max-w-2xl mx-auto justify-center items-center px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 py-4 xs:py-5 sm:py-8 md:py-3 lg:py-8">
            {/* Header */}
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 md:mb-1 lg:mb-2 text-center sm:text-left">
              Take your photo
            </h2>
            <p className="text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#45556C] mb-4 xs:mb-5 sm:mb-8 md:mb-4 lg:mb-8 text-center sm:text-left">
              This helps us create a more accurate virtual avatar of you.
            </p>

            {/* Tips Card */}
            <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-4 lg:mb-6 p-4 xs:p-5 sm:p-6 md:p-4 lg:p-6 bg-[#F6F4F1]">
              <div className="font-medium text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#400000] mb-2.5 xs:mb-3 sm:mb-3 md:mb-2.5 lg:mb-3">
                For best results:
              </div>
              <ul className="space-y-1.5 xs:space-y-1.5 sm:space-y-2 md:space-y-1.5 lg:space-y-2 text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm text-gray-600">
                <li>• Stand straight facing the camera with your arms at your sides.</li>
                <li>• Full-body frame: Ensure you are visible from head to toe.</li>
                <li>• Lighting &amp; Background: Use bright light and a plain, neutral background.</li>
                <li>• Wear fitted clothing: This allows the AI to map the outfit to your body shape accurately.</li>
                <li>• Photo Quality: Avoid blurry, dark, filtered, or cropped images.</li>
                <li>• Single Subject: Make sure you are the only person in the photo.</li>
              </ul>
            </div>

            {/* Camera/Preview Container */}
            <div className="space-y-3 xs:space-y-4 sm:space-y-4 md:space-y-3 lg:space-y-4">
              <div className="relative overflow-hidden bg-gray-900 aspect-[3/4]">
                {capturedImage ? (
                  <>
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay with profile details */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-3 xs:p-3 sm:p-4 md:p-3 lg:p-4">
                      <div className="grid grid-cols-2 gap-x-3 xs:gap-x-4 sm:gap-x-4 md:gap-x-3 lg:gap-x-4 gap-y-1.5 xs:gap-y-2 sm:gap-y-2 md:gap-y-1.5 lg:gap-y-2 text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm">
                        <div>
                          <span className="text-gray-600">Height</span>
                          <p className="font-medium">{profileData.height} cm</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Body Shape</span>
                          <p className="font-medium capitalize">{profileData.bodyShape}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Hair</span>
                          <p className="font-medium capitalize">{profileData.hairLength} {profileData.hairType}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Skin Tone</span>
                          <p className="font-medium capitalize">{profileData.skinTone}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Capture/Continue Button */}
              <button
                onClick={capturedImage ? handleSaveModel : capturePhoto}
                disabled={processingImage || savingProfile}
                className="w-full h-12 xs:h-12 sm:h-14 md:h-11 lg:h-14 bg-gradient-to-r from-red-500 to-orange-400 text-white text-sm xs:text-sm sm:text-base md:text-sm lg:text-base font-semibold hover:shadow-lg transition-all"
              >
                {processingImage ? 'PROCESSING BACKGROUND...' : capturedImage ? 'SAVE & CONTINUE' : 'CAPTURE PHOTO'}
              </button>

            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        );


      case 7:
        return (
          <div className="min-h-screen mt-28 bg-[#FAFAFA] flex flex-col">
            {/* Main Content – Image Left, Text Right */}
            <div className="flex-1 flex flex-col justify-center items-center lg:flex-row px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 gap-4 xs:gap-5 sm:gap-8 md:gap-4 lg:gap-8 py-4 xs:py-5 sm:py-6 md:py-3 lg:py-6">

              {/* Left: Photo Preview */}
              <div className="flex-1 w-full lg:max-w-md">
                <img
                  src={capturedImage || "https://i.imgur.com/1Qw2X3j.jpg"}
                  alt="Your photo"
                  className="w-full h-full min-h-[280px] xs:min-h-[320px] sm:min-h-96 md:min-h-[280px] lg:min-h-96 object-cover shadow-md"
                />
              </div>

              {/* Right: Text + Tips */}
              <div className=" flex flex-col justify-center -mt-38 w-full  max-w-md">
                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 md:mb-1 lg:mb-2 text-center lg:text-left">
                  Your Model: {normalizeModelName(modelName) || 'Model'}
                </h1>
                <p className="text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-[#45556C] mb-4 xs:mb-5 sm:mb-8 md:mb-4 lg:mb-8 text-center lg:text-left">
                  Review your model and continue, or retake the image.
                </p>

                {/* Tips Card */}
                <div
                  className="p-4 xs:p-5 sm:p-6 md:p-4 lg:p-6 shadow-sm border border-gray-100 mb-4 xs:mb-5 sm:mb-6 md:mb-4 lg:mb-6"
                  style={{ backgroundColor: '#BA8DB7' }}
                >
                  <p className="font-semibold text-sm xs:text-sm sm:text-base md:text-sm lg:text-base text-primary mb-3 xs:mb-3 sm:mb-4 md:mb-3 lg:mb-4">
                    For best results:
                  </p>
                  <ul className="space-y-2 xs:space-y-2 sm:space-y-3 md:space-y-2 lg:space-y-3 text-[#403200]">
                    {[
                      "Stand straight facing the camera with your arms at your sides.",
                      "Full-body frame: Ensure you are visible from head to toe.",
                      "Lighting & Background: Use bright light and a plain, neutral background.",
                      "Wear fitted clothing: This allows the AI to map the outfit to your body shape accurately.",
                      "Photo Quality: Avoid blurry, dark, filtered, or cropped images.",
                      "Single Subject: Make sure you are the only person in the photo."
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 xs:gap-2 sm:gap-3 md:gap-2 lg:gap-3">
                        <span className="text-base xs:text-base sm:text-lg md:text-base lg:text-lg leading-none">•</span>
                        <span className="text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 xs:space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4">
                  {/* Continue Button */}
                  <button
                    onClick={handleSaveModel}
                    className="w-full h-11 xs:h-12 sm:h-14 md:h-11 lg:h-14 text-white text-sm xs:text-sm sm:text-lg md:text-sm lg:text-lg font-bold shadow-md flex items-center justify-center"
                    style={{ backgroundColor: '#33022F' }}
                  >
                    SAVE & CONTINUE →
                  </button>
                  {/* Retake Button */}
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      setCurrentStep(5);
                    }}
                    className="w-full h-10 xs:h-11 sm:h-12 md:h-10 lg:h-12 bg-white border border-gray-300 text-gray-800 text-xs xs:text-sm sm:text-sm md:text-xs lg:text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Camera size={16} className="xs:w-[18px] xs:h-[18px] sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    RETAKE PHOTO
                  </button>
                </div>
              </div>
            </div>
          </div>
        );



      case 8: // AI TRY-ON - Mobile & Desktop versions
        return (
          <>
            {/* Back Button - Desktop Only */}
            <div className="hidden md:block absolute top-6  left-56 mt-6 z-40">
              <button onClick={handleBack} className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black">
                <ChevronLeft size={20} /> Back
              </button>
            </div>

            {/* ========== MOBILE VERSION ========== */}
            <div className="md:hidden relative min-h-screen  bg-white flex flex-col px-3 xs:px-4 pt-4 xs:pt-6 pb-20 xs:pb-24">

              {/* Mobile Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 mb-3 xs:mb-4"
              >
                <ChevronLeft size={18} className="xs:w-5 xs:h-5" />
                <span className="text-xs xs:text-sm">Back</span>
              </button>

              {/* Title */}
              <h2 className="text-[#FF6B4A] text-base xs:text-xl font-medium mb-1">
                Your virtual look is ready — want to see how amazing you look?
              </h2>

              {/* Subtitle */}
              <p className="text-gray-600 text-[10px] xs:text-xs mb-2 xs:mb-3">
                Your outfit categories are already curated for you. Explore refined colors and unique styles
              </p>

              {/* CTA Text */}
              <p className="text-gray-800 text-xs xs:text-sm font-medium mb-4 xs:mb-6">
                CLICK below for TRYON
              </p>

              {/* Main Image Carousel Container */}
              <div className="relative w-full flex items-center justify-center mb-4 xs:mb-6 overflow-hidden">

                {/* Left Arrow */}
                <button
                  onClick={() => {
                    const currentIndex = outfitOptions.findIndex(o => o.id === selectedOutfit);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : outfitOptions.length - 1;
                    const prevOutfit = outfitOptions[prevIndex];
                    setSelectedOutfit(prevOutfit.id);
                    if (generatedResults[prevOutfit.id]) {
                      setCenterImage(generatedResults[prevOutfit.id]);
                    }
                  }}
                  className="absolute left-0 z-10 bg-white/80 rounded-full p-1.5 xs:p-2 shadow-md"
                >
                  <ChevronLeft size={20} className="xs:w-6 xs:h-6 text-gray-700" />
                </button>

                {/* Images */}
                <div className="flex items-center justify-center gap-1 px-10 xs:px-12">
                  {outfitOptions.map((outfit, index) => {
                    const isCenter = outfit.id === selectedOutfit;
                    const currentIndex = outfitOptions.findIndex(o => o.id === selectedOutfit);

                    let position = index - currentIndex;
                    if (position < -2) position += outfitOptions.length;
                    if (position > 2) position -= outfitOptions.length;

                    if (Math.abs(position) > 2) return null;

                    return (
                      <div
                        key={outfit.id}
                        onClick={() => {
                          setSelectedOutfit(outfit.id);
                          if (outfit.id === "original") {
                            setCenterImage(capturedImage);
                            return;
                          }
                          if (generatedResults[outfit.id]) {
                            setCenterImage(generatedResults[outfit.id]);
                          } else {
                            generateSingleTryOn(outfit.id, outfit.garmentUrl);
                          }
                        }}
                        className={`transition-all duration-500 ease-out cursor-pointer flex-shrink-0
                    ${isCenter
                            ? 'w-[160px] h-[230px] xs:w-[200px] xs:h-[280px] z-20 scale-100 opacity-100'
                            : position === -1 || position === 1
                              ? 'w-[100px] h-[150px] xs:w-[120px] xs:h-[180px] z-10 scale-90 opacity-60'
                              : 'w-[70px] h-[100px] xs:w-[80px] xs:h-[120px] z-0 scale-75 opacity-30'
                          }
                  `}
                        style={{
                          transform: `translateX(${position * (isCenter ? 0 : position > 0 ? -30 : 30)}px)`
                        }}
                      >
                        <img
                          src={
                            outfit.id === "original"
                              ? capturedImage
                              : generatedResults[outfit.id] || outfit.staticImage
                          }
                          alt={outfit.label}
                          className="w-full h-full object-cover rounded-lg shadow-xl"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => {
                    const currentIndex = outfitOptions.findIndex(o => o.id === selectedOutfit);
                    const nextIndex = currentIndex < outfitOptions.length - 1 ? currentIndex + 1 : 0;
                    const nextOutfit = outfitOptions[nextIndex];
                    setSelectedOutfit(nextOutfit.id);
                    if (generatedResults[nextOutfit.id]) {
                      setCenterImage(generatedResults[nextOutfit.id]);
                    }
                  }}
                  className="absolute right-0 z-10 bg-white/80 rounded-full p-1.5 xs:p-2 shadow-md"
                >
                  <ChevronRight size={20} className="xs:w-6 xs:h-6 text-gray-700" />
                </button>
              </div>

              {/* Bottom Navigation Dots */}
              <div className="flex justify-center items-center gap-4 xs:gap-6 mb-6 xs:mb-8">
                {outfitOptions.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() => {
                      setSelectedOutfit(outfit.id);
                      if (generatedResults[outfit.id]) {
                        setCenterImage(generatedResults[outfit.id]);
                      } else {
                        generateVirtualTryOns(outfit.id, outfit.garmentUrl);
                      }
                    }}
                    className={`text-[10px] xs:text-xs font-medium transition-all ${outfit.id === selectedOutfit
                      ? 'text-[#FF6B4A] border-b-2 border-[#FF6B4A] pb-1'
                      : 'text-gray-500'
                      }`}
                  >
                    {outfit.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 xs:gap-3 px-2">
                <button
                  onClick={async () => {
                    setSavingProfile(true);
                    try {
                      // 1. Save profile data
                      const dataToSave = {
                        ...profileData,
                        modelName: normalizeModelName(modelName),
                        photoUrl: capturedImage || profileData.photoUrl,
                      };
                      await profileService.saveProfile(dataToSave, userCollection);

                      // 2. Save try-on results (uploads to Cloudinary + saves URLs to Firestore)
                      const cloudinaryUrls = await profileService.saveTryOnResults(generatedResults, userCollection);

                      console.log("✅ All data saved successfully");
                      console.log("Cloudinary URLs:", cloudinaryUrls);

                      // Update local saved state so models show on re-visit
                      setSavedResults(cloudinaryUrls);
                      setHasSavedModels(true);

                      setCurrentStep(9);
                    } catch (error) {
                      console.error("❌ Save error:", error);
                      alert(`Error saving profile: ${error.message}`);
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  disabled={savingProfile || Object.keys(generatedResults).length === 0}
                  className="w-full h-11 xs:h-12 bg-[#33022F] 
text-white text-xs xs:text-sm font-semibold rounded flex items-center justify-center gap-2
disabled:opacity-50 transition-all"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="xs:w-[18px] xs:h-[18px]" />
                      SAVE & CONTINUE
                    </>
                  )}
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="w-full h-10 xs:h-12 border-2 border-[#FF6B4A] text-[#FF6B4A] 
              text-xs xs:text-sm font-semibold rounded flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} className="xs:w-[18px] xs:h-[18px]" />
                  EDIT PROFILE
                </button>
              </div>
            </div>

            {/* ========== DESKTOP VERSION ========== */}
            <div className="hidden md:flex relative min-h-screen mt-24 bg-[#FCFAF7] flex-col items-center px-4 md:px-6 pt-6 md:pt-10 pb-16 md:pb-24">

              {/* Title */}
              <h2 className="text-xl md:text-[28px] font-semibold text-gray-900 text-center max-w-2xl leading-snug">
                Your virtual look is ready — want to see how amazing you look?
              </h2>

              {/* Subtitle */}
              <p className="text-xs md:text-[14px] text-gray-500 mt-1.5 md:mt-2 text-center">
                All four outfit categories have been pre-selected for you. You can explore
                different colors and styles while shopping.
              </p>

              {/* MAIN GRID */}
              <div className="flex justify-center items-start gap-6 md:gap-10 mt-8 md:mt-12 w-full max-w-6xl">

                {/* LEFT - 2 outfits */}
                <div className="flex gap-4 md:gap-6 items-center">
                  {outfitOptions.slice(0, 2).map((outfit, index) => (
                    <button
                      key={outfit.id}
                      onClick={() => {
                        setSelectedOutfit(outfit.id);
                        if (generatedResults[outfit.id]) {
                          setCenterImage(generatedResults[outfit.id]);
                        } else {
                          generateVirtualTryOns(outfit.id, outfit.garmentUrl);
                        }
                      }}
                      disabled={generatingOutfit !== null}
                      className={`relative overflow-hidden shadow-md transition-all
                  ${index === 0 ? "h-[150px] w-[115px] md:h-[170px] md:w-[130px]" : "h-[175px] w-[135px] md:h-[198px] md:w-[150px]"}
                `}
                    >
                      <img
                        src={generatedResults[outfit.id] || outfit.staticImage}
                        alt={outfit.label}
                        className={`w-full h-full object-contain transition-all duration-300 ${!generatedResults[outfit.id] ? "grayscale brightness-50" : ""
                          }`}
                      />

                      {!generatedResults[outfit.id] && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                          <p className="text-[10px] md:text-xs font-medium mb-2">
                            GENERATING {outfit.label.toUpperCase()}...
                          </p>
                          <Loader2 className="animate-spin" size={20} />
                        </div>
                      )}

                      {generatedResults[outfit.id] && (
                        <>
                          <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 md:px-4 py-1 rounded">
                            <p className="text-white font-medium text-[10px] md:text-xs">{outfit.label.toUpperCase()}</p>
                          </div>
                          <div className="absolute top-2 md:top-3 right-2 md:right-3 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {/* CENTER IMAGE */}
                <div className="flex justify-center items-center">
                  <img
                    src={capturedImage}
                    alt="You"
                    className="w-[150px] h-[210px] md:w-[180px] md:h-[250px] max-w-full -mt-4 md:-mt-6 shadow-2xl object-cover"
                  />
                </div>

                {/* RIGHT - 2 outfits */}
                <div className="flex gap-4 md:gap-6 items-center">
                  {outfitOptions.slice(2, 4).map((outfit, index) => (
                    <button
                      key={outfit.id}
                      onClick={() => {
                        setSelectedOutfit(outfit.id);
                        if (generatedResults[outfit.id]) {
                          setCenterImage(generatedResults[outfit.id]);
                        } else {
                          generateVirtualTryOns(outfit.id, outfit.garmentUrl);
                        }
                      }}
                      disabled={generatingOutfit !== null}
                      className={`relative overflow-hidden shadow-md transition-all
                  ${index === 0 ? "h-[175px] w-[135px] md:h-[198px] md:w-[150px]" : "h-[150px] w-[115px] md:h-[170px] md:w-[130px]"}
                `}
                    >
                      <img
                        src={generatedResults[outfit.id] || outfit.staticImage}
                        alt={outfit.label}
                        className={`w-full h-full object-cover transition-all duration-300 ${!generatedResults[outfit.id] ? "grayscale brightness-50" : ""
                          }`}
                      />

                      {!generatedResults[outfit.id] && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                          <p className="text-[10px] md:text-xs font-medium mb-2">
                            GENERATING {outfit.label.toUpperCase()}...
                          </p>
                          <Loader2 className="animate-spin" size={20} />
                        </div>
                      )}

                      {generatedResults[outfit.id] && (
                        <>
                          <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 md:px-4 py-1 rounded">
                            <p className="text-white font-medium text-[10px] md:text-xs">{outfit.label.toUpperCase()}</p>
                          </div>
                          <div className="absolute top-2 md:top-3 right-2 md:right-3 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* SAVE & EDIT BUTTONS */}
              <div className="flex justify-center items-center gap-6 md:gap-8 mt-10 md:mt-14">
                <button
                  onClick={async () => {
                    setSavingProfile(true);
                    try {
                      const dataToSave = {
                        ...profileData,
                        modelName: normalizeModelName(modelName),
                        photoUrl: capturedImage || profileData.photoUrl,
                      };
                      await profileService.saveProfile(dataToSave, userCollection);
                      const cloudinaryUrls = await profileService.saveTryOnResults(generatedResults, userCollection);
                      console.log("✅ All data saved successfully");

                      // Update local saved state so models show on re-visit
                      setSavedResults(cloudinaryUrls);
                      setHasSavedModels(true);

                      setCurrentStep(9);
                    } catch (error) {
                      console.error("❌ Save error:", error);
                      alert(`Error saving profile: ${error.message}`);
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  disabled={savingProfile || Object.keys(generatedResults).length === 0}
                  className="w-[180px] md:w-[210px] h-12 md:h-14 bg-[#33022F] 
text-white text-sm md:text-base font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    "SAVE & CONTINUE"
                  )}
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="text-gray-600 text-sm md:text-base font-medium hover:text-gray-900 flex items-center gap-2"
                >
                  <Edit2 size={16} className="md:w-[18px] md:h-[18px]" />
                  EDIT PROFILE
                </button>
              </div>
            </div>
          </>
        );




      case 9: // Success
        return (
          <div className="flex flex-col justify-center items-center min-h-[400px] xs:min-h-[450px] sm:min-h-[500px] md:min-h-[400px] lg:min-h-[500px] px-4 xs:px-5 sm:px-6 md:px-4 lg:px-6 py-6 xs:py-8 sm:py-10 md:py-6 lg:py-10">

            {/* Main content - centered */}
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="text-center max-w-md w-full">

                {/* Success Icon */}
                <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-6 xs:mb-7 sm:mb-8 md:mb-5 lg:mb-8">
                  <img
                    src={success_mark}
                    className="h-full w-full object-contain"
                    alt="Success"
                  />
                </div>

                {/* Title */}
                <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-2xl lg:text-3xl font-semibold text-black mb-4 xs:mb-5 sm:mb-6 md:mb-4 lg:mb-6 leading-tight px-2">
                  Your Tryon Profile is Ready
                </h2>

                {/* Subtitle */}
                <p className="text-[#45556C] text-sm xs:text-base sm:text-lg md:text-base lg:text-lg mb-8 xs:mb-9 sm:mb-10 md:mb-7 lg:mb-10 leading-relaxed px-2">
                  You can now see how clothes will look on your virtual avatar while shopping.
                </p>

                <div className="flex flex-col items-center gap-3">
                  {/* Start Button */}
                  <button
                    onClick={handleComplete}
                    className="h-12 xs:h-13 sm:h-14 md:h-12 lg:h-14 px-10 xs:px-11 sm:px-12 md:px-10 lg:px-12 text-white font-bold text-sm xs:text-base sm:text-lg md:text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    style={{ background: 'var(--villy-primary, #33022F)' }}
                  >
                    START TRYING ON
                  </button>

                  <button
                    onClick={() => {
                      setHasSavedModels(true);
                      setCurrentStep(0);
                    }}
                    className="h-12 px-8 border-2 border-[#33022F] text-[#33022F] font-semibold text-sm sm:text-base hover:bg-[#33022F]/5 transition-all duration-200"
                  >
                    VIEW YOUR SAVED MODELS
                  </button>
                </div>
              </div>
            </div>
          </div>
        );



      default:
        return null;
    }
  };

  // Loading state while checking for existing models
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#33022F] mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading your models...</p>
        </div>
      </div>
    );
  }

  // Saved Models View — show when user already has generated models
  if (hasSavedModels && currentStep === 0) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen flex flex-col justify-start pb-20">
        <ModelGalleryModal />
        <SavedModelPreviewModal />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
              My Saved Models
            </h1>
            <p className="text-sm sm:text-base text-[#45556C]">
              You can save up to 4 named models and revisit them later.
            </p>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {savedModels.map((model) => (
              <div
                key={model.id || model.name}
                onClick={() => {
                  setSelectedModelId(getModelKey(model));
                  setPreviewModel(model);
                }}
                className={`bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer ${selectedModelId === getModelKey(model)
                  ? 'ring-2 ring-[#33022F]'
                  : 'ring-1 ring-transparent'
                  }`}
              >
                <div className="relative bg-[#F6F4F1] aspect-[3/4] overflow-hidden">
                  <img
                    src={model.photoUrl}
                    alt={model.name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase">
                    {selectedModelId === getModelKey(model) ? 'Selected' : 'Saved'}
                  </div>
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                    {model.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/womenwear')}
              className="w-full sm:w-auto px-8 h-12 sm:h-14 text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-200"
              style={{ background: 'var(--villy-primary, #33022F)' }}
            >
              START SHOPPING
            </button>
            <button
              onClick={() => {
                if (savedModels.length >= 4) {
                  alert('You can save up to 4 models. Delete one before adding a new model.');
                  return;
                }

                setCapturedImage(null);
                setModelName('');
                setSelectedModelId(null);
                setPreviewModel(null);
                setHasSavedModels(false);
                setCurrentStep(0);
              }}
              className="w-full sm:w-auto px-8 h-12 sm:h-14 border-2 border-[#33022F] text-[#33022F] text-sm sm:text-base font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              SAVE ANOTHER MODEL
            </button>
            <button
              onClick={async () => {
                const selectedModel = savedModels.find((item) => getModelKey(item) === selectedModelId);
                if (!selectedModel) return;

                if (!window.confirm(`Are you sure you want to delete model "${selectedModel.name}"?`)) return;
                setDeletingProfile(true);
                try {
                  const remainingModels = await profileService.deleteSavedModel(selectedModelId, userCollection);
                  setSavedModels(remainingModels);
                  setSelectedModelId(null);
                  setPreviewModel(null);
                  setHasSavedModels(remainingModels.length > 0);

                  if (remainingModels.length > 0) {
                    const primary = remainingModels[0];
                    setModelName(normalizeModelName(primary.name || ''));
                    setCapturedImage(primary.photoUrl || null);
                    setProfileData((prev) => ({
                      ...prev,
                      modelName: primary.name || prev.modelName,
                      photoUrl: primary.photoUrl || '',
                    }));
                  } else {
                    setSavedResults({});
                    setModelName('');
                    setProfileData(prev => ({ ...prev, photoUrl: '' }));
                    setCapturedImage(null);
                    setGeneratedResults({});
                    setCenterImage(null);
                    setCurrentStep(0);
                  }
                } catch (error) {
                  console.error('❌ Delete error:', error);
                  alert(`Error deleting model: ${error.message}`);
                } finally {
                  setDeletingProfile(false);
                }
              }}
              disabled={deletingProfile || !selectedModelId}
              className="w-full sm:w-auto px-8 h-12 sm:h-14 border-2 border-red-500 text-red-500 text-sm sm:text-base font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deletingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  DELETING...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {selectedModelId ? 'DELETE MODEL' : 'SELECT MODEL TO DELETE'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden  bg-[#FAF8F5] flex flex-col min-h-screen h-auto pb-20">
      {/* Progress Bar */}


      <div className="mt-1">
        <div className="max-w-2xl mx-auto px-6 py-1">
          <div className="text-xs text-gray-600 mb-1">{getDisplayedStep()} of {totalSteps}</div>
          <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-600 transition-all"
              style={{ width: `${(getDisplayedStep() / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Back Button */}
      {currentStep > 0 && currentStep < 8 && (
        <div className={`absolute top-44   flex z-40 ${currentStep === 7 ? 'left-74 mt-2' : 'left-112 '}`}>
          <button onClick={handleBack} className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black">
            <ChevronLeft size={20} /> Back
          </button>
        </div>
      )}


      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center pt-10 sm:pt-20">
        <div className="w-full">{renderStep()}</div>
      </div>

      {/* Hidden refs */}
      <video ref={videoRef} autoPlay playsInline className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  );
};

export default MyProfile;
