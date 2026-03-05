// src/components/b2c/TryOncomponents/TryOncustomization/BlouseNeckCustomizer.jsx
// Combined blouse sleeve + neck customizer for sarees.
// User selects both styles here, then taps "Apply" to get one output image.

import React from "react";
import { BLOUSE_SLEEVE_OPTIONS, NECK_OPTIONS } from "../../../../utils/tryOnConstants";
import LazyImageLoader from "../../LazyImageLoader/LazyImageLoader";

const BlouseNeckCustomizer = ({
  pendingBlouse,
  setPendingBlouse,
  pendingNeck,
  setPendingNeck,
  isApplying,
  applyChanges,
  tryOnResult,
}) => {
  const [activeTab, setActiveTab] = React.useState("sleeve");
  const canApply = !!tryOnResult && !isApplying && (pendingBlouse || pendingNeck);

  return (
    <div className="w-full bg-transparent mt-1">

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div className="bg-[#fcf5fa] rounded-full p-1 flex mb-5">
        <button
          onClick={() => setActiveTab("sleeve")}
          className={`flex-1 text-center py-2 text-[12px] font-medium rounded-full transition-all ${activeTab === "sleeve" ? "bg-white text-gray-900 shadow-sm" : "text-[#7B325A]"
            }`}
        >
          SLEEVE STYLE
        </button>
        <button
          onClick={() => setActiveTab("neck")}
          className={`flex-1 text-center py-2 text-[12px] font-medium rounded-full transition-all ${activeTab === "neck" ? "bg-white text-gray-900 shadow-sm" : "text-[#7B325A]"
            }`}
        >
          Neck Style
        </button>
      </div>

      {/* ── GRID OPTIONS ────────────────────────────────────────────── */}
      {activeTab === "sleeve" && (
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 mb-6">
          {BLOUSE_SLEEVE_OPTIONS.map((blouse) => {
            const active = pendingBlouse === blouse.id;
            return (
              <div
                key={blouse.id}
                onClick={() => setPendingBlouse(active ? null : blouse.id)}
                className={`flex flex-col items-center justify-between cursor-pointer overflow-hidden transition-all h-[140px] lg:h-[130px] ${active ? "border-[1.5px] border-[#4a044e]" : "border-[1.5px] border-transparent"
                  }`}
              >
                <div className="flex-1 flex items-center justify-center w-full outline-none">
                  <img src={blouse.image} alt={blouse.name} className="w-[105px] h-[105px] lg:w-[90px] lg:h-[90px] object-contain" />
                </div>
                <span className={`w-full py-1 text-[11px] font-medium text-center transition-colors ${active ? "bg-[#4a044e] text-white" : "bg-transparent text-gray-900"
                  }`}>
                  {blouse.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "neck" && (
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 mb-6">
          {NECK_OPTIONS.map((neck) => {
            const active = pendingNeck === neck.id;
            return (
              <div
                key={neck.id}
                onClick={() => setPendingNeck(active ? null : neck.id)}
                className={`flex flex-col items-center justify-between cursor-pointer overflow-hidden transition-all h-[140px] lg:h-[130px] ${active ? "border-[1.5px] border-[#4a044e]" : "border-[1.5px] border-transparent"
                  }`}
              >
                <div className="flex-1 flex items-center justify-center w-full outline-none">
                  <img src={neck.image} alt={neck.label} className="w-[105px] h-[105px] lg:w-[90px] lg:h-[90px] object-contain" />
                </div>
                <span className={`w-full py-1 text-[11px] font-medium text-center transition-colors ${active ? "bg-[#4a044e] text-white" : "bg-transparent text-gray-900"
                  }`}>
                  {neck.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── APPLY BUTTON ─────────────────────────────────────────────── */}
      <div>
        <button
          onClick={applyChanges}
          disabled={!canApply}
          className={`w-full py-2.5 text-[14px] font-medium rounded-full transition-all flex items-center justify-center gap-2 ${canApply
            ? "border border-[#4a044e] text-[#4a044e] hover:bg-[#fcf5fa] active:scale-[0.98]"
            : "border border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isApplying ? (
            <>
              <LazyImageLoader isProcessing={true} size="button" />
              <span>Applying…</span>
            </>
          ) : (
            <span>Apply Changes</span>
          )}
        </button>
        {!tryOnResult && (
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Complete try-on first to apply styles
          </p>
        )}
      </div>

    </div>
  );
};

export default BlouseNeckCustomizer;