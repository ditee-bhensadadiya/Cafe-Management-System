import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import FormInput from "../../components/FormInput";
import { useAuth } from "../../context/AuthContext";
import { emailRules } from "../../utils/validationRules";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/menu", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="glass-card animate-rise p-8 sm:p-10">
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-espresso/60 dark:text-cream/60">
        Log in to order your favorites and track your cups.
      </p>

      {serverError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          register={register("email", emailRules)}
          error={errors.email}
        />

        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            register={register("password", { required: "Password is required." })}
            error={errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-[38px] text-espresso/40 hover:text-primary"
            tabIndex={-1}
          >
            {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-espresso/60 dark:text-cream/60">
        New to Brew &amp; Co.?{" "}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
