import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Tickic from '../../../assets/TryOn/tick_ic.svg';
import step1img from '../../../assets/TryOn/step1img.svg';
import { profileService } from '../../../services/profileService';

const TryOnStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  
  const tryOnData = location.state;
  const [userHasTryOn, setUserHasTryOn] = useState(false);
  const [userTryOnImage, setUserTryOnImage] = useState(null);

  useEffect(() => {
    const checkUserTryOn = async () => {
      if (!tryOnData?.dressType) return;
      
      try {
        const savedImage = await profileService.getTryOnByDressType(tryOnData.dressType);
        if (savedImage) {
          setUserHasTryOn(true);
          setUserTryOnImage(savedImage);
        }
      } catch (error) {
        console.error("Error checking user try-on:", error);
      }
    };

    checkUserTryOn();
  }, [tryOnData]);

  const handleUploadClick = () => {
    navigate('/tryon/upload', { 
      state: { 
        ...tryOnData, 
        selectModel: false 
      } 
    });
  };

  const handleSelectModel = () => {
    navigate('/tryon/upload', { 
      state: { 
        ...tryOnData, 
        selectModel: true 
      } 
    });
  };

  const handleSkip = () => {
    navigate(`/products/${productId}`);
  };

  const handleClose = () => {
    navigate(`/products/${productId}`);
  };

  if (!tryOnData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* <button 
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <X size={24} />
      </button> */}

      <div className="w-full h-[560px] p-2 md:h-[300px] bg-gray-100 flex items-center justify-center">
        <img 
          src={step1img} 
          alt="Try-on guide"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="px-4 pt-6 pb-20">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-black mb-1">Try-On</h1>
          <p className="text-gray-600 text-sm font-medium">Let's go shopping</p>
        </div>

        <div className="w-3/5 shadow-md border border-gray-200 p-3 mb-6 bg-white">
          <div className="flex justify-between items-center px-3 py-2 bg-[#EEF7F0] border border-[#B8E3C6]  mb-3">
            <p className="text-[10px] font-semibold text-[#15912C] tracking-wide">SELECTED DRESS</p>
            <img src={Tickic} className="h-4" alt="check" />
          </div>

          <div className="flex gap-3 items-center">
            <img 
              src={tryOnData.garmentImage} 
              className="h-14 w-14  object-cover border border-gray-200 flex-shrink-0" 
              alt="Product" 
            />
            <p className="text-xs text-gray-700 line-clamp-2 flex-1">
              {tryOnData.garmentName}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <button
            onClick={handleUploadClick}
            className="w-full bg-[#8B0000] text-white h-[48px] text-sm font-medium hover:bg-[#A30000] transition-all "
          >
            Upload a picture
          </button>

          <button
            onClick={handleSelectModel}
            className="w-full border-2 border-[#8B0000] text-[#8B0000] h-[48px] text-sm font-medium hover:bg-[#8B0000] hover:text-white transition-all "
          >
            Select a model
          </button>
        </div>

        <p className="text-[11px] text-gray-600 leading-relaxed">
          Hey! To use the 2D TRY ON feature, just upload or take a selfie or{" "}
          Press <span className="text-[#8B0000] text-xs font-semibold">SKIP</span> to check out the models you can try on!
        </p>
      </div>

<div className=' flex justify-end  bottom-0 right-0 mb-4 mr-4'>

      <button
        onClick={handleSkip}
        className="bottom-6 right-4 bg-white border border-gray-300 px-5 py-2  text-sm font-medium text-gray-700 hover:border-[#8B0000] hover:text-[#8B0000] transition-all shadow-md flex items-center gap-2 z-10"
      >
        SKIP
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
</div>
    </div>
  );
};

export default TryOnStartPage;