// src/pages/ProductDetail.jsx
import { useParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading, error } = useProducts();

  const product = products.find((p) => p.id === id);

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <img
        src={product.imageUrls?.[0] || "https://via.placeholder.com/600"}
        alt={product.name}
        className="w-full max-w-lg mx-auto mb-6 rounded-lg"
      />
      <h1 className="text-3xl font-bold mb-2">{product.name || product.title}</h1>
      <p className="text-2xl font-semibold text-gray-800 mb-4">₹{product.price}</p>
      <p className="text-gray-600 mb-4">{product.description || "No description"}</p>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Sizes:</strong> {product.selectedSizes?.join(", ") || "-"}
        </div>
        <div>
          <strong>Colors:</strong> {product.selectedColors?.join(", ") || "-"}
        </div>
        <div>
          <strong>Fabric:</strong> {product.fabric || "-"}
        </div>
        <div>
          <strong>Craft:</strong> {product.craft || "-"}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
