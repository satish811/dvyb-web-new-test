import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faInstagram,
  faFacebook,
  faSnapchat,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faShareAlt } from "@fortawesome/free-solid-svg-icons";

export default function ShareCart({ onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialPlatforms = [
    { name: "WhatsApp", color: "bg-green-500", icon: faWhatsapp },
    { name: "Gmail", color: "bg-red-500", icon: faEnvelope },
    {
      name: "Instagram",
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
      icon: faInstagram,
    },
    { name: "Quickshare", color: "bg-blue-500", icon: faShareAlt },
    { name: "Facebook", color: "bg-blue-600", icon: faFacebook },
    { name: "Telegram", color: "bg-sky-500", icon: faTelegram },
    { name: "Snapchat", color: "bg-yellow-400", icon: faSnapchat },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[999]">
      <div className="bg-white max-w-sm w-full relative overflow-hidden rounded-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Content */}
        <div className="pt-12 pb-10 px-8 text-center">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Product</h2>
          <p className="text-gray-600 mb-6">Share with friends & shop together</p>

          {/* Link Box */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 flex items-center gap-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
            />
            <button onClick={handleCopy} className="p-2 hover:bg-gray-200 rounded-md transition">
              {copied ? (
                <Check className="text-green-600 w-5 h-5" />
              ) : (
                <Copy className="text-gray-700 w-5 h-5" />
              )}
            </button>
          </div>

          {/* OR */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-600 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Icons */}
          <div className="flex flex-wrap justify-center gap-4">
            {socialPlatforms.map((p) => (
              <button key={p.name} className="flex flex-col items-center gap-2 group">
                <div
                  className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center shadow-md transition-all group-hover:scale-110`}
                >
                  <FontAwesomeIcon icon={p.icon} className="text-white" />
                </div>
                <span className="text-xs text-gray-700 font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
