import React from "react";
import { Facebook, Instagram, Twitter, Youtube, RotateCcw, ShieldCheck } from "lucide-react";

// Assets
import footerBg from "../../../assets/b2c/landing/Landing-villy/footerbanner.png";

export default function HomeFooter() {
    return (
        <footer
            className="relative w-full text-white pt-16 pb-32 md:pb-24 bg-cover bg-top bg-no-repeat"
            style={{
                backgroundImage: `url(${footerBg})`,
                minHeight: '600px' // Ensure minimum height to show background
            }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-full flex flex-col justify-between">

                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">

                    {/* LEFT COLUMNS - Links Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

                        {/* Column 1 */}
                        <div className="flex flex-col gap-6">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm uppercase">Quick Links</h4>
                            <ul className="space-y-3 text-xs md:text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Virtual Try On</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Exclusives</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-6">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm uppercase">Our Company</h4>
                            <ul className="space-y-3 text-xs md:text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-6">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm uppercase">Our Products</h4>
                            <ul className="space-y-3 text-xs md:text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Digiwarehouse</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Return Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Warranty</a></li>
                            </ul>
                        </div>

                        {/* Column 4 */}
                        <div className="flex flex-col gap-6">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm uppercase">Our Services</h4>
                            <ul className="space-y-3 text-xs md:text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
                            </ul>
                        </div>

                    </div>

                    {/* RIGHT SIDE - Social & App */}
                    <div className="flex flex-col gap-8 lg:w-80">

                        {/* Socials */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm uppercase">Follow Us On</h4>
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-gray-300 transition-colors"><Facebook size={20} strokeWidth={1.5} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Instagram size={20} strokeWidth={1.5} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Twitter size={20} strokeWidth={1.5} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Youtube size={20} strokeWidth={1.5} /></a>
                            </div>
                        </div>

                        {/* App Download */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-xs md:text-sm uppercase">Experience VILLY App on Mobile</h4>
                            <div className="flex gap-3">
                                <a href="#" className="block w-28 md:w-32 transition-opacity hover:opacity-90 bg-black rounded-md overflow-hidden border border-white/20">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                        alt="Download on the App Store"
                                        className="w-full h-full object-contain p-1"
                                    />
                                </a>
                                <a href="#" className="block w-28 md:w-32 transition-opacity hover:opacity-90 bg-black rounded-md overflow-hidden border border-white/20">
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
                <div className="mt-6 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">

                    {/* Return Badge */}
                    <div className="flex items-center gap-4">
                        <div className="border border-white/50 rounded-full p-2.5 rotate-45"> {/* Rotate container for style */}
                            <RotateCcw size={22} className="text-white -rotate-45" /> {/* Counter rotate icon */}
                        </div>
                        <div className="text-left">
                            <p className="text-xs uppercase tracking-wider font-bold">Return within 14 days</p>
                            <p className="text-[10px] text-gray-200 font-light tracking-wide">of receiving your order</p>
                        </div>
                    </div>

                    {/* Original Badge */}
                    <div className="flex items-center gap-4">
                        <div className="border-2 border-white/50 rounded-full p-1 w-12 h-12 flex items-center justify-center transform -rotate-12 bg-white/10 backdrop-blur-sm">
                            <span className="text-[8px] font-bold uppercase text-center leading-tight">Original</span>
                        </div>
                        <div className="text-left">
                            <p className="text-xs uppercase tracking-wider font-bold">100% Original</p>
                            <p className="text-[10px] text-gray-200 font-light tracking-wide">guarantee for all products at villy.in</p>
                        </div>
                    </div>

                </div>

            </div>
        </footer>
    );
}
