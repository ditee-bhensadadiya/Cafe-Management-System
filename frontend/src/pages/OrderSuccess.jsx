import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiCheckCircle } from "react-icons/hi2";
import { orderApi } from "../api/orders";
import { formatCurrency } from "../utils/format";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    orderApi.getOrder(orderId).then(setOrder).catch((err) => setError(err.message));
  }, [orderId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <HiCheckCircle className="mx-auto text-7xl text-accent" />
      </motion.div>

      <h1 className="mt-6 font-display text-4xl font-semibold">Order placed!</h1>
      <p className="mt-2 text-espresso/60 dark:text-cream/60">
        Thanks — we're getting your order ready.
      </p>

      {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

      {order && (
        <div className="glass-card mt-8 p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm text-espresso/50 dark:text-cream/40">Order Number</span>
            <span className="font-display font-semibold">{order.order_number}</span>
          </div>
          <div className="mt-4 space-y-2 border-t border-secondary/20 pt-4">
            {order.items.map((item) => (
              <div key={item.product_name + item.unit_price} className="flex justify-between text-sm">
                <span className="text-espresso/70 dark:text-cream/60">
                  {item.product_name} × {item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-secondary/20 pt-4 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/orders" className="btn-primary">Track my order</Link>
        <Link to="/menu" className="btn-ghost">Back to menu</Link>
      </div>
    </div>
  );
}
