import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e8e8e8',
          primary: '#5e17eb',
          dark: '#2b0b6b',
          accent: '#843dff',
          reverse: '#ffe3ff',
          glow: '#5e17eb',
        },
        background: "#f8fafc",
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
        },
        border: {
          DEFAULT: "#e8e8e8",
          subtle: "#f4f4f4",
          strong: "#cbd5e1",
        },
        primary: {
          50: "#f6f2ff",
          100: "#ede5ff",
          200: "#dccdff",
          300: "#c2a3ff",
          400: "#a36eff",
          500: "#843dff",
          600: "#5e17eb",
          700: "#4f0ecf",
          800: "#410da7",
          900: "#360e86",
          DEFAULT: "#5e17eb",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          DEFAULT: "#843dff",
        },
        content: {
          primary: "#121018",
          secondary: "#475569",
          muted: "#94a3b8",
          inverse: "#ffffff",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 14px 30px -8px rgba(94, 23, 235, 0.22)",
        glow: "0 0 25px rgba(94, 23, 235, 0.2)",
        "glow-secondary": "0 0 25px rgba(132, 61, 255, 0.2)",
        dropdown: "0 12px 30px rgba(0, 0, 0, 0.1)",
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
