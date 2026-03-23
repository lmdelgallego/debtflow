/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        card: "#111216",
        foreground: "#f4f4f5",
        muted: "#18181b",
        mutedForeground: "#a1a1aa",
        border: "#27272a",
        income: "#34d399",
        expense: "#fbbf24",
        debt: "#60a5fa",
        danger: "#f87171"
      }
    }
  },
  plugins: []
};
