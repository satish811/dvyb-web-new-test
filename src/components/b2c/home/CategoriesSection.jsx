import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // ✨ Animation import
import { staggerContainer, slideUp, hoverScale } from "../../../utils/animations"; // ✨ Global animations

// Images
import sareeImg from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import lehengaImg from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import salwarImg from "../../../assets/b2c/landing/Landing-villy/salwarsuit.png";
import indoWesternImg from "../../../assets/b2c/landing/Landing-villy/indowestern.png";
import kurtasImg from "../../../assets/b2c/landing/Landing-villy/Kurtas.jpg";
import shararasImg from "../../../assets/b2c/landing/Landing-villy/Shararas.jpg";
import indoWestern2Img from "../../../assets/b2c/landing/Landing-villy/indowestern2.jpg";
import bridalImg from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";

const categories = [
    { id: 1, title: "SAREES", img: sareeImg, link: "/women/saree" },
    { id: 2, title: "LEHENGA CHOLI", img: lehengaImg, link: "/women/lehenga" },
    { id: 3, title: "SALWAR SUIT", img: salwarImg, link: "/women/salwar-suit" },
    { id: 4, title: "INDO-WESTERN", img: indoWesternImg, link: "/women/indo-western" },
    { id: 5, title: "KURTAS", img: kurtasImg, link: "/women/kurta-sets" },
    { id: 6, title: "SHRARAS", img: shararasImg, link: "/women/shararas" },
    { id: 7, title: "INDO-WESTERN", img: indoWestern2Img, link: "/women/indo-western" },
    { id: 8, title: "BRIDAL", img: bridalImg, link: "/women/bridal" },
];

const CategoryCard = ({ item, onClick }) => {
    return (
        <motion.div
            variants={slideUp}
            className="relative cursor-pointer group h-[450px] w-full"
            onClick={() => onClick(item.link)}
            whileHover={{ y: -5 }} // Subtle lift on hover
        >
            {/* Main Image Container */}
            <div className="w-full h-full relative overflow-hidden">
                <motion.img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

                {/* Text */}
                <div className="absolute bottom-6 w-full text-center z-20">
                    <h3 className="text-white text-lg font-serif tracking-widest uppercase font-medium">
                        {item.title}
                    </h3>
                </div>
            </div>

            {/* Gold Decorative Frame Overlay */}
            {/* We use an SVG to replicate the specific arch/bracket shape if possible, 
            or a CSS shape that closely mimics the "Rounded gold decorative frame".
            Here we simulate the arch-top frame.
        */}
            <div className="absolute inset-0 z-10 pointer-events-none p-3">
                <div className="w-full h-full border border-[#D4AF37]/80 rounded-t-[40px] relative">
                    {/* Optional: Add decorative corners if strictly needed, but rounded top is close to the vibe */}
                </div>
            </div>
        </motion.div>
    );
};

export default function CategoriesSection() {
    const navigate = useNavigate();

    return (
        <section className="bg-[#FAF9F6] py-10 px-4 md:px-8">
            {/* Section Header */}
            <h2 className="text-3xl font-serif text-black mb-8 tracking-wide text-left uppercase pl-2">
                Categories
            </h2>

            {/* Grid */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1"
            >
                {categories.map((cat) => (
                    <CategoryCard key={cat.id} item={cat} onClick={navigate} />
                ))}
            </motion.div>
        </section>
    );
}
