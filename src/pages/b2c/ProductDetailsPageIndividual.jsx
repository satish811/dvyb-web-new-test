import { useParams } from "react-router-dom";
import SimilarProductsSection from "../../components/b2c/similar_product/SimilarProductsSection";
import IndividualProduct from "../../components/b2c/individual_product/IndividualProductDetailsPage";
import TrendingProductsSection from "../../components/b2c/trending_product/TrendingProductsSection";
import TrendingProducts from "../../components/common/TrendingProducts/TrendingProducts";

const ProductDetailsPageIndividual = ({ onClose }) => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ========== INDIVIDUAL PRODUCT DETAILS ========== */}
      <IndividualProduct productId={id} />

      {/* ========== SIMILAR PRODUCTS SECTION ========== */}
      <div className="mt-12">
        <SimilarProductsSection />
      </div>

      {/* ========== TRENDING PRODUCTS SECTION ========== */}
      <div>
        <TrendingProductsSection />
        {/* < TrendingProducts onClose={onClose} column = {6}/> */}
      </div>
    </div>
  );
};

export default ProductDetailsPageIndividual;
