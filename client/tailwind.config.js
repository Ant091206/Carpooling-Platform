/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fb',
          100: '#e9eff6',
          200: '#ccdbe9',
          300: '#9ebecc',
          400: '#679db4',
          500: '#48809a',
          600: '#38667e',
          700: '#2f5367',
          800: '#294757',
          900: '#253d4c',
          950: '#152531',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
