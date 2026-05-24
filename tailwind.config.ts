import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "#1e3a6e",
          dark: "#0f1f3d",
          light: "#2d55a0",
          muted: "#e8f0fe",
        },
        accent: {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
          light: "#fcd34d",
        },
        uw: {
          50: "#eef7fd",
          100: "#d0eaf8",
          400: "#66b9e8",
          500: "#399edc",
          600: "#2d8bc8",
          900: "#1a5a8a",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px 0 rgba(0,0,0,0.07)",
        "card-hover": "0 8px 24px 0 rgba(0,0,0,0.13)",
      },
    },
  },
  plugins: [],
};
export default config;
