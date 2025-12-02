import wishlistImage from "@/assets/b2c/images/wishlist/wishlist.png";

const EmptyWishlistState = () => {
  return (
    <div className="text-center mb-16">
      <div className="mb-8">
        {/* Cart Image */}
        <div className="flex justify-center mb-6">
          <div className="w-52 h-52 bg-gray-100 rounded-full flex items-center justify-center p-4">
            <img src={wishlistImage} alt="Empty Wishlist" className="w-40 h-40 object-contain" />
          </div>
        </div>

        <h1 className="text-4xl font-medium text-gray-900 mb-4">Your shopping cart is empty</h1>
        <p className="text-xl text-gray-600 mb-8">You have no items in your cart</p>
      </div>
      <button className="bg-black text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-800 transition duration-200">
        CONTINUE SHOPPING
      </button>
    </div>
  );
};

export default EmptyWishlistState;
