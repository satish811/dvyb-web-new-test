import React from "react";
import { useNavigate } from "react-router-dom";

// Image imports
import Banner from "@/assets/b2c/images/MainBlog/Banner.jpg";
import red from "@/assets/b2c/images/MainBlog/Red.svg";
import bride from "@/assets/b2c/images/MainBlog/Bride.svg";
import saree from "@/assets/b2c/images/MainBlog/Saree.svg";
import silk from "@/assets/b2c/images/MainBlog/silk.svg";
import Hand from "@/assets/b2c/images/MainBlog/Hand.svg";
import women from "@/assets/b2c/images/MainBlog/women.svg";
import Lehenga from "@/assets/b2c/images/MainBlog/Lehenga.svg";
import LehengaStyle1 from "../../../assets/b2c/landing/wedding/wed02.webp";
import Anarkali from "@/assets/b2c/images/MainBlog/Anarkali.svg";
import kurta from "@/assets/b2c/images/MainBlog/kurta.svg";

// Image constants
const IMAGES = {
  blogOfTheDay: Banner,
  recentBlogs: {
    kanchiPattu: red,
    bridalWear: bride,
    godvariSaree: saree,
    silkySmooth: silk,
    masterPiece: Hand,
    fusionFashion: women,
  },
  products: {
    lehenga: Lehenga,
    eveningDrapery: LehengaStyle1,
    floralKurta1: Anarkali,
    floralKurta2: kurta,
  },
  fashionBaits: {
    kanchiPattu: red,
    bridalWear: bride,
    godvariOrigin: saree,
    silkySmooth: silk,
    masterPiece: Hand,
    fusionFashion: women,
  },
};

