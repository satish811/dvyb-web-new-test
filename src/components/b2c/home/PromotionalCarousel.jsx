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
        <section className="w-full relative overflow-hidden bg-gray-50 mt-10 my-12 py-16">
            {/* Slider Container */}
            <div
                className="flex transition-transform duration-700 ease-in-out w-full"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="min-w-full relative h-[250px] sm:h-[400px] md:h-[700px]">
                        <img
                            src={slide.img}
                            alt={slide.alt}
                            className="w-full h-full object-cover sm:object-fill"
                        />
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${current === index
                            ? "bg-[#9F5F9F] w-6" // Active pill shape/color
                            : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
