/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          450: "#9d76fa",
          455: "#936af8",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          750: "#641cd1",
          800: "#5b21b6",
          850: "#5318a3",
          900: "#4c1d95",
          955: "#3a0975",
        },
        cyan: {
          50: "#ecfeff",
          100: "#cffafe",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        surface: {
          50:  "#ffffff",
          100: "#f4f6fb",
          200: "#e8eaf0",
          300: "#d4d7e3",
          400: "#9ca3af",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass:   "0 2px 20px rgba(99,102,241,0.07)",
        card:    "0 4px 24px rgba(0,0,0,0.06)",
        glow:    "0 0 20px rgba(124,58,237,0.2)",
        "glow-sm": "0 0 12px rgba(124,58,237,0.15)",
      },
      animation: {
        "fade-in":  "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.35s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0, transform: "translateY(10px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
