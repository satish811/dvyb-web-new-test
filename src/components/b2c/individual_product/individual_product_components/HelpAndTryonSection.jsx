import React, { useState } from "react";
import { Eye, Truck, MonitorPlay, MessageCircle } from "lucide-react";
import WhatsAppPopup from "../../../common/PopUps/whatsAppPopup";

const HelpAndTryonSection = () => {
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);

  const helpItems = [
    {
      icon: <Eye size={22} className="text-gray-800" />,
      title: "Virtual Try On",
      description: "Virtual fitting made easy.",
    },
    {
      icon: <Truck size={22} className="text-gray-800" />,
      title: "Early Delivery",
      description: "Need the product sooner?",
    },
    {
      icon: <MonitorPlay size={22} className="text-gray-800" />,
      title: "Live Product Preview",
      description: "Try it on with your picture.",
    },
  ];

  const handleChatClick = () => {
    setShowWhatsAppPopup(true);
  };

  const handleClosePopup = () => {
    setShowWhatsAppPopup(false);
  };

  return (
    <>
      <div className="items-start rounded-lg p-6 mt-6 pb-8 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {helpItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-1 p-3 rounded-lg transition-colors duration-200 hover:bg-amber-50 cursor-pointer"
            >
              <div>{item.icon}</div>
              <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-start items-start">
          <p className="text-sm text-gray-800 mb-3">
            Do you need help with customisation or shipping of this product?
          </p>

          <button
            className="flex items-center gap-2 border border-primary text-primary font-medium text-xs px-4 py-2 hover:bg-amber-50 transition justify-start rounded-lg"
            onClick={handleChatClick}
          >
            <MessageCircle size={16} />
            Chat With Us
          </button>
        </div>
      </div>

      {/* WhatsApp Popup */}
      {showWhatsAppPopup && (
        <WhatsAppPopup onClose={handleClosePopup} phoneNumber="+919938685049" />
      )}
    </>
  );
};

export default HelpAndTryonSection;
