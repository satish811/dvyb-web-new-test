import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const RightSlidePopup = ({ content, autoHideDelay = 5000, onClose, keyProp }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHiding, setIsHiding] = useState(false);
  const popupRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    setIsHiding(false);

    if (popupRef.current) {
      popupRef.current.style.transform = "translateX(0)";
    }

    if (autoHideDelay) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        handleHide();
      }, autoHideDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, keyProp, autoHideDelay]);

  const handleHide = () => {
    setIsHiding(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsHiding(false);
      onClose?.();
    }, 300);
  };

  const handleScrollHide = () => {
    if (popupRef.current) {
      popupRef.current.style.transform = "translateX(100%)";
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }
  };

  const handleTouchStart = (e) => {
    const touchStartX = e.touches[0].clientX;
    const popupWidth = popupRef.current?.offsetWidth || 0;

    const handleTouchMove = (moveEvent) => {
      const touchX = moveEvent.touches[0].clientX;
      const deltaX = touchX - touchStartX;

      if (deltaX > 0 && popupRef.current) {
        const translateX = Math.min(deltaX, popupWidth);
        popupRef.current.style.transform = `translateX(${translateX}px)`;
      }
    };

    const handleTouchEnd = (endEvent) => {
      const touchEndX = endEvent.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      const popupWidth = popupRef.current?.offsetWidth || 0;

      if (deltaX > popupWidth * 0.5) {
        handleScrollHide();
      } else {
        if (popupRef.current) {
          popupRef.current.style.transform = "translateX(0)";
        }
      }

      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        ref={popupRef}
        className={`
          relative bg-white rounded-lg shadow-2xl border border-gray-200
          transition-transform duration-300 ease-out
          ${isHiding ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
          min-w-[300px] max-w-[400px]
        `}
        onTouchStart={handleTouchStart}
      >
        {/* Close button */}
        <button
          onClick={handleHide}
          className="absolute -left-2 -top-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Close popup"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-4">
          {typeof content === "string" ? <p className="text-gray-800">{content}</p> : content}
        </div>
      </div>
    </div>
  );
};

export default RightSlidePopup;
