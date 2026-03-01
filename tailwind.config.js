/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        azul: '#0051BA',
        'azul-dark': '#003d8a',
        'azul-profundo': '#0B1F3B',
        'azul-vibrante': '#1E63FF',
        'dourado-suave': '#F5B942',
        'branco-premium': '#FFFFFF',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
