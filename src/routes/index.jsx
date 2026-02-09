import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/protectedRoute";
import MainLayout from "../layout/mainLayout";
import ProductLayout from "../layout/ProductLayout";
import { useProducts } from "../hooks/useProducts";

// 🧱 Pages
import Home from "../pages/b2c/homePage/homePage";
import CartPage from "../pages/b2c/cartPage/cartPage";
import CheckoutPage from "../pages/b2c/cartPage/CheckoutPage";
import ProductDetailsPageIndividual from "../pages/b2c/ProductDetailsPageIndividual";
import CategoryPage from "../pages/b2c/CategoryPage";

// 📰 Common Pages
import BlogPage from "../components/common/BlogPage/BlogPage";
import MainBlog from "../components/common/BlogPage/MainBlog";
import SingleMainBlog from "../components/common/BlogPage/singleBlogMain";
import FaqPage from "../components/common/FAQ/FAQ";
import PrivacyPolicy from "../components/common/PrivacyPolicy/PrivacyPolicy";
import ReturnExchangePolicy from "../components/common/Returnpolicy/ReturnPolicy";
import SingleBlog from "../components/common/SingleBlog/SingleBlog";
import TermsAndConditions from "../components/common/TermsAndCondtions/TermsAndConditions";
import UploadSelfieModalMobile from "../pages/b2c/TryOnMobilePages/UploadselfieMobie";
import ProfilePage from "../pages/b2c/Profilepages/ProfilePage";
import Navbar from "../components/common/navbar/navbar";
import { EmptyWishlist } from "../components/b2c";
import WishlistPage from "../pages/b2c/WishlistPage/WishlistPage";
import OrderSuccessPage from "../pages/b2c/orders/OrderSuccessPage";

import TryOnStartPage from "../components/b2c/TryOnMobile_Pages/TryOnStartPage";
import TryOnUploadPage from "../components/b2c/TryOnMobile_Pages/TryOnUploadPage";
import TryOnProcessingPage from "../components/b2c/TryOnMobile_Pages/TryOnProcessingPage";
import TryOnPreviewPage from "../components/b2c/TryOnMobile_Pages/TryOnPreviewPage";

import BestSeller from "../components/common/footer/BestSeller/BestSeller";
import OurStory from "../components/common/OurStory/ourStory";

export default function AppRoutes() {
  const { products, loading, error } = useProducts();

  if (error) return <div>Error: {error}</div>;

  return (
    <Routes>
      {/* 🏠 Home */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/our-story"
        element={
          <MainLayout>
            <OurStory />
          </MainLayout>
        }
      />

      <Route
        path="/usertype=b2b"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      <Route
        path="/order-success"
        element={
          <MainLayout>
            <OrderSuccessPage />
          </MainLayout>
        }
      />
      <Route
        path="/best-seller"
        element={
          <MainLayout>
            <BestSeller />
          </MainLayout>
        }
      />

      {/* 🧷 Product listing pages */}

      {/* All Products */}
      <Route
        path="/womenwear"
        element={
          <MainLayout>
            <ProductLayout products={products} />
          </MainLayout>
        }
      />

      {/* Category-specific pages */}
      <Route
        path="/women/:category"
        element={
          <MainLayout>
            <CategoryPage products={products} />
          </MainLayout>
        }
      />

      {/* 🧷 Product details page */}
      <Route
        path="/products/:id"
        element={
          <MainLayout>
            <ProductDetailsPageIndividual />
          </MainLayout>
        }
      />

      {/* 🛒 Cart & Checkout (Protected if needed later) */}
      <Route
        path="/cart"
        element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <MainLayout>
            <CheckoutPage />
          </MainLayout>
        }
      />

      {/* 📰 Blog pages */}
      <Route
        path="/blog"
        element={
          <MainLayout>
            <BlogPage />
          </MainLayout>
        }
      />
      <Route
        path="/mainblog"
        element={
          <MainLayout>
            <MainBlog />
          </MainLayout>
        }
      />
      <Route
        path="/singleBlogMain"
        element={
          <MainLayout>
            <SingleMainBlog />
          </MainLayout>
        }
      />
      <Route
        path="/SingleBlog"
        element={
          <MainLayout>
            <SingleBlog />
          </MainLayout>
        }
      />

      {/* 📄 Static pages */}
      <Route
        path="/faq"
        element={
          <MainLayout>
            <FaqPage />
          </MainLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          // <MainLayout>
          <PrivacyPolicy />
          // </MainLayout>
        }
      />
      <Route
        path="/Returns"
        element={
          <MainLayout>
            <ReturnExchangePolicy />
          </MainLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <MainLayout>
            <TermsAndConditions />
          </MainLayout>
        }
      />

      <Route
        path="/upload-mobile"
        element={
          <MainLayout>
            <UploadSelfieModalMobile />
          </MainLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Navbar />
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 🔒 Example protected routes (commented for now) */}

      <Route
        path="/wishlist"
        element={
          // <ProtectedRoute>
          <MainLayout>
            <WishlistPage />
            {/* <EmptyWishlist/> */}
          </MainLayout>
          // </ProtectedRoute>
        }
      />

      {/* Mobile tryon pages */}

      <Route path="/tryon/start/:productId" element={<TryOnStartPage />} />
      <Route path="/tryon/upload" element={<TryOnUploadPage />} />
      <Route path="/tryon/processing" element={<TryOnProcessingPage />} />
      <Route path="/tryon/preview" element={<TryOnPreviewPage />} />
    </Routes>
  );
}
