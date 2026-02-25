import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { AnimatePresence } from "framer-motion";
import PageTransition from "../components/common/PageTransition";
import ProtectedRoute from "../components/protectedRoute";
import MainLayout from "../layout/mainLayout";
import ProductLayout from "../layout/ProductLayout";
import { useProducts } from "../hooks/useProducts";
import LazyImageLoader from "../components/b2c/LazyImageLoader/LazyImageLoader";
import LogoutSkeleton from "../components/common/LogoutSkeleton"; // Import LogoutSkeleton

// 🧱 Pages
import Home from "../pages/b2c/homePage/homePage";
import CartPage from "../pages/b2c/cartPage/cartPage";
import CheckoutPage from "../pages/b2c/cartPage/CheckoutPage";
import ProductDetailsPageIndividual from "../pages/b2c/ProductDetailsPageIndividual";
import CategoryPage from "../pages/b2c/CategoryPage";
import MenPage from "../pages/b2c/MenPage";
import VirtualTryOn from "../virtualtryon";

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
import LandingPage from "../pages/b2c/LandingPage/LandingPage";

import BestSeller from "../components/common/footer/BestSeller/BestSeller";
import OurStory from "../components/common/OurStory/ourStory";

export default function AppRoutes() {
  const { products, loading, error } = useProducts();
  const { loggingOut } = useAuth(); // Get loggingOut state
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(false);

  if (error) return <div>Error: {error}</div>;

  const hideNavbar =
    location.pathname.startsWith("/tryon/");

  const hideHeaderOnMobile =
    location.pathname.startsWith("/products") || location.pathname.startsWith("/womenwear");

  return (
    <>
      {/* FULL PAGE LOADER */}
      {(showLoader || loggingOut) && (
        loggingOut ? <LogoutSkeleton /> : (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex justify-center items-center z-[9999]">
            <LazyImageLoader isProcessing={true} />
          </div>
        )
      )}

      {/* Fixed Navbar - rendered OUTSIDE PageTransition so transforms don't break fixed positioning */}
      {!hideNavbar && (
        <header
          className={`${hideHeaderOnMobile ? "hidden md:block" : "block"} fixed top-0 left-0 right-0 z-50`}
        >
          <Navbar setShowLoader={setShowLoader} />
        </header>
      )}

      {/* Overflow hidden prevents page transitions from creating double-height layout,
          which the browser would then save as scroll position and restore on refresh */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* 🏠 Home */}
          <Route
            path="/"
            element={
              <PageTransition>
                <MainLayout>
                  <Home />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* New Landing Page */}
          <Route
            path="/landing"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />

          <Route
            path="/our-story"
            element={
              <PageTransition>
                <MainLayout>
                  <OurStory />
                </MainLayout>
              </PageTransition>
            }
          />

          <Route
            path="/usertype=b2b"
            element={
              <PageTransition>
                <MainLayout>
                  <Home />
                </MainLayout>
              </PageTransition>
            }
          />

          <Route
            path="/order-success"
            element={
              <PageTransition>
                <MainLayout>
                  <OrderSuccessPage />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/best-seller"
            element={
              <PageTransition>
                <MainLayout>
                  <BestSeller />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* 🧷 Product listing pages */}

          {/* All Products */}
          <Route
            path="/womenwear"
            element={
              <PageTransition>
                <MainLayout>
                  <ProductLayout products={products} />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* Men's Wear - Coming Soon */}
          <Route
            path="/menwear"
            element={
              <PageTransition>
                <MainLayout>
                  <MenPage />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* Category-specific pages */}
          <Route
            path="/women/:category"
            element={
              <PageTransition>
                <MainLayout>
                  <CategoryPage products={products} />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* 🧷 Product details page */}
          <Route
            path="/products/:id"
            element={
              <PageTransition>
                <MainLayout>
                  <ProductDetailsPageIndividual />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* 🛒 Cart & Checkout (Protected if needed later) */}
          <Route
            path="/cart"
            element={
              <PageTransition>
                <MainLayout>
                  <CartPage />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/checkout"
            element={
              <PageTransition>
                <MainLayout>
                  <CheckoutPage />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* 📰 Blog pages */}
          <Route
            path="/blog"
            element={
              <PageTransition>
                <MainLayout>
                  <BlogPage />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/mainblog"
            element={
              <PageTransition>
                <MainLayout>
                  <MainBlog />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/singleBlogMain"
            element={
              <PageTransition>
                <MainLayout>
                  <SingleMainBlog />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/SingleBlog"
            element={
              <PageTransition>
                <MainLayout>
                  <SingleBlog />
                </MainLayout>
              </PageTransition>
            }
          />

          {/* 📄 Static pages */}
          <Route
            path="/virtual-try-on"
            element={
              <PageTransition>
                <MainLayout>
                  <VirtualTryOn />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/faq"
            element={
              <PageTransition>
                <MainLayout>
                  <FaqPage />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/privacy"
            element={
              <PageTransition>
                <MainLayout>
                  <PrivacyPolicy />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/Returns"
            element={
              <PageTransition>
                <MainLayout>
                  <ReturnExchangePolicy />
                </MainLayout>
              </PageTransition>
            }
          />
          <Route
            path="/terms"
            element={
              <PageTransition>
                <MainLayout>
                  <TermsAndConditions />
                </MainLayout>
              </PageTransition>
            }
          />

          <Route
            path="/upload-mobile"
            element={
              <PageTransition>
                <MainLayout>
                  <UploadSelfieModalMobile />
                </MainLayout>
              </PageTransition>
            }
          />

          <Route
            path="/profile"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              </PageTransition>
            }
          />

          {/* 🔒 Example protected routes (commented for now) */}

          <Route
            path="/wishlist"
            element={
              <PageTransition>
                {/* <ProtectedRoute> */}
                <MainLayout>
                  <WishlistPage />
                  {/* <EmptyWishlist/> */}
                </MainLayout>
                {/* </ProtectedRoute> */}
              </PageTransition>
            }
          />

          {/* Mobile tryon pages - KEPT AS IS (Usually separate flow) */}

          <Route path="/tryon/start/:productId" element={<TryOnStartPage />} />
          <Route path="/tryon/upload" element={<TryOnUploadPage />} />
          <Route path="/tryon/processing" element={<TryOnProcessingPage />} />
          <Route path="/tryon/preview" element={<TryOnPreviewPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

