// components/footer/footerData.js
export const footerSections = [
  {
    title: "Quick Links",
    key: "quick",
    links: [
      { label: "Virtual Try On", to: "/virtual-tryon" },
      { label: "Exclusives", to: "/best-seller?type=exclusives" },
      { label: "Best Sellers", to: "/best-seller?type=best-sellers" },
      { label: "Closet Icon", to: "/womenwear" },
      { label: "Bridal Closet", to: "/womenwear?category=wedding" },
    ],
  },
  {
    title: "Our Company",
    key: "company",
    links: [
      { label: "Our Story", to: "/our-story" },
      { label: "Contact Us", to: "/faq" },
      { label: "FAQ", to: "/faq" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
  {
    title: "Customer Policies",
    key: "policies",
    links: [
      // { label: "Store", to: "/store" },
      { label: "Store", to: "https://www.villydigi.in/", external: true },

      // { label: "Shipping Info", to: "/shipping" },
      { label: "Return Policy", to: "/returns" },
      { label: "Warranty", to: "/returns" },
    ],
  },
  {
    title: "Our Services",
    key: "services",
    links: [
      { label: "wholesaler", to: "/usertype=b2b" },
      { label: "Support", to: "/faq" },
      { label: "Blog", to: "/blog" },

      // { label: "Feedback", to: "/feedback" },
    ],
  },
];
