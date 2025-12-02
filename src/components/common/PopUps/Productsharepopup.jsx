import React, { useState } from "react";
import img from "@/assets/b2c/images/Popups/Productshare.svg";
import {
  Copy,
  Check,
  MessageCircle,
  Mail,
  Instagram,
  Share2,
  Facebook,
  Send,
  X,
} from "lucide-react";

export default function ShareModal() {
  const [copied, setCopied] = useState(false);
  const shareUrl = "http://www.adc.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialPlatforms = [
    { name: "WhatsApp", color: "bg-green-500", Icon: MessageCircle },
    { name: "Gmail", color: "bg-red-500", Icon: Mail },
    {
      name: "Instagram",
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
      Icon: Instagram,
    },
    { name: "Quickshare", color: "bg-blue-500", Icon: Share2 },
    { name: "Facebook", color: "bg-blue-600", Icon: Facebook },
    { name: "Telegram", color: "bg-sky-500", Icon: Send },
    { name: "Snapchat", color: "bg-yellow-400", Icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl shadow-lg">
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-gray-200 relative">
          <button
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-semibold tracking-wider mb-2">SHARE WITH FRIENDS</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Good things are better
            <br />
            when shared
          </p>
        </div>

        {/* Product Info */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
              <img src={img} alt="Product" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1">GOLDEN MUSTARD ELEGANCE ANARKALI SET</h3>
              <p className="text-sm text-gray-600 mb-2">mustard spun silk anarkali set</p>
              <p className="text-xs text-gray-500">
                CODE: <span className="font-medium">SUSC0425127</span>
              </p>
            </div>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="p-8 pb-6">
          <label className="block text-sm font-semibold mb-3">Share Product link</label>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded p-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
            />
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
              title="Copy link"
            >
              {copied ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <Copy size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-base text-gray-600 font-medium">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="px-8 pb-10">
          <div className="flex flex-wrap justify-center gap-4">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.name}
                className="flex flex-col items-center gap-3 group min-w-[70px]"
              >
                <div
                  className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center shadow-lg transform transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl`}
                >
                  <platform.Icon className="text-white" size={30} strokeWidth={2} />
                </div>
                <span className="text-xs text-gray-800 font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
