import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineShoppingBag, HiOutlineUserCircle, HiBars3, HiXMark, HiMoon, HiSun } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const navLinkClass = ({ isActive }) =>
  `font-body text-sm font-medium transition-colors ${
    isActive ? "text-accent" : "text-espresso/70 hover:text-primary dark:text-cream/70"
  }`;

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
  logout();
  navigate(isAdmin ? "/admin/login" : "/login");
};

  return (
    <header className="sticky top-0 z-40 border-b border-secondary/20 bg-cream/80 backdrop-blur-lg dark:bg-espresso/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold text-primary dark:text-secondary">Brew</span>
          <span className="font-display text-2xl font-semibold text-accent">&amp; Co.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
            {isAdmin ? (
              <>
                <NavLink to="/admin" end className={navLinkClass}>
                  Dashboard
                </NavLink>

                <NavLink to="/admin/products" className={navLinkClass}>
                  Products
                </NavLink>

                <NavLink to="/admin/categories" className={navLinkClass}>
                  Categories
                </NavLink>

                <NavLink to="/admin/orders" className={navLinkClass}>
                  Orders
                </NavLink>

                <NavLink to="/admin/users" className={navLinkClass}>
                  Users
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/menu" className={navLinkClass}>
                  Menu
                </NavLink>

                {isAuthenticated && (
                  <NavLink to="/orders" className={navLinkClass}>
                    My Orders
                  </NavLink>
                )}
              </>
            )}
          </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-full p-2 text-primary transition hover:bg-primary/5 dark:text-secondary"
          >
            {isDark ? <HiSun size={20} /> : <HiMoon size={20} />}
          </button>

          {!isAdmin && (
          <Link
            to="/cart"
            className="relative rounded-full p-2 text-primary transition hover:bg-primary/5 dark:text-secondary">          
            <HiOutlineShoppingBag size={22} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-cream"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          )}  
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to={isAdmin ? "/admin" : "/profile"} className="flex items-center gap-2 text-sm font-medium text-primary dark:text-secondary">
                <HiOutlineUserCircle size={22} />
                {user?.name?.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="btn-ghost !px-4 !py-2 text-sm">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">Log in</Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">Sign up</Link>
            </div>
          )}
        </div>

        <button
          className="p-2 text-primary md:hidden dark:text-secondary"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiXMark size={26} /> : <HiBars3 size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-secondary/20 md:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-5">
              <NavLink to="/menu" onClick={() => setMobileOpen(false)} className={navLinkClass}>Menu</NavLink>
              <NavLink to="/cart" onClick={() => setMobileOpen(false)} className={navLinkClass}>
                Cart {itemCount > 0 && `(${itemCount})`}
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/orders" onClick={() => setMobileOpen(false)} className={navLinkClass}>My Orders</NavLink>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={navLinkClass}>Profile</NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={navLinkClass}>Admin Panel</NavLink>
              )}
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-espresso/70 dark:text-cream/70">
                {isDark ? <HiSun /> : <HiMoon />} {isDark ? "Light mode" : "Dark mode"}
              </button>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-ghost">Log out</button>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="btn-ghost flex-1">Log in</Link>
                  <Link to="/register" className="btn-primary flex-1">Sign up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
