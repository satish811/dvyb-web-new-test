import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const shareTitle = "Check out this amazing product on Villy!";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    switch (platform) {
      case "WhatsApp":
        window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, "_blank");
        break;
      case "Gmail":
        window.open(`mailto:?subject=${encodedTitle}&body=I thought you might like this: ${encodedUrl}`);
        break;
      case "Facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
        break;
      case "Telegram":
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank");
        break;
      case "Snapchat":
        // Snapchat sharing via web intent
        window.open(`https://snapchat.com/scan?attachmentUrl=${encodedUrl}`, "_blank");
        break;
      case "Quickshare":
        if (navigator.share) {
          navigator.share({
            title: shareTitle,
            url: shareUrl,
          }).catch(console.error);
        } else {
          // Fallback if Web Share API is not supported (e.g. desktop browsers)
          handleCopy();
        }
        break;
      case "Instagram":
        // Instagram doesn't have a direct web share link for links. 
        // We copy to clipboard and alert the user so they can paste it manually.
        handleCopy();
        alert("Link copied! Open Instagram to share it.");
        break;
      default:
        break;
    }
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

  // Lock body scroll while modal is open, preserving current scroll position
  useEffect(() => {
    const scrollY = window.scrollY;
    const originalStyle = document.body.style.cssText;
    document.body.style.cssText = `overflow: hidden; position: fixed; top: -${scrollY}px; left: 0; right: 0;`;

    return () => {
      document.body.style.cssText = originalStyle;
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 9999,
        overflow: "auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          maxWidth: "384px",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
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
              <button
                key={p.name}
                onClick={() => handleShare(p.name)}
                className="flex flex-col items-center gap-2 group"
              >
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

  return createPortal(modal, document.body);
}
