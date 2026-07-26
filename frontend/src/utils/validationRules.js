export const nameRules = {
  required: "Name is required.",
  minLength: { value: 3, message: "Name must be at least 3 letters." },
  pattern: { value: /^[A-Za-z ]{3,}$/, message: "Name must contain only alphabets." },
};

export const emailRules = {
  required: "Email is required",

  pattern: {
    value: /^[A-Za-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/i,
    message:
      "Only Gmail, Yahoo and Outlook email addresses are allowed.",
  },
};

export const phoneRules = {
  required: "Phone number is required.",
  pattern: {
    value: /^[0-9]{10}$/,
    message: "Phone number must contain exactly 10 digits.",
  },
};

export const passwordRules = {
  required: "Password is required.",
  minLength: { value: 8, message: "Password must be at least 8 characters." },
  validate: {
    hasUpper: (v) => /[A-Z]/.test(v) || "Password must contain one uppercase letter.",
    hasLower: (v) => /[a-z]/.test(v) || "Password must contain one lowercase letter.",
    hasNumber: (v) => /[0-9]/.test(v) || "Password must contain one number.",
    hasSpecial: (v) =>
      /[!@#$%^&*(),.?":{}|<>_\-+=[\];'`~/\\]/.test(v) || "Password must contain one special character.",
  },
};

export const confirmPasswordRules = (getPasswordValue) => ({
  required: "Please confirm your password.",
  validate: (v) => v === getPasswordValue() || "Passwords do not match.",
});
