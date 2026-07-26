import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axiosClient from "../api/axiosClient";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";
import { nameRules, phoneRules } from "../utils/validationRules";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      profile_photo_url: user?.profile_photo_url || "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const { data: updated } = await axiosClient.put("/auth/me", data);
      refreshUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      setServerError(err.message || "Could not update profile.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">My Profile</h1>
      <p className="mt-2 text-espresso/60 dark:text-cream/60">Update your account details.</p>

      {serverError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card mt-8 space-y-4 p-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.profile_photo_url || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user?.name || "U")}
            alt="Profile"
            className="h-16 w-16 rounded-full border-2 border-secondary/40 object-cover"
          />
          <div className="flex-1">
            <FormInput label="Profile photo URL" register={register("profile_photo_url")} placeholder="https://…" />
          </div>
        </div>

        <FormInput label="Email" register={{}} defaultValue={user?.email || ""} disabled />
        <FormInput label="Full name" register={register("name", nameRules)} error={errors.name} />
        <FormInput label="Phone number" type="tel" register={register("phone", phoneRules)} error={errors.phone} />
        <FormInput label="Address" register={register("address")} placeholder="123 Main Street, Apt 4B" />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
