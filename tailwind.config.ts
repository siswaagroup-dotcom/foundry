import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./clients/**/*.{ts,tsx}",
    "./team/**/*.{ts,tsx}",
    "./settings/**/*.{ts,tsx}",
    "./task-details/**/*.{ts,tsx}",
    "./expense-detail/**/*.{ts,tsx}",
    "./social-post-detail/**/*.{ts,tsx}",
    "./create-post/**/*.{ts,tsx}",
    "./create-expense/**/*.{ts,tsx}",
    "./create-task/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f97316",
          foreground: "#ffffff",
          hover: "#ea580c",
        },
        background: "#f8fafc",
        text: "#111827",
        muted: "#6b7280",
        border: "#e5e7eb",
        card: "#ffffff",
      },
      boxShadow: {
        auth: "0 18px 45px rgba(31, 31, 31, 0.08)",
        authDesktop: "0 25px 60px rgba(0, 0, 0, 0.08)",
        tab: "0 2px 8px rgba(31, 31, 31, 0.08)",
        action: "0 10px 20px rgba(249, 115, 22, 0.24)",
      },
      borderRadius: {
        auth: "24px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
