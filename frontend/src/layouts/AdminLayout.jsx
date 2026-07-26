import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HiOutlineSquares2X2,
  HiOutlineCake,
  HiOutlineTag,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: HiOutlineSquares2X2, end: true },
  { to: "/admin/products", label: "Products", icon: HiOutlineCake },
  { to: "/admin/categories", label: "Categories", icon: HiOutlineTag },
  { to: "/admin/orders", label: "Orders", icon: HiOutlineClipboardDocumentList },
  { to: "/admin/users", label: "Users", icon: HiOutlineUsers },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Admin Header */}
      <div className="glass-card mb-6 flex flex-col gap-4 rounded-2xl p-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary dark:text-secondary">
            Brew &amp; Co.
          </h1>

          <p className="mt-1 text-sm text-espresso/60 dark:text-cream/60">
            Admin Management Portal
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-espresso/50 dark:text-cream/40">
              Logged in as
            </p>

            <p className="font-semibold text-primary dark:text-secondary">
              {user?.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-secondary/30 px-5 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-cream dark:text-secondary"
          >
            <HiOutlineArrowRightOnRectangle size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">

        {/* Sidebar */}
        <aside className="glass-card h-fit rounded-2xl p-3 lg:w-60 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-cream shadow"
                      : "text-espresso/70 hover:bg-primary/5 dark:text-cream/70"
                  }`
                }
              >
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
}