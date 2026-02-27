import React from "react";
import { useUI } from "../../../context/UIContext";
// Using Lehanga model images as placeholders for the Try-On visual assets
import centerModel from "../../../assets/b2c/tryOnModels/lehanga/lehengaModel-1.png"; // Full body preferred
import leftSideImg from "../../../assets/b2c/tryOnModels/lehanga/lehengaModel-2.png"; // Placeholder for left side face/detail
import rightSideImg from "../../../assets/b2c/tryOnModels/lehanga/lehengaModel-3.png"; // Placeholder for right side environment

export default function VirtualTryOnSection() {
    const { setTryOnModalOpen } = useUI();

    return (
        <section className="relative w-full bg-[#EEEAF4] overflow-hidden pt-12 pb-12 px-4 md:px-8 2xl:py-24">
            {/* Background/Layout Container */}
            <div className="max-w-[1920px] mx-auto flex flex-col items-center relative">

                {/* ================= MOBILE LAYOUT (COLLAGE) ================= */}
                <div className="flex flex-col w-full md:hidden">
                    {/* Top Text */}
                    <p className="text-[10px] font-medium tracking-widest text-gray-800 leading-relaxed uppercase mb-6 text-justify">
                        TRY IT ON INSTANTLY TO SEE HOW IT LOOKS ON YOU BEFORE YOU BUY.
                        EXPLORE DIFFERENT STYLES, COLORS, AND FITS IN SECONDS, SO YOU CAN
                        CHOOSE WITH CONFIDENCE AND CHECKOUT KNOWING IT'S THE RIGHT MATCH FOR YOU.
                    </p>

                    {/* Collage Container */}
                    <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] mb-8">
                        {/* 1. Street Image (Top Right) */}
                        <div className="absolute top-0 right-0 w-[55%] h-[45%] z-10">
                            <img src={rightSideImg} alt="Environment" className="w-full h-full object-cover shadow-lg" />
                        </div>

                        {/* 2. Face Image (Bottom Left) */}
                        <div className="absolute bottom-0 left-0 w-[45%] h-[40%] z-10">
                            <img src={leftSideImg} alt="Detail" className="w-full h-full object-cover shadow-lg" />
                        </div>

                        {/* 3. Main Model Image (Center - Highest Z-Index of images) */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[45%] h-[70%] z-20 border-2 border-white shadow-2xl flex items-center justify-center">
                            <img src={centerModel} alt="Model" className="absolute inset-0 w-full h-full object-cover" />

                            {/* OVERLAY TEXT (Inside Center Image) */}
                            <div className="relative z-30 pointer-events-none w-full px-1">
                                <h2 className="text-[6.5vw] xs:text-[6vw] sm:text-[4vw] font-bold uppercase tracking-wider text-center leading-tight">
                                    <span className="text-[#9F5F9F] block text-center">VIRTUAL</span>
                                    <span className="text-white block text-center" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>TRY ON</span>
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Text & CTA */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-[11px] text-gray-600 leading-relaxed mb-6 px-2">
                            Try It On Instantly To See How It Looks On You Before You Buy.
                            Explore Different Styles, Colors, And Fits In Seconds, So You Can
                            Choose With Confidence And Checkout Knowing It's The Right Match For You.
                        </p>

                        <button
                            onClick={() => setTryOnModalOpen(true)}
                            className="bg-[#9F5F9F] text-white w-full py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#8e4d8e] transition shadow-md rounded-sm"
                        >
                            TRY ON
                        </button>
                    </div>
                </div>


                {/* ================= DESKTOP LAYOUT (Original) ================= */}
                <div className="hidden md:block w-full text-center pointer-events-none absolute top-10 md:top-20 2xl:top-28 z-10">
                    <h2
                        className="text-[10vw] font-bold uppercase tracking-wider"
                        style={{
                            background: "linear-gradient(to right, #A060A0, #E0E0E0, #A060A0)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                        }}
                    >
                        VIRTUAL TRYON
                    </h2>
                </div>

                {/* Main Content Grid: 3 Columns (Desktop Only) */}
                <div className="hidden md:flex flex-col md:flex-row items-center justify-between w-full h-full relative z-20 mt-20 md:mt-32 2xl:mt-48 gap-8 md:gap-4 2xl:gap-12 px-8 2xl:px-16">

                    {/* LEFT COLUMN: Face Image + Text */}
                    <div className="w-full md:w-1/4 flex flex-col gap-6 2xl:gap-10 md:pt-40 2xl:pt-56">
                        {/* Left Side Image (Face/Detail) */}
                        <div className="w-32 h-40 md:w-48 md:h-64 2xl:w-64 2xl:h-80 overflow-hidden rounded-sm shadow-md self-start md:self-end grayscale hover:grayscale-0 transition-all duration-500">
                            <img src={leftSideImg} alt="Virtual Try On Detail" className="w-full h-full object-cover" />
                        </div>

                        {/* Left Text */}
                        <p className="text-xs md:text-sm 2xl:text-lg font-medium tracking-widest text-gray-700 leading-relaxed uppercase max-w-xs 2xl:max-w-md self-start md:self-end text-left md:text-right">
                            TRY IT ON INSTANTLY TO SEE HOW IT LOOKS ON YOU BEFORE YOU BUY.
                            EXPLORE DIFFERENT STYLES, COLORS, AND FITS IN SECONDS, SO YOU CAN
                            CHOOSE WITH CONFIDENCE AND CHECKOUT KNOWING IT’S THE RIGHT MATCH FOR YOU.
                        </p>
                    </div>

                    {/* CENTER COLUMN: Main Full Body Image */}
                    <div className="w-full md:w-1/2 flex justify-center order-first md:order-none -mt-10 md:-mt-40 2xl:-mt-48 relative">
                        {/* The image needs to stand out, potentially overlapping the text */}
                        <div className="w-64 md:w-80 lg:w-[400px] 2xl:w-[500px] h-auto aspect-[3/5] shadow-2xl overflow-hidden rounded-sm border-4 border-white">
                            <img src={centerModel} alt="Model wearing Virtual Try On" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Street Image + Text + Button */}
                    <div className="w-full md:w-1/4 flex flex-col gap-6 2xl:gap-10 md:pt-10 2xl:pt-20">
                        {/* Right Side Image (Street/Env) */}
                        <div className="w-32 h-32 md:w-64 md:h-48 2xl:w-80 2xl:h-64 overflow-hidden rounded-sm shadow-md self-end grayscale hover:grayscale-0 transition-all duration-500">
                            <img src={rightSideImg} alt="Virtual Try On Environment" className="w-full h-full object-cover" />
                        </div>

                        {/* Right Text */}
                        <p className="text-xs md:text-sm 2xl:text-lg text-gray-600 leading-relaxed max-w-xs 2xl:max-w-md self-end md:self-start text-right md:text-left font-serif italic">
                            Try It On Instantly To See How It Looks On You Before You Buy.
                            Explore Different Styles, Colors, And Fits In Seconds, So You Can
                            Choose With Confidence And Checkout Knowing It's The Right Match For You.
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => setTryOnModalOpen(true)}
                            className="self-end md:self-start bg-[#9F5F9F] text-white px-8 2xl:px-12 py-3 2xl:py-5 text-xs md:text-sm 2xl:text-lg font-bold tracking-widest uppercase hover:bg-[#8e4d8e] transition shadow-lg rounded-sm mt-2 2xl:mt-4"
                        >
                            TRY ON
                        </button>
                    </div>

                </div>

            </div>
        </section>
    );
}
