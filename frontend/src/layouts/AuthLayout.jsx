import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grain bg-[length:18px_18px] opacity-40" />
        <Link to="/" className="relative z-10 font-display text-3xl font-semibold text-cream">
          Brew <span className="text-secondary">&amp; Co.</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <p className="max-w-sm font-display text-3xl font-medium leading-snug text-cream">
            "Every good conversation starts with a good cup."
          </p>
          <div className="steam-divider mt-8 justify-start">
            <span /><span /><span /><span /><span />
          </div>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-cream px-4 py-12 dark:bg-espresso sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 block font-display text-2xl font-semibold text-primary lg:hidden">
            Brew <span className="text-accent">&amp; Co.</span>
          </Link>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
