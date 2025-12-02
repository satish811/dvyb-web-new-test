import TrendingProductsSection from "../trending_product/TrendingProductsSection";

const EmptyCartTrendingProducts = () => {
  return (
    <div className="w-full flex justify-center mt-[80px]">
      <div
        className="flex flex-col"
        style={{
          width: "100%",
          maxWidth: "1080px",
          gap: "12px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="text-[24px] md:text-[32px] font-medium text-gray-900">
            TRENDING PRODUCTS
          </h2>
          <div className="w-24 h-1 bg-gray-300 mx-auto mt-2"></div>
        </div>

        {/* Trending Products Component */}
        <TrendingProductsSection />
      </div>
    </div>
  );
};

export default EmptyCartTrendingProducts;
