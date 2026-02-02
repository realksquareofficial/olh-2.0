/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        olh: {
          primary: '#3DA5D9',
          dark: '#2364AA',
          light: '#1BE7FF',
          bg: '#D4E9F2',
          card: '#FFFFFF',
          text: '#1A2332',
          textLight: '#546E7A',
          accent: '#3DA5D9',
          hover: '#2C8AB8',
        }
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}