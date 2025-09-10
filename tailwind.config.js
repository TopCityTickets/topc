/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366f1',
        'primary-focus': '#4f46e5',
        'secondary': '#475569',
        'dark': '#0f172a',
        'gray-light': '#cbd5e1'
      }
    },
  },
  plugins: [],
}
