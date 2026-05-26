/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sgi: {
          DEFAULT: "#023E8A",
          50: "#E8F0FB",
          100: "#C9DCF4",
          200: "#9DBDE8",
          300: "#6E9CDB",
          400: "#2979D4",
          500: "#023E8A",
          600: "#1A5EBF",
          700: "#02336F",
          800: "#022753",
          900: "#011938",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
