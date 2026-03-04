
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
/**
 * Try-On Header Component
 * Back button and navigation
 */
const TryOnHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="
  relative w-full flex justify-start
  pt-4 px-2 pb-2
  lg:absolute lg:top-6 lg:left-4 lg:p-0
  z-20
">      <button
        onClick={() => {
          navigate(-1)
        }}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:opacity-80 text-[#74136C] transition-all text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>
    </div>
  );
};

export default TryOnHeader;