/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
          950: '#082f49',
        },
        navy: {
          50: '#f5f7fa',
          100: '#eaedf2',
          200: '#d0d7de',
          300: '#aab6c5',
          400: '#7f92a9',
          500: '#5c728e',
          600: '#465870',
          700: '#384659',
          800: '#2f3a49',
          900: '#0f172a', /* Main Corporate Color */
          950: '#020617',
        },
        accent: {
          500: '#f59e0b', /* Amber for highlights */
          600: '#d97706',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        }
      },
    },
  },
  plugins: [],
}