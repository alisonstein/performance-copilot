import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#080B14",
          secondary: "#0F1424",
        },
        card: "#141A2E",
        primary: {
          DEFAULT: "#7157FF",
          light: "#8E7AFF",
        },
        accent: "#2ED3B7",
        ink: {
          DEFAULT: "#F7F8FC",
          secondary: "#9EA6BC",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        lg2: "20px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.35)",
        glow: "0 0 60px rgba(113, 87, 255, 0.15)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(113,87,255,0.14), transparent 60%)",
        "hero-glow":
          "linear-gradient(135deg, rgba(113,87,255,0.18) 0%, rgba(46,211,183,0.10) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
