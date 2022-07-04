/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Fira Sans", "sans"],
      },
    },
  },
  plugins: [require("daisyui")],
}
