import React from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";

const TrendingProductsSection = () => {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">Loading similar products...</div>
    );
  }

  if (error || !products || products.length === 0) {
    return <div className="text-center py-10 text-red-600 text-sm">No similar products found.</div>;
  }

  const displayProducts = products.slice(0, 6);

  return (
    <div
      className="mt-8 pt-6 flex flex-col"
      style={{
        gap: "24px",
        width: "100%",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            textTransform: "uppercase",
            color: "#000",
            margin: 0,
          }}
        >
          TRENDING PRODUCTS
        </h2>

        <button
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "#B71C1C",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          className="hover:underline"
        >
          VIEW ALL
        </button>
      </div>

      {/* Product Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(184.33px, 1fr))",
          gap: "12px",
        }}
      >
        {displayProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
            style={{
              width: "184.33px",
              height: "386px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            {/* Product Image */}
            <div
              style={{
                width: "178px",
                height: "287px",
                overflow: "hidden",
                background: "#f5f5f5",
              }}
            >
              <img
                src={product.imageUrls?.[0]}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Product Details */}
            <div
              style={{
                width: "184.33px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                height: "85px",
              }}
            >
              {/* Title */}
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#000",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.name}
              </p>

              {/* Description */}
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "13px",
                  color: "#444",
                  margin: 0,
                  lineHeight: "1.3",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.description}
              </p>

              {/* Price */}
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#400000",
                  margin: 0,
                }}
              >
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingProductsSection;

// import React from "react";
// import { useProducts } from "../../../hooks/useProducts";
// import ProductCard from "../products/ProductCard";

// const TrendingProductsSection = () => {
//   const { products, loading, error } = useProducts();

//   // ✅ Static fallback data (only if API has no data)
//   const staticProducts = [
//     {
//       id: 1,
//       name: "Suhino",
//       description: "Fancy Tissue Work & Embroidered Lehenga Set",
//       price: 14990,
//       dressType: "Lehenga",
//       imageUrls: [
//         "https://cdn.pixabay.com/photo/2020/04/12/12/03/fashion-5031399_1280.jpg",
//       ],
//     },
//     {
//       id: 2,
//       name: "Kanchivaram",
//       description: "Silk Saree with Gold Zari Work",
//       price: 25000,
//       dressType: "Saree",
//       imageUrls: [
//         "https://cdn.pixabay.com/photo/2018/02/16/10/54/woman-3158992_1280.jpg",
//       ],
//     },
//     {
//       id: 3,
//       name: "Ananya",
//       description: "Handwoven Block Printed Kurta Set",
//       price: 17200,
//       dressType: "Kurta",
//       imageUrls: [
//         "https://cdn.pixabay.com/photo/2016/11/29/12/54/beautiful-1869206_1280.jpg",
//       ],
//     },
//     {
//       id: 4,
//       name: "Bandhej",
//       description: "Embellished Bandhej Suit with Dupatta",
//       price: 18700,
//       dressType: "Suit",
//       imageUrls: [
//         "https://cdn.pixabay.com/photo/2016/03/27/19/40/beautiful-1284353_1280.jpg",
//       ],
//     },
//     {
//       id: 5,
//       name: "Mirral",
//       description: "Chiffon Floral Print Anarkali with Belt",
//       price: 24900,
//       dressType: "Anarkali",
//       imageUrls: [
//         "https://cdn.pixabay.com/photo/2020/03/31/20/38/woman-4987080_1280.jpg",
//       ],
//     },
//     {
//       id: 6,
//       name: "Kalyan",
//       description: "Exclusive Bridal Saree with Brocade Border",
//       price: 46000,
//       dressType: "Saree",
//       imageUrls: [
//         "https://cdn.pixabay.com/photo/2021/08/12/07/17/indian-bride-6539364_1280.jpg",
//       ],
//     },
//   ];

//   // ✅ Decide which products to show
//   const displayProducts =
//     products && products.length > 0
//       ? products.slice(0, 6)
//       : staticProducts.slice(0, 6);

//   // --- Loading / Error ---
//   if (loading) {
//     return (
//       <div className="text-center py-10 text-gray-500 text-sm">
//         Loading similar products...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-10 text-red-600 text-sm">
//         Failed to load similar products.
//       </div>
//     );
//   }

//   return (
//     <div className="border-t mt-8 pt-6">
//       {/* --- Header --- */}
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-lg font-semibold tracking-wide text-gray-900 uppercase">
//           Trending Products
//         </h2>
//         <button className="text-red-800 font-semibold text-sm hover:underline">
//           VIEW ALL
//         </button>
//       </div>

//       {/* --- Product Grid --- */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
//         {displayProducts.map((product) => (
//           <ProductCard key={product.id} product={product} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TrendingProductsSection;
