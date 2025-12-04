import { useEffect } from "react";
import { useParams } from "react-router-dom";
import SimilarProductsSection from "../../components/b2c/similar_product/SimilarProductsSection";
import IndividualProduct from "../../components/b2c/individual_product/IndividualProductDetailsPage";
import TrendingProductsSection from "../../components/b2c/trending_product/TrendingProductsSection";
import { useProducts } from "../../hooks/useProducts";
import { addRecentlyViewed } from "../../components/utils/recentlyViewedUtils";

const ProductDetailsPageIndividual = ({ onClose }) => {
  const { id } = useParams();
  const { products } = useProducts();

  useEffect(() => {
    if (products.length > 0 && id) {
      const product = products.find((p) => p.id === id);
      if (product) {
        addRecentlyViewed(product);
      }
    }
  }, [id, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ========== INDIVIDUAL PRODUCT DETAILS ========== */}
      <IndividualProduct productId={id} />

      {/* ========== SIMILAR PRODUCTS SECTION ========== */}
      <div className="hidden md:block mt-12">
        <SimilarProductsSection />
      </div>

      {/* ========== TRENDING PRODUCTS SECTION ========== */}
      <div className="hidden md:block">
        <TrendingProductsSection />
      </div>
    </div>
  );
};

export default ProductDetailsPageIndividual;
