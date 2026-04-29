// import React from "react";
// import { useNavigate } from "react-router-dom";
// import WishlistHeartButton from "../../common/WishlistHeartButton";

// // Assets
// import vector1 from "../../../assets/b2c/landing/Landing-villy/newvector1.png";
// import vector2 from "../../../assets/b2c/landing/Landing-villy/newvector2.png";

// export default function PopularProductsSection({ products: firebaseProducts = [] }) {
//     const navigate = useNavigate();

//     // Get 8 products for the 4x2 grid from Firebase
//     const products = Array.isArray(firebaseProducts) ? firebaseProducts.slice(0, 8) : [];

//     // Helper to format price
//     const formatPrice = (price) => {
//         if (!price) return "";
//         return typeof price === 'number' ? `₹ ${price.toLocaleString()}` : price;
//     };

//     return (
//         <section className="w-full py-10 md:py-16 2xl:py-24 bg-[#F3F4F6]"> {/* Light gray background matching reference */}

//             {/* Header with Vectors */}
//             <div className="flex items-center justify-center gap-2 md:gap-4 2xl:gap-8 mb-8 md:mb-12 2xl:mb-20 px-4">
//                 <img src={vector1} alt="decoration left" className="w-[60px] md:w-[150px] 2xl:w-[200px] object-contain" />
//                 <h2 className="text-center" style={{ fontFamily: "'Merienda', cursive", fontWeight: 400, fontSize: '32px', lineHeight: '44.31px', letterSpacing: '0%', color: '#171717' }}>
//                     Popular Products
//                 </h2>
//                 <img src={vector2} alt="decoration right" className="w-[60px] md:w-[150px] 2xl:w-[200px] object-contain" />
//             </div>

//             {/* Product Grid / Horizontal Scroll */}
//             <div className="max-w-[1400px] 2xl:max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-16">
//                 <div className="flex justify-start md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 2xl:gap-10 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory hide-scrollbar">
//                     {products.map((product) => (
//                         <div
//                             key={product.id}
//                             className="relative group flex flex-col gap-3 2xl:gap-5 cursor-pointer shrink-0 w-[60vw] sm:w-[45vw] md:w-full snap-center"
//                             onClick={() => navigate(`/products/${product.id}`)}
//                         >

//                             <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-gray-200">
//                                 <img
//                                     src={product.imageUrls?.[0] || "/placeholder.jpg"}
//                                     alt={product.name || product.title}
//                                     className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
//                                 />

//                                 {/* NEW Badge - Top Left */}
//                                 {product.isNew && (
//                                     <div className="absolute top-0 left-0 bg-black text-white text-[10px] 2xl:text-sm font-bold px-2 py-1 2xl:px-3 2xl:py-1.5 uppercase tracking-widest">
//                                         NEW
//                                     </div>
//                                 )}

//                                 {/* Wishlist Icon - Top Right */}
//                                 <div className="absolute top-2 right-2 2xl:top-4 2xl:right-4">
//                                     <div className="bg-purple-200/80 rounded-full p-1.5 2xl:p-2.5 hover:bg-purple-300 transition-colors cursor-pointer">
//                                         <WishlistHeartButton
//                                             productId={product.id}
//                                             productData={product}
//                                             className="!w-4 !h-4 md:!w-5 md:!h-5 2xl:!w-6 2xl:!h-6 text-purple-900" // Override styles to match small purple circle
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Product Details */}
//                             <div className="flex flex-col gap-1 2xl:gap-2">
//                                 <h3 className="text-xs md:text-sm 2xl:text-lg font-medium text-gray-800 line-clamp-1">
//                                     {product.name || product.title}
//                                 </h3>

//                                 {/* Price */}
//                                 <div className="flex items-center gap-2 text-xs md:text-sm 2xl:text-base">
//                                     <span className="font-bold text-gray-900">
//                                         {formatPrice(product.price)}
//                                     </span>
//                                     {product.mrp && (
//                                         <span className="text-gray-400 line-through text-[10px] md:text-xs 2xl:text-sm">
//                                             {formatPrice(product.mrp)}
//                                         </span>
//                                     )}
//                                 </div>

//                                 {/* Color Dots - Display actual product colors */}
//                                 <div className="flex gap-1 2xl:gap-2 mt-1">
//                                     {product.selectedColors?.slice(0, 3).map((color, idx) => {
//                                         // Parse color if it has underscore prefix (e.g., "color_#FF5733")
//                                         const hexColor = typeof color === 'string' && color.includes('_')
//                                             ? color.split('_')[1]
//                                             : color;

