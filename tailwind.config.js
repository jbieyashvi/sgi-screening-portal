/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sgi: {
          DEFAULT: "#185FA5",
          50: "#EEF4FB",
          100: "#D6E4F3",
          200: "#A8C5E5",
          300: "#7AA5D6",
          400: "#4C86C8",
          500: "#185FA5",
          600: "#134C84",
          700: "#0E3963",
          800: "#092642",
          900: "#041321",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
