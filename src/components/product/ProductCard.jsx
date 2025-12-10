// ProductCard.jsx
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onClose, className, disableNamePointer }) {
    const rawTitle = product.title || "Unnamed Product";
  const rawDescription = product.description || "";
  const navigate = useNavigate();

   
  const title = rawTitle.trim().slice(0, 40) + (rawTitle.length > 40 ? "..." : ""); 
  const description = rawDescription.trim().slice(0, 50) + (rawDescription.length > 80 ? "..." : "");


  return (
    <article
      onClick={() => {
        onClose?.(); // Use optional chaining here
        navigate(`/products/${product.id}`);
      }}
      className={cn(
        "group w-70 h-130 relative overflow-hidden cursor-pointer transition-all duration-300 flex flex-col",
        className
      )}
    >
      {/* IMAGE CONTAINER */}
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src={product.imageUrls?.[0] || product.images?.[0]}
          alt={title}
          className="w-full h-90 group relative transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* CONTENT */}
      <div className="py-4 flex flex-col flex-grow justify-between">
        <div>
          <h3
            className={cn(
              "text-gray-900 text-base line-clamp-2 uppercase leading-snug",
              disableNamePointer && "cursor-default"
            )}
          >
            {title}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="mt-2">
          <span className="text-lg font-semibold text-primary">
            ₹{Math.round(product.price).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </article>
  );
}
