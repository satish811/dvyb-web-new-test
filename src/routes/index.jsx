// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/protectedRoute";
import MainLayout from "../layout/mainLayout";
import ProductLayout from "../layout/ProductLayout";
import WomenwearRoute from "./WomenwearRoute";
import { useProducts } from "../hooks/useProducts";

// 🧱 Pages
import Home from "../pages/b2c/homePage/homePage";
import CartPage from "../pages/b2c/cartPage/cartPage";
import CheckoutPage from "../pages/b2c/cartPage/CheckoutPage";
import ProductDetailsPageIndividual from "../pages/b2c/ProductDetailsPageIndividual";
// import OrderSuccessPage from "../pages/b2c/cartPage/OrderSuccessPage";

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

export default function AppRoutes() {
  const { products, loading, error } = useProducts();
  if (loading) return <div>Loading...</div>;
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

      {/* 🧷 Product listing page */}
      <Route
        path="/womenwear"
        element={
          <MainLayout>
            <ProductLayout products={products}>
              <WomenwearRoute products={products} />
            </ProductLayout>
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
    </Routes>
  );
}
