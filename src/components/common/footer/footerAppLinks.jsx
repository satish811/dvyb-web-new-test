import React from "react";

const FooterAppLinks = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
      <a href="#">
        <img
          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
          alt="App Store"
          className="h-10 md:h-16 w-auto"
        />
      </a>
      <a href="#">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
          alt="Google Play"
          className="h-10 md:h-16 w-auto"
        />
      </a>
    </div>
  );
};

export default FooterAppLinks;
