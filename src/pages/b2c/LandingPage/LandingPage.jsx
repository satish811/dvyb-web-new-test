import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star, ChevronRight, Truck, ShieldCheck, Zap } from 'lucide-react';
import Navbar from '../../../components/common/navbar/navbar'; // Reusing existing Navbar if possible, or build new one

const LandingPage = () => {
    return (
        <div className="font-[Outfit] text-gray-900 bg-white">
            {/* 1. Navbar (If reusing) - Or build a simple clean one for landing */}
            {/* Assuming MainLayout handles Navbar, but if standalone: */}
            {/* <Navbar /> */}

            {/* 2. Hero Section */}
            <section className="relative min-h-[90vh] flex items-center bg-[#fdfbf7] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-[#faeff5] rounded-l-[10rem] opacity-50 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#33022F] rounded-full filter blur-[100px] opacity-5 translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
                    {/* Left Content */}
                    <div className="space-y-8 animate-fade-in-up">
                        <span className="inline-block px-4 py-1.5 bg-[#33022F]/10 text-[#33022F] text-sm font-semibold rounded-full tracking-wide uppercase">
                            New Collection 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-[#33022F]">
                            Discover Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33022F] to-[#8B4789]">Unique Style</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            Explore our curated collection of premium fashion designed to elevate your everyday look. Experience quality, comfort, and elegance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/products" className="px-8 py-4 bg-[#33022F] text-white text-lg font-medium rounded-full hover:bg-[#5a0452] transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                Shop Now <ShoppingBag size={20} />
                            </Link>
                            <Link to="/our-story" className="px-8 py-4 bg-white text-[#33022F] border border-[#33022F]/20 text-lg font-medium rounded-full hover:border-[#33022F] transition flex items-center justify-center gap-2">
                                Learn More <ArrowRight size={20} />
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="pt-8 flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <div className="flex text-yellow-400 gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <p className="text-gray-500 font-medium">Loved by 10k+ customers</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative h-[600px] hidden lg:block">
                        <div className="absolute top-10 right-10 w-full h-full bg-[#33022f] rounded-[2rem] opacity-5"></div>
                        <img
                            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                            alt="Fashion Model"
                            className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl z-10"
                        />
                        {/* Floating Badge */}
                        <div className="absolute bottom-20 -left-10 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-4 animate-bounce-slow">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">New Arrival</p>
                                <p className="text-lg font-bold text-gray-900">Summer '26</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#33022F] mb-4">Why Choose Villy?</h2>
                        <p className="text-gray-600">We prioritize quality and customer experience above everything else.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <ShieldCheck size={32} />, title: "Premium Quality", desc: "Crafted with the finest materials for lasting durability and comfort." },
                            { icon: <Truck size={32} />, title: "Fast Delivery", desc: "Get your favorite styles delivered to your doorstep in record time." },
                            { icon: <Zap size={32} />, title: "Virtual Try-On", desc: "Experience our innovative AI tech to try clothes before you buy." }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 hover:bg-[#faeff5] transition-colors duration-300 group">
                                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#33022F] mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Stats / Social Proof */}
            <section className="py-20 bg-[#33022F] text-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                    {[
                        { num: "50k+", label: "Happy Customers" },
                        { num: "2000+", label: "Products" },
                        { num: "100+", label: "Brands" },
                        { num: "4.9", label: "Average Rating" } // Include Icon later
                    ].map((stat, idx) => (
                        <div key={idx} className="p-4">
                            <h4 className="text-4xl md:text-5xl font-bold mb-2">{stat.num}</h4>
                            <p className="text-white/70 font-medium tracking-wide uppercase text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. CTA Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative rounded-[3rem] bg-[#f8f5f2] p-12 md:p-20 flex flex-col items-center text-center overflow-hidden">
                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-[#33022F]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B4789]/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-bold text-[#33022F] mb-6">Ready to upgrade your wardrobe?</h2>
                            <p className="text-lg text-gray-600 mb-10">Join thousands of trendsetters and discover fashion that speaks to you.</p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/signup" className="px-10 py-4 bg-[#33022F] text-white text-lg font-bold rounded-full hover:bg-[#5a0452] transition shadow-xl hover:-translate-y-1">
                                    Get Started
                                </Link>
                                <Link to="/products" className="px-10 py-4 bg-white text-[#33022F] border border-gray-200 text-lg font-bold rounded-full hover:border-[#33022F] transition flex items-center gap-2">
                                    Browse Collection <ChevronRight size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Footer (Mini) */}
            <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-2xl font-bold tracking-tighter">VILLY.</div>
                    <div className="flex gap-8 text-sm text-gray-400">
                        <Link to="#" className="hover:text-white transition">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition">Terms of Service</Link>
                        <Link to="#" className="hover:text-white transition">Contact Us</Link>
                    </div>
                    <p className="text-gray-500 text-sm">© 2026 Villy Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
