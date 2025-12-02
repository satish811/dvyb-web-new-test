// src/hooks/useProducts.js
import { useEffect, useState } from "react";
import staticProducts from "../static/landing/staticProducts"; //

export function useStaticProducts() {
  const [state, setState] = useState({
    staticProducts: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    try {
      // simulate data load
      setTimeout(() => {
        setState({
          staticProducts, // ✅ load directly from static file
          loading: false,
          error: null,
        });
      }, 300); // small delay for realism
    } catch (err) {
      setState({ staticProducts: [], loading: false, error: err.message });
    }
  }, []);

  return state;
}
