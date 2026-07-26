import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth";
import FormInput from "../../components/FormInput";
import { confirmPasswordRules, passwordRules } from "../../utils/validationRules";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authApi.resetPassword({
        token,
        new_password: data.password,
        confirm_password: data.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (!token) {
    return (
      <div className="glass-card animate-rise p-8 text-center sm:p-10">
        <h1 className="font-display text-2xl font-semibold">Invalid reset link</h1>
        <p className="mt-3 text-sm text-espresso/60 dark:text-cream/60">
          This password reset link is missing its token. Please request a new one.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-8 inline-flex">
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card animate-rise p-8 text-center sm:p-10">
        <h1 className="font-display text-2xl font-semibold">Password updated</h1>
        <p className="mt-3 text-sm text-espresso/60 dark:text-cream/60">
          Taking you to the login page…
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card animate-rise p-8 sm:p-10">
      <h1 className="font-display text-3xl font-semibold">Set a new password</h1>
      <p className="mt-2 text-sm text-espresso/60 dark:text-cream/60">
        Choose a strong password you haven't used before.
      </p>

      {serverError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <FormInput label="New password" type="password" placeholder="Cafe@123" register={register("password", passwordRules)} error={errors.password} />
        <FormInput
          label="Confirm new password"
          type="password"
          placeholder="Cafe@123"
          register={register("confirmPassword", confirmPasswordRules(() => watch("password")))}
          error={errors.confirmPassword}
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
