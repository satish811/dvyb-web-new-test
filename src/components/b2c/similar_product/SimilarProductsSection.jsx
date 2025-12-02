import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";

const SimilarProductsSection = () => {
  const { products, loading, error } = useProducts();

  const navigate = useNavigate();

  // --- Error or no data ---
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
          SIMILAR PRODUCTS
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

export default SimilarProductsSection;
