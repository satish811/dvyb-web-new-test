import React from "react";
import { Facebook, Instagram, Twitter, Youtube, RotateCcw, ShieldCheck } from "lucide-react";

// Assets
import footerBg from "../../../assets/b2c/landing/Landing-villy/Footerbackground2.png";

export default function HomeFooter() {
    return (
        <footer
            className="relative w-full text-white pt-16 pb-32 md:pb-48 bg-cover bg-bottom bg-no-repeat"
            style={{ backgroundImage: `url(${footerBg})` }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">

                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">

                    {/* LEFT COLUMNS - Links Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">

                        {/* Column 1 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Virtual Try On</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Exclusives</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Our Company</h4>
                            <ul className="space-y-2 text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Our Products</h4>
                            <ul className="space-y-2 text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Digiwarehouse</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Return Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Warranty</a></li>
                            </ul>
                        </div>

                        {/* Column 4 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Our Services</h4>
                            <ul className="space-y-2 text-sm text-gray-200 font-light">
                                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
                            </ul>
                        </div>

                    </div>

                    {/* RIGHT SIDE - Social & App */}
                    <div className="flex flex-col gap-8 lg:w-1/3">

                        {/* Socials */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Follow Us On</h4>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-gray-300 transition-colors"><Facebook size={20} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Instagram size={20} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Twitter size={20} /></a>
                                <a href="#" className="hover:text-gray-300 transition-colors"><Youtube size={20} /></a>
                            </div>
                        </div>

                        {/* App Download */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Experiment Dvyb App on Mobile</h4>
                            <div className="flex gap-4">
                                <a href="#" className="block w-32 md:w-36 transition-opacity hover:opacity-90">
                                    <img
                                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                                        alt="Download on the App Store"
                                        className="w-full h-auto"
                                    />
                                </a>
                                <a href="#" className="block w-32 md:w-36 transition-opacity hover:opacity-90">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                        alt="Get it on Google Play"
                                        className="w-full h-auto"
                                    />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>

                {/* MIDDLE BADGES ROW */}
                <div className="mt-16 md:mt-20 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">

                    {/* Return Badge */}
                    <div className="flex items-center gap-3">
                        <div className="border border-white/30 rounded-full p-2">
                            <RotateCcw size={24} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs uppercase tracking-wider font-bold">Return within 14 days</p>
                            <p className="text-[10px] text-gray-300 font-light">of receiving your order</p>
                        </div>
                    </div>

                    {/* Divider (Hidden on mobile) */}
                    <div className="hidden md:block w-px h-8 bg-white/20"></div>

                    {/* Original Badge */}
                    <div className="flex items-center gap-3">
                        <div className="border border-white/30 rounded-full p-2">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs uppercase tracking-wider font-bold">100% Original</p>
                            <p className="text-[10px] text-gray-300 font-light">guarantee for all products at villy.in</p>
                        </div>
                    </div>

                </div>

            </div>
        </footer>
    );
}
