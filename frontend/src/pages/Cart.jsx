import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMinus, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import Swal from "sweetalert2";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../api/orders";
import { formatCurrency } from "../utils/format";
import EmptyState from "../components/EmptyState";

export default function Cart() {
  const { items, increaseQuantity, decreaseQuantity, removeItem, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0 || !isAuthenticated) {
      setSummary(null);
      return;
    }
    setIsCalculating(true);
    setError("");
    const timer = setTimeout(() => {
      orderApi
        .calculateCart(items.map((i) => ({ product_id: i.productId, quantity: i.quantity })))
        .then(setSummary)
        .catch((err) => setError(err.message))
        .finally(() => setIsCalculating(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [items, isAuthenticated]);

  const handleRemove = async (item) => {
    const result = await Swal.fire({
      title: `Remove ${item.name}?`,
      text: "This will remove the item from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D2691E",
      cancelButtonColor: "#6F4E37",
      confirmButtonText: "Remove",
    });
    if (result.isConfirmed) removeItem(item.productId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          subtitle="Add something delicious from the menu to get started."
          action={<Link to="/menu" className="btn-primary">Browse the menu</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">Your Cart</h1>
      <p className="mt-2 text-espresso/60 dark:text-cream/60">{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart.</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card flex items-center gap-4 p-4"
              >
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=60"}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-display font-semibold">{item.name}</h3>
                  <p className="text-sm text-espresso/60 dark:text-cream/50">{formatCurrency(item.price)} each</p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-secondary/40 px-2 py-1">
                  <button
                    onClick={() => decreaseQuantity(item.productId)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-primary hover:bg-primary/5"
                    aria-label="Decrease quantity"
                  >
                    <HiOutlineMinus size={14} />
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.productId)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-primary hover:bg-primary/5"
                    aria-label="Increase quantity"
                  >
                    <HiOutlinePlus size={14} />
                  </button>
                </div>

                <span className="w-24 text-right font-display font-semibold text-primary dark:text-secondary">
                  {formatCurrency(item.price * item.quantity)}
                </span>

                <button
                  onClick={() => handleRemove(item)}
                  className="text-espresso/30 hover:text-red-500"
                  aria-label={`Remove ${item.name}`}
                >
                  <HiOutlineTrash size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="glass-card h-fit p-6">
          <h2 className="font-display text-xl font-semibold">Order Summary</h2>

          {!isAuthenticated ? (
            <p className="mt-4 text-sm text-espresso/60 dark:text-cream/50">
              Log in to see live tax and discount totals before checkout.
            </p>
          ) : error ? (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          ) : (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-espresso/70 dark:text-cream/60">
                <span>Subtotal</span>
                <span>{isCalculating ? "…" : formatCurrency(summary?.subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso/70 dark:text-cream/60">
                <span>Tax</span>
                <span>{isCalculating ? "…" : formatCurrency(summary?.tax_amount)}</span>
              </div>
              {Number(summary?.discount_amount) > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount</span>
                  <span>-{formatCurrency(summary?.discount_amount)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-secondary/20 pt-2 font-display text-lg font-semibold">
                <span>Total</span>
                <span>{isCalculating ? "…" : formatCurrency(summary?.total_amount)}</span>
              </div>
            </div>
          )}

          <button onClick={handleCheckout} className="btn-primary mt-6 w-full">
            Proceed to Checkout
          </button>
          <Link to="/menu" className="mt-3 block text-center text-sm font-medium text-primary hover:underline dark:text-secondary">
            Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
