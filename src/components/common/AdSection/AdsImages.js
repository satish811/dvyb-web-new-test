import saree from "@/assets/b2c/ads/Ad_1.png";
import anarkali from "@/assets/b2c/ads/Ad_2.png";
import specialOffer from "@/assets/b2c/ads/Ad_4.png";
import ethnic from "@/assets/b2c/ads/Ad_5.png";
import specialOffer1 from "@/assets/b2c/ads/Ad_6.png";

import saree_banner from "@/assets/b2c/ads/Saree_Banner_1.png";
import saree_banner_mob from "@/assets/b2c/ads/Saree_Banner_mob_1.png";

import banner from "@/assets/b2c/ads/Banner_2.png";
import banner_mob from "@/assets/b2c/ads/Banner_mob_2.png";

import banner_2 from "@/assets/b2c/ads/Banner_3.png";
import banner_mob_2 from "@/assets/b2c/ads/Banner_mob_3.png";

import makar_sankranti from "@/assets/b2c/ads/lohari_banner.jpg";
import saree_1 from "@/assets/b2c/ads/saree_1.jpg";
import saree_2 from "@/assets/b2c/ads/saree_2.jpg";


// --------------------------------------------
// DESKTOP ADS
// --------------------------------------------
export const ads = [
  {
    id: 1,
    image: makar_sankranti,
    alt: "Banner 4 Desktop",
    category: "other",
    link: "/womenwear",
  },
  // {
  //   id: 1,
  //   image: saree,
  //   alt: "Advertisement 1",
  //   category: "saree",
  //   link: "/womenwear?category=saree",
  // },
  {
    id: 2,
    image: anarkali,
    alt: "Advertisement 2",
    category: "anarkalis",
    link: "/womenwear?category=anarkalis",
  },
  {
    id: 3,
    image: specialOffer,
    alt: "Advertisement 4",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 4,
    image: ethnic,
    alt: "Advertisement 5",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 5,
    image: specialOffer1,
    alt: "Advertisement 6",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 6,
    image: saree_1,
    alt: "Saree Banner Desktop",
    category: "saree",
    link: "/womenwear?category=saree",
  },
  {
    id: 7,
    image: banner,
    alt: "Banner 2 Desktop",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 8,
    image: banner_2,
    alt: "Banner 3 Desktop",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 9,
    image: makar_sankranti,
    alt: "Banner 4 Desktop",
    category: "other",
    link: "/womenwear",
  },
];

// --------------------------------------------
// MOBILE ADS
// --------------------------------------------
export const adsMobile = [
  {
    id: 1,
    image: saree_banner_mob,
    alt: "Saree Banner Mobile",
    category: "saree",
    link: "/womenwear?category=saree",
  },
  {
    id: 2,
    image: banner_mob,
    alt: "Banner 2 Mobile",
    category: "other",
    link: "/womenwear",
  },
  {
    id: 3,
    image: banner_mob_2,
    alt: "Banner 3 Mobile",
    category: "other",
    link: "/womenwear",
  },
];

export default ads;
