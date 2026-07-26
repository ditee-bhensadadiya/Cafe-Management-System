import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../../components/FormInput";
import { useAuth } from "../../context/AuthContext";
import {
  confirmPasswordRules,
  emailRules,
  nameRules,
  passwordRules,
  phoneRules,
} from "../../utils/validationRules";

export default function Register() {
  const { register: registerUser } = useAuth();
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
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirmPassword,
      });
      toast.success("Account created — welcome to Brew & Co.!");
      navigate("/menu", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="glass-card animate-rise p-8 sm:p-10">
      <h1 className="font-display text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-espresso/60 dark:text-cream/60">
        Order ahead, track your cup, and save your favorites.
      </p>

      {serverError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <FormInput label="Full name" placeholder="Jordan Rivera" register={register("name", nameRules)} error={errors.name} />
        <FormInput label="Email" type="email" placeholder="you@example.com" register={register("email", emailRules)} error={errors.email} />
        <FormInput label="Phone number" type="tel" placeholder="9876543210" register={register("phone", phoneRules)} error={errors.phone} />
        <FormInput label="Password" type="password" placeholder="Cafe@123" register={register("password", passwordRules)} error={errors.password} />
        <FormInput
          label="Confirm password"
          type="password"
          placeholder="Cafe@123"
          register={register("confirmPassword", confirmPasswordRules(() => watch("password")))}
          error={errors.confirmPassword}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-espresso/60 dark:text-cream/60">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
