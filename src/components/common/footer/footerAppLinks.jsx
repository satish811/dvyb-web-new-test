import React from "react";

const FooterAppLinks = () => {
  return (
    <div className="flex">
      <a href="#">
        <img
          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
          alt="App Store"
          className="h-16"
        />
      </a>
      <a href="#">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
          alt="Google Play"
          className="h-16"
        />
      </a>
    </div>
  );
};

export default FooterAppLinks;
