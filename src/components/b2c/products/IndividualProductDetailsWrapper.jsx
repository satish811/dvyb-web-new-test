import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductDetailsPage from "./ProductDetailsPage";

const IndividualProductDetailsWrapper = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    /**
     * We can replace this with API call later
     * @returns
     */
    const fetchProduct = async () => {
      try {
        /**
         * For now simulate API or get from localStorage / context
         * @returns
         */
        const res = await fetch("/mock-data/products.json");
        const data = await res.json();
        const found = data.find((p) => String(p.id) === id);
        setProduct(found);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product)
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <p className="text-gray-600 text-lg">Product not found.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );

  return <ProductDetailsPage product={product} />;
};

export default IndividualProductDetailsWrapper;
