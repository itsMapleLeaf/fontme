/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{ts,tsx,astro}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}
