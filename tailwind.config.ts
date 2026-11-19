import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#B07A85", hover: "#9A6572", light: "#FFF1F5" },
        accent: "#F4A3BA",
        "card-bg": "#FAD7DE",
        "text-title": "#2B2024",
        "text-secondary": "#8A7A80",
        "price-old": "#9A9A9A",
        whatsapp: "#25D366",
      },
      borderRadius: { card: "24px", pill: "9999px" },
      boxShadow: {
        card: "0 4px 20px rgba(176,122,133,.10)",
        "card-hover": "0 8px 32px rgba(176,122,133,.18)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
