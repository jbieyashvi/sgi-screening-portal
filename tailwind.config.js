/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sgi: {
          DEFAULT: "#0D2B4E",
          50: "#EAEEF4",
          100: "#CBD6E3",
          200: "#9DB0C7",
          300: "#6E89AB",
          400: "#3D5C84",
          500: "#0D2B4E",
          600: "#0A2240",
          700: "#071A31",
          800: "#051122",
          900: "#020912",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
