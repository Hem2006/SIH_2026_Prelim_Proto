/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govteal: {
          50: '#f0f6f8',
          100: '#dae9ee',
          200: '#b8d3de',
          300: '#8bb3c5',
          400: '#588da6',
          500: '#3e728b',
          600: '#345e73',
          700: '#2e4f61',
          800: '#2b4452',
          900: '#1f4e5c',
          950: '#112932',
        },
        sidebar: {
          DEFAULT: '#2A3F54',
          dark: '#243545',
          darker: '#1A2D3F',
          light: '#354F65',
          hover: '#425C73',
          active: '#1ABB9C',
        }
      }
    },
  },
  plugins: [],
}
