/**
 * Reusable text input for react-hook-form.
 * Usage: <FormInput label="Email" type="email" register={register("email")} error={errors.email} />
 */
export default function FormInput({ label, type = "text", register, error, placeholder, ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block font-body text-sm font-medium text-espresso/80">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`input-field ${error ? "input-error" : ""}`}
        {...register}
        {...rest}
      />
      {error && <p className="field-error-text">{error.message}</p>}
    </div>
  );
}
