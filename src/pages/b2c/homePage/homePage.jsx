import CategoryCarousel from "../../../components/utils/CategoryCarousel";
import ProductGrid from "../../../components/product/productGrid";
import SectionTitle from "../../../components/utils/SectionTitle";
import homeBannerWomen from "../../../assets/hero_women.jpg";
import homeBannerMen from "../../../assets/hero_men.jpg";
import ClosetIconsSection from "../../../components/b2c/home/ClosetIconsSection";
import { useProducts } from "../../../hooks/useProducts";
import LuxuryPicks from "../../../components/b2c/home/LuxuryPicks";
import SpotlightCollections from "../../../components/b2c/home/SpotlightCollections";
import BestProducts from "../../../components/b2c/home/BestProducts";
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import CategoriesSection from "../../../components/b2c/home/CategoriesSection";
import VirtualTryOnSection from "../../../components/b2c/home/VirtualTryOnSection";
import PromotionalCarousel from "../../../components/b2c/home/PromotionalCarousel";
import LuxeEditSection from "../../../components/b2c/home/LuxeEditSection";
import EthnicWearSection from "../../../components/b2c/home/EthnicWearSection";
import TryItBuyItSection from "../../../components/b2c/home/TryItBuyItSection";
import PopularProductsSection from "../../../components/b2c/home/PopularProductsSection";
import NewArrivalBanner from "../../../components/b2c/home/NewArrivalBanner";
import { LOADING_FRAMES, FRAME_INTERVAL } from "../../../assets/lazyloading2";

