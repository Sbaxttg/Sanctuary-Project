/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#0a0e14",
          surface: "#0f141a",
          primary: "#2962FF",
          "accent-soft": "#94aaff",
          muted: "#94a3b8",
          subtle: "#64748b",
          input: "#0c1016",
          display: "#f1f3fc",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      boxShadow: {
        deep: "0 32px 64px -15px rgba(0, 0, 0, 0.6)",
        "primary-glow": "0 0 0 1px rgba(41, 98, 255, 0.35), 0 0 24px -4px rgba(41, 98, 255, 0.45)",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};
