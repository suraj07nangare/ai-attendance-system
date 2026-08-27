/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0C",
        surface: "#141416",
        border: "#232326",
        muted: "#8A8A8E",
        fg: "#F5F5F0",
        accent: "#39E27A",
        accent2: "#FF5A2E",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}