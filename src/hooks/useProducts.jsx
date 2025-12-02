// src/hooks/useProducts.js
import { useEffect, useState, useCallback } from "react";
import { productService } from "../services/firebaseServices";
import { Product } from "../models/b2cProductModel";

export function useProducts() {
  const [state, setState] = useState({
    products: [],
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const data = await productService.fetchAllProducts();
      setState({ products: data, loading: false, error: null });
    } catch (err) {
      console.error(err);
      setState({ products: [], loading: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    fetch();
    // optional: real-time listener with onSnapshot
  }, [fetch]);

  return { ...state, refetch: fetch };
}
