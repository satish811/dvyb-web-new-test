// src/components/b2c/TryOncomponents/TryOncustomization/BlouseNeckCustomizer.jsx
// Combined blouse sleeve + neck customizer for sarees.
// User selects both styles here, then taps "Apply" to get one output image.

import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState('sleeve'); // 'sleeve' or 'neck'
  const canApply = !!tryOnResult && !isApplying && (pendingBlouse || pendingNeck);

  return (
    <div className="w-full mt-2">
      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex justify-between w-[278.46px] h-[35.29px] items-center bg-[#FFE7FD] rounded-[44px] p-[2.82px] mb-[14.77px]">
        <button
          onClick={() => setActiveTab('sleeve')}
          className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold tracking-wider uppercase rounded-[44px] transition-all ${activeTab === 'sleeve'
            ? 'bg-white text-[#4b1464] shadow-sm'
            : 'text-[#4b1464]/60 hover:bg-white/50'
            }`}
        >
          SLEEVE STYLE
        </button>
        <button
          onClick={() => setActiveTab('neck')}
          className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold tracking-wider uppercase rounded-[44px] transition-all ${activeTab === 'neck'
            ? 'bg-white text-[#4b1464] shadow-sm'
            : 'text-[#4b1464]/60 hover:bg-white/50'
            }`}
        >
          Neck Style
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="mb-4 min-h-[140px]">
        {activeTab === 'sleeve' ? (
          <div className="grid grid-cols-3 gap-[14px] w-[278px] min-h-[174px]">
            {BLOUSE_SLEEVE_OPTIONS.map((blouse) => {
              const active = pendingBlouse === blouse.id;
              return (
                <div
                  key={blouse.id}
                  onClick={() => setPendingBlouse(active ? null : blouse.id)}
                  className={`relative cursor-pointer transition-all w-[79px] h-[87px] border-[1px] ${active ? "border-[#4C0846]" : "border-transparent"
                    }`}
                  style={{ boxSizing: 'border-box' }}
                >
                  <img
                    src={blouse.image}
                    alt={blouse.name}
                    className="absolute object-contain"
                    style={{
                      width: '64px',
                      height: '64px',
                      top: '0px',
                      left: '7.5px'
                    }}
                  />
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[25px] flex items-center justify-center text-[12.5px] font-medium leading-none ${active ? "bg-[#4C0846] text-white" : "bg-transparent text-[#4C0846]"}`}
                  >
                    {blouse.name}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[14px] w-[278px] min-h-[174px]">
            {NECK_OPTIONS.map((neck) => {
              const active = pendingNeck === neck.id;
              return (
                <div
                  key={neck.id}
                  onClick={() => setPendingNeck(active ? null : neck.id)}
                  className={`relative cursor-pointer transition-all w-[79px] h-[87px] border-[1px] ${active ? "border-[#4C0846]" : "border-transparent"
                    }`}
                  style={{ boxSizing: 'border-box' }}
                >
                  <img
                    src={neck.image}
                    alt={neck.label}
                    className="absolute object-contain"
                    style={{
                      width: '64px',
                      height: '64px',
                      top: '0px',
                      left: '7.5px'
                    }}
                  />
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[25px] flex items-center justify-center text-[12.5px] font-medium leading-none ${active ? "bg-[#4C0846] text-white" : "bg-transparent text-[#4C0846]"}`}
                  >
                    {neck.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Apply button ─────────────────────────────────────────────── */}
      <div className="mt-2">
        <button
          onClick={applyChanges}
          disabled={!canApply}
          className={`w-full py-2.5 px-4 text-[13px] font-semibold rounded-full transition-all flex items-center justify-center gap-2 border ${canApply
            ? "border-[#4b1464] text-[#4b1464] hover:bg-purple-50 active:scale-[0.98]"
            : "border-gray-300 text-gray-400 cursor-not-allowed"
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
      </div>

    </div>
  );
};

export default BlouseNeckCustomizer;

