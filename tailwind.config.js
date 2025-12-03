/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Slate: Base neutral color for Enterprise UI
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Blue: Primary brand color (refined)
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Semantic aliases
        primary: {
          50: '#eff6ff',      // blue-50
          100: '#dbeafe',     // blue-100
          200: '#bfdbfe',     // blue-200
          300: '#93c5fd',     // blue-300
          400: '#60a5fa',     // blue-400
          500: '#3b82f6',     // blue-500
          600: '#2563eb',     // blue-600
          700: '#1d4ed8',     // blue-700
          800: '#1e40af',     // blue-800
          900: '#1e3a8a',     // blue-900
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8',   // blue-700
          light: '#eff6ff',   // blue-50
        },
        success: {
          50: '#ecfdf5',      // emerald-50
          100: '#d1fae5',     // emerald-100
          500: '#10b981',     // emerald-500
          600: '#059669',     // emerald-600
          700: '#047857',     // emerald-700
        },
        warning: {
          50: '#fef3c7',      // amber-50
          100: '#fde68a',     // amber-100
          500: '#f59e0b',     // amber-500
          600: '#d97706',     // amber-600
        },
        danger: {
          50: '#fee2e2',      // red-50
          100: '#fecaca',     // red-100
          500: '#ef4444',     // red-500
          600: '#dc2626',     // red-600
          700: '#b91c1c',     // red-700
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',   // slate-50
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}