//                                         return (
//                                             <span
//                                                 key={idx}
//                                                 className="w-2 h-2 md:w-2.5 md:h-2.5 2xl:w-3.5 2xl:h-3.5 border border-gray-200 rounded-full"
//                                                 style={{ backgroundColor: hexColor }}
//                                             />
//                                         );
//                                     })}
//                                 </div>
//                             </div>

//                         </div>
//                     ))}
//                 </div>
//             </div>

//         </section>
//     );
// }


import React from "react";
import { useNavigate } from "react-router-dom";
import WishlistHeartButton from "../../common/WishlistHeartButton";
import { isProductPublishedByBoth } from "../../../utils/productVisibility";

// Assets
import vector1 from "../../../assets/b2c/landing/Landing-villy/newvector1.png";
import vector2 from "../../../assets/b2c/landing/Landing-villy/newvector2.png";

export default function PopularProductsSection({ products: firebaseProducts = [] }) {

    const navigate = useNavigate();

    const products = Array.isArray(firebaseProducts)
        ? firebaseProducts.filter(isProductPublishedByBoth).slice(0, 8)
        : [];

    const formatPrice = (price) => {
        if (!price) return "";
        return typeof price === "number"
            ? `₹ ${price.toLocaleString()}`
            : price;
    };

    return (
        <section className="w-full py-10 md:py-16 2xl:py-24 bg-[#F3F4F6]">

            {/* Header */}
            <div className="flex items-center justify-center gap-2 md:gap-4 2xl:gap-8 mb-8 md:mb-12 2xl:mb-20 px-4">

                <img
                    src={vector1}
                    alt="decoration left"
                    className="w-[60px] md:w-[150px] 2xl:w-[200px] object-contain"
                />

                <h2
                    className="text-center"
                    style={{
                        fontFamily: "'Merienda', cursive",
                        fontWeight: 400,
                        fontSize: "32px",
                        lineHeight: "44.31px",
                        letterSpacing: "0%",
                        color: "#171717"
                    }}
                >
                    Popular Products
                </h2>

                <img
                    src = {vector2}
                    alt="decoration right"
                    className="w-[60px] md:w-[150px] 2xl:w-[200px] object-contain"
                />

            </div>

            {/* Products */}
            <div className="max-w-[1400px] 2xl:max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-16">

                <div className="flex justify-start md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 2xl:gap-10 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory hide-scrollbar">

                    {products.map((product) => (

                        <div
                            key={product.id}
                            className="relative group flex flex-col gap-3 2xl:gap-5 cursor-pointer shrink-0 w-[60vw] sm:w-[45vw] md:w-full snap-center"
                            onClick={() => navigate(`/products/${product.id}`)}
                        >

                            {/* Product Image */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">

                                <img
                                    src={product.imageUrls?.[0] || "/placeholder.jpg"}
                                    alt={product.name || product.title}
                                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* NEW Badge */}
                                {product.isNew && (
                                    <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                        NEW
                                    </div>
                                )}

                                {/* Wishlist Icon */}
                                <div
                                    className="absolute top-2 right-2 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >

                                    <div className="bg-purple-200/90 rounded-full p-2 hover:bg-purple-300 transition-colors flex items-center justify-center">

                                        <WishlistHeartButton
                                            productId={product.id}
                                            productData={product}
                                            className="!w-4 !h-4 md:!w-5 md:!h-5 2xl:!w-6 2xl:!h-6 text-purple-900"
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col gap-1 2xl:gap-2">

                                <h3 className="text-xs md:text-sm 2xl:text-lg font-medium text-gray-800 line-clamp-1">
                                    {product.name || product.title}
                                </h3>

                                {/* Price */}
                                <div className="flex items-center gap-2 text-xs md:text-sm 2xl:text-base">

                                    <span className="font-bold text-gray-900">
                                        {formatPrice(product.price)}
                                    </span>

                                    {product.mrp && (
                                        <span className="text-gray-400 line-through text-[10px] md:text-xs 2xl:text-sm">
                                            {formatPrice(product.mrp)}
                                        </span>
                                    )}

                                </div>

                                {/* Color Dots */}
                                <div className="flex gap-1 2xl:gap-2 mt-1">

                                    {product.selectedColors?.slice(0, 3).map((color, idx) => {

                                        const hexColor =
                                            typeof color === "string" && color.includes("_")
                                                ? color.split("_")[1]
                                                : color;

                                        return (
                                            <span
                                                key={idx}
                                                className="w-2 h-2 md:w-2.5 md:h-2.5 2xl:w-3.5 2xl:h-3.5 border border-gray-200 rounded-full"
                                                style={{ backgroundColor: hexColor }}
                                            />
                                        );

                                    })}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}