import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "rgb(var(--tz-background) / <alpha-value>)",
        surface: "rgb(var(--tz-surface) / <alpha-value>)",
        foreground: "rgb(var(--tz-foreground) / <alpha-value>)",
        muted: "rgb(var(--tz-muted) / <alpha-value>)",
        border: "rgb(var(--tz-border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--tz-primary) / <alpha-value>)",
          hover: "rgb(var(--tz-primary-hover) / <alpha-value>)",
          foreground: "rgb(var(--tz-primary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--tz-accent) / <alpha-value>)",
          foreground: "rgb(var(--tz-accent-foreground) / <alpha-value>)",
        },
        success: "rgb(var(--tz-success) / <alpha-value>)",
        warning: "rgb(var(--tz-warning) / <alpha-value>)",
        danger: "rgb(var(--tz-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
