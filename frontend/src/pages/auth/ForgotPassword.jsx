import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import FormInput from "../../components/FormInput";
import { emailRules } from "../../utils/validationRules";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (sent) {
    return (
      <div className="glass-card animate-rise p-8 text-center sm:p-10">
        <h1 className="font-display text-2xl font-semibold">Check your inbox</h1>
        <p className="mt-3 text-sm text-espresso/60 dark:text-cream/60">
          If an account exists for that email, we've sent a link to reset your password.
        </p>
        <Link to="/login" className="btn-ghost mt-8 inline-flex">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card animate-rise p-8 sm:p-10">
      <h1 className="font-display text-3xl font-semibold">Reset your password</h1>
      <p className="mt-2 text-sm text-espresso/60 dark:text-cream/60">
        Enter your email and we'll send you a link to get back in.
      </p>

      {serverError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <FormInput label="Email" type="email" placeholder="you@example.com" register={register("email", emailRules)} error={errors.email} />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-espresso/60 dark:text-cream/60">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
