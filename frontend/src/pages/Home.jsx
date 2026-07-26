import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { HiArrowRight } from "react-icons/hi2";
import { productApi } from "../api/products";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productApi.list({ sort_by: "rating", sort_order: "desc", page: 1, page_size: 4, available_only: true }),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain bg-[length:18px_18px] opacity-30" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent"
          >
            Small-batch. Made to order.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight sm:text-6xl"
          >
            Coffee, tea &amp; comfort food — <span className="text-primary">crafted daily.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl text-lg text-espresso/60 dark:text-cream/60"
          >
            Order ahead, skip the line, and track your cup from kitchen to counter.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/menu" className="btn-primary">
              View Menu <HiArrowRight />
            </Link>
            <Link to="/register" className="btn-ghost">
              Create an account
            </Link>
          </motion.div>

          <div className="steam-divider mt-16">
            <span /><span /><span /><span /><span />
          </div>
        </div>
      </section>

      {/* Featured items */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">Fan favorites</h2>
          <Link to="/menu" className="text-sm font-semibold text-accent hover:underline">
            See full menu
          </Link>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(data?.items || []).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
