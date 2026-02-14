
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, RotateCcw, ShieldCheck } from "lucide-react";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";

// Assets
import footerBg from "../../../assets/b2c/landing/Landing-villy/footerbanner.png";

export default function HomeFooter() {
    const { setTryOnModalOpen } = useUI();
    const { userRole } = useAuth(); // Get user role from context

    return (
        <footer
            className="relative w-full text-white pt-16 pb-32 md:pb-24 2xl:pt-24 2xl:pb-32 bg-cover bg-no-repeat min-h-[600px] bg-fixed"
            style={{
                backgroundImage: `url(${footerBg})`,
                backgroundColor: '#9A3258', // Fallback color matching the image
                backgroundPosition: 'center top',
            }}
        >
            <div className="max-w-[1400px] 2xl:max-w-[1920px] mx-auto px-6 md:px-10 2xl:px-20 h-full flex flex-col justify-between">

                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-20 2xl:gap-32">

                    {/* LEFT COLUMNS - Links Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 2xl:gap-16">

                        {/* Column 1 */}
                        <div className="flex flex-col gap-6 2xl:gap-8">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm 2xl:text-base uppercase">Quick Links</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-xs md:text-sm 2xl:text-base text-gray-200 font-light">
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
                            <h4 className="font-bold tracking-widest text-xs md:text-sm 2xl:text-base uppercase">Our Company</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-xs md:text-sm 2xl:text-base text-gray-200 font-light">
                                <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
                                <li><Link to="/faq" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-6 2xl:gap-8">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm 2xl:text-base uppercase">Our Products</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-xs md:text-sm 2xl:text-base text-gray-200 font-light">
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
                                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                                <li><Link to="/Returns" className="hover:text-white transition-colors">Return Policy</Link></li>
                                {/* <li><a href="#" className="hover:text-white transition-colors">Warranty</a></li> */}
                            </ul>
                        </div>

                        {/* Column 4 */}
                        <div className="flex flex-col gap-6 2xl:gap-8">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm 2xl:text-base uppercase">Our Services</h4>
                            <ul className="space-y-3 2xl:space-y-4 text-xs md:text-sm 2xl:text-base text-gray-200 font-light">
                                <li><Link to="/faq" className="hover:text-white transition-colors">Support</Link></li>
                                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
                            </ul>
                        </div>

                    </div>

                    {/* RIGHT SIDE - Social & App */}
                    <div className="flex flex-col gap-8 2xl:gap-12 lg:w-80 2xl:w-96">

                        {/* Socials */}
                        <div className="flex flex-col gap-4 2xl:gap-6">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm 2xl:text-base uppercase">Follow Us On</h4>
                            <div className="flex gap-6 2xl:gap-8">
                                <a href="#" className="hover:text-gray-300 transition-colors"><Facebook size={20} className="md:w-5 md:h-5 2xl:w-6 2xl:h-6" strokeWidth={1.5} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Instagram size={20} className="md:w-5 md:h-5 2xl:w-6 2xl:h-6" strokeWidth={1.5} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Twitter size={20} className="md:w-5 md:h-5 2xl:w-6 2xl:h-6" strokeWidth={1.5} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Youtube size={20} className="md:w-5 md:h-5 2xl:w-6 2xl:h-6" strokeWidth={1.5} /></a>
                            </div>
                        </div>

                        {/* App Download */}
                        <div className="flex flex-col gap-4 2xl:gap-6">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm 2xl:text-base uppercase">Experience VILLY App on Mobile</h4>
                            <div className="flex gap-3 2xl:gap-4">
                                <a href="#" className="block w-28 md:w-32 2xl:w-40 transition-opacity hover:opacity-90 bg-black rounded-md overflow-hidden border border-white/20">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                        alt="Download on the App Store"
                                        className="w-full h-full object-contain p-1"
                                    />
                                </a>
                                <a href="#" className="block w-28 md:w-32 2xl:w-40 transition-opacity hover:opacity-90 bg-black rounded-md overflow-hidden border border-white/20">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                        alt="Get it on Google Play"
                                        className="w-full h-full object-contain" // removed p-1 for Google Play as it usually has built-in padding in SVG or needs to fill more
                                    />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>

                {/* MIDDLE BADGES ROW - Spaced out less to move up */}
                <div className="mt-6 md:mt-10 2xl:mt-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 2xl:gap-24 text-center">

                    {/* Return Badge */}
                    <div className="flex items-center gap-4 2xl:gap-6">
                        <div className="border border-white/50 rounded-full p-2.5 2xl:p-3.5 rotate-45"> {/* Rotate container for style */}
                            <RotateCcw size={22} className="text-white -rotate-45 md:w-[22px] md:h-[22px] 2xl:w-7 2xl:h-7" /> {/* Counter rotate icon */}
                        </div>
                        <div className="text-left">
                            <p className="text-xs 2xl:text-sm uppercase tracking-wider font-bold">Return within 14 days</p>
                            <p className="text-[10px] 2xl:text-xs text-gray-200 font-light tracking-wide">of receiving your order</p>
                        </div>
                    </div>

                    {/* Original Badge */}
                    <div className="flex items-center gap-4 2xl:gap-6">
                        <div className="border-2 border-white/50 rounded-full p-1 w-12 h-12 2xl:w-16 2xl:h-16 flex items-center justify-center transform -rotate-12 bg-white/10 backdrop-blur-sm">
                            <span className="text-[8px] 2xl:text-[10px] font-bold uppercase text-center leading-tight">Original</span>
                        </div>
                        <div className="text-left">
                            <p className="text-xs 2xl:text-sm uppercase tracking-wider font-bold">100% Original</p>
                            <p className="text-[10px] 2xl:text-xs text-gray-200 font-light tracking-wide">guarantee for all products at villy.in</p>
                        </div>
                    </div>

                </div>

            </div>
        </footer>
    );
}
