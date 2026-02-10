import React from "react";
import { useNavigate } from "react-router-dom";

// Assets
import heroImg from "../../../assets/b2c/landing/Landing-villy/Lehenga.png"; // Large hero
import grid1 from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";
import grid2 from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import grid3 from "../../../assets/b2c/landing/Landing-villy/salwarsuit.png";
import grid4 from "../../../assets/b2c/landing/Landing-villy/indowestern.png";

export default function LuxeEditSection() {
    const navigate = useNavigate();

    const gridItems = [
        { id: 1, title: "BRIDAL EDIT", img: grid1, link: "/womenwear?category=bridal" },
        { id: 2, title: "UNDER ₹20K", img: grid2, link: "/womenwear?price_lt=20000" },
        { id: 3, title: "BRIDES MADE EDIT", img: grid3, link: "/womenwear?category=bridesmaid" },
        { id: 4, title: "DESIGNER LEHANGAS", img: grid4, link: "/womenwear?category=lehenga" },
    ];

    return (
        <section className="w-full py-20 my-12 px-4 md:px-12 bg-gradient-to-b md:bg-gradient-to-r from-[#2E022E] via-[#580658] to-[#2E022E]">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">

                {/* LEFT SIDE: Heading + Hero Image */}
                <div className="w-full lg:w-1/2 flex flex-col relative">
                    {/* Heading */}
                    <h2 className="text-6xl md:text-8xl text-purple-200 font-thin mb-8 uppercase tracking-widest" style={{ fontFamily: 'Antiga, serif' }}>
                        LUXE EDIT
                    </h2>

                    {/* Hero Card */}
                    <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-xl overflow-hidden shadow-2xl group">
                        <img
                            src={heroImg}
                            alt="Luxe Edit Hero"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                        {/* Button */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                            <button
                                onClick={() => navigate('/womenwear')}
                                className="bg-white text-black px-10 py-3 text-sm font-bold tracking-[0.2em] uppercase hover:bg-gray-100 transition shadow-lg"
                            >
                                Shop Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: 2x2 Grid */}
                <div className="w-full lg:w-1/2 grid grid-cols-2 gap-6">
                    {gridItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-3 group cursor-pointer"
                            onClick={() => navigate(item.link)}
                        >
                            {/* Image Card */}
                            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-white/10 relative">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Checkered Overlay/Texture (Optional via CSS, simplified here) */}
                            </div>

                            {/* Caption Box */}
                            <div className="bg-[#4A0A4A] text-center py-2 rounded-lg shadow-inner">
                                <span className="text-white text-xs md:text-sm font-bold tracking-widest uppercase">
                                    {item.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
