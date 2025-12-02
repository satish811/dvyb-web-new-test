import React from "react";
import { AlertCircle } from "lucide-react";

const DisclaimerSection = () => {
  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
        Disclaimer
      </h3>

      <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
        <AlertCircle size={20} className="text-gray-800 mt-0.5" />
        <p className="text-sm text-gray-700 leading-relaxed">
          This product is handcrafted and may have slight variations in color, texture, or finish.
          These differences are natural and make each piece unique.
        </p>
      </div>
    </div>
  );
};

export default DisclaimerSection;
