import saree from "@/assets/b2c/ads/Ad_1.png";
import anarkali from "@/assets/b2c/ads/Ad_2.png";
import fashion from "@/assets/b2c/ads/Ad_3.png";
import specialOffer from "@/assets/b2c/ads/Ad_4.png";
import ethnic from "@/assets/b2c/ads/Ad_5.png";
import specialOffer1 from "@/assets/b2c/ads/Ad_6.png";

export const ads = [
  {
    id: 1,
    image: saree,
    alt: "Advertisement 1",
    category: "saree",
    link: "/womenwear?category=saree",
  },
  {
    id: 2,
    image: anarkali,
    alt: "Advertisement 2",
    category: "anarkalis",
    link: "/womenwear?category=anarkalis",
  },
  {
    id: 3,
    image: fashion,
    alt: "Advertisement 3",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 4,
    image: specialOffer,
    alt: "Advertisement 4",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 5,
    image: ethnic,
    alt: "Advertisement 5",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 6,
    image: specialOffer1,
    alt: "Advertisement 6",
    category: "other",
    link: "/womenwear",
  },
];

export default ads;
