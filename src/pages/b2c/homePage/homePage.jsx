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
import { useNavigate } from "react-router-dom";
import CategoriesSection from "../../../components/b2c/home/CategoriesSection";
import VirtualTryOnSection from "../../../components/b2c/home/VirtualTryOnSection";
import PromotionalCarousel from "../../../components/b2c/home/PromotionalCarousel";
import LuxeEditSection from "../../../components/b2c/home/LuxeEditSection";
import EthnicWearSection from "../../../components/b2c/home/EthnicWearSection";
import TryItBuyItSection from "../../../components/b2c/home/TryItBuyItSection";
import PopularProductsSection from "../../../components/b2c/home/PopularProductsSection";
import NewArrivalBanner from "../../../components/b2c/home/NewArrivalBanner";
// import HomeFooter from "../../../components/b2c/home/HomeFooter";

export default function Home() {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();

  if (loading) return <div className="text-center py-20 sm:py-2">Loading…</div>;
  if (error) return <div className="text-center text-iserror py-20">{error}</div>;

  const productsArray = Array.isArray(products) ? products : [];

  return (
    <div className="">

      <section className="relative w-full overflow-hidden h-auto min-h-[500px] md:h-[calc(100vh-64px)] flex flex-col md:flex-row">

        {/* Left Side - Women */}
        <div className="relative w-full md:w-1/2 h-[50vh] md:h-full">
          <img
            src={homeBannerWomen}
            alt="Women's Fashion"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/10"></div> {/* Subtle tint for text contrast if needed */}

          <div className="absolute bottom-10 md:bottom-20 w-full flex justify-center pointer-events-auto">
            <button
              onClick={() => navigate("/womenwear")}
              className="bg-white text-black px-8 py-3 md:px-10 md:py-3 text-xs md:text-sm font-bold tracking-[0.15em] uppercase hover:bg-gray-100 transition shadow-xl"
            >
              Shop Women
            </button>
          </div>
        </div>

        {/* Right Side - Men */}
        <div className="relative w-full md:w-1/2 h-[50vh] md:h-full">
          <img
            src={homeBannerMen}
            alt="Men's Fashion"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="absolute bottom-10 md:bottom-20 w-full flex justify-center pointer-events-auto">
            <button
              onClick={() => navigate("/menwear")}
              className="bg-white text-black px-8 py-3 md:px-10 md:py-3 text-xs md:text-sm font-bold tracking-[0.15em] uppercase hover:bg-gray-100 transition shadow-xl"
            >
              Shop Men
            </button>
          </div>
        </div>

        {/* Centered Text Overlay - Absolute over the entire section */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none md:-mt-32 pb-10">
          <h1
            className="text-white drop-shadow-xl z-20 text-center mx-4"
            style={{
              fontFamily: 'Antiga, serif',
              fontSize: '99.69px',
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

      {/* 2. CATEGORIES SECTION */}
      <CategoriesSection />

      {/* 2.5. VIRTUAL TRY ON SECTION */}
      <VirtualTryOnSection />

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
