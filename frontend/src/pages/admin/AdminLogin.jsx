import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { emailRules } from "../../utils/validationRules";

export default function AdminLogin() {
  const { login, logout, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const user = await login(data); // logs in + persists session via AuthContext
      if (user.role !== "admin") {
        logout(); // this account isn't an admin — don't leave a customer session sitting in /admin
        setServerError("This account doesn't have admin access.");
        return;
      }
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate("/admin", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso px-4">
      <div className="w-full max-w-md rounded-xl2 border border-secondary/20 bg-espresso/60 p-8 shadow-soft-lg backdrop-blur-xl sm:p-10">
        <div className="flex items-center gap-2">
          <HiOutlineShieldCheck className="text-2xl text-secondary" />
          <span className="font-display text-xl font-semibold text-cream">Brew &amp; Co. Admin</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-cream">Admin sign in</h1>
        <p className="mt-2 text-sm text-cream/50">Restricted access — staff and management only.</p>

        {serverError && (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cream/70">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              className={`w-full rounded-xl border bg-espresso/40 px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
                errors.email ? "border-red-400" : "border-secondary/30"
              }`}
              {...register("email", emailRules)}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-300">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cream/70">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-espresso/40 px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
                errors.password ? "border-red-400" : "border-secondary/30"
              }`}
              {...register("password", { required: "Password is required." })}
            />
            {errors.password && <p className="mt-1.5 text-sm text-red-300">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-secondary px-6 py-3 font-semibold text-espresso shadow-soft transition hover:bg-secondary-light disabled:opacity-50"
          >
            {isSubmitting ? "Signing in…" : "Sign in to Admin"}
          </button>
        </form>

        <p className="text-center mt-5">
            Don't have an admin account?
        </p>

        <Link
            to="/admin/register"
            className="text-orange-500 hover:underline"
        >
            Create Admin Account
        </Link>
      </div>
    </div>
  );
}
