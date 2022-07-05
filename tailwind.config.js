/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Fira Sans'", "sans-serif"],
        condensed: ["'Fira Sans Condensed'", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
}