export default function Home() {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileTab, setMobileTab] = useState("women");

  // Handle scroll to section if state is passed (e.g., from Navbar 'WOMEN' click)
  useEffect(() => {
    if (!loading && location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        // Delay slightly to ensure layout is stable after products load
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          // Clear state after scrolling
          window.history.replaceState({}, document.title);
        }, 100);
      }
    }
  }, [loading, location.state]);

  // Loading state — show the Villy logo animation
  const [loadingFrame, setLoadingFrame] = React.useState(0);
  React.useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % LOADING_FRAMES.length);
    }, FRAME_INTERVAL);
    return () => clearInterval(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <img
          src={LOADING_FRAMES[loadingFrame]}
          alt="Loading..."
          style={{
            width: "300px",
            height: "300px",
            objectFit: "cover",
          }}
        />
      </div>
    );
  }
  if (error) return <div className="text-center text-iserror py-20">{error}</div>;

  const productsArray = Array.isArray(products) ? products : [];

  return (
    <div className="">

      {/* MOBILE HERO SECTION */}
      <section className="relative w-full h-[calc(100vh-112px)] md:hidden flex flex-col">
        {/* Tabs */}
        <div className="flex w-full bg-[#FAFAFA]">
          <button
            onClick={() => setMobileTab("women")}
            className={`flex-1 py-3 text-sm font-medium tracking-wide uppercase transition-colors relative ${mobileTab === 'women' ? 'text-[#33022F] font-bold' : 'text-gray-500'}`}
          >
            Women
            {mobileTab === 'women' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#33022F]"></div>}
          </button>
          <button
            onClick={() => setMobileTab("men")}
            className={`flex-1 py-3 text-sm font-medium tracking-wide uppercase transition-colors relative ${mobileTab === 'men' ? 'text-[#33022F] font-bold' : 'text-gray-500'}`}
          >
            Men
            {mobileTab === 'men' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#33022F]"></div>}
          </button>
        </div>

        {/* Hero Image & Overlay */}
        <div className="relative flex-1 w-full overflow-hidden">
          <img
            src={mobileTab === "women" ? homeBannerWomen : homeBannerMen}
            alt={mobileTab === "women" ? "Women's Fashion" : "Men's Fashion"}
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#33022F]/40 via-transparent to-[#33022F]/80"></div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16">
            <h1
              className="text-white drop-shadow-xl mb-3 text-[14vw] sm:text-[56px]"
              style={{
                fontFamily: 'Antiga, serif',
                lineHeight: '1',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}
            >
              THIS IS VILLY
            </h1>
            <p
              className="text-white mb-8 max-w-[280px] sm:max-w-[300px] text-[3.5vw] sm:text-[13px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                lineHeight: '1.4',
                letterSpacing: '0.01em'
              }}
            >
              “Try before you buy — experience fashion through your virtual mirror.”
            </p>

            <button
              onClick={() => navigate(mobileTab === "women" ? "/womenwear" : "/menwear")}
              className="bg-white text-black w-[200px] sm:w-[220px] h-[45px] sm:h-[50px] text-xs sm:text-sm font-bold tracking-[0.12em] uppercase shadow-xl hover:bg-gray-100 transition rounded-none flex items-center justify-center"
            >
              SHOP {mobileTab === "women" ? "WOMENS" : "MENS"}
            </button>
          </div>
        </div>
      </section>

      {/* DESKTOP HERO SECTION (Hidden on Mobile) */}
      <section className="hidden md:flex relative w-full overflow-hidden h-[calc(100vh-64px)] flex-row">

        {/* Left Side - Women */}
        <div className="relative w-1/2 h-full">
          <img
            src={homeBannerWomen}
            alt="Women's Fashion"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="absolute bottom-20 w-full flex justify-center pointer-events-auto">
            <button
              onClick={() => navigate("/womenwear")}
              className="bg-white text-black px-6 lg:px-10 py-3 text-xs lg:text-sm font-bold tracking-[0.15em] uppercase hover:bg-gray-100 transition shadow-xl"
            >
              Shop Women
            </button>
          </div>
        </div>

        {/* Right Side - Men */}
        <div className="relative w-1/2 h-full">
          <img
            src={homeBannerMen}
            alt="Men's Fashion"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="absolute bottom-20 w-full flex justify-center pointer-events-auto">
            <button
              onClick={() => navigate("/menwear")}
              className="bg-white text-black px-6 lg:px-10 py-3 text-xs lg:text-sm font-bold tracking-[0.15em] uppercase hover:bg-gray-100 transition shadow-xl"
            >
              Shop Men
            </button>
          </div>
        </div>

        {/* Centered Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-32 pb-10">
          <h1
            className="text-white drop-shadow-xl z-20 text-center mx-4 text-[8vw] lg:text-[7vw] xl:text-[99.69px]"
            style={{
              fontFamily: 'Antiga, serif',
              fontWeight: 400,
              fontStyle: 'normal',
              lineHeight: '100%',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            THIS IS VILLY
          </h1>
          <p
            className="text-white drop-shadow-md z-20 text-center px-4 mt-4"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12.46px',
              fontWeight: 500,
              lineHeight: '100%',
              letterSpacing: '0px',
              opacity: 1
            }}
          >
            “Try before you buy — experience fashion through your virtual mirror.”
          </p>
        </div>

      </section>

    
      {/* 2.5. VIRTUAL TRY ON SECTION */}
      <VirtualTryOnSection />

      {/* 2. CATEGORIES SECTION */}
      <CategoriesSection />

      {/* 2.8 PROMOTIONAL CAROUSEL */}
      <PromotionalCarousel />

      {/* 2.9 LUXE EDIT SECTION */}
      <LuxeEditSection />

      {/* 2.95 ETHNIC WEAR SECTION */}
      <EthnicWearSection />

      {/* 2.97 TRY IT & BUY IT SECTION */}
      <TryItBuyItSection />

      {/* 2.98 POPULAR PRODUCTS SECTION */}
      <PopularProductsSection products={productsArray} />

      {/* 2.99 NEW ARRIVAL BANNER */}
      <NewArrivalBanner />

      {/* 2.99.1 HOME FOOTER */}
      {/* <HomeFooter /> */}

      {/* 3. SHOP BY CATEGORY */}
      {/* <section className="">
        <div className="">
          <SectionTitle viewAll>Shop by Category</SectionTitle>
          <CategoryCarousel />
        </div>
      </section> */}

      {/* 4. DISCOUNT COLLECTION */}
      {/* <section className="pt-12">
        <SectionTitle viewAll>Discount Collection</SectionTitle>
        <ProductGrid products={discount} columns={4} showDiscount={false} />
      </section> */}

      {/* Luxurious Picks of the Day (from image) */}
      {/* <section className="pt-12">
        <LuxuryPicks products={luxuryPicks} columns={4} />
      </section> */}

      {/* 5. SPOTLIGHT OF THE DAY */}
      {/* {spotlight && (
        <section className=" pt-12">
          <SpotlightCollections />
        </section>
      )} */}

      {/* 6. BEST SELLING */}
      {/* <section className="  pt-12 space-y-3">
        <SectionTitle viewAll>Bestselling</SectionTitle>

        <BestProducts products={bestsellers} columns={2} />

        <ProductGrid products={wedding} columns={3} />
      </section> */}

      {/* 7. CLOSET ICONS (New Section) */}
      {/* <section className=" py-12">
        {closetIcons.length > 0 && (
          <section>
            <SectionTitle viewAll>Closet icons</SectionTitle>
            <ClosetIconsSection products={closetIcons} columns={5} />
            <ProductGrid products={discount} columns={4} showShopNow={false} />
            <BestProducts products={bestsellers} columns={3} buttonText="Upto 50%" />
          </section>
        )}
      </section> */}
    </div>
  );
}
