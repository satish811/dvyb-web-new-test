import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import ProductGrid from "../components/b2c/products/ProductGrid";

export default function WomenwearRoute({ products }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");

  const filteredProducts = useMemo(() => {
    return category
      ? products.filter((p) => p.dressType?.trim().toLowerCase() === category?.trim().toLowerCase())
      : products;
  }, [category, products]);

  return (
    <div className="lg:px-6 lg:py-8">
      <ProductGrid products={filteredProducts} category={category} />
    </div>
  );
}
