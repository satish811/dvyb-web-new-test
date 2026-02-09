import React from "react";
import { useUI } from "../../../context/UIContext";
// Using Lehanga model images as placeholders for the Try-On visual assets
import centerModel from "../../../assets/b2c/tryOnModels/lehanga/lehengaModel-1.png"; // Full body preferred
import leftSideImg from "../../../assets/b2c/tryOnModels/lehanga/lehengaModel-2.png"; // Placeholder for left side face/detail
import rightSideImg from "../../../assets/b2c/tryOnModels/lehanga/lehengaModel-3.png"; // Placeholder for right side environment

export default function VirtualTryOnSection() {
    const { setTryOnModalOpen } = useUI();

    return (
        <section className="relative w-full bg-[#EEEAF4] overflow-hidden py-16 px-4 md:px-8">
            {/* Background/Layout Container */}
            <div className="max-w-7xl mx-auto flex flex-col items-center relative">

                {/* LARGE GRADIENT HEADING (Background visual layer) */}
                {/* Positioned absolutely or visually behind/intertwined with the center image */}
                <div className="absolute top-10 md:top-20 z-10 w-full text-center pointer-events-none">
                    <h2
                        className="text-5xl md:text-7xl lg:text-9xl font-bold uppercase tracking-wider"
                        style={{
                            background: "linear-gradient(to right, #A060A0, #E0E0E0, #A060A0)", // Purple/Pink gradient approximation
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                        }}
                    >
                        VIRTUAL TRYON
                    </h2>
                </div>

                {/* Main Content Grid: 3 Columns */}
                <div className="flex flex-col md:flex-row items-center justify-between w-full h-full relative z-20 mt-20 md:mt-32 gap-8 md:gap-4">

                    {/* LEFT COLUMN: Face Image + Text */}
                    <div className="w-full md:w-1/4 flex flex-col gap-6 md:pt-40">
                        {/* Left Side Image (Face/Detail) */}
                        <div className="w-32 h-40 md:w-48 md:h-64 overflow-hidden rounded-sm shadow-md self-start md:self-end grayscale hover:grayscale-0 transition-all duration-500">
                            <img src={leftSideImg} alt="Virtual Try On Detail" className="w-full h-full object-cover" />
                        </div>

                        {/* Left Text */}
                        <p className="text-xs md:text-sm font-medium tracking-widest text-gray-700 leading-relaxed uppercase max-w-xs self-start md:self-end text-left md:text-right">
                            TRY IT ON INSTANTLY TO SEE HOW IT LOOKS ON YOU BEFORE YOU BUY.
                            EXPLORE DIFFERENT STYLES, COLORS, AND FITS IN SECONDS, SO YOU CAN
                            CHOOSE WITH CONFIDENCE AND CHECKOUT KNOWING IT’S THE RIGHT MATCH FOR YOU.
                        </p>
                    </div>

                    {/* CENTER COLUMN: Main Full Body Image */}
                    <div className="w-full md:w-1/2 flex justify-center order-first md:order-none -mt-10 md:-mt-40 relative">
                        {/* The image needs to stand out, potentially overlapping the text */}
                        <div className="w-64 md:w-80 lg:w-[400px] h-auto aspect-[3/5] shadow-2xl overflow-hidden rounded-sm border-4 border-white">
                            <img src={centerModel} alt="Model wearing Virtual Try On" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Street Image + Text + Button */}
                    <div className="w-full md:w-1/4 flex flex-col gap-6 md:pt-10">
                        {/* Right Side Image (Street/Env) */}
                        <div className="w-32 h-32 md:w-64 md:h-48 overflow-hidden rounded-sm shadow-md self-end grayscale hover:grayscale-0 transition-all duration-500">
                            <img src={rightSideImg} alt="Virtual Try On Environment" className="w-full h-full object-cover" />
                        </div>

                        {/* Right Text */}
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-xs self-end md:self-start text-right md:text-left font-serif italic">
                            Try It On Instantly To See How It Looks On You Before You Buy.
                            Explore Different Styles, Colors, And Fits In Seconds, So You Can
                            Choose With Confidence And Checkout Knowing It's The Right Match For You.
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => setTryOnModalOpen(true)}
                            className="self-end md:self-start bg-[#9F5F9F] text-white px-8 py-3 text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-[#8e4d8e] transition shadow-lg rounded-sm mt-2"
                        >
                            TRY ON
                        </button>
                    </div>

                </div>

            </div>
        </section>
    );
}
