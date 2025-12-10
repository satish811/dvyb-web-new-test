import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Check, ChevronRight, ChevronLeft, Edit2, Loader2,Save } from 'lucide-react';
import women_ic from '../../../assets/ProfileCreation/women_ic.svg';
import pink_star from '../../../assets/ProfileCreation/pink_star.svg';
import yellow_star from '../../../assets/ProfileCreation/yellow_star.svg';
import cornerLogo from '../../../assets/ProfileCreation/cornerLogo.svg'
import tick from '../../../assets/ProfileCreation/tick.svg'
import success_mark from '../../../assets/ProfileCreation/success_mark.svg'



import { profileService } from '../../../services/profileService';   

const MyProfile = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    height: 178,
    unit: 'cm',
    bodyShape: '',
    skinTone: '',
    hairType: '',
    hairLength: '',
    hairColor: '',
    photoUrl: '', // base64 of user photo
  });

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [loadingTryOn, setLoadingTryOn] = useState(false);
  const [tryOnResults, setTryOnResults] = useState({});

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

const navigate = useNavigate(); 

  const [selectedOutfit, setSelectedOutfit] = useState(null); // Which outfit is clicked
const [generatingOutfit, setGeneratingOutfit] = useState(null); // Which is loading
const [generatedResults, setGeneratedResults] = useState({}); // Store all results
const [centerImage, setCenterImage] = useState(null); // What shows in center

