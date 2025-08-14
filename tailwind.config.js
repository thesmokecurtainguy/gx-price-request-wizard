/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E30613",
          dark: "#111827",
          gray: "#6B7280",
          light: "#F3F4F6"
        }
      }
    }
  },
  plugins: [],
};
