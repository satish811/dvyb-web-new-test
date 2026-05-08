import React from "react";
import { useUI } from "../../../context/UIContext";
import tryOnVideo from "../../../assets/b2c/landing/videos/Villy's Virtual Try - On.mp4";

export default function VirtualTryOnSection() {
    const { setTryOnModalOpen } = useUI();

    return (
        <section className="relative w-full aspect-video overflow-hidden bg-black">
            {/* 1. Full Background Video - Now matches the 16:9 container exactly */}
            <video 
                src={tryOnVideo} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover" 
            />

            {/* 2. Subtle Dark Overlay */}
            <div className="absolute inset-0 bg-black/10 z-10" />

            {/* 3. Content Layer - Button at Bottom-Left */}
            <div className="relative z-20 h-full w-full flex items-end justify-start p-[4%] md:p-[5%] lg:p-[6%]">
                <button
                    onClick={() => setTryOnModalOpen(true)}
                    className="group relative bg-[#9F5F9F] text-white px-8 md:px-12 lg:px-14 py-3 md:py-4 lg:py-5 text-[10px] md:text-sm lg:text-base font-black tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 shadow-[0_0_50px_rgba(159,95,159,0.4)] rounded-full overflow-hidden"
                >
                    <span className="relative z-10">Try On Now</span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[#9F5F9F] font-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">Try On Now</span>
                </button>
            </div>
        </section>
    );
}
