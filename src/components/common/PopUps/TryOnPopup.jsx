import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  // faFacebookF,
  faInstagram,
  faTelegramPlane,
  faSnapchat,
  // faGoogle,
} from "@fortawesome/free-brands-svg-icons";
import { faCopy, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import Model from "@/assets/b2c/images/Popups/Model.svg";

export default function ShareModal() {
  const [copied, setCopied] = useState(false);
  const shareUrl = "http://www.adc.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialPlatforms = [
    { name: "WhatsApp", color: "bg-green-500", icon: faWhatsapp },

    {
      name: "Instagram",
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
      icon: faInstagram,
    },

    { name: "Telegram", color: "bg-sky-500", icon: faTelegramPlane },
    { name: "Snapchat", color: "bg-yellow-400", icon: faSnapchat },
  ];

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 text-center ">
          <button className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          <h2 className="text-xs font-normal  tracking-wide mb-1">SHARE YOUR LOOK WITH FRIENDS</h2>
          <p className="text-xs font-normal text-gray-600">
            Good things are better
            <br />
            when shared
          </p>
        </div>

        {/* Product Image */}
        <div className="p-2 flex justify-center">
          <div className="relative w-44 h-64 rounded-lg overflow-hidden shadow-lg">
            <img src={Model} alt="Fashion look" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Share Link */}
        <div className="px-6 pb-4">
          <label className="block text-sm font-medium mb-2">Share link</label>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            >
              {copied ? (
                <FontAwesomeIcon icon={faCheck} className="text-green-600" />
              ) : (
                <FontAwesomeIcon icon={faCopy} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-center">
            {socialPlatforms.map((platform) => (
              <button key={platform.name} className="flex flex-col items-center gap-2 group">
                <div
                  className={`w-12 h-12 rounded-full ${platform.color} flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}
                >
                  <FontAwesomeIcon icon={platform.icon} className="text-white text-lg" />
                </div>
                <span className="text-xs text-gray-700 font-medium text-center">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
