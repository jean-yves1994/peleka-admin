/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EBF2FF",
          100: "#D1E1FF",
          200: "#A3C3FF",
          300: "#6A9DFB",
          400: "#2C71F2",
          500: "#094ECE",
          600: "#003699",
          700: "#002366", // ← Imperial Blue, exact
          800: "#001B4D",
          900: "#001438",
          950: "#000C24",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          400: "#94a3b8",
          500: "#64748b",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Inter",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        pop: "0 10px 40px -10px rgba(124,58,237,0.35)",
      },
    },
  },
  plugins: [],
};
