
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";

// Assets
import footerBg from "../../../assets/b2c/landing/Landing-villy/footerbackground3.png";
import appStoreImg from "../../../assets/b2c/landing/Landing-villy/AppStore.png";
import googlePlayImg from "../../../assets/b2c/landing/Landing-villy/GooglePlay.png";
import originalIcon from "../../../assets/b2c/landing/Landing-villy/Original1.png";
import returnIcon from "../../../assets/b2c/landing/Landing-villy/ReturnPolicy.png";


export default function HomeFooter() {
    const { setTryOnModalOpen } = useUI();
    const { userRole } = useAuth(); // Get user role from context

    const headerStyle = {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 500,
        fontSize: 'clamp(16px, 1.4vw, 22px)',
        lineHeight: '100%',
        letterSpacing: '0%',
        textTransform: 'uppercase',
        textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)'
    };

    const linkStyle = {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 300,
        fontSize: 'clamp(14px, 1.2vw, 18px)',
        lineHeight: '100%',
        letterSpacing: '-0.02em',
        textTransform: 'uppercase'
    };

    return (
        <footer
            className="relative w-full text-white pt-16 pb-32 md:pb-24 2xl:pt-24 2xl:pb-32 bg-cover bg-no-repeat min-h-[700px]"
            style={{
                backgroundImage: `url(${footerBg})`,
                backgroundColor: '#9A3258', // Fallback color matching the image
                backgroundPosition: 'center',
                opacity: 1,
            }}
        >
            <div className="max-w-[1400px] 2xl:max-w-[1920px] mx-auto px-6 md:px-10 2xl:px-20 h-full flex flex-col justify-between">

                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-20 2xl:gap-32">

                    {/* LEFT COLUMNS - Links Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 2xl:gap-16">

                        {/* Column 1 */}
                        <div className="flex flex-col gap-6 4xl:gap-8">
                            <h4 style={headerStyle}>Quick Links</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-gray-200" style={linkStyle}>
                                <li>
                                    <button
                                        onClick={() => setTryOnModalOpen(true)}
                                        className="hover:text-white transition-colors text-left"
                                    >
                                        Virtual Try On
                                    </button>
                                </li>
                                {/* <li><Link to="/womenwear" className="hover:text-white transition-colors">Exclusives</Link></li>
                                <li><Link to="/best-seller" className="hover:text-white transition-colors">Best Sellers</Link></li> */}
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-6 2xl:gap-8">
                            <h4 style={headerStyle}>Our Company</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-gray-200" style={linkStyle}>
                                <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
                                <li><Link to="/faq" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-6 2xl:gap-8">
                            <h4 style={headerStyle}>Our Products</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-gray-200" style={linkStyle}>
                                {/* Conditionally show Digiwarehouse for B2B users only */}
                                {userRole === "B2B" && (
                                    <li>
                                        <a
                                            href="https://www.villydigi.in/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-white transition-colors"
                                        >
                                            Digiwarehouse
                                        </a>
                                    </li>
                                )}
                                <li><Link to="/Returns" className="hover:text-white transition-colors">Return Policy</Link></li>
                                {/* <li><a href="#" className="hover:text-white transition-colors">Warranty</a></li> */}
                            </ul>
                        </div>

                        {/* Column 4 */}
                        <div className="flex flex-col gap-6 2xl:gap-8">
                            <h4 style={headerStyle}>Our Services</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-gray-200" style={linkStyle}>
                                <li><Link to="/faq" className="hover:text-white transition-colors">Support</Link></li>
                                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                    </div>

                    {/* RIGHT SIDE - Social & App */}
                    <div className="lg:w-auto lg:flex-shrink-0" style={{ display: 'flex', flexDirection: 'column' }}>

                        {/* Social + App container */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(6px, 0.5vw, 10px)',
                            maxWidth: '280px',
                            width: '100%',
                        }}>


                            <h4 style={{
                                ...headerStyle,
                                margin: 0,
                            }}>Experience VILLY App on Mobile</h4>

                            {/* Buttons row */}
                            <div style={{
                                display: 'flex',
                                gap: 'clamp(6px, 0.6vw, 12px)',
                            }}>
                                {/* App Store Button */}
                                <a href="#" className="block transition-opacity hover:opacity-90">
                                    <img src={appStoreImg} alt="Download on the App Store" style={{ height: 'clamp(28px, 2.4vw, 38px)', width: 'auto', display: 'block' }} />
                                </a>

                                {/* Google Play Button */}
                                <a href="#" className="block transition-opacity hover:opacity-90">
                                    <img src={googlePlayImg} alt="Get it on Google Play" style={{ height: 'clamp(28px, 2.4vw, 38px)', width: 'auto', display: 'block' }} />
                                </a>
                            </div>

                        </div>

                    </div>
                </div>

                {/* MIDDLE BADGES ROW */}
                <div className="mt-6 md:mt-10 2xl:mt-16 flex flex-col items-center justify-center gap-6 md:gap-8">

                    {/* Return Badge */}
                    <div className="flex items-center gap-3 2xl:gap-4 justify-start w-full max-w-[320px]">
                        <img src={returnIcon} alt="14 Days Return" className="w-10 h-10 2xl:w-12 2xl:h-12 object-contain flex-shrink-0" />
                        <p className="text-sm 2xl:text-base tracking-wide text-left">
                            <span className="uppercase font-bold">Return within 14 days</span>{' '}
                            <span className="text-gray-200 font-light block sm:inline">of receiving your order</span>
                        </p>
                    </div>

                    {/* Original Badge */}
                    <div className="flex items-center gap-3 2xl:gap-4 justify-start w-full max-w-[320px]">
                        <img src={originalIcon} alt="100% Original" className="w-10 h-10 2xl:w-12 2xl:h-12 object-contain flex-shrink-0" />
                        <p className="text-sm 2xl:text-base tracking-wide text-left">
                            <span className="uppercase font-bold">100% Original</span>{' '}
                            <span className="text-gray-200 font-light block sm:inline">guarantee for all products at villy.in</span>
                        </p>
                    </div>

                    {/* Social icons row - moved under Original Badge */}
                    <div className="flex items-center justify-start gap-4 mt-2 w-full max-w-[320px]">
                        <a href="https://www.facebook.com/profile.php?id=61588636642553" className="hover:text-gray-300 transition-colors flex items-center"><Facebook size={20} strokeWidth={1.5} /></a>
                        <a href="https://www.instagram.com/villy.official?igsh=MWtmNm5oNGhrdmlvdA==" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors flex items-center"><Instagram size={20} strokeWidth={1.5} /></a>
                        <a href="https://x.com/Thevillyof34956" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors flex items-center"><FaXTwitter size={20} /></a>
                        <a href="https://www.youtube.com/@thevillyofficial" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors flex items-center"><Youtube size={20} strokeWidth={1.5} /></a>
                    </div>

                </div>

            </div>
        </footer>
    );
}
