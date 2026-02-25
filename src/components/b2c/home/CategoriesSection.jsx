import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // ✨ Animation import
import { staggerContainer, slideUp } from "../../../utils/animations"; // ✨ Global animations

// Images
import sareeImg from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import lehengaImg from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import salwarImg from "../../../assets/b2c/landing/Landing-villy/salwarsuit.png";
import indoWesternImg from "../../../assets/b2c/landing/Landing-villy/indowestern.png";
import kurtasImg from "../../../assets/b2c/landing/Landing-villy/Kurtas.jpg";
import shararasImg from "../../../assets/b2c/landing/Landing-villy/Shararas.jpg";
import anarkali from "../../../assets/b2c/landing/Landing-villy/anrakalidec.png";
import bridalImg from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";

const categories = [
    { id: 1, title: "SAREES", img: sareeImg, link: "/women/saree" },
    { id: 2, title: "LEHENGA CHOLI", img: lehengaImg, link: "/women/lehenga" },
    { id: 3, title: "SALWAR SUIT", img: salwarImg, link: "/women/salwar-suit" },
    { id: 4, title: "INDO-WESTERN", img: indoWesternImg, link: "/women/indo-western" },
    { id: 5, title: "KURTAS", img: kurtasImg, link: "/women/kurta-sets" },
    { id: 6, title: "SHRARAS", img: shararasImg, link: "/women/shararas" },
    { id: 7, title: "ANARKALI", img: anarkali, link: "/women/anarkali" },
    { id: 8, title: "BRIDAL", img: bridalImg, link: "/women/bridal" },
];

const CategoryCard = ({ item, onClick }) => {
    return (
        <motion.div
            variants={slideUp}
            className="relative cursor-pointer group w-full sm:w-[350px] md:w-full h-[350px] md:h-[450px] xl:h-[550px] 2xl:h-[650px] flex-shrink-0 snap-center md:snap-align-none"
            onClick={() => onClick(item.link)}
            whileHover={{ y: -5 }} // Subtle lift on hover
        >
            {/* Main Image Container */}
            <div className="w-full h-full relative overflow-hidden rounded-none">
                <motion.img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                {/* Text */}
                <div className="absolute bottom-6 xl:bottom-8 2xl:bottom-10 w-full text-center z-20 px-4">
                    <h3 className="text-white text-base md:text-lg xl:text-xl 2xl:text-2xl font-serif tracking-widest uppercase font-medium">
                        {item.title}
                    </h3>
                </div>
            </div>

            {/* Decorative Frame Overlay - Optional style preserved */}
            <div className="hidden md:block absolute inset-0 z-10 pointer-events-none p-3 xl:p-4 2xl:p-5">
                <div className="w-full h-full border border-[#D4AF37]/80 rounded-t-[40px] relative transition-opacity opacity-0 group-hover:opacity-100">
                </div>
            </div>
        </motion.div>
    );
};

export default function CategoriesSection() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    return (
        <section id="categories-section" className="bg-[#FAF9F6] pb-10 md:pb-16 2xl:pb-24 px-0 scroll-mt-[80px] md:scroll-mt-[75px]">
            <div className="max-w-[1920px] mx-auto">


                {/* Container */}
                <motion.div
                    ref={scrollRef}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-0 overflow-x-auto md:overflow-visible pb-6 md:pb-0 px-0 snap-x snap-mandatory scroll-smooth hide-scrollbar"
                >
                    {categories.map((cat) => (
                        <CategoryCard key={cat.id} item={cat} onClick={navigate} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
