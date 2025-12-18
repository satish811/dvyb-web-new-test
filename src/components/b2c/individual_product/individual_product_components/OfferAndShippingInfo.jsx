import React, { useState } from "react";
import CodeAppliedPopup from "../../../common/PopUps/applyCode";

const OfferAndShippingInfo = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentCode, setCurrentCode] = useState("");

  const offers = [
    {
      title: "WELCOME 5",
      description: "Get Flat 5% OFF on your order. (T&C Applied)",
      action: "COPY CODE",
      code: "WELCOME5",
    },
    // {
    //   title: "PRICE MATCH PROMISE",
    //   description: "If you find the product for less we'll match it! (T&C Applied)",
    //   action: "KNOW MORE",
    // },
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCurrentCode(code);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentCode("");
  };

  const handleActionClick = (offer) => {
    if (offer.action === "COPY CODE" && offer.code) {
      handleCopyCode(offer.code);
    } else if (offer.action === "KNOW MORE") {
      // Handle "KNOW MORE" action here
      console.log("Know more clicked for:", offer.title);
      // You can add additional logic for the "KNOW MORE" action
    }
  };

  return (
    <>
      <div className="w-full border-t border-gray-200 mt-6">
        {offers.map((offer, index) => (
          <div
            key={index}
            className={`flex items-start justify-between py-3 border-b border-gray-200 last:border-none`}
          >
            {/* Offer Text */}
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {offer.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">{offer.description}</p>
            </div>

            {/* Action Text */}
            <button
              onClick={() => handleActionClick(offer)}
              className="text-[13px] font-semibold text-yellow-600 uppercase tracking-wide hover:text-yellow-700 transition"
            >
              {offer.action}
            </button>
          </div>
        ))}
      </div>

      {/* Code Applied Popup */}
      {showPopup && <CodeAppliedPopup onClose={handleClosePopup} code={currentCode} />}
    </>
  );
};

export default OfferAndShippingInfo;
