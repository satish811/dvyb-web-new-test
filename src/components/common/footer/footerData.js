// components/footer/footerData.js
export const footerSections = [
  {
    title: "Quick Links",
    key: "quick",
    links: [
      { label: "Virtual Try On", to: "/virtual-tryon" },
      { label: "Exclusives", to: "/best-seller?type=exclusives" },
      { label: "Best Sellers", to: "/best-seller?type=best-sellers" },
    ],
  },
  {
    title: "Our Company",
    key: "company",
    links: [
      { label: "Contact Us", to: "/faq" },
      { label: "FAQ", to: "/faq" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
  {
    title: "Our Products",
    key: "products",
    links: [
      { label: "Digiwarehouse", to: "https://villydigi.in", external: true },
      { label: "Shipping Info", to: "/terms" },
      { label: "Return Policy", to: "/terms" },
      { label: "Warranty", to: "/terms" },
    ],
  },
  {
    title: "Our Services",
    key: "services",
    links: [
      { label: "Support", to: "/faq" },
      { label: "Blog", to: "/blog" },
    ],
  },
];
