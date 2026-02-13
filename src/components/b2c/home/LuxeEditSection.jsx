import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Asset Imports
import mainImg from "../../../assets/b2c/landing/Landing-villy/Luxewomen.png";
import decorLeftBottom from "../../../assets/b2c/landing/Landing-villy/Borderdesign2.png";
import Luxeeditsectionframe from "../../../assets/b2c/landing/Landing-villy/Luxeeditsectionframe.png";
import decorLeftTop from "../../../assets/b2c/landing/Landing-villy/Borderdesignbottom.png";
import decorRight from "../../../assets/b2c/landing/Landing-villy/flower1.png";

// Grid Images
import bridalImg from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";
import under20kImg from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import bridesmaidImg from "../../../assets/b2c/landing/Landing-villy/silksaree.jpg";
import designerImg from "../../../assets/b2c/landing/Landing-villy/florallehanga.jpg";

const LuxeEditSection = () => {
    const navigate = useNavigate();

    const gridItems = [
        { id: 1, title: "BRIDAL EDIT", img: bridalImg, link: "/womenwear?category=wedding" },
        { id: 2, title: "UNDER ₹20K", img: under20kImg, link: "/womenwear?priceMax=20000" },
        { id: 3, title: "BRIDES MADE EDIT", img: bridesmaidImg, link: "/womenwear?category=saree" },
        { id: 4, title: "DESIGNER LEHENGAS", img: designerImg, link: "/womenwear?category=lehenga" },
    ];

    return (
        <section className="relative w-full overflow-hidden flex items-center justify-center"
            style={{
                minHeight: '630px',
                height: 'auto',
                paddingTop: '0px',
                paddingBottom: '40px',
                backgroundImage: `url(${Luxeeditsectionframe})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="relative z-10 w-full max-w-[1330px] mx-auto flex flex-col lg:flex-row items-center justify-end px-4 lg:px-0">

                {/* RIGHT SECTION: 2x2 Grid - Positioned to the right */}
                <div className="w-full lg:w-[600px] grid grid-cols-2 gap-[15px] mt-10 lg:mt-0 relative z-20">
                    {gridItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(item.link)}
                            className="group cursor-pointer relative overflow-hidden rounded-[13px] shadow-lg border border-transparent hover:border-[#FFD700]/20 transition-all duration-300 transform hover:-translate-y-1"
                            style={{
                                width: '100%',
                                maxWidth: '213px',
                                height: '271px', // Keep original height
                                background: '#3F083B',
                                paddingBottom: '34px' // Added padding for label area
                            }}
                        >
                            <div className="w-full h-full overflow-hidden rounded-[13px]">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* Bottom Label Banner - Full Width Dark */}
                            <div className="absolute bottom-0 left-0 right-0 py-3 text-center transition-colors group-hover:bg-[#580040]"
                                style={{
                                    background: '#3F083B',
                                    borderBottomLeftRadius: '13.13px',
                                    borderBottomRightRadius: '13.13px',
                                    height: '34px', // Fixed height for label area
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                <span className="text-white text-[10px] font-bold tracking-[0.05em] uppercase block">
                                    {item.title}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default LuxeEditSection;
