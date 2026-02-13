import React, { useState, useEffect } from "react";

// Ad Assets
import ad1 from "../../../assets/b2c/landing/Landing-villy/summersale.png";
import ad2 from "../../../assets/b2c/ads/Ad_2.png";
import banner2 from "../../../assets/b2c/ads/Banner_2.png";
import ad5 from "../../../assets/b2c/ads/Ad_5.png";
import banner3 from "../../../assets/b2c/ads/Banner_3.png";

const slides = [
    { id: 1, img: ad1, alt: "Promotional Banner 1" },
    { id: 2, img: banner2, alt: "Summer Sale" },
    { id: 3, img: ad2, alt: "Special Offer" },
    { id: 4, img: ad5, alt: "New Collection" },
    { id: 5, img: banner3, alt: "Exclusive Deal" },
];

export default function PromotionalCarousel() {
    const [current, setCurrent] = useState(0);

    // Auto-slide functionality
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(slideInterval);
    }, []);

    const goToSlide = (index) => {
        setCurrent(index);
    };

    return (
        <section className="w-full mt-0 pt-0 pb-0 md:pb-0 bg-white">
            <div
                className="relative flex flex-col w-full"
            >
                {/* Slider Image Area */}
                <div className="relative overflow-hidden w-full group"
                    style={{
                        height: '592px', // Keep requested height or make responsive? Usually full width implies responsive height, but let's stick to the explicit height for now unless it breaks. 592px is quite tall. Let's keep it but maybe allow min-height.
                        // Actually, let's keep the explicit height for now as per previous strict request, but let it be w-full.
                    }}
                >
                    <div
                        className="flex transition-transform duration-700 ease-in-out w-full h-full"
                        style={{ transform: `translateX(-${current * 100}%)` }}
                    >
                        {slides.map((slide) => (
                            <div key={slide.id} className="min-w-full relative h-full">
                                <img
                                    src={slide.img}
                                    alt={slide.alt}
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hidden md:block"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hidden md:block"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* Pagination Dots Bar - Below Image */}
                <div className="w-full bg-[#EAE0E4] h-[40px] flex items-center justify-center space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`rounded-full transition-all duration-300 ${current === index
                                ? "bg-[#5F0F40] w-2.5 h-2.5" // Active dot (Dark purple from image)
                                : "bg-[#D1D1D1] w-2.5 h-2.5 hover:bg-gray-400"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