const BlogPage = () => {
  const navigate = useNavigate();

  const recentBlogs = [
    {
      title: "Kanchi Pattu saree history",
      date: "Aug 09 2025",
      image: IMAGES.recentBlogs.kanchiPattu,
      path: "/SingleBlog",
    },
    {
      title: "Bridal Wear Trends",
      date: "Aug 24 2025",
      image: IMAGES.recentBlogs.bridalWear,
      path: "/SingleBlog",
    },
    {
      title: "The origin of godvari saree",
      date: "Aug 09 2025",
      image: IMAGES.recentBlogs.godvariSaree,
      path: "/SingleBlog",
    },
    {
      title: "Silky smooth silk",
      date: "Aug 09 2025",
      image: IMAGES.recentBlogs.silkySmooth,
      path: "/SingleBlog",
    },
    {
      title: "Master piece embroidery",
      date: "Aug 09 2025",
      image: IMAGES.recentBlogs.masterPiece,
      path: "/SingleBlog",
    },
    {
      title: "Fusion Fashion",
      date: "Aug 09 2025",
      image: IMAGES.recentBlogs.fusionFashion,
      path: "/SingleBlog",
    },
  ];

  const products1 = [
    {
      title: "Celebrate Karwa Chauth in Style: 7 Sarees You Can't Miss",
      image: IMAGES.products.lehenga,
    },
    {
      title: "Embrace the Festive Spirit: 5 Must-Have Lehenga Styles",
      subtitle: "ELEGANT EVENING DRAPERY",
      discount: "UPTO 30% OFF",
      image: IMAGES.products.eveningDrapery,
    },
    {
      title: "Modern Twists on Traditional Wear: Top 4 Anarkali Suits",
      subtitle: "FLORAL CHARM KURTA",
      discount: "UPTO 15% OFF",
      image: IMAGES.products.floralKurta1,
    },
    {
      title: "Accessorize Your Festivities: 8 Jewelry Pieces to Adorn",
      subtitle: "FLORAL CHARM KURTA",
      discount: "UPTO 40% OFF",
      image: IMAGES.products.floralKurta2,
    },
  ];

  const fashionBaits = [
    {
      title: "Kanchi Pattu saree history",
      date: "Aug 09 2025",
      image: IMAGES.fashionBaits.kanchiPattu,
      path: "/SingleBlog",
    },
    {
      title: "Bridal Wear Trends",
      date: "Aug 24 2025",
      image: IMAGES.fashionBaits.bridalWear,
      path: "/SingleBlog",
    },
    {
      title: "The origin of godvari saree",
      date: "Aug 09 2025",
      image: IMAGES.fashionBaits.godvariOrigin,
      path: "/SingleBlog",
    },
    {
      title: "Silky smooth silk",
      date: "Aug 09 2025",
      image: IMAGES.fashionBaits.silkySmooth,
      path: "/SingleBlog",
    },
    {
      title: "Master piece embroidery",
      date: "Aug 09 2025",
      image: IMAGES.fashionBaits.masterPiece,
      path: "/SingleBlog",
    },
    {
      title: "Fusion Fashion",
      date: "Aug 09 2025",
      image: IMAGES.fashionBaits.fusionFashion,
      path: "/SingleBlog",
    },
  ];

  return (
    <div className="min-h-screen bg-white lg:mx-14 sm:mx-4 md:mt-16 ">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Blog of the Day - Linked to /singleBlogMain */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium mb-4 ">BLOG OF THE DAY</h2>
            <div
              className="relative cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => navigate("/singleBlogMain")}
            >
              <img
                src={IMAGES.blogOfTheDay}
                alt="Karwa Chauth Blog"
                className="w-[100%] h-[100%] "
              />
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">
                  Celebrate Karwa Chauth in Style: 7 Sarees You Can't Miss
                </h3>
                <p className="text-gray-600 mb-2">
                  A saree is a beautiful traditional garment worn by women in South Asia, showcasing
                  elegance and grace. It consists of a long piece of fabric, typically draped around
                  the body, often paired with a stylish blouse.
                </p>
                <span className="font-semibold">
                  Read More <span className="text-red-600">»</span>
                </span>
              </div>
            </div>
          </div>

          {/* Recent Blogs - Linked to /SingleBlog */}
          <div>
            <h2 className="text-sm font-medium mb-4">RECENT BLOGS</h2>
            <div className="grid grid-cols-2 gap-4">
              {recentBlogs.map((blog, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(blog.path)}
                >
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-32 object-cover mb-2"
                  />
                  <h4 className="text-sm mb-1">{blog.title}</h4>
                  <p className="text-xs text-gray-500">{blog.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid (Middle Images) - Linked to /mainblog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {products1.map((product, index) => (
            <div
              key={index}
              className="relative group cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => navigate("/mainblog")} // Link added here
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-auto transform transition-transform duration-300 group-hover:scale-105"
                />
                {product.subtitle && (
                  <div className="absolute bottom-9 left-1 top-70 right-0 inset-1 bg-opacity-30 flex flex-col items-center justify-center text-white ">
                    <h4 className="text-lg font-bold ">{product.subtitle}</h4>
                    {product.discount && <p className="text-sm mt-2">{product.discount}</p>}
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-sm">{product.title}</h3>

              {/* Text Links also trigger navigation via parent div, but keeping styling */}
              {index === 1 && (
                <span className="text-sm block mt-1">
                  Discover Your Look <span className="text-red-600">»</span>
                </span>
              )}
              {index === 2 && (
                <span className="text-sm block mt-1">
                  Explore Options <span className="text-red-600">»</span>
                </span>
              )}
              {index === 3 && (
                <span className="text-sm block mt-1">
                  Shop The Collection <span className="text-red-600">»</span>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Fashion Baits - Linked to /SingleBlog */}
        <div className="mt-12">
          <h2 className="text-sm font-medium mb-4">Fashion Baits</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {fashionBaits.map((item, index) => (
              <div
                key={index}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(item.path)}
              >
                <img src={item.image} alt={item.title} className="w-full h-50 object-cover mb-2" />
                <h4 className="text-xs font-semibold mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPage;
