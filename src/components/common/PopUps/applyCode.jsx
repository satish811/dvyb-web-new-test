import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CodeAppliedPopup({ onClose, code = "WELCOME5" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[999]">
      <div className="bg-white max-w-sm w-full relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="pt-12 pb-10 px-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">Code Copied!</h2>
          <p className="text-gray-600 mb-6">Use this code at checkout to get your discount</p>

          {/* Code Box */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-3xl font-bold text-gray-900 tracking-wider">{code}</div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full bg-[#800000] text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-[#660000] transition"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                COPY AGAIN
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            This code will be auto-applied at checkout if eligible
          </p>
        </div>
      </div>
    </div>
  );
}
