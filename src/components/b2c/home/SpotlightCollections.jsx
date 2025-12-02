import React from "react";
import { spotLight, coll01, coll02, coll03, coll04, coll05, coll06, img01 } from "@/assets";
import { useNavigate } from "react-router-dom";

const CollectionCard = ({ image, title, onClick }) => (
  <div className="group cursor-pointer" onClick={onClick}>
    <div className="overflow-hidden mb-1 aspect-[1]">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <h3 className="text-xs md:text-sm lg:text-md text-left font-medium">{title}</h3>
  </div>
);

const SpotlightCollections = () => {
  const navigate = useNavigate();

  const spotlight = {
    title: "Kanjivaram Silk Saree",
    description:
      "Experience the timeless elegance of traditional Kanjivaram silk sarees. Handwoven with intricate gold zari work, perfect for weddings and special occasions.",
    image: [spotLight],
    path: "/womenwear",
  };

  const collections = [
    {
      id: 1,
      title: "Kanchi Pattu",
      image: [coll01],
      path: "/womenwear?category=saree",
    },
    {
      id: 2,
      title: "Bridal Lehengas",
      image: [img01],
      path: "/womenwear?category=lehenga",
    },
    {
      id: 3,
      title: "Anarkali Suits",
      image: [coll03],
      path: "/womenwear?category=anarkalis",
    },
    {
      id: 4,
      title: "Gadwal Kolanjeepana",
      image: [coll04],
      path: "/womenwear?category=saree",
    },
    {
      id: 5,
      title: "Embroidery Blouse",
      image: [coll05],
      path: "/womenwear?category=blouses",
    },
    {
      id: 6,
      title: "Bridal Saree",
      image: [coll06],
      path: "/womenwear?category=saree",
    },
  ];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-3 md:px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Spotlight Section */}
          <section className="flex flex-col">
            <h2 className="sm:text-base md:text-lg lg:text-xl mb-[28px] font-medium uppercase tracking-wide text-left">
              SPOTLIGHT OF THE DAY
            </h2>

            <div
              className="overflow-hidden cursor-pointer flex-1"
              onClick={() => navigate(spotlight.path)}
            >
              <img
                src={spotlight.image}
                alt={spotlight.title}
                className="w-full h-full object-cover transition-transform duration-500"
              />
            </div>
          </section>

          {/* Collections Section */}

          <section>
            <h2 className="sm:text-base md:text-lg lg:text-xl mb-[28px] font-medium uppercase tracking-wide text-left">
              New Collections to Love
            </h2>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {collections.map((item) => (
                <CollectionCard
                  key={item.id}
                  image={item.image}
                  title={item.title}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SpotlightCollections;
