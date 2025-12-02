import React from "react";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";

const FooterSocials = () => {
  const socialIcons = [
    { icon: <FaFacebookF />, link: "#" },
    { icon: <FaInstagram />, link: "#" },
    { icon: <FaXTwitter />, link: "#" },
    { icon: <FaYoutube />, link: "#" },
  ];

  return (
    <div className="flex space-x-4 mt-4">
      {socialIcons.map((item, index) => (
        <a
          key={index}
          href={item.link}
          className="text-gray-700 hover:text-black text-xl transition-colors duration-200"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
};

export default FooterSocials;