// Remove old tryOnResults state, use generatedResults instead


  const totalSteps = 10; // now 10 because we added AI try-on step

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
    { id: 'olive', label: 'Olive', color: '#8B6F47' },
    { id: 'brown', label: 'Brown', color: '#6F4E37' },
    { id: 'deep', label: 'Deep', color: '#4A3728' }
  ];

  const hairTypes = [{ id: 'straight', label: 'Straight' }, { id: 'wavy', label: 'Wavy' }, { id: 'curly', label: 'Curly' }, { id: 'coily', label: 'Coily' }];
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

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    setProfileData(prev => ({ ...prev, photoUrl: imageData }));
    stopCamera();
    setCurrentStep(7); // go to preview
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setCapturedImage(base64);
      setProfileData(prev => ({ ...prev, photoUrl: base64 }));
      setCurrentStep(7); // go to preview
    };
    reader.readAsDataURL(file);
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

      const res = await fetch("/api/tryon?mode=multi", {
        method: "POST",
        body: formData,
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

useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}, [currentStep]);

  
    useEffect(() => {
    if (capturedImage && currentStep === 8 && capturedImage && Object.keys(generatedResults).length === 0 ) {
      setCenterImage(capturedImage); // Show user photo initially
      generateVirtualTryOns();
    }
  }, [capturedImage, currentStep]);



  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
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
    
    const res = await fetch("/api/tryon?mode=single", { // ← CHANGED: Use query param
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
    staticImage: 'https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp',
    garmentUrl: 'https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp'  // ← REAL URL
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


  const renderStep = () => {
    switch (currentStep) {
    case 0:
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] px-4 sm:px-6 py-8 sm:py-0">
      {/* Icon with stars */}
      <div className="relative mb-6 sm:mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#BE4949] flex items-center justify-center shadow-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
            <img src={women_ic} alt="" className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          
          <div className="absolute -top-1 -right-3 sm:-right-4">
            <img src={yellow_star} className="w-5 h-5 sm:w-6 sm:h-6" alt="" />
          </div>
        </div>
        
        <div className="absolute bottom-3 sm:bottom-4 -left-5 sm:-left-6">
          <img src={pink_star} className="w-5 h-5 sm:w-6 sm:h-6" alt="" />
        </div>
      </div>
      
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 text-center px-2">
        Create Your Tryon Profile
      </h2>
      
      {/* Description */}
      <p className="text-sm sm:text-base text-[#45556C] text-center max-w-md mb-8 sm:mb-12 px-4">
        Answer a few quick questions to see outfits on a virtual version of you.
      </p>
      
      {/* Start Button */}
      <button
        onClick={handleNext}
        className="w-full max-w-md h-12 sm:h-14 bg-gradient-to-r from-red-500 to-orange-400 text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-200 mb-3 sm:mb-4"
      >
        START CREATING
      </button>
      
      {/* Maybe Later */}
      <button 
        onClick={() => navigate('/')} 
        className="text-gray-500 text-sm sm:text-base cursor-pointer font-medium hover:text-gray-700 mb-8 sm:mb-0"
      >
        MAYBE LATER
      </button>
      
      {/* Feature Pills */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-8 sm:mt-12">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          <span className="text-xs sm:text-sm font-semibold text-black whitespace-nowrap">
            Private & Secure
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          <span className="text-xs sm:text-sm font-semibold text-black whitespace-nowrap">
            Takes 2 minutes
          </span>
        </div>
      </div>
    </div>
  );



  
  
  case 1:
  return (
    <div className="max-w-2xl mx-auto -mt-18 px-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">How tall are you?</h2>
      <p className="text-[#45556C] font-family-outfit mb-8">We'll use this to scale your virtual try-on accurately.</p>
      
      <div className="flex gap-2 justify-center mt-12 mb-8">
        <button
          onClick={() => setProfileData({ ...profileData, unit: 'cm' })}
          className={`px-6 py-2 text-md font-medium transition-all ${
            profileData.unit === 'cm' 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          cm
        </button>
        <button
          onClick={() => setProfileData({ ...profileData, unit: 'ft' })}
          className={`px-6 py-2 font-medium transition-all ${
            profileData.unit === 'ft' 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ft
        </button>
      </div>

      <div className="text-center items-center justify-center flex gap-[16px] gap-mb-8">
        <div className="text-6xl font-semibold text-gray-900 mb-2">
          {profileData.unit === 'cm' ? profileData.height : getHeightInFeet()}
        </div>
        <div className="text-2xl font-normal text-gray-500">
          {profileData.unit === 'cm' ? 'cm' : ''}
        </div>
      </div>

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
      />
      <p className='text-center text-xs mt-9 font-medium text-gray-600'>DRAG THIS TO SET YOUR HEIGHT</p>
    </div>
  );
      
case 2:
return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Section */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 text-center sm:text-left">
        Which body shape describes you best?
      </h2>
      <p className="text-sm sm:text-base text-[#45556C] mb-6 sm:mb-8 text-center sm:text-left">
        This helps us show you how clothes will fit your unique silhouette.
      </p>
      
      {/* Body Shape Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {bodyShapes.map(shape => (
          <button
            key={shape.id}
            onClick={() => setProfileData({ ...profileData, bodyShape: shape.id })}
            className={`p-6 sm:p-8 lg:p-12 border-2 transition-all text-center ${
              profileData.bodyShape === shape.id
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {shape.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

case 3:
  return (
    <div className="max-w-2xl mx-auto px-6 -mt-16">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Which skin tone is closest to yours?</h2>
      <p className="text-[#45556C] mb-8">This ensures your virtual avatar represents you authentically.</p>
      
      <div className="grid grid-cols-4 gap-4">
        {skinTones.map(tone => (
          <button
            key={tone.id}
            onClick={() => setProfileData({ ...profileData, skinTone: tone.id })}
            className={`flex flex-col items-center gap-3 p-4 border-2 transition-all ${
              profileData.skinTone === tone.id
                ? 'border-primary'
                : 'border-none hover:border-gray-300'
            }`}
          >
            <div 
              className={`w-16 h-16 ${
                profileData.skinTone === tone.id ? '' : ''
              }`}
              style={{ backgroundColor: tone.color }}
            >
            
            </div>
            <span className="text-sm font-medium text-gray-700">{tone.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
 
case 4:
 return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 text-center sm:text-left">
        Tell us about your hair
      </h2>
      <p className="text-sm sm:text-base text-[#45556C] mb-6 sm:mb-8 text-center sm:text-left">
        These details help personalize your virtual avatar.
      </p>
      
      <div className="space-y-6 sm:space-y-8">
        {/* Hair Color Section */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
            Hair Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {hairColors.map(color => (
              <button
                key={color.id}
                onClick={() => setProfileData({ ...profileData, hairColor: color.id })}
                className={`flex items-center gap-2 sm:gap-3 lg:gap-6 p-2 sm:p-3 border-2 transition-all ${
                  profileData.hairColor === color.id
                    ? 'border-[#2C2826] bg-gray-50'
                    : 'border-[#E5E1DB] bg-white hover:border-gray-300'
                }`}
              >
                <div 
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.color }}
                ></div>
                <span className="text-xs sm:text-sm font-medium truncate">{color.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hair Type Section */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
            Hair Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {hairTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setProfileData({ ...profileData, hairType: type.id })}
                className={`p-3 sm:p-4 border-2 transition-all ${
                  profileData.hairType === type.id
                    ? 'border-[#2C2826] bg-gray-50'
                    : 'border-[#E5E1DB] bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-xs sm:text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hair Length Section */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
            Hair Length
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {hairLengths.map(length => (
              <button
                key={length.id}
                onClick={() => setProfileData({ ...profileData, hairLength: length.id })}
                className={`py-2.5 sm:py-3 px-4 sm:px-6 border-2 text-xs sm:text-sm font-medium transition-all ${
                  profileData.hairLength === length.id
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
    </div>
  );
 
 case 5:
  return (
    <div className="max-w-2xl mx-auto px-6 m-3 py-10">
      <h2 className="text-2xl font-semibold text-gray-900 mb-">Take your photo</h2>
      <p className="text-[#45556C] mb-2">This helps us create a more accurate virtual avatar of you.</p>
      
      <div className="mb-6 p-6 mt-4 bg-[#F6F4F1]">
        <div className="font-medium text-[#400000] mb-4">For best results:</div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Face the camera directly</li>
          <li>• Ensure good lighting</li>
          <li>• Keep a neutral expression</li>
          <li>• Show shoulders in frame</li>
          <li>• Keep your Hands straight</li>
        </ul>
      </div>

      <div className="space-y-4">
        <button
          onClick={startCamera}
          disabled={cameraError}
          className="w-full p-6 border-2 border-[#200000] hover:bg-gray-50 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-[#400000] flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">Take a Photo</div>
            <div className="text-sm text-gray-500">Use your camera to capture a selfie</div>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-6 border-2 border-[#4000003D] hover:border-gray-300 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-[#F0EDE8] flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">Upload a Photo</div>
            <div className="text-sm text-gray-500">Choose an existing photo from your device</div>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {cameraError && (
          <div className="mt-6 p-4 bg-gray-900 text-white text-center">
            <p className="font-medium mb-2">Unable to access camera. Please check permissions.</p>
            <button onClick={startCamera} className="text-sm underline">
              Try Again
            </button>
          </div>
        )}

        <button
          onClick={() => setCurrentStep(9)}
          className="w-full border border-[#E5E1DB] py-3 mt-3 text-gray-600 font-medium hover:text-gray-900"
        >
          SKIP FOR NOW
        </button>
      </div>
    </div>
  );

 case 6:
  // Camera view
  return (
    <div className="max-w-2xl mx-auto justify-center items-center px-6 mt-3 py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Take your photo</h2>
      <p className="text-[#45556C] mb-8">This helps us create a more accurate virtual avatar of you.</p>
      
      <div className="mb-6 p-6 bg-[#F6F4F1]">
        <div className="font-medium text-[#400000] mb-3">For best results:</div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Face the camera directly</li>
          <li>• Ensure good lighting</li>
          <li>• Keep a neutral expression</li>
          <li>• Show shoulders in frame</li>
          <li>• Keep your Hands straight</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="relative overflow-hidden bg-gray-900 aspect-[3/4]">
          {capturedImage ? (
            <>
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
              {/* Overlay with profile details */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
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

        <button
          onClick={capturedImage ? handleNext : capturePhoto}
          className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold hover:shadow-lg transition-all"
        >
          {capturedImage ? 'CONTINUE' : 'CAPTURE PHOTO'}
        </button>

        {!capturedImage && (
          <button
            onClick={() => {
              stopCamera();
              setCurrentStep(9);
            }}
            className="w-full py-3 text-gray-600 font-medium hover:text-gray-900"
          >
            SKIP FOR NOW
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

case 7:
  return (
    <div className="min-h-screen  bg-[#FAFAFA] flex flex-col">
      {/* Top Progress + Back */}
      {/* <div className="px-6 pt-6">
        <div className="text-center text-sm text-gray-500 mb-2">5 of 7</div>
        <div className="h-px bg-gray-300"></div>
      </div> */}

      {/* Back Button */}
      {/* <div className=" ml-42 pt-4">
   <button onClick={() => setCurrentStep(6)} className="flex items-center gap-1 text-gray-700">
  <ChevronLeft className="w-5 text-gray-500 h-5" />
  <span className="text-md text-gray-500 font-medium">Back</span>
</button>
      </div> */}

      {/* Main Content – Image Left, Text Right */}
      <div className="flex-1 flex flex-col justify-center items-center lg:flex-row px-6 gap-8">
        {/* Left: Full-width photo */}
        <div className="flex-1 lg:max-w-md">
          <img
            src={capturedImage || "https://i.imgur.com/1Qw2X3j.jpg"}
            alt="Your photo"
            className="w-full h-full min-h-96 object-cover shadow-md"
          />
        </div>

        {/* Right: Text + Tips */}
        <div className="flex-1 flex flex-col -mt-24 justify-center max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Take your photo
          </h1>
          <p className="text-[#45556C] text-base mb-8">
            This helps us create a more accurate virtual avatar of you.
          </p>

          {/* Tips Card */}
          <div className="bg-[#F6F4F1] p-6 shadow-sm border border-gray-100">
            <p className="font-semibold text-primary mb-4">For best results:</p>
            <ul className="space-y-3 text-gray-700">
              {[
                "Face the camera directly",
                "Ensure good lighting",
                "Keep a neutral expression",
                "Show shoulders in frame",
                "Keep your Hands straight"
              ].map((tip, i) => (
                <li key={i} className="flex text-[#403200] items-start gap-3">
                  <span className=" text-lg leading-none">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Fixed Buttons */}
          <div className=" pb-8 pt-6 space-y-4">
            <button
              onClick={() => setCurrentStep(8)}
              className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg font-bold  shadow-md flex items-center justify-center"
            >
              CONTINUE →
            </button>

            <button
              onClick={() => {
                setCapturedImage(null);
                setCurrentStep(5);
              }}
              className="w-full h-12 bg-white border border-gray-300 text-gray-800 font-medium  flex items-center justify-center gap-2"
            >
              <Camera size={20} />
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
      <div className={`absolute top-30 left-56 mt-6 flex z-40`}>
        <button onClick={handleBack} className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black">
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      {/* MOBILE VERSION */}
      <div className="md:hidden relative min-h-screen bg-white flex flex-col px-4 pt-6 pb-24">
        
        {/* Mobile Back Button */}
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 mb-4"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Back</span>
        </button>

        {/* Title */}
        <h2 className="text-[#FF6B4A] text-xl font-medium mb-1">
          Your virtual look is ready — want to see how amazing you look?
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 text-xs mb-3">
          Your outfit categories are already curated for you. Explore refined colors and unique styles
        </p>

        {/* CTA Text */}
        <p className="text-gray-800 text-sm font-medium mb-6">
          CLICK below for TRYON
        </p>

        {/* Main Image Carousel Container */}
        <div className="relative w-full flex items-center justify-center mb-6 overflow-hidden">
          
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
            className="absolute left-0 z-10 bg-white/80 rounded-full p-2 shadow-md"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          {/* Images */}
          <div className="flex items-center justify-center gap-1 px-12">
            {outfitOptions.map((outfit, index) => {
              const isCenter = outfit.id === selectedOutfit;
              const currentIndex = outfitOptions.findIndex(o => o.id === selectedOutfit);
              
              // Calculate position relative to center
              let position = index - currentIndex;
              if (position < -2) position += outfitOptions.length;
              if (position > 2) position -= outfitOptions.length;
              
              // Only show items within range
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
                      ? 'w-[200px] h-[280px] z-20 scale-100 opacity-100' 
                      : position === -1 || position === 1
                        ? 'w-[120px] h-[180px] z-10 scale-90 opacity-60'
                        : 'w-[80px] h-[120px] z-0 scale-75 opacity-30'
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
            className="absolute right-0 z-10 bg-white/80 rounded-full p-2 shadow-md"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Bottom Navigation Dots */}
        <div className="flex justify-center items-center gap-6 mb-8">
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
              className={`text-xs font-medium transition-all ${
                outfit.id === selectedOutfit 
                  ? 'text-[#FF6B4A] border-b-2 border-[#FF6B4A] pb-1' 
                  : 'text-gray-500'
              }`}
            >
              {outfit.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 px-2">
          <button
            onClick={async () => {
              try {
                const dataToSave = {
                  ...profileData,
                  photoUrl: capturedImage || profileData.photoUrl,
                };

                await profileService.saveProfile(dataToSave);

                for (const [outfitType, imageUrl] of Object.entries(generatedResults)) {
                  await profileService.saveTryOnResult(outfitType, imageUrl);
                }

                setCurrentStep(9);
              } catch (error) {
                console.error("❌ Save error:", error);
                alert(`Error saving profile: ${error.message}`);
              }
            }}
            disabled={Object.keys(generatedResults).length === 0}
            className="w-full h-12 bg-gradient-to-r from-[#FF6B4A] to-[#FF9068] 
              text-white font-semibold rounded flex items-center justify-center gap-2
              disabled:opacity-50 transition-all"
          >
            <Save size={18} />
            SAVE & CONTINUE
          </button>

          <button
            onClick={() => setCurrentStep(5)}
            className="w-full h-12 border-2 border-[#FF6B4A] text-[#FF6B4A] 
              font-semibold rounded flex items-center justify-center gap-2"
          >
            <Edit2 size={18} />
            EDIT PROFILE
          </button>
        </div>
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden md:flex relative min-h-screen bg-[#FCFAF7] flex-col items-center px-6 pt-10 pb-24">

        {/* Title */}
        <h2 className="text-[28px] font-semibold text-gray-900 text-center max-w-2xl leading-snug">
          Your virtual look is ready — want to see how amazing you look?
        </h2>

        {/* Subtitle */}
        <p className="text-[14px] text-gray-500 mt-2 text-center">
          All four outfit categories have been pre-selected for you. You can explore
          different colors and styles while shopping.
        </p>

        {/* MAIN GRID */}
        <div className="flex justify-center items-start gap-10 mt-12 w-full max-w-6xl">

          {/* LEFT - 2 outfits */}
          <div className="flex gap-6 items-center">
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
                className={`relative w-[160px] overflow-hidden shadow-md transition-all
                  ${index === 0 ? "h-[170px] w-[130px]" : "h-[198px] w-[150px]"}
                `}
              >
                {/* Image */}
                <img
                  src={generatedResults[outfit.id] || outfit.staticImage}
                  alt={outfit.label}
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    !generatedResults[outfit.id] ? "grayscale brightness-50" : ""
                  }`}
                />

                {/* Not generated yet → CTA Overlay */}
                {!generatedResults[outfit.id] && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                    <p className="text-xs font-medium mb-2">
                      GENERATING {outfit.label.toUpperCase()}...
                    </p>
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                )}

                {/* Generated → Bottom Label + Check */}
                {generatedResults[outfit.id] && (
                  <>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded">
                      <p className="text-white font-medium text-xs">{outfit.label.toUpperCase()}</p>
                    </div>

                    <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
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
              className="w-[180px] h-[250px] max-w-full -mt-6 shadow-2xl object-cover"
            />
          </div>

          {/* RIGHT - 2 outfits */}
          <div className="flex gap-6 items-center">
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
                className={`relative w-[160px] overflow-hidden shadow-md transition-all
                  ${index === 0 ? "h-[198px] w-[150px]" : "h-[170px] w-[130px]"}
                `}
              >
                <img
                  src={generatedResults[outfit.id] || outfit.staticImage}
                  alt={outfit.label}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    !generatedResults[outfit.id] ? "grayscale brightness-50" : ""
                  }`}
                />

                {!generatedResults[outfit.id] && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                    <p className="text-xs font-medium mb-2">
                      GENERATING {outfit.label.toUpperCase()}...
                    </p>
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                )}

                {generatedResults[outfit.id] && (
                  <>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded">
                      <p className="text-white font-medium text-xs">{outfit.label.toUpperCase()}</p>
                    </div>

                    <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SAVE & EDIT BUTTONS */}
        <div className="flex justify-center items-center gap-8 mt-14">
          <button
            onClick={async () => {
              try {
                const dataToSave = {
                  ...profileData,
                  photoUrl: capturedImage || profileData.photoUrl,
                };

                await profileService.saveProfile(dataToSave);

                for (const [outfitType, imageUrl] of Object.entries(generatedResults)) {
                  await profileService.saveTryOnResult(outfitType, imageUrl);
                }

                setCurrentStep(9);
              } catch (error) {
                console.error("❌ Save error:", error);
                alert(`Error saving profile: ${error.message}`);
              }
            }}
            disabled={Object.keys(generatedResults).length === 0}
            className="w-[210px] h-14 bg-gradient-to-r from-red-500 to-orange-400 
              text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            SAVE & CONTINUE
          </button>

          <button
            onClick={() => setCurrentStep(5)}
            className="text-gray-600 font-medium hover:text-gray-900 flex items-center gap-2"
          >
            <Edit2 size={18} />
            EDIT PROFILE
          </button>
        </div>
      </div>
    </>
  );
  
case 9: // Success
  return (
    <div className="-mt-36 flex flex-col justify-between">
      {/* Main content - centered */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          {/* Check icon circle */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            {/* <Check className="w-12 h-12 text-white" /> */}
            <img src={success_mark} className="h-4/5 w-4/5" alt="" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-3xl font-semibold text-black mb-6">
            Your Tryon Profile is Ready
          </h2>

          {/* Subtitle */}
          <p className="text-[#45556C] text-lg mb-10 leading-relaxed">
            You can now see how clothes will look on your virtual avatar while shopping.
          </p>

          {/* Gradient button - exact colors from your photo */}
          <button
            onClick={handleComplete}
            className="h-14 px-12 bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            START TRYING ON
          </button>
        </div>
      </div>

      {/* Bottom profile summary */}
      {/* <div className="px-6 pb-12">
        <p className="text-gray-500 text-sm text-center mb-6">
          Your profile summary:
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <span className="px-5 py-3 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
            5.7 ft
          </span>
          <span className="px-5 py-3 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
            Straight
          </span>
          <span className="px-5 py-3 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
            Dark Brown Hair
          </span>
          <span className="px-5 py-3 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
            Light Tone
          </span>
        </div>
      </div> */}
    </div>
  );

default:
  return null;
    }
  };

return (
  <div className="overflow-hidden bg-gray-50 flex flex-col min-h-screen h-auto">
    {/* Progress Bar */}
    

<div className=" mt-3 ">
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="text-xs text-gray-600 mb-2">{currentStep + 1} of {totalSteps}</div>
        <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-600 transition-all"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>

    {/* Back Button */}
    {currentStep < 8 && (
      <div className={`absolute top-36   flex z-40 ${currentStep === 7 ? 'left-74 mt-2' : 'left-112 mt-6'}`}>
        <button onClick={handleBack} className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black">
          <ChevronLeft size={20} /> Back
        </button>
      </div>
    )}


    {/* Main Content */}
    <div className="flex-1 flex items-center bg-[#FAF8F5] justify-center py-8">
      <div className="w-full -mt-10">{renderStep()}</div>
    </div>

    {/* Hidden refs */}
    <video ref={videoRef} autoPlay playsInline className="hidden" />
    <canvas ref={canvasRef} className="hidden" />
    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
 
    {currentStep > 0 && currentStep < 5 && (
      <div className={`max-w-4xl mx-auto w-full items-center ${currentStep==4 ? 'md:bottom-16' : 'md:bottom-32'} justify-center md:relative  flex px-6 pb-8 `}>
        <button
          onClick={handleNext}
          disabled={
            (currentStep === 2 && !profileData.bodyShape) ||
            (currentStep === 3 && !profileData.skinTone) ||
            (currentStep === 4 && (!profileData.hairType || !profileData.hairLength || !profileData.hairColor))
          }
          className="w-3/4 h-14 bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          CONTINUE
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    )}
  </div>
);
};

export default MyProfile;
