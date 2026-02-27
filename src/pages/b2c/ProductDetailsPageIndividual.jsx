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
  const currentProduct = products.find(p => p.id === id);


  useEffect(() => {
    if (currentProduct) {
      addRecentlyViewed(currentProduct);
    }
  }, [currentProduct]);

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32 3xl:px-48 relative">

      {/* PRODUCT DETAILS */}
      <div className="w-full mx-auto pt-[5px]">
        <IndividualProduct productId={id} />
      </div>

      {/* SIMILAR PRODUCTS */}
      <div className="hidden md:block mt-10 lg:mt-8 w-full mx-auto">
        <SimilarProductsSection dressType={currentProduct?.dressType} />
      </div>

      {/* TRENDING PRODUCTS */}
      <div className="hidden md:block mt-10 lg:mt-8 w-full mx-auto">
        <TrendingProductsSection />
      </div>
    </div>
  );
};

export default ProductDetailsPageIndividual;
