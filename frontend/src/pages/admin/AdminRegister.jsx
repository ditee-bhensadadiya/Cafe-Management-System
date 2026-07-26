import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HiOutlineShieldCheck, HiOutlineKey } from "react-icons/hi2";
import { adminAuthApi } from "../../api/adminAuth";
import { useAuth } from "../../context/AuthContext";
import {
  confirmPasswordRules,
  emailRules,
  nameRules,
  passwordRules,
  phoneRules,
} from "../../utils/validationRules";

function AdminInput({ label, type = "text", register, error, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-cream/70">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-espresso/40 px-4 py-3 text-cream placeholder:text-cream/30
                    focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
                      error ? "border-red-400" : "border-secondary/30"
                    }`}
        {...register}
      />
      {error && <p className="mt-1.5 text-sm text-red-300">{error.message}</p>}
    </div>
  );
}

export default function AdminRegister() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");

    try {
        const result = await adminAuthApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirmPassword,
        admin_secret: data.adminSecretCode,
        });

        localStorage.setItem(
        "cafe_access_token",
        result.access_token
        );

        localStorage.setItem(
        "cafe_user",
        JSON.stringify(result.user)
        );

        await refreshUser();

        toast.success("Admin account created!");

        navigate("/admin", { replace: true });

    } catch (err) {
        setServerError(
        err.message || "Could not create admin account."
        );
    }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso px-4 py-12">
      <div className="w-full max-w-md rounded-xl2 border border-secondary/20 bg-espresso/60 p-8 shadow-soft-lg backdrop-blur-xl sm:p-10">
        <div className="flex items-center gap-2">
          <HiOutlineShieldCheck className="text-2xl text-secondary" />
          <span className="font-display text-xl font-semibold text-cream">Brew &amp; Co. Admin</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-cream">Create admin account</h1>
        <p className="mt-2 text-sm text-cream/50">Requires a valid admin secret code from management.</p>

        {serverError && (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <AdminInput label="Full name" register={register("name", nameRules)} error={errors.name} placeholder="Jordan Rivera" />
          <AdminInput label="Email" type="email" register={register("email", emailRules)} error={errors.email} placeholder="admin@example.com" />
          <AdminInput label="Phone number" type="tel" register={register("phone", phoneRules)} error={errors.phone} placeholder="9876543210" />
          <AdminInput label="Password" type="password" register={register("password", passwordRules)} error={errors.password} placeholder="••••••••" />
          <AdminInput
            label="Confirm password"
            type="password"
            register={register("confirmPassword", confirmPasswordRules(() => watch("password")))}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-cream/70">
              <HiOutlineKey className="text-secondary" /> Admin secret code
            </label>
            <input
              type="password"
              placeholder="Provided by management"
              className={`w-full rounded-xl border bg-espresso/40 px-4 py-3 text-cream placeholder:text-cream/30
                          focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                            errors.adminSecretCode ? "border-red-400" : "border-accent/40"
                          }`}
              {...register("adminSecretCode", { required: "Admin secret code is required." })}
            />
            {errors.adminSecretCode && (
              <p className="mt-1.5 text-sm text-red-300">{errors.adminSecretCode.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-cream shadow-soft transition hover:bg-accent-light disabled:opacity-50"
          >
            {isSubmitting ? "Creating account…" : "Create Admin Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-cream/30">
          Already have admin access?{" "}
          <Link to="/admin/login" className="text-secondary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}