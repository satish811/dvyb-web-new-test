import WishlistProductCard from "./ProductCard";
import { trendingWishlistProducts } from "../../../static";

const TrendingProducts = () => {
  return (
    <div className="border-t border-gray-200 pt-12">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-medium text-gray-900 mb-4">TRENDING PRODUCTS</h2>
        <div className="w-24 h-1 bg-gray-300 mx-auto"></div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {trendingWishlistProducts.map((product) => (
          <WishlistProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default TrendingProducts;
