import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Pure light mode: only activated by .dark class which is never added
  theme: {
    extend: {
      colors: {
        background: "#F7F8FC",
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F0F3F9",
          tertiary: "#E8EDF5",
        },
        border: {
          DEFAULT: "#E5E9F2",
          subtle: "#EFF2F7",
          strong: "#D2D9E7",
        },
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#4563EB", // Primary Accent from requirements
          600: "#364EC7",
          700: "#2B3EA5",
          800: "#202E7B",
          900: "#172154",
          DEFAULT: "#4563EB",
        },
        secondary: {
          50: "#EDFAFA",
          100: "#D3F4F3",
          200: "#A9EAE8",
          300: "#75DEDB",
          400: "#38C9C4",
          500: "#16A6A1", // Secondary Accent from requirements
          600: "#108581",
          700: "#0C6663",
          800: "#094D4B",
          900: "#063635",
          DEFAULT: "#16A6A1",
        },
        content: {
          primary: "#172033", // Primary Text
          secondary: "#667085", // Secondary Text
          muted: "#8C96A8",
          inverse: "#FFFFFF",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(23, 32, 51, 0.05), 0 1px 2px rgba(23, 32, 51, 0.02)",
        card: "0 2px 8px -2px rgba(23, 32, 51, 0.06), 0 1px 4px -1px rgba(23, 32, 51, 0.03)",
        "card-hover": "0 14px 28px -6px rgba(69, 99, 235, 0.12), 0 6px 14px -2px rgba(23, 32, 51, 0.05)",
        glow: "0 0 20px rgba(69, 99, 235, 0.2)",
        "glow-secondary": "0 0 20px rgba(22, 166, 161, 0.2)",
        dropdown: "0 10px 25px -5px rgba(23, 32, 51, 0.1), 0 8px 10px -6px rgba(23, 32, 51, 0.05)",
      },
      animation: {
        marquee: "marquee 35s linear infinite",
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-up": "scaleUp 0.2s ease-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.97)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
