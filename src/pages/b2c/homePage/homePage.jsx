import CategoryCarousel from "../../../components/utils/CategoryCarousel";
import ProductGrid from "../../../components/product/productGrid";
import SectionTitle from "../../../components/utils/SectionTitle";
import homeBanner from "../../../assets/b2c/landing/banner01.jpg";
import ClosetIconsSection from "../../../components/b2c/home/ClosetIconsSection";
import { useProducts } from "../../../hooks/useProducts";
import { useStaticProducts } from "../../../hooks/useStaticProducts";
import LuxuryPicks from "../../../components/b2c/home/LuxuryPicks";
import SpotlightCollections from "../../../components/b2c/home/SpotlightCollections";
import BestProducts from "../../../components/b2c/home/BestProducts";
import { useNavigate } from "react-router-dom";
import WeddingSection from "../../../components/b2c/home/WeddingCard";

export default function Home() {
  const { staticProducts, loading, error } = useStaticProducts();
  const navigate = useNavigate();

  if (loading) return <div className="text-center py-20 sm:py-2">Loading…</div>;
  if (error) return <div className="text-center text-iserror py-20">{error}</div>;

  const productsArray = Array.isArray(staticProducts) ? staticProducts : [];
  const wedding = productsArray.filter((p) => p.category === "Wedding");
  const discount = productsArray.filter((p) => p.category === "Discount");
  const bestsellers = productsArray.filter((p) => p.category === "Bestselling").slice(0, 8);
  const spotlight = productsArray.find((p) => p.category === "Spotlight");
  const luxuryPicks = productsArray.filter((p) => p.category === "Luxury").slice(0, 4);
  const closetIcons = productsArray.filter((p) => p.category === "Closet").slice(0, 8);

  return (
    <div className="overflow-x-hidden">

      <section className="h-[60vh] md:h-[80vh] lg:h-[90vh] overflow-hidden flex justify-center items-center bg-gray-50">
        <img
          onClick={() => navigate("/womenwear")}
          src={homeBanner}
          alt="New Year Sale"
          className="max-w-[1200px]  h-full object-contain md:object-cover cursor-pointer px-2 md:px-0"
        />
      </section>

      {/* 2. WEDDING TALES */}
      <section className="container py-9">
        <SectionTitle viewAll>Wedding Tales</SectionTitle>
        <WeddingSection products={wedding} columns={3} />
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="">
        <div className="container ">
          <SectionTitle viewAll>Shop by Category</SectionTitle>
          <CategoryCarousel />
        </div>
      </section>

      {/* 4. DISCOUNT COLLECTION */}
      <section className="container pt-12">
        <SectionTitle viewAll>Discount Collection</SectionTitle>
        <ProductGrid products={discount} columns={4} showDiscount={false} />
      </section>

      {/* Luxurious Picks of the Day (from image) */}
      <section className="container pt-12">
        <LuxuryPicks products={luxuryPicks} columns={4} />
      </section>

      {/* 5. SPOTLIGHT OF THE DAY */}
      {spotlight && (
        <section className="container  pt-12">
          {/* <SectionTitle>Spotlight of the Day</SectionTitle> */}

          <SpotlightCollections />
        </section>
      )}

      {/* 6. BEST SELLING */}
      <section className="container  pt-12 space-y-3">
        <SectionTitle viewAll>Bestselling</SectionTitle>

        <BestProducts products={bestsellers} columns={2} />

        <ProductGrid products={wedding} columns={3} />
      </section>

      {/* 7. CLOSET ICONS (New Section) */}
      <section className="container  py-12">
        {closetIcons.length > 0 && (
          <section>
            <SectionTitle viewAll>Closet icons</SectionTitle>
            <ClosetIconsSection products={closetIcons} columns={5} />
            <ProductGrid products={discount} columns={4} showShopNow={false} />
            <BestProducts products={bestsellers} columns={3} buttonText="Upto 50%" />
          </section>
        )}
      </section>
    </div>
  );
}
