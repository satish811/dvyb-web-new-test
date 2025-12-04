import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import share_ic from '../../../assets/TryOn/share_ic.svg';
import Tickic from '../../../assets/TryOn/tick_ic.svg';
import beach from '../../../assets/TryOn/beach2.jpg';
import temple from '../../../assets/TryOn/temple3.jpg';
import wed from '../../../assets/TryOn/wed4.jpg';
import img1 from '../../../assets/lazyloading/logoimg1.svg';
import img2 from '../../../assets/lazyloading/logoimg2.svg';
import img3 from '../../../assets/lazyloading/logoimg3.svg';
import img4 from '../../../assets/lazyloading/logoimg4.svg';
import img5 from '../../../assets/lazyloading/logoimg5.svg';
import img6 from '../../../assets/lazyloading/logoimg6.svg';
import { saveTryOnResult } from '../../../services/tryOnService';
import { wishlistService } from '../../../services/wishlistService';
import { useAuth } from '../../../context/AuthContext';
import customize_ic from '../../../assets/TryOn/customize_ic.svg';
import t360 from '../../../assets/TryOn/t360_ic.svg';
import gallery_ic from '../../../assets/TryOn/gallery_ic.svg';
import  LazyImageLoader  from '../LazyImageLoader/LazyImageLoader';


const TryOnPreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tryOnData = location.state;
  const { user } = useAuth();

  const [selectedTab, setSelectedTab] = useState('colours');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [view360Enabled, setView360Enabled] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(null);
  
  const [tryOnResult, setTryOnResult] = useState(null);
  const [tryOnResultNoBg, setTryOnResultNoBg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const images = [img1, img2, img3, img4, img5, img6];

  const colors = tryOnData?.selectedColors?.map(color => {
    const match = color.match(/^([^(]+)/);
    const name = match ? match[1].trim() : color;
    const hex = color.match(/#([0-9A-F]{6})/i)?.[1] || '000000';
    return { name, hex: `#${hex}` };
  }) || [
    { name: 'blue', hex: '#1E3A8A' },
    { name: 'yellow', hex: '#CA8A04' },
    { name: 'green', hex: '#16A34A' },
    { name: 'purple', hex: '#7C3AED' }
  ];

  const fabrics = [
    { name: tryOnData?.fabric || 'Pure Silk', category: 'Premium' },
    { name: 'Zari Work', category: 'Lightweight' },
    { name: 'Heavy Silk', category: 'Premium' }
  ];

  const backgrounds = [
    { id: 'temple', name: 'TEMPLE', image: temple },
    { id: 'beach', name: 'BEACH', image: beach },
    { id: 'wedding', name: 'WEDDING', image: wed },
  ];

  // Rotate loading images
  useEffect(() => {
    if (isProcessing) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isProcessing]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (user && tryOnData?.productId) {
        try {
          const inWishlist = await wishlistService.isInWishlist(tryOnData.productId);
          setIsInWishlist(inWishlist);
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      }
    };
    checkWishlist();
  }, [user, tryOnData]);

  // Perform try-on
  const performTryOn = async () => {
    const { modelImage, garmentImage, garmentName } = tryOnData || {};
    if (!modelImage || !garmentImage) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const modelBlob = await fetch(modelImage).then(r => r.blob());
      const garmentBlob = await fetch(garmentImage).then(r => r.blob());

      const formData = new FormData();
      formData.append('model', modelBlob, 'model.png');
      formData.append('garment', garmentBlob, 'garment.png');
      formData.append('outfitType', garmentName || 'saree');

      const response = await fetch('/api/tryon?mode=test', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Server error: ${err}`);
      }

      const data = await response.json();

      if (data.success && data.result) {
        setTryOnResult(data.result);
        
        // Auto remove background
        setTimeout(() => removeBackgroundFromResult(data.result), 800);

        // Save to gallery
        try {
          await saveTryOnResult({
            ...tryOnData,
            tryOnResult: data.result,
            is3D: false,
          });
          toast.success('Try-on saved to your gallery!');
        } catch (error) {
          console.error('Failed to save try-on:', error);
        }
      } else {
        throw new Error(data.error || 'No result from server');
      }
    } catch (error) {
      console.error('Try-On failed:', error);
      setErrorMsg(error.message || 'AI try-on failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeBackgroundFromResult = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image_file', blob);
      formData.append('size', 'auto');

      const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': '45iFVGTnxxaakQJLzrRszmGT',
        },
        body: formData,
      });

      if (!removeBgResponse.ok) {
        throw new Error('Background removal failed');
      }

      const removedBgBlob = await removeBgResponse.blob();
      const noBgUrl = URL.createObjectURL(removedBgBlob);
      setTryOnResultNoBg(noBgUrl);
    } catch (error) {
      console.error('Background removal failed:', error);
    }
  };

  useEffect(() => {
    if (tryOnData?.modelImage && tryOnData?.garmentImage) {
      performTryOn();
    }
  }, [tryOnData]);

  const handleBack = () => {
    navigate(`/products/${tryOnData?.productId}`);
  };

  const handleReset = () => {
    setSelectedBackground(null);
    setView360Enabled(false);
  };

  const handleViewProduct = () => {
    navigate(`/products/${tryOnData?.productId}`);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please log in to add to wishlist!');
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(tryOnData.productId);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(tryOnData.productId, {
          name: tryOnData.garmentName,
          price: tryOnData.price,
          image: tryOnData.garmentImage,
        });
        setIsInWishlist(true);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    toast.info('Share feature coming soon!');
  };

  const getCurrentDisplayImage = () => {
    return tryOnResultNoBg || tryOnResult || tryOnData?.modelImage;
  };

  if (!tryOnData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-4 py-2  text-sm font-medium hover:bg-[#8B0000] hover:text-white transition-all"
        >
          <ArrowLeft size={16} />
          Back to Products
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Try-On Result Image */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 min-h-[60vh] flex items-center justify-center">
          {isProcessing ? (
          <div>


            <LazyImageLoader isProcessing={isProcessing} />
              <p className="text-xl text-center text-primary font-Outfit mt-4">
        Creating your Vibe
      </p>
          </div>

          ) : errorMsg ? (
            <div className="text-center p-6">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="font-semibold text-lg mb-2">{errorMsg}</p>
              <button
                onClick={performTryOn}
                className="mt-4 px-6 py-3 bg-[#8B0000] text-white "
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <img 
                src={getCurrentDisplayImage()}
                alt="Try-on result"
                className="max-w-full max-h-[75vh] object-cover"
              />
              
              <button 
                onClick={handleReset}
                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2  shadow-lg flex items-center gap-2 text-sm font-medium"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </>
          )}
        </div>

        {/* Bottom Sheet Content */}
        <div className="bg-white">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 "></div>
          </div>

       

          {/* Customize Outfit */}
          <div className="px-4 py-4 ">
            <div className='flex  gap-2.5'>

            <img src={customize_ic}  className='-mt-2' alt="" />
            <h3 className="text-md font-semibold text-gray-900 mb-3">Customize Outfit</h3>
            
            </div>
            <p className='text-sm font-family-outfit text-gray-600'>Try different colors, fabrics, and styles</p>
            <div className="flex gap-2 mb-4 mt-5 bg-[#F0E0E0] p-1 ">
              <button
                onClick={() => setSelectedTab('colours')}
                className={`flex-1 py-2 text-sm font-medium transition-all  ${
                  selectedTab === 'colours' ? 'bg-white text-[#8B0000] shadow-sm' : 'text-[#8B0000]'
                }`}
              >
                Colours
              </button>
              <button
                onClick={() => setSelectedTab('fabrics')}
                className={`flex-1 py-2 text-sm font-medium transition-all  ${
                  selectedTab === 'fabrics' ? 'bg-white text-[#8B0000] shadow-sm' : 'text-[#8B0000]'
                }`}
              >
                Fabrics
              </button>
            </div>

            {selectedTab === 'colours' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Colour: <span className="uppercase font-semibold">{selectedColor}</span>
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`aspect-square transition-all h-12 mt-1.5 rounded  ${
                        selectedColor === color.name ? 'ring-2 ring-gray-900 ring-offset-2' : 'ring-1 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'fabrics' && (
              <div className="space-y-2">
                {fabrics.map((fabric) => (
                  <button
                    key={fabric.name}
                    className="w-full p-3  text-left bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  >
                    <div className="text-sm font-medium">{fabric.name}</div>
                    <div className="text-xs text-gray-500">{fabric.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>


   {/* View in 360 Toggle */}
          <div className="px-4 py-4  ">
            <div className="flex items-center justify-between">
                <div className='flex gap-3'>

                <img src={t360} alt="" />
              <span className="text-sm font-family-outfit font-medium  text-black">View in 360</span>
                </div>
              <button
                onClick={() => setView360Enabled(!view360Enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full  transition-colors ${
                  view360Enabled ? 'bg-[#8B0000]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform  bg-white rounded-full transition-transform ${
                    view360Enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        <div className=' mt-3 h-2 bg-[#E1E1E1]'></div>
          {/* Scenes */}
          <div className="px-4 py-4 ">
<div className='flex gap-2'>

            <img src={gallery_ic} alt="" />
            <h3 className="text-md  font-semibold mb-1">Scenes</h3>
</div>
            <p className="text-sm text-gray-500 mb-4">Backgrounds</p>

            <div className="grid grid-cols-2 gap-3">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg.id)}
                  className={`relative  overflow-hidden ${
                    selectedBackground === bg.id ? 'ring-2 ring-gray-900 ring-offset-2' : 'ring-1 ring-gray-200'
                  }`}
                >
                  <div className="aspect-video">
                    <img src={bg.image} alt={bg.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-medium py-1 px-2 text-center">
                    {bg.name}
                  </div>
                </button>
              ))}
            </div>
          </div>


        <div className=' mt-3 h-2 bg-[#E1E1E1]'></div>
        
          {/* Quick Actions */}
          <div className="px-4 py-4 space-y-3 pb-6">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            
            <button
              onClick={handleViewProduct}
              className="w-full bg-[#8B0000] text-white py-3  font-medium hover:bg-[#A30000] flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} className="rotate-180" />
              VIEW PRODUCT
            </button>

            {/* <div className=" gap-3"> */}
              <button
                onClick={handleAddToWishlist}
                className={`py-3  w-full font-medium flex items-center justify-center gap-2 transition-all ${
                  isInWishlist
                    ? 'bg-red-50 border-2 border-red-500 text-red-500'
                    : 'border-2 border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white'
                }`}
              >
                <Heart size={19} className={isInWishlist ? 'fill-current' : ''} />
                Add to Wishlist
              </button>

              <button
                onClick={handleShare}
                className="py-3 w-full   border-black text-gray-700 font-medium hover:border-[#8B0000] hover:text-[#8B0000] flex items-center justify-center gap-2"
              >
                <img src={share_ic} className="w-5 h-5" alt="share" />
               <span className='text-primary'>Share  my look</span> 
              </button>
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryOnPreviewPage;