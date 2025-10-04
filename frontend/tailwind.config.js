/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          '500': '#3b82f6', // Blue
          '600': '#2563eb',
          '700': '#1d4ed8',
        },
        'success': {
          '500': '#10b981', // Emerald
        },
        'danger': {
          '500': '#ef4444', // Red
        },
        'neutral': {
          '50': '#f9fafb', // Light Background
          '800': '#1f2937', // Text
        }
      },
      fontFamily: {
        // Updated font to Segoe UI
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
