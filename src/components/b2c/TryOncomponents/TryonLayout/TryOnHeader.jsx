
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
  left-4 md:left-6 xl:left-24 2xl:left-52
  z-20
">

      <button
        onClick={()=>{
          navigate(-1)
        }}
        className="flex items-center gap-2 px-4 py-2 shadow-sm hover:shadow-md transition-all text-sm font-medium text-primary border border-primary"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>
    </div>
  );
};

export default TryOnHeader;