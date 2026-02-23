
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
  absolute 
  top-4 md:top-6
  left-2 md:left-4
  z-20
">

      <button
        onClick={()=>{
          navigate(-1)
        }}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-hoverBg text-white transition-all text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>
    </div>
  );
};

export default TryOnHeader;