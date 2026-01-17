/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'insight-blue': '#0ea5e9',
        'insight-purple': '#6366f1',
        'insight-green': '#10b981',
        'insight-yellow': '#f59e0b',
        'insight-red': '#ef4444',
        'insight-gray': '#6b7280'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}