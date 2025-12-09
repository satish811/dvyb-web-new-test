import { useEffect, useState } from "react";
import { productService } from "../services/firebaseServices";

export function useProducts() {
  const [state, setState] = useState({
    products: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      try {
        if (isMounted) {
          setState((s) => ({ ...s, loading: true, error: null }));
        }

        const data = await productService.fetchAllProducts();

        if (isMounted) {
          setState({
            products: data,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        if (isMounted) {
          setState({
            products: [],
            loading: false,
            error: err.message,
          });
        }
      }
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
