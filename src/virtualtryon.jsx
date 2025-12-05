import React, { useState } from "react";
import { Upload, Loader2, RefreshCw, Download } from "lucide-react";

export default function VirtualTryOn() {
  const [modelImage, setModelImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [modelPreview, setModelPreview] = useState(null);
  const [garmentPreview, setGarmentPreview] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [sareeTryOn, setSareeTryOn] = useState(null);
  const [kurthiTryOn, setKurthiTryOn] = useState(null);
  const [lehengaTryOn, setLehengaTryOn] = useState(null);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === "model") {
          setModelPreview(event.target.result);
          setModelImage(file);
        } else {
          setGarmentPreview(event.target.result);
          setGarmentImage(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTryOn = async () => {
    if (!modelImage) {
      setError("Please upload a model photo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("model", modelImage);

      const response = await fetch("http://localhost:3001/api/multi-tryon", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Try-on failed");
      }

      // store all 3 outputs
      setSareeTryOn(data.results.saree);
      setKurthiTryOn(data.results.kurthi);
      setLehengaTryOn(data.results.lehenga);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `virtual-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setModelImage(null);
    setGarmentImage(null);
    setModelPreview(null);
    setGarmentPreview(null);
    setGeneratedImage(null);
    setResponseText("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Virtual Try-On with Gemini 2.5</h1>
          <p className="text-gray-600">
            Upload a model photo and garment to generate a realistic try-on
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Model Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Model Photo</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
              {modelPreview ? (
                <div className="relative">
                  <img
                    src={modelPreview}
                    alt="Model"
                    className="max-h-64 mx-auto rounded object-contain"
                  />
                  <button
                    onClick={() => {
                      setModelImage(null);
                      setModelPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 text-sm font-semibold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-1">Click to upload model photo</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "model")}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-6 ">
            <div className="">
              <img
                src="https://res.cloudinary.com/doiezptnn/image/upload/v1763213100/modeltryon_wsilt2.jpg"
                alt=""
              />
            </div>
            <div>
              <img
                src="https://res.cloudinary.com/doiezptnn/image/upload/v1763963486/uocufnkfbgsfranfg28w.jpg"
                alt=""
              />
            </div>
            <div>
              <img
                src="https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png"
                alt=""
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={generateTryOn}
            disabled={loading || !modelImage}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating Try-On...
              </>
            ) : (
              "Generate Virtual Try-On"
            )}
          </button>
          <button
            onClick={reset}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={20} />
            Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Result Section */}
        {generatedImage && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Virtual Try-On Result</h2>
              <button
                onClick={downloadImage}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
            </div>
            <div className="flex justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={generatedImage}
                alt="Virtual Try-On Result"
                className="max-w-full max-h-[600px] rounded-lg shadow-md object-contain"
              />
            </div>
            {responseText && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{responseText}</p>
              </div>
            )}
          </div>
        )}

        {sareeTryOn || kurthiTryOn || lehengaTryOn ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sareeTryOn && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2 text-center">Saree Try-On</h3>
                <img src={sareeTryOn} className="rounded-lg shadow" />
              </div>
            )}

            {kurthiTryOn && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2 text-center">Kurthi Try-On</h3>
                <img src={kurthiTryOn} className="rounded-lg shadow" />
              </div>
            )}

            {lehengaTryOn && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2 text-center">Lehenga Try-On</h3>
                <img src={lehengaTryOn} className="rounded-lg shadow" />
              </div>
            )}
          </div>
        ) : null}

        {/* Instructions */}
        {!generatedImage && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center text-gray-600 mb-6">
              <p className="mb-2">
                <strong>How to use:</strong>
              </p>
              <ol className="text-left max-w-md mx-auto space-y-2">
                <li>1. Upload a photo of the model/person</li>
                <li>2. Upload a photo of the garment</li>
                <li>3. Click "Generate Virtual Try-On"</li>
                <li>4. Wait 1-2 minutes for the AI to create the result</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">⚠️ Important Setup:</p>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Make sure backend server is running on port 3001</li>
                <li>
                  2. Backend command:{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">npm start</code>
                </li>
                <li>3. Use images smaller than 5MB for best results</li>
                <li>4. Generation takes 1-3 minutes - please be patient</li>
              </ol>
            </div>

            <p className="mt-4 text-sm text-center text-gray-500">
              Powered by Gemini 2.5 Flash Image Generation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
