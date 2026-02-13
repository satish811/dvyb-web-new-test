import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Import images for the grid
import bridalImg from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";
import lehengaImg from "../../../assets/b2c/landing/Landing-villy/Lehenga.png";
import kurtasImg from "../../../assets/b2c/landing/Landing-villy/Kurtas.jpg";
import sareesImg from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import shararasImg from "../../../assets/b2c/landing/Landing-villy/Shararas.jpg";
import wovenSareeImg from "../../../assets/b2c/landing/Landing-villy/Wovensaree.jpg";
import paithaniImg from "../../../assets/b2c/landing/Landing-villy/paithanisilksaree.jpg";
import silkSareeImg from "../../../assets/b2c/landing/Landing-villy/salwarsuit.png";
import kanjeevaramImg from "../../../assets/b2c/landing/Landing-villy/kanjeevaramsaree.jpg";

// Import background pattern
import ethnicBgPattern from "../../../assets/b2c/landing/Landing-villy/backroundethic.png";

const EthnicWearSection = () => {
    const navigate = useNavigate();

    // Grid images array
    const gridImages = [
        bridalImg, lehengaImg, kurtasImg,
        sareesImg, shararasImg, wovenSareeImg,
        paithaniImg, silkSareeImg, kanjeevaramImg
    ];

    return (
        <section className="w-full flex flex-col lg:flex-row h-auto lg:h-[600px]">
            {/* LEFT SIDE: 3x3 Image Grid */}
            <div className="w-full lg:w-1/2 grid grid-cols-3 grid-rows-3 h-[400px] lg:h-full">
                {gridImages.map((img, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="relative w-full h-full overflow-hidden"
                    >
                        <img
                            src={img}
                            alt={`Ethnic Style ${index + 1}`}
                            className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700"
                        />
                    </motion.div>
                ))}
            </div>

            {/* RIGHT SIDE: Content Card */}
            <div className="w-full lg:w-1/2 relative flex items-center justify-center p-8 lg:p-16 h-[500px] lg:h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${ethnicBgPattern})` }}
            >
                {/* White Card Overlay */}
                <div className="bg-[#FAF7F2] p-8 md:p-12 max-w-lg w-full text-center relative shadow-xl">
                    {/* Double Border Effect */}
                    <div className="border border-gray-800 p-6 md:p-10 h-full w-full relative">

                        {/* Top Label */}
                        <h4 className="text-gray-600 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-4">
                            NEW IN:
                        </h4>

                        {/* Main Title */}
                        <h2 className="text-4xl md:text-6xl font-serif text-[#4A002C] mb-6 leading-tight">
                            Ethnic<br />Wear
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 font-light">
                            From Sun-Drenched Deserts To Cool Mountain Mornings, Discover Where To Go And What To Wear Out This Summer
                        </p>

                        {/* CTA Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/womenwear?category=saree')}
                            className="bg-[#6A0DAD] text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#580b91] transition-colors"
                        >
                            SHOP NOW
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EthnicWearSection;
