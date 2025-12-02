import TrendingProductsSection from "../trending_product/TrendingProductsSection";
import EmptyCartState from "./EmptyCartState";

const EmptyCart = () => {
  return (
    <div className="mt-[50px] min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-outfit">
      <div className="max-w-4xl mx-auto">
        <EmptyCartState />
        <TrendingProductsSection />
      </div>
    </div>
  );
};

export default EmptyCart;
