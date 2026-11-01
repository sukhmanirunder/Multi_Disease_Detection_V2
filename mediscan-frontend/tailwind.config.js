/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:     "#153746",
        teal:     "#168C83",
        mint:     "#DDF4EC",
        pagebg:   "#F5FAF9",
        border:   "#DCE7E5",
        bodytext: "#334155",
        riskLow:  "#207544",
        riskMod:  "#946200",
        riskHigh: "#B42332",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};