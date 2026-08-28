/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7F8FB",
        surface: "#FFFFFF",
        border: "#E7E9F0",
        muted: "#7A7F91",
        ink: "#1B1D28",
        primary: {
          DEFAULT: "#3B6EF6",
          dark: "#2952D9",
          light: "#EAF0FE",
        },
        mint: "#22C55E",
        coral: "#FF5C7A",
        sun: "#FFB020",
        grape: "#8B5CF6",
        sky: "#22B8CF",
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 20, 43, 0.04), 0 8px 24px rgba(20, 20, 43, 0.06)",
        pop: "0 8px 20px rgba(59, 110, 246, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}
