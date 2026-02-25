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
  const canApply = !!tryOnResult && !isApplying && (pendingBlouse || pendingNeck);

  return (
    <div className="w-full bg-white">

      {/* ── Instruction banner ───────────────────────────────────────── */}
      <div className="px-3 py-2 bg-[#f5eefa] border-b border-purple-100 text-center">
        <p className="text-[11px] text-[#6b21a8] font-medium leading-snug">
          Select a <strong>sleeve</strong> and <strong>neck</strong> style,
          then tap <strong>Apply</strong> to generate your look
        </p>
      </div>

      {/* ── Sleeve section ───────────────────────────────────────────── */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
          Sleeve Style
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {BLOUSE_SLEEVE_OPTIONS.map((blouse) => {
            const active = pendingBlouse === blouse.id;
            return (
              <div
                key={blouse.id}
                onClick={() => setPendingBlouse(active ? null : blouse.id)}
                className={`flex flex-col items-center cursor-pointer rounded overflow-hidden transition-all border-2 ${
                  active ? "border-primary shadow-md" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img src={blouse.image} alt={blouse.name} className="w-full h-[54px] object-cover" />
                <span className={`w-full py-1 text-[10px] font-semibold text-center ${
                  active ? "bg-primary text-white" : "bg-gray-50 text-gray-700"
                }`}>
                  {blouse.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Neck section ─────────────────────────────────────────────── */}
      <div className="px-3 pt-2.5 pb-2">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
          Neck Style
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {NECK_OPTIONS.map((neck) => {
            const active = pendingNeck === neck.id;
            return (
              <div
                key={neck.id}
                onClick={() => setPendingNeck(active ? null : neck.id)}
                className={`flex flex-col items-center cursor-pointer rounded overflow-hidden transition-all border-2 ${
                  active ? "border-primary shadow-md" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img src={neck.image} alt={neck.label} className="w-full h-[52px] object-cover" />
                <span className={`w-full py-1 text-[10px] font-semibold text-center ${
                  active ? "bg-primary text-white" : "bg-gray-50 text-gray-700"
                }`}>
                  {neck.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Apply button ─────────────────────────────────────────────── */}
      <div className="px-3 pt-1 pb-3 border-t border-gray-100">
        <button
          onClick={applyChanges}
          disabled={!canApply}
          className={`w-full py-2 text-[13px] font-bold rounded-sm transition-all flex items-center justify-center gap-2 ${
            canApply
              ? "bg-primary text-white hover:opacity-90 active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
          <p className="text-[10px] text-gray-400 text-center mt-1">
            Complete try-on first to apply styles
          </p>
        )}
      </div>

    </div>
  );
};

export default BlouseNeckCustomizer;

