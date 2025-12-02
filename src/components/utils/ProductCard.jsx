// ProductCard.jsx
import { cn } from "@/lib/utils";

export default function ProductCard({ product, className }) {
  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const finalPrice = product.originalPrice
    ? product.originalPrice * (1 - (product.discountPercent || 0) / 100)
    : product.price;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow",
        className
      )}
    >
      <div className="aspect-w-3 aspect-h-4 relative">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      <div className="p-4 bg-white">
        <h3 className="font-medium text-textDark line-clamp-2">{product.title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-primary">
            ₹{finalPrice.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through text-textLight">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <button className="mt-3 w-full bg-primary hover:bg-primaryLight text-white py-2 rounded-md transition">
          SHOP NOW
        </button>
      </div>
    </article>
  );
}
