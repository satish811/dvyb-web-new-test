import CategoryCarousel from "../../../components/utils/CategoryCarousel";
import ProductGrid from "../../../components/product/productGrid";
import SectionTitle from "../../../components/utils/SectionTitle";
import homeBanner from "../../../assets/b2c/landing/banner01.svg";
import ClosetIconsSection from "../../../components/b2c/home/ClosetIconsSection";
import { useProducts } from "../../../hooks/useProducts";
import { useStaticProducts } from "../../../hooks/useStaticProducts";
import LuxuryPicks from "../../../components/b2c/home/LuxuryPicks";
import SpotlightCollections from "../../../components/b2c/home/SpotlightCollections";
import BestProducts from "../../../components/b2c/home/BestProducts";
import { useNavigate } from "react-router-dom";

export default function Home() {
  // const { products, loading, error } = useProducts();
  // const { loading, error } = useProducts();
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
    <div>
      <section className="lg:mt-7 md:mt-7 w-full max-w-[95vw] md:h-[90vh] lg:mx-7  mx-auto overflow-hidden flex justify-center items-center ">
        <img
          onClick={() => navigate("/womenwear")}
          src={homeBanner}
          alt="New Year Sale"
          className="w-full h-full object-fill object-center cursor-pointer"
        />
      </section>

      {/* 2. WEDDING TALES */}
      <section className="container mx-auto py-12 px-3">
        <SectionTitle viewAll>Wedding Tales</SectionTitle>
        <ProductGrid products={wedding} columns={3} />
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="px-3">
        <div className="container mx-auto">
          <SectionTitle viewAll>Shop by Category</SectionTitle>
          <CategoryCarousel />
        </div>
      </section>

      {/* 4. DISCOUNT COLLECTION */}
      <section className="container mx-auto px-3 pt-12">
        <SectionTitle viewAll>Discount Collection</SectionTitle>
        <ProductGrid products={discount} columns={4} showDiscount={false} />
      </section>

      {/* Luxurious Picks of the Day (from image) */}
      <section className="container mx-auto pt-12">
        <LuxuryPicks products={luxuryPicks} columns={4} />
      </section>

      {/* 5. SPOTLIGHT OF THE DAY */}
      {spotlight && (
        <section className="container mx-auto pt-12">
          {/* <SectionTitle>Spotlight of the Day</SectionTitle> */}

          <SpotlightCollections />
        </section>
      )}

      {/* 6. BEST SELLING */}
      <section className="container mx-auto pt-12 px-3">
        <SectionTitle viewAll>Bestselling</SectionTitle>
        <BestProducts products={bestsellers} columns={2} />
        <ProductGrid products={wedding} columns={3} />
      </section>

      {/* 7. CLOSET ICONS (New Section) */}
      <section className="container mx-auto py-12">
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
