import React from "react";
import { useNavigate } from "react-router-dom";

// Assets for Grid
import img1 from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";
import img2 from "../../../assets/b2c/landing/Landing-villy/Kurtas.jpg";
import img3 from "../../../assets/b2c/landing/Landing-villy/Landingmen.jpg";
import img4 from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import img5 from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import img6 from "../../../assets/b2c/landing/Landing-villy/Shararas.jpg";
import img7 from "../../../assets/b2c/landing/Landing-villy/indowestern.png";
import img8 from "../../../assets/b2c/landing/Landing-villy/indowestern2.jpg";
import img9 from "../../../assets/b2c/landing/Landing-villy/landingwomen.png";

// Pattern Background
import patternBg from "../../../assets/ProductsPage/bg4.svg";

export default function EthnicWearSection() {
    const navigate = useNavigate();

    const gridImages = [
        { id: 1, src: img1, alt: "Ethnic Wear 1" },
        { id: 2, src: img2, alt: "Ethnic Wear 2" },
        { id: 3, src: img3, alt: "Ethnic Wear 3" },
        { id: 4, src: img4, alt: "Ethnic Wear 4" },
        { id: 5, src: img5, alt: "Ethnic Wear 5" },
        { id: 6, src: img6, alt: "Ethnic Wear 6" },
        { id: 7, src: img7, alt: "Ethnic Wear 7" },
        { id: 8, src: img8, alt: "Ethnic Wear 8" },
        { id: 9, src: img9, alt: "Ethnic Wear 9" },
    ];

    return (
        <section className="w-full h-auto min-h-[600px] flex flex-col lg:flex-row">

            {/* LEFT SIDE: 3x3 Grid */}
            <div className="w-full lg:w-1/2 grid grid-cols-3 gap-0.5 md:gap-1">
                {gridImages.map((item) => (
                    <div key={item.id} className="w-full aspect-square overflow-hidden group">
                        <img
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                ))}
            </div>

            {/* RIGHT SIDE: Decorative Card */}
            <div className="w-full lg:w-1/2 bg-[#F9F4F0] relative flex items-center justify-center p-8 md:p-16">

                {/* Pattern Background Overlay */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url(${patternBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                ></div>

                {/* Decorative Frame Border (Purple/Pinkish) */}
                <div className="w-full max-w-lg h-full max-h-[600px] border-[1px] border-[#70205D] p-2 relative bg-white/50 backdrop-blur-sm z-10 shadow-lg">
                    {/* Inner Border */}
                    <div className="w-full h-full border-[1.5px] border-[#70205D] flex flex-col items-center justify-center text-center p-8 md:p-12 gap-6">

                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-800">
                            New In:
                        </span>

                        <h2 className="text-5xl md:text-7xl text-[#4A0A4A] font-serif leading-none">
                            Ethnic <br /> Wear
                        </h2>

                        <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed max-w-sm">
                            From Sun-Drenched Deserts To Cool Mountain Mornings,
                            Discover Where To Go And What To Wear Out This Summer
                        </p>

                        <button
                            onClick={() => navigate('/womenwear')}
                            className="bg-[#70205D] text-white px-10 py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#5a1a4a] transition mt-4"
                        >
                            Shop Now
                        </button>

                    </div>
                </div>

            </div>

        </section>
    );
}
