import { motion } from "framer-motion";
import { HiOutlinePlus } from "react-icons/hi2";
import { toast } from "react-toastify";
import StarRating from "./StarRating";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/format";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=60";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    if (!product.is_available || product.stock === 0) return;
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const outOfStock = !product.is_available || product.stock === 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card group flex flex-col overflow-hidden"
    >
      <div className="relative h-40 w-full overflow-hidden bg-secondary/10">
        <img
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-espresso/80 px-3 py-1 text-xs font-semibold text-cream">
            {product.stock === 0 ? "Out of stock" : "Unavailable"}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
          {product.category?.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold leading-snug">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-espresso/60 dark:text-cream/50">{product.description}</p>
        )}

        <div className="mt-2">
          <StarRating rating={product.rating} count={product.rating_count} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-xl font-semibold text-primary dark:text-secondary">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-cream shadow-soft
                       transition hover:bg-accent-light active:scale-95 disabled:cursor-not-allowed disabled:bg-secondary/40"
            aria-label={`Add ${product.name} to cart`}
          >
            <HiOutlinePlus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
