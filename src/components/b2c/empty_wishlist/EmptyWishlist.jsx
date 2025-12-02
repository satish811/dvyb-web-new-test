import EmptyWishlistState from "./EmptyWishlistState";
import TrendingProducts from "./TrendingProducts";

const EmptyWishlist = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-outfit">
      <div className="max-w-4xl mx-auto">
        <EmptyWishlistState />
        <TrendingProducts />
      </div>
    </div>
  );
};

export default EmptyWishlist;
