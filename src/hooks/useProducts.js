// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import { productService } from "../services/firebaseServices";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.fetchAllProducts();
        console.log("📦 All products fetched:", data.length);
        setProducts(data);
      } catch (err) {
        setError("Failed to load products");
        console.error("❌ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
