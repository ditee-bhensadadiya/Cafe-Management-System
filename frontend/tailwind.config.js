/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6F4E37",
          light: "#8A6A4F",
          dark: "#57392A",
        },
        secondary: {
          DEFAULT: "#C8A97E",
          light: "#DBC3A0",
          dark: "#B08F63",
        },
        cream: "#FFF8F3",
        espresso: "#2B2B2B",
        accent: {
          DEFAULT: "#D2691E",
          light: "#E08942",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(111, 78, 55, 0.10)",
        "soft-lg": "0 20px 60px rgba(111, 78, 55, 0.16)",
        glass: "0 8px 32px rgba(43, 43, 43, 0.08)",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(111,78,55,0.06) 1px, transparent 0)",
      },
      keyframes: {
        steam: {
          "0%, 100%": { transform: "translateY(0) scaleX(1)", opacity: "0.55" },
          "50%": { transform: "translateY(-6px) scaleX(1.08)", opacity: "0.9" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        steam: "steam 3.2s ease-in-out infinite",
        rise: "rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
