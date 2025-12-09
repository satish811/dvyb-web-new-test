import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import RightSlidePopup from "../../common/PopUps/RightSlidePopup";

const FooterSocials = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupKey, setPopupKey] = useState(0);

  const socialIcons = [
    {
      icon: <FaFacebookF />,
      platform: "Facebook",
      color: "hover:text-blue-600",
      title: "Facebook Coming Soon",
    },
    {
      icon: <FaInstagram />,
      platform: "Instagram",
      color: "hover:text-pink-600",
      title: "Instagram Coming Soon",
    },
    {
      icon: <FaXTwitter />,
      platform: "Twitter",
      color: "hover:text-black",
      title: "Twitter Coming Soon",
    },
    {
      icon: <FaYoutube />,
      platform: "YouTube",
      color: "hover:text-red-600",
      title: "YouTube Coming Soon",
    },
  ];

  const handleSocialClick = (e, platform, title) => {
    e.preventDefault();
    setPopupText(`${platform} page is under development and will be available soon!`);
    setPopupTitle(title);
    setPopupKey((prev) => prev + 1);
    setShowPopup(true);
  };

  const handleRightSlidePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="flex space-x-4 mt-4">
        {socialIcons.map((item, index) => (
          <button
            key={index}
            onClick={(e) => handleSocialClick(e, item.platform, item.title)}
            className={`text-gray-700 ${item.color} text-xl transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 cursor-pointer`}
            aria-label={`${item.platform} - Coming Soon`}
            title={item.title}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Right Slide Popup */}
      {showPopup && (
        <RightSlidePopup
          key={popupKey}
          keyProp={popupKey}
          content={
            <div className="text-center p-2">
              <p className="font-semibold text-gray-800 mb-1">{popupTitle}</p>
              <p className="text-sm text-gray-600">{popupText}</p>
            </div>
          }
          autoHideDelay={5000}
          onClose={handleRightSlidePopupClose}
        />
      )}
    </>
  );
};

export default FooterSocials;
