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
        background: '#1a1a1a',
        surface: '#2d2d2d',
        'surface-elevated': '#3a3a3a',
        primary: {
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
          light: '#81C784',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        accent: '#00BFA5',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        'text-disabled': '#666666',
        border: '#404040',
        error: '#f44336',
        warning: '#ff9800',
        success: '#4CAF50',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
