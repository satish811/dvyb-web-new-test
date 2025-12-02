export const formatPrice = (price) => {
  if (typeof price === "string") {
    return parseInt(price.replace(/,/g, "")).toLocaleString("en-IN");
  }
  return price.toLocaleString("en-IN");
};
