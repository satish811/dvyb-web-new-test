// src/models/Product.js
export const Product = {
  // No strict interface, but use as prop shape
  id: "",
  title: "",
  name: "",
  price: 0,
  originalPrice: 0,
  discountPercent: 0,
  category: "",
  images: [],
  description: "",
  isNew: false,
  timestamp: new Date(),
  // any extra fields
};
