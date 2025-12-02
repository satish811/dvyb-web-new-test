import { X, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

export default function WhatsAppPopup({ onClose, phoneNumber = "+1234567890" }) {
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = () => {
    const message = "Hello! I need help with customisation or shipping of a product.";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCallClick = () => {
    window.open(`tel:${phoneNumber}`, "_self");
  };

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

        <div className="pt-12 pb-8 px-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold text-primary mb-3">Contact Us</h2>
          <p className="text-gray-600 mb-6">
            We're here to help you with customisation and shipping!
          </p>

          {/* Phone Number Box */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-xl font-bold text-primary tracking-wide">{phoneNumber}</div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyNumber}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-red-300 transition mb-3"
          >
            {copied ? (
              <>
                <X className="w-5 h-5 rotate-45" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                COPY PHONE NUMBER
              </>
            )}
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-green-700 transition"
          >
            <MessageCircle className="w-5 h-5" />
            CHAT ON WHATSAPP
          </button>

          {/* Call Button */}
          <button
            onClick={handleCallClick}
            className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-green-50 transition mt-3"
          >
            <Phone className="w-5 h-5" />
            CALL NOW
          </button>

          <p className="text-xs text-gray-500 mt-4">Available during business hours: 9AM - 6PM</p>
        </div>
      </div>
    </div>
  );
}
