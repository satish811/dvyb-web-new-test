import React from "react";
import { useStaticProducts } from "../../../hooks/useStaticProducts";
import WishlistHeartButton from "../../common/WishlistHeartButton";

// Assets
import vector1 from "../../../assets/b2c/landing/Landing-villy/Vector1.png";
import vector2 from "../../../assets/b2c/landing/Landing-villy/vector2.png";

export default function PopularProductsSection() {
    const { staticProducts } = useStaticProducts();

    // Get 8 products for the 4x2 grid
    // Filter existing products or take a slice. Using slice(0, 8) as per plan.
    const products = Array.isArray(staticProducts) ? staticProducts.slice(0, 8) : [];

    // Helper to format price
    const formatPrice = (price) => {
        if (!price) return "";
        return typeof price === 'number' ? `₹ ${price.toLocaleString()}` : price;
    };

    return (
        <section className="w-full py-16 bg-[#F3F4F6]"> {/* Light gray background matching reference */}

            {/* Header with Vectors */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <img src={vector1} alt="decoration left" className="w-[100px] md:w-[150px] object-contain" />
                <h2 className="text-3xl md:text-5xl text-[#1F2937] font-serif tracking-wide text-center" style={{ fontFamily: 'Antiga, serif' }}>
                    Popular Products
                </h2>
                <img src={vector2} alt="decoration right" className="w-[100px] md:w-[150px] object-contain" />
            </div>

            {/* Product Grid */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="relative group flex flex-col gap-3">

                            {/* Image Container */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-gray-200">
                                <img
                                    src={product.images ? product.images[0] : product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* NEW Badge - Top Left */}
                                {product.isNew && (
                                    <div className="absolute top-0 left-0 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                        NEW
                                    </div>
                                )}

                                {/* Wishlist Icon - Top Right */}
                                <div className="absolute top-2 right-2">
                                    <div className="bg-purple-200/80 rounded-full p-1.5 hover:bg-purple-300 transition-colors cursor-pointer">
                                        <WishlistHeartButton
                                            productId={product.id}
                                            productData={product}
                                            className="!w-5 !h-5 text-purple-900" // Override styles to match small purple circle
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                    {product.title}
                                </h3>

                                {/* Price */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-bold text-gray-900">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.mrp && (
                                        <span className="text-gray-400 line-through text-xs">
                                            {formatPrice(product.mrp)}
                                        </span>
                                    )}
                                </div>

                                {/* Color Dots - Hardcoded for UI match if not in data, or generic map */}
                                <div className="flex gap-1 mt-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5733]"></span> {/* Red/Orange */}
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFC300]"></span> {/* Yellow */}
                                    {/* Add more based on logic if available, currently static to match reference style */}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
}